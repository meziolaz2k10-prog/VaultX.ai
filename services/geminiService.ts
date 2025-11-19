import { GoogleGenAI, Modality, Chat, GenerateContentResponse } from "@google/genai";
import { GeneratedImage } from "../types";

const getAI = () => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Checks for spelling mistakes and returns correction.
 */
export const checkSpelling = async (text: string): Promise<{corrected: string, hasMistake: boolean}> => {
  const ai = getAI();
  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: `You are a spell checker. Check the following text for spelling mistakes. 
        If there are mistakes, return ONLY the corrected text. 
        If there are no mistakes, return exactly "NO_CHANGE". 
        Do not add any markdown, quotes, or explanations.
        Text: "${text}"`
      });
      
      const result = response.text?.trim() || "NO_CHANGE";
      
      if (result === "NO_CHANGE" || result.toLowerCase() === text.toLowerCase()) {
        return { corrected: text, hasMistake: false };
      }
      
      return { corrected: result, hasMistake: true };
  } catch (e) {
      console.warn("Spelling check failed, skipping", e);
      return { corrected: text, hasMistake: false };
  }
};

/**
 * Generates an image using the Gemini Imagen 3 model.
 */
export const generateArt = async (
  prompt: string, 
  styleModifier: string,
  aspectRatio: '1:1' | '16:9' | '9:16' | '3:4' | '4:3' = '1:1'
): Promise<string> => {
  const ai = getAI();
  const fullPrompt = `${prompt}. ${styleModifier}`;

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
        throw new Error("No image was generated.");
    }
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

/**
 * Edits an image using Gemini 2.5 Flash Image.
 */
export const editImage = async (
    base64Image: string,
    prompt: string
): Promise<string> => {
    const ai = getAI();
    // Strip data:image/jpeg;base64, prefix
    const base64Data = base64Image.split(',')[1];
    const mimeType = base64Image.substring(base64Image.indexOf(':') + 1, base64Image.indexOf(';'));

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    },
                    { text: prompt }
                ]
            },
            config: {
                responseModalities: [Modality.IMAGE]
            }
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part && part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
        throw new Error("No image generated from edit.");
    } catch (error) {
        console.error("Edit Image Error:", error);
        throw error;
    }
};

/**
 * Generates a video using Veo.
 */
export const generateVideo = async (
    prompt: string,
    aspectRatio: '16:9' | '9:16',
    imageInput?: string
): Promise<string> => {
    
    // Check for API Key selection via window.aistudio
    if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
             await window.aistudio.openSelectKey();
        }
    }
    
    const ai = getAI();
    
    let operation;
    
    try {
        if (imageInput) {
            const base64Data = imageInput.split(',')[1];
            const mimeType = imageInput.substring(imageInput.indexOf(':') + 1, imageInput.indexOf(';'));
            
            operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                image: {
                    imageBytes: base64Data,
                    mimeType: mimeType
                },
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio
                }
            });
        } else {
            operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio
                }
            });
        }

        // Poll for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) throw new Error("Video generation failed.");

        // Fetch the actual video bytes
        const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
        const blob = await videoResponse.blob();
        return URL.createObjectURL(blob);

    } catch (error: any) {
        if (error.message?.includes("Requested entity was not found")) {
             if (window.aistudio) await window.aistudio.openSelectKey();
             throw new Error("Please select a valid API Key for Veo.");
        }
        console.error("Veo Error:", error);
        throw error;
    }
};

/**
 * Chat with Gemini (Pro or Flash).
 */
export interface ChatParams {
    message: string;
    history: any[]; // Using any for simplicity with SDK types
    model: 'pro' | 'flash';
    isThinking?: boolean;
    attachment?: string; // Base64
    onChunk: (text: string) => void;
}

export const streamChat = async ({ 
    message, 
    history, 
    model, 
    isThinking, 
    attachment, 
    onChunk 
}: ChatParams) => {
    const ai = getAI();
    
    let modelName = 'gemini-2.5-flash-lite';
    let config: any = {};

    if (model === 'pro' || isThinking || attachment) {
        modelName = 'gemini-3-pro-preview';
        if (isThinking) {
            config.thinkingConfig = { thinkingBudget: 32768 };
        }
    }

    const chat: Chat = ai.chats.create({
        model: modelName,
        history: history,
        config: config
    });

    let msgContent: any = message;

    if (attachment) {
        const base64Data = attachment.split(',')[1];
        const mimeType = attachment.substring(attachment.indexOf(':') + 1, attachment.indexOf(';'));
        
        // For chat with attachments, we send parts
        msgContent = [
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            },
            { text: message }
        ];
    }

    const result = await chat.sendMessageStream({ message: msgContent });
    
    for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            onChunk(c.text);
        }
    }
};

export const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};