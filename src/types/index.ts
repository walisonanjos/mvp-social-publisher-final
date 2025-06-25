// src/types/index.ts

// A definição ÚNICA e COMPLETA para Niche, usada em todo o app.
export type Niche = {
  id: string;
  name: string;
};

// A definição ÚNICA e COMPLETA para Video, usada em todo o app.
// Combina todos os campos de todas as versões anteriores.
export type Video = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  video_url: string;
  scheduled_at: string;
  // Usamos o status em português que a UI já espera.
  status: 'agendado' | 'postado' | 'falhou';
  user_id: string;
  youtube_video_id: string | null;
  post_error: string | null;
  target_youtube: boolean | null;
  niche_id: string;
};