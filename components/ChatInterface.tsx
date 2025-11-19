import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { streamChat, checkSpelling } from '../services/geminiService';
import { SpellingModal } from './SpellingModal';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [attachment, setAttachment] = useState<{url: string, type: 'image' | 'video'} | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [spellingCorrection, setSpellingCorrection] = useState<{original: string, corrected: string} | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const type = file.type.startsWith('video') ? 'video' : 'image';
          const reader = new FileReader();
          reader.onloadend = () => {
              setAttachment({ url: reader.result as string, type });
              setIsPro(true);
          };
          reader.readAsDataURL(file);
      }
  };

  const initiateSend = async () => {
      if ((!input.trim() && !attachment) || isStreaming) return;

      // Check spelling for user input if it's text-heavy
      if (input.length > 5) {
          const check = await checkSpelling(input);
          if (check.hasMistake) {
              setSpellingCorrection({ original: input, corrected: check.corrected });
              return;
          }
      }

      executeSend(input);
  };

  const executeSend = async (finalInput: string) => {
      setSpellingCorrection(null);
      const userMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          text: finalInput,
          timestamp: Date.now(),
          attachments: attachment ? [attachment] : undefined
      };

      setMessages(prev => [...prev, userMsg]);
      setInput('');
      const currentAttachment = attachment;
      setAttachment(null);
      setIsStreaming(true);

      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
          id: botMsgId,
          role: 'model',
          text: '',
          timestamp: Date.now(),
          isThinking: isThinking
      }]);

      try {
          let fullText = '';
          await streamChat({
              message: userMsg.text,
              history: messages.map(m => ({
                  role: m.role,
                  parts: [{ text: m.text }]
              })),
              model: isPro ? 'pro' : 'flash',
              isThinking: isThinking,
              attachment: currentAttachment?.url,
              onChunk: (chunk) => {
                  fullText += chunk;
                  setMessages(prev => prev.map(m => 
                      m.id === botMsgId ? { ...m, text: fullText } : m
                  ));
              }
          });
      } catch (err) {
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'model',
              text: "I encountered a network issue. Please try again.",
              timestamp: Date.now()
          }]);
      } finally {
          setIsStreaming(false);
      }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-4 rounded-3xl bg-white dark:bg-vault-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transition-colors duration-300">
        
        {/* Header / Controls */}
        <div className="flex items-center justify-between border-b border-vault-100 dark:border-vault-800 bg-white dark:bg-vault-950 p-4">
            <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${isPro ? 'bg-purple-600' : 'bg-green-500'}`}></div>
                <span className="text-sm font-bold text-vault-900 dark:text-white">
                    {isPro ? 'Gemini Pro 3' : 'Gemini Flash 2.5'}
                </span>
                {isThinking && <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">Thinking</span>}
            </div>
            <div className="flex items-center gap-1 bg-vault-50 dark:bg-vault-900 rounded-lg p-1 border border-vault-200 dark:border-vault-800">
                <button 
                    onClick={() => { setIsPro(false); setIsThinking(false); }}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${!isPro ? 'bg-white dark:bg-vault-800 text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-vault-500 dark:text-vault-400 hover:text-black dark:hover:text-white'}`}
                >
                    Fast
                </button>
                <button 
                    onClick={() => setIsPro(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${isPro && !isThinking ? 'bg-white dark:bg-vault-800 text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-vault-500 dark:text-vault-400 hover:text-black dark:hover:text-white'}`}
                >
                    Smart
                </button>
                <button 
                    onClick={() => { setIsPro(true); setIsThinking(!isThinking); }}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${isThinking ? 'bg-purple-600 text-white shadow-sm' : 'text-vault-500 dark:text-vault-400 hover:text-black dark:hover:text-white'}`}
                >
                    Think
                </button>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-vault-900">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-vault-300 dark:text-vault-600">
                    <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p className="font-medium">VaultX Intelligence. Ready.</p>
                </div>
            )}
            
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm ${msg.role === 'user' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-vault-50 dark:bg-vault-800 text-vault-800 dark:text-vault-200 border border-vault-100 dark:border-vault-700'}`}>
                        {msg.attachments && msg.attachments.map((att, i) => (
                            <div key={i} className="mb-3 rounded-lg overflow-hidden max-w-[200px] border border-white/10 dark:border-black/10">
                                {att.type === 'image' ? (
                                    <img src={att.url} alt="Attachment" className="w-full h-auto" />
                                ) : (
                                    <div className="flex items-center justify-center h-24 bg-white/10 text-xs text-white">Video Attached</div>
                                )}
                            </div>
                        ))}
                        <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base font-medium">
                            {msg.text}
                        </div>
                        {msg.role === 'model' && msg.text === '' && (
                             <div className="flex gap-1 mt-2">
                                <div className="w-1.5 h-1.5 bg-vault-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-vault-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-1.5 h-1.5 bg-vault-400 rounded-full animate-bounce delay-200"></div>
                             </div>
                        )}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-vault-950 border-t border-vault-100 dark:border-vault-800">
             {attachment && (
                <div className="flex items-center gap-2 mb-3 bg-vault-50 dark:bg-vault-900 p-2 rounded-xl w-fit border border-vault-200 dark:border-vault-800">
                    <div className="h-10 w-10 bg-white dark:bg-vault-800 rounded-lg border border-vault-100 dark:border-vault-700 flex items-center justify-center overflow-hidden">
                        {attachment.type === 'image' ? <img src={attachment.url} className="w-full h-full object-cover"/> : <span className="text-[10px] font-bold dark:text-white">VID</span>}
                    </div>
                    <span className="text-xs font-bold text-vault-600 dark:text-vault-300">Attached</span>
                    <button onClick={() => setAttachment(null)} className="text-vault-400 hover:text-red-500 ml-2">&times;</button>
                </div>
            )}
            
            <div className="flex gap-3">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3.5 rounded-xl bg-vault-50 dark:bg-vault-900 text-vault-400 dark:text-vault-500 hover:bg-vault-100 dark:hover:bg-vault-800 hover:text-black dark:hover:text-white transition border border-vault-200 dark:border-vault-800"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
                </button>
                
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && initiateSend()}
                    placeholder="Ask VaultX..."
                    className="flex-1 bg-vault-50 dark:bg-vault-900 border-2 border-transparent focus:border-vault-200 dark:focus:border-vault-700 rounded-xl px-4 text-vault-900 dark:text-white placeholder-vault-400 dark:placeholder-vault-600 focus:outline-none focus:bg-white dark:focus:bg-black transition-all"
                />
                
                <button 
                    onClick={initiateSend}
                    disabled={(!input.trim() && !attachment) || isStreaming}
                    className={`p-3.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:bg-gray-900 dark:hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>

        <SpellingModal
            isOpen={!!spellingCorrection}
            original={spellingCorrection?.original || ''}
            corrected={spellingCorrection?.corrected || ''}
            onConfirm={() => executeSend(spellingCorrection!.corrected)}
            onReject={() => executeSend(spellingCorrection!.original)}
        />
    </div>
  );
};