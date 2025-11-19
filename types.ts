export interface ArtStyle {
  id: string;
  name: string;
  promptModifier: string;
  icon: string; // SVG path or Lucide name reference
  previewColor: string;
}

export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  styleId: string;
  timestamp: number;
  aspectRatio: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface GenerationState {
  status: GenerationStatus;
  currentImage: GeneratedImage | null;
  error: string | null;
}

export type Tab = 'art' | 'video' | 'chat';
export type Theme = 'light' | 'dark';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachments?: {
    type: 'image' | 'video';
    url: string;
  }[];
  isThinking?: boolean;
}