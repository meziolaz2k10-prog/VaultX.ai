import React from 'react';
import { UserProfile, Tab, Theme } from '../types';

interface NavbarProps {
  user: UserProfile;
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  theme: Theme;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, currentTab, onTabChange, theme, toggleTheme }) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-vault-200 dark:border-vault-800 bg-white/80 dark:bg-vault-950/80 backdrop-blur-md shadow-sm transition-colors duration-300">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('art')}>
            {/* VaultX Logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black shadow-lg transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 7L17 17M17 7L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </div>
            <span className="text-xl font-bold tracking-tighter text-vault-900 dark:text-white hidden md:block">
                Vault<span className="text-vault-400">X</span>.ai
            </span>
            </div>
            
            <div className="flex items-center gap-1 rounded-xl bg-vault-100 dark:bg-vault-900 p-1 border border-vault-200 dark:border-vault-800">
                <button 
                    onClick={() => onTabChange('art')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${currentTab === 'art' ? 'bg-white dark:bg-vault-800 text-vault-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-vault-500 dark:text-vault-400 hover:text-vault-900 dark:hover:text-white'}`}
                >
                    Create
                </button>
                <button 
                    onClick={() => onTabChange('video')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${currentTab === 'video' ? 'bg-white dark:bg-vault-800 text-vault-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-vault-500 dark:text-vault-400 hover:text-vault-900 dark:hover:text-white'}`}
                >
                    Video
                </button>
                <button 
                    onClick={() => onTabChange('chat')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${currentTab === 'chat' ? 'bg-white dark:bg-vault-800 text-vault-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-vault-500 dark:text-vault-400 hover:text-vault-900 dark:hover:text-white'}`}
                >
                    Intelligence
                </button>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-vault-500 hover:bg-vault-100 dark:hover:bg-vault-800 transition-colors"
                aria-label="Toggle Theme"
            >
                {theme === 'light' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                )}
            </button>
            <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-vault-800 dark:text-vault-200">{user.name}</span>
            </div>
            <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-white dark:border-vault-700 shadow-md ring-1 ring-vault-200 dark:ring-vault-800">
                <img src={user.avatar} alt="User" className="h-full w-full object-cover" />
            </div>
        </div>
      </div>
    </nav>
  );
};