import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { downloadImage } from '../services/geminiService';

interface GeneratedModalProps {
  image: GeneratedImage | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GeneratedModal: React.FC<GeneratedModalProps> = ({ image, isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen || !image) return null;

  const handleDownload = () => {
    downloadImage(image.url, `vaultx-${image.id}.jpg`);
    showToast("Saved to Device");
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const handleSimulatedAction = (action: string) => {
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        showToast(`${action} Complete`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-md p-4 transition-colors duration-300">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white dark:bg-vault-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 flex flex-col md:flex-row h-[85vh] md:h-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/80 dark:bg-black/80 p-2 text-black dark:text-white backdrop-blur hover:bg-white dark:hover:bg-black transition-all shadow-lg"
        >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        {/* Image Section */}
        <div className="relative flex h-full md:h-[600px] w-full items-center justify-center bg-vault-50 dark:bg-black p-6 md:w-2/3 border-r border-vault-100 dark:border-vault-800">
            <img 
                src={image.url} 
                alt={image.prompt} 
                className="max-h-full max-w-full rounded-lg object-contain shadow-xl"
            />
             {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg">
                    <div className="flex flex-col items-center gap-3">
                         <div className="h-8 w-8 animate-spin rounded-full border-2 border-black dark:border-white border-t-transparent"></div>
                         <span className="text-sm font-bold text-black dark:text-white">Processing...</span>
                    </div>
                </div>
            )}
        </div>

        {/* Controls Section */}
        <div className="flex w-full flex-col bg-white dark:bg-vault-900 p-8 md:w-1/3 overflow-y-auto border-l border-vault-100 dark:border-vault-800">
            <h2 className="text-2xl font-bold text-vault-900 dark:text-white mb-1">Result</h2>
            <p className="text-xs font-medium text-vault-400 dark:text-vault-500 mb-8 uppercase tracking-wider">
                {new Date(image.timestamp).toLocaleDateString()} • {image.aspectRatio}
            </p>

            <div className="mb-8">
                <h3 className="mb-3 text-xs font-bold text-vault-400 dark:text-vault-500 uppercase tracking-wider">Prompt</h3>
                <div className="rounded-xl bg-vault-50 dark:bg-vault-950 p-4 text-sm text-vault-700 dark:text-vault-300 italic leading-relaxed border border-vault-100 dark:border-vault-800">
                    "{image.prompt}"
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-3">
                <button 
                    onClick={handleDownload}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-black dark:bg-white px-4 py-3.5 font-bold text-white dark:text-black transition hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95 shadow-lg"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download HD
                </button>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => handleSimulatedAction("Upscale")}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-2 rounded-xl border border-vault-200 dark:border-vault-700 bg-white dark:bg-vault-950 px-3 py-3 text-sm font-bold text-vault-600 dark:text-vault-300 transition hover:border-vault-300 hover:bg-vault-50 dark:hover:bg-vault-800 hover:text-black dark:hover:text-white"
                    >
                        Upscale 2x
                    </button>
                    <button 
                         onClick={() => handleSimulatedAction("Remove Background")}
                         disabled={isProcessing}
                        className="flex items-center justify-center gap-2 rounded-xl border border-vault-200 dark:border-vault-700 bg-white dark:bg-vault-950 px-3 py-3 text-sm font-bold text-vault-600 dark:text-vault-300 transition hover:border-vault-300 hover:bg-vault-50 dark:hover:bg-vault-800 hover:text-black dark:hover:text-white"
                    >
                        Remove BG
                    </button>
                </div>
            </div>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-black dark:bg-white px-6 py-3 text-sm font-bold text-white dark:text-black shadow-2xl animate-fade-in-up">
                {toastMsg}
            </div>
        )}

      </div>
    </div>
  );
};