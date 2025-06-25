// src/types/index.ts

// Mova a definição do tipo 'Video' para cá
export type Video = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  video_url: string;
  scheduled_at: string;
  status: 'scheduled' | 'published' | 'error';
  user_id: string;
  youtube_video_id?: string;
  niche_id: string;
};