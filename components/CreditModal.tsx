import React from 'react';

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCredits: (amount: number) => void;
}

export const CreditModal: React.FC<CreditModalProps> = ({ isOpen, onClose, onAddCredits }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-dark-900 p-6 shadow-2xl ring-1 ring-white/10">
        <h3 className="text-xl font-bold text-white mb-2">Out of Credits?</h3>
        <p className="text-gray-400 mb-6">You need 1 credit to generate an image. Top up now to keep creating!</p>
        
        <div className="space-y-3">
          <button 
            onClick={() => onAddCredits(5)}
            className="flex w-full items-center justify-between rounded-xl bg-dark-800 p-4 hover:bg-dark-700 transition ring-1 ring-dark-700"
          >
            <span className="font-bold text-white">5 Credits</span>
            <span className="text-primary-500 font-bold">Free (Demo)</span>
          </button>
          <button 
             onClick={() => onAddCredits(50)}
             className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 p-4 hover:from-primary-500 hover:to-purple-500 transition"
          >
             <span className="font-bold text-white">50 Credits</span>
             <span className="text-white font-bold">$4.99</span>
          </button>
        </div>
        
        <button 
            onClick={onClose}
            className="mt-6 w-full py-2 text-sm text-gray-500 hover:text-white"
        >
            Cancel
        </button>
      </div>
    </div>
  );
};