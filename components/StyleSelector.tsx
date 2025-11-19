import React from 'react';
import { ART_STYLES } from '../constants';
import { ArtStyle } from '../types';

interface StyleSelectorProps {
  selectedStyle: string;
  onSelect: (styleId: string) => void;
  disabled?: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect, disabled }) => {
  return (
    <div className="w-full py-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-vault-400 dark:text-vault-500">
        Aesthetic Style
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {ART_STYLES.map((style: ArtStyle) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            disabled={disabled}
            className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 p-4 transition-all duration-200
              ${
                selectedStyle === style.id
                  ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-lg scale-105'
                  : 'border-vault-100 dark:border-vault-800 bg-vault-50 dark:bg-vault-950 text-vault-500 dark:text-vault-400 hover:border-vault-300 dark:hover:border-vault-600 hover:bg-white dark:hover:bg-vault-900 hover:text-black dark:hover:text-white'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-current bg-opacity-10`}>
                 <svg 
                    className={`h-6 w-6 ${selectedStyle === style.id ? 'text-white dark:text-black' : 'text-vault-400 dark:text-vault-500 group-hover:text-black dark:group-hover:text-white'}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.icon} />
                </svg>
            </div>
            <span className="text-xs font-bold">
              {style.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};