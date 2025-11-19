import React, { useState, useRef } from 'react';
import { generateVideo, checkSpelling } from '../services/geminiService';
import { SpellingModal } from './SpellingModal';

export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [spellingCorrection, setSpellingCorrection] = useState<{original: string, corrected: string} | null>(null);

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
      
      setIsLoading(true);
      const check = await checkSpelling(prompt);
      
      if (check.hasMistake) {
          setSpellingCorrection({ original: prompt, corrected: check.corrected });
          setIsLoading(false);
          return;
      }
      
      executeGeneration(prompt);
  };

  const executeGeneration = async (finalPrompt: string) => {
    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setSpellingCorrection(null);
    
    try {
        const url = await generateVideo(finalPrompt, aspectRatio, uploadedImage || undefined);
        setGeneratedVideoUrl(url);
        setPrompt(finalPrompt);
    } catch (err: any) {
        setError(err.message || "Video generation failed");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded-3xl bg-white dark:bg-vault-900 p-6 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 md:p-8 transition-colors duration-300">
            <div className="mb-8 flex flex-col gap-2 text-center">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-vault-900 to-vault-600 dark:from-white dark:to-vault-400 bg-clip-text text-transparent">
                  Motion Studio
                </h1>
                <p className="text-vault-500 dark:text-vault-400 font-medium">Cinematic video generation powered by Veo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="md:col-span-1 space-y-4">
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300
                            ${uploadedImage ? 'border-black/10 dark:border-white/10 bg-vault-50 dark:bg-vault-800' : 'border-vault-300 dark:border-vault-700 bg-vault-50 dark:bg-vault-800 hover:border-vault-400 dark:hover:border-vault-500 hover:bg-vault-100 dark:hover:bg-vault-700'}
                        `}
                      >
                          {uploadedImage ? (
                              <div className="relative h-full w-full p-2">
                                <img src={uploadedImage} alt="Reference" className="h-full w-full object-contain" />
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
                                    className="absolute top-1 right-1 rounded-full bg-white dark:bg-black p-1 text-red-500 shadow-md hover:bg-red-50 dark:hover:bg-red-900/30"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                              </div>
                          ) : (
                              <div className="flex flex-col items-center text-vault-400 dark:text-vault-500 text-center p-2">
                                  <svg className="mb-2 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-xs font-medium">Image-to-Video (Optional)</span>
                              </div>
                          )}
                          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-vault-400 dark:text-vault-500 tracking-wider">Format</label>
                        <div className="flex gap-2">
                            {(['16:9', '9:16'] as const).map(r => (
                                <button
                                    key={r}
                                    onClick={() => setAspectRatio(r)}
                                    className={`flex-1 rounded-lg border py-2 text-sm font-bold transition-all ${aspectRatio === r ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-md' : 'border-vault-200 dark:border-vault-700 bg-white dark:bg-vault-950 text-vault-500 dark:text-vault-400 hover:border-vault-300 dark:hover:border-vault-600'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                      </div>
                </div>

                {/* Prompt & Generate */}
                <div className="md:col-span-2 flex flex-col gap-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the motion..."
                        className="h-40 w-full resize-none rounded-2xl border-2 border-vault-100 dark:border-vault-800 bg-vault-50 dark:bg-vault-950 p-4 text-base text-vault-900 dark:text-white placeholder-vault-400 dark:placeholder-vault-600 outline-none focus:border-black/20 dark:focus:border-white/20 focus:bg-white dark:focus:bg-vault-900 focus:ring-0 transition-all shadow-inner"
                    />
                    
                    <button
                        onClick={initiateGeneration}
                        disabled={isLoading || !prompt.trim()}
                        className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-black dark:bg-white py-4 font-bold text-white dark:text-black shadow-lg transition-all 
                            ${isLoading ? 'opacity-70 cursor-wait' : 'hover:scale-[1.01] active:scale-[0.99]'}
                        `}
                    >
                        {isLoading ? (
                             <>
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white dark:border-black border-t-transparent" />
                                <span>Processing Video (1-2m)...</span>
                             </>
                        ) : (
                            <>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Generate Video</span>
                            </>
                        )}
                    </button>

                    {error && <p className="text-sm text-red-500 dark:text-red-400 text-center font-medium">{error}</p>}
                </div>
            </div>
        </div>

        {/* RESULT SECTION */}
        {generatedVideoUrl && (
            <div className="overflow-hidden rounded-3xl border border-vault-200 dark:border-vault-800 bg-white dark:bg-vault-900 shadow-2xl transition-colors duration-300">
                <video 
                    src={generatedVideoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full max-h-[600px] mx-auto bg-black"
                />
                <div className="flex justify-between items-center bg-white dark:bg-vault-900 p-6 border-t border-vault-100 dark:border-vault-800">
                    <h3 className="font-bold text-vault-900 dark:text-white">Result</h3>
                    <a 
                        href={generatedVideoUrl} 
                        download="vaultx-video.mp4"
                        className="px-4 py-2 rounded-lg bg-vault-100 dark:bg-vault-800 text-sm font-bold text-vault-900 dark:text-white hover:bg-vault-200 dark:hover:bg-vault-700 transition"
                    >
                        Download MP4
                    </a>
                </div>
            </div>
        )}

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