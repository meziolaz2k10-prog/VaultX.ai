import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ArtGenerator } from './components/ArtGenerator';
import { VideoGenerator } from './components/VideoGenerator';
import { ChatInterface } from './components/ChatInterface';
import { UserProfile, GeneratedImage, Tab, Theme } from './types';

// Mock initial user
const INITIAL_USER: UserProfile = {
  name: 'Designer',
  avatar: 'https://picsum.photos/200/200'
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [currentTab, setCurrentTab] = useState<Tab>('art');
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [theme, setTheme] = useState<Theme>('light');

  // Load history and theme
  useEffect(() => {
    const savedHistory = localStorage.getItem('vaultx_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    const savedTheme = localStorage.getItem('vaultx_theme') as Theme;
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('vaultx_history', JSON.stringify(history));
  }, [history]);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('vaultx_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen text-vault-900 dark:text-white font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black pb-12 transition-colors duration-300">
      <Navbar 
        user={user} 
        currentTab={currentTab} 
        onTabChange={setCurrentTab}
        theme={theme}
        toggleTheme={toggleTheme} 
      />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 md:px-8">
        {currentTab === 'art' && (
            <ArtGenerator 
                history={history}
                setHistory={setHistory}
            />
        )}

        {currentTab === 'video' && (
            <VideoGenerator />
        )}

        {currentTab === 'chat' && (
            <ChatInterface />
        )}
      </main>
    </div>
  );
};

export default App;