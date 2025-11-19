import { ArtStyle } from "./types";

export const ART_STYLES: ArtStyle[] = [
  {
    id: 'none',
    name: 'No Style',
    promptModifier: 'high quality, detailed',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    previewColor: 'bg-gray-600'
  },
  {
    id: 'anime',
    name: 'Anime',
    promptModifier: 'anime style, vivid colors, studio ghibli, makoto shinkai, highly detailed, cel shading',
    icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    previewColor: 'bg-pink-500'
  },
  {
    id: 'realistic',
    name: 'Realistic',
    promptModifier: 'photorealistic, 8k resolution, cinematic lighting, raw photo, hyperdetailed, shot on 35mm lens',
    icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
    previewColor: 'bg-blue-500'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    promptModifier: 'cyberpunk style, neon lights, futuristic city, high tech, synthwave colors, dark atmosphere',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    previewColor: 'bg-purple-600'
  },
  {
    id: '3d-render',
    name: '3D Render',
    promptModifier: '3D render, unreal engine 5, octane render, ray tracing, plastic texture, cute, isometric',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    previewColor: 'bg-orange-500'
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    promptModifier: 'oil painting style, visible brushstrokes, texture, classical art, impressionist',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    previewColor: 'bg-yellow-600'
  }
];