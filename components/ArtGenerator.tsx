import React, { useState, useRef } from 'react';
import { StyleSelector } from './StyleSelector';
import { GeneratedModal } from './GeneratedModal';
import { SpellingModal } from './SpellingModal';
import { GeneratedImage, GenerationState, GenerationStatus } from '../types';
import { ART_STYLES } from '../constants';
import { generateArt, editImage, checkSpelling } from '../services/geminiService';

interface ArtGeneratorProps {
    history: GeneratedImage[];
    setHistory: React.Dispatch<React.SetStateAction<GeneratedImage[]>>;
}

export const ArtGenerator: React.FC<ArtGeneratorProps> = ({ 
    history, setHistory 
}) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [selectedStyle, setSelectedStyle] = useState<string>('anime');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '3:4' | '4:3'>('1:1');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Spelling State
  const [spellingCorrection, setSpellingCorrection] = useState<{original: string, corrected: string} | null>(null);

  const [generationState, setGenerationState] = useState<GenerationState>({
    status: GenerationStatus.IDLE,
    currentImage: null,
    error: null,
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setUploadedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const initiateGeneration = async () => {
      if (!prompt.trim()) return;
      if (mode === 'edit' && !uploadedImage) return;

      // 1. Check Spelling First
      setGenerationState(prev => ({ ...prev, status: GenerationStatus.LOADING }));
      const check = await checkSpelling(prompt);
      
      if (check.hasMistake) {
          setSpellingCorrection({ original: prompt, corrected: check.corrected });
          setGenerationState(prev => ({ ...prev, status: GenerationStatus.IDLE })); // Pause loading
          return; 
      }

      // No mistake, proceed
      executeGeneration(prompt);
  };

  const executeGeneration = async (finalPrompt: string) => {
    setGenerationState({ status: GenerationStatus.LOADING, currentImage: null, error: null });
    setSpellingCorrection(null);

    try {
      let imageUrl = '';
      let displayPrompt = finalPrompt;

      if (mode === 'generate') {
        const style = ART_STYLES.find(s => s.id === selectedStyle) || ART_STYLES[0];
        imageUrl = await generateArt(finalPrompt, style.promptModifier, aspectRatio);
      } else {
        // Edit Mode
        imageUrl = await editImage(uploadedImage!, finalPrompt);
        displayPrompt = `Edited: ${finalPrompt}`;
      }
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: displayPrompt,
        styleId: mode === 'generate' ? selectedStyle : 'custom-edit',
        timestamp: Date.now(),
        aspectRatio: aspectRatio
      };

      setHistory(prev => [newImage, ...prev]);
      setGenerationState({ status: GenerationStatus.SUCCESS, currentImage: newImage, error: null });
      setIsDetailModalOpen(true);
      setPrompt(finalPrompt); // Update input to corrected version if applicable

    } catch (err: any) {
      setGenerationState({ 
        status: GenerationStatus.ERROR, 
        currentImage: null, 
        error: err.message || 'Failed to generate image. Please try again.' 
      });
    }
  };

  const openImageDetails = (img: GeneratedImage) => {
      setGenerationState(prev => ({ ...prev, currentImage: img }));
      setIsDetailModalOpen(true);
  };

  return (
    <div className="w-full">
        {/* HERO / INPUT SECTION */}
        <div className="mx-auto max-w-4xl rounded-3xl bg-white dark:bg-vault-900 p-6 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 md:p-8 transition-colors duration-300">
          
          {/* Mode Toggle */}
          <div className="mb-8 flex justify-center">
            <div className="flex rounded-2xl bg-vault-100 dark:bg-vault-800 p-1.5 border border-vault-200 dark:border-vault-700 shadow-inner">
                <button
                    onClick={() => setMode('generate')}
                    className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'generate' ? 'bg-white dark:bg-vault-900 text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-vault-500 dark:text-vault-400 hover:text-black dark:hover:text-white'}`}
                >
                    Text to Image
                </button>
                <button
                    onClick={() => setMode('edit')}
                    className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'edit' ? 'bg-white dark:bg-vault-900 text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-vault-500 dark:text-vault-400 hover:text-black dark:hover:text-white'}`}
                >
                    Edit Image
                </button>
            </div>
          </div>

          <div className="mb-8 flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-extrabold md:text-4xl text-vault-900 dark:text-white tracking-tight">
              {mode === 'generate' ? 'Visualize your ideas.' : 'Refine your reality.'}
            </h1>
            <p className="text-vault-500 dark:text-vault-400 font-medium">
                {mode === 'generate' ? 'Premium AI generation powered by Gemini.' : 'Upload and instruct Gemini to transform your photo.'}
            </p>
          </div>

          {/* Edit Mode Image Upload */}
          {mode === 'edit' && (
              <div className="mb-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300
                        ${uploadedImage ? 'border-black/10 dark:border-white/10 bg-vault-50 dark:bg-vault-800' : 'border-vault-300 dark:border-vault-700 bg-vault-50 dark:bg-vault-800 hover:border-vault-400 dark:hover:border-vault-500 hover:bg-vault-100 dark:hover:bg-vault-700'}
                    `}
                  >
                      {uploadedImage ? (
                          <img src={uploadedImage} alt="Upload" className="h-full w-full object-contain p-2" />
                      ) : (
                          <div className="flex flex-col items-center text-vault-500 dark:text-vault-400">
                              <svg className="mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium">Click to upload source image</span>
                          </div>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                  </div>
              </div>
          )}

          <div className="relative mb-6 group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'generate' ? "A futuristic city made of white marble and gold..." : "Add a vintage filter, remove the background..."}
              className="h-32 w-full resize-none rounded-2xl border-2 border-vault-100 dark:border-vault-800 bg-vault-50 dark:bg-vault-950 p-5 text-lg text-vault-900 dark:text-white placeholder-vault-400 dark:placeholder-vault-600 outline-none focus:border-black/20 dark:focus:border-white/20 focus:bg-white dark:focus:bg-vault-900 focus:ring-0 transition-all shadow-inner"
            />
            {prompt && (
                <button 
                    onClick={() => setPrompt('')}
                    className="absolute right-3 top-3 rounded-full p-1 text-vault-400 hover:bg-vault-200 dark:hover:bg-vault-800 hover:text-black dark:hover:text-white transition"
                >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                </button>
            )}
          </div>

          <div className="mb-6 flex flex-wrap gap-4 items-center justify-between border-b border-vault-100 dark:border-vault-800 pb-4">
             {/* Aspect Ratio Selector - Only for Generate Mode */}
             {mode === 'generate' && (
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <span className="text-xs uppercase tracking-wider text-vault-400 dark:text-vault-500 font-bold">Aspect Ratio</span>
                    <div className="flex flex-wrap gap-1 rounded-lg bg-vault-100 dark:bg-vault-800 p-1 border border-vault-200 dark:border-vault-700">
                        {['1:1', '16:9', '9:16', '3:4', '4:3'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setAspectRatio(r as any)}
                                className={`flex-1 sm:flex-none px-3 py-1 text-xs font-bold rounded-md transition-all ${aspectRatio === r ? 'bg-white dark:bg-vault-950 text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-vault-500 dark:text-vault-400 hover:text-vault-900 dark:hover:text-white'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
             )}
          </div>

          {mode === 'generate' && (
            <StyleSelector 
                selectedStyle={selectedStyle} 
                onSelect={setSelectedStyle} 
                disabled={generationState.status === GenerationStatus.LOADING}
            />
          )}

          <button
            onClick={initiateGeneration}
            disabled={generationState.status === GenerationStatus.LOADING || !prompt.trim() || (mode === 'edit' && !uploadedImage)}
            className={`group mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-black dark:bg-white py-4 text-lg font-bold text-white dark:text-black shadow-xl shadow-black/20 dark:shadow-white/10 transition-all 
              ${generationState.status === GenerationStatus.LOADING ? 'opacity-70 cursor-wait' : 'hover:scale-[1.01] hover:shadow-2xl active:scale-[0.99]'}
              ${(mode === 'edit' && !uploadedImage) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {generationState.status === GenerationStatus.LOADING ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white dark:border-black border-t-transparent" />
                <span>{mode === 'generate' ? 'Processing...' : 'Editing...'}</span>
              </>
            ) : (
              <>
                <svg className="h-6 w-6 transition-transform group-hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span>{mode === 'generate' ? 'Generate Masterpiece' : 'Apply Transformation'}</span>
              </>
            )}
          </button>
          
          {generationState.error && (
            <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-center text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50">
              {generationState.error}
            </div>
          )}
        </div>

        {/* GALLERY SECTION */}
        <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-vault-900 dark:text-white tracking-tight">Your Vault</h2>
                <span className="text-sm font-medium text-vault-500 dark:text-vault-400 bg-white dark:bg-vault-900 px-3 py-1 rounded-full shadow-sm border border-vault-200 dark:border-vault-800">{history.length} Assets</span>
            </div>
            
            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-vault-300 dark:border-vault-700 bg-white/50 dark:bg-vault-900/50 py-24">
                    <div className="mb-4 rounded-full bg-vault-100 dark:bg-vault-800 p-6">
                        <svg className="h-8 w-8 text-vault-400 dark:text-vault-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-vault-500 dark:text-vault-400 font-medium">Your vault is empty. Create something iconic.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {history.map((img) => (
                        <div 
                            key={img.id} 
                            onClick={() => openImageDetails(img)}
                            className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-white dark:bg-vault-900 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
                        >
                            <img 
                                src={img.url} 
                                alt={img.prompt} 
                                loading="lazy"
                                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <p className="truncate text-xs font-medium text-white/90">{img.prompt}</p>
                                    <p className="text-[10px] text-gray-400 capitalize mt-0.5">{img.styleId}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      {/* Modals */}
      <GeneratedModal 
        image={generationState.currentImage} 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
      />
      
      <SpellingModal
        isOpen={!!spellingCorrection}
        original={spellingCorrection?.original || ''}
        corrected={spellingCorrection?.corrected || ''}
        onConfirm={() => executeGeneration(spellingCorrection!.corrected)}
        onReject={() => executeGeneration(spellingCorrection!.original)}
      />
    </div>
  );
};