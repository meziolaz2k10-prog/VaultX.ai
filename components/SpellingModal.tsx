import React from 'react';

interface SpellingModalProps {
  original: string;
  corrected: string;
  isOpen: boolean;
  onConfirm: () => void;
  onReject: () => void;
}

export const SpellingModal: React.FC<SpellingModalProps> = ({ 
  original, 
  corrected, 
  isOpen, 
  onConfirm, 
  onReject 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-sm p-4 transition-colors duration-300">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-vault-900 p-6 shadow-2xl ring-1 ring-vault-300 dark:ring-vault-700">
        <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-lg font-bold text-vault-900 dark:text-white">Spelling Check</h3>
        </div>
        
        <p className="text-vault-600 dark:text-vault-300 mb-4">We detected a possible spelling mistake in your prompt.</p>
        
        <div className="space-y-3 mb-6">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50">
                <p className="text-xs text-red-500 dark:text-red-400 uppercase font-bold mb-1">Original</p>
                <p className="text-red-800 dark:text-red-200 line-through opacity-70">{original}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50">
                 <p className="text-xs text-green-500 dark:text-green-400 uppercase font-bold mb-1">Suggestion</p>
                 <p className="text-green-800 dark:text-green-200 font-semibold">{corrected}</p>
            </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onReject}
            className="flex-1 py-2.5 rounded-xl border border-vault-300 dark:border-vault-700 text-vault-600 dark:text-vault-300 font-medium hover:bg-vault-100 dark:hover:bg-vault-800 transition"
          >
            Keep Original
          </button>
          <button 
             onClick={onConfirm}
             className="flex-1 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition shadow-lg"
          >
             Yes, Correct It
          </button>
        </div>
      </div>
    </div>
  );
};