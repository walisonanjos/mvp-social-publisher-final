// src/app/page.tsx

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Auth from "../components/Auth";
import UploadForm from "../components/UploadForm";
import VideoList from "../components/VideoList";
import { createClient } from "../lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { RefreshCw } from "lucide-react";
import Navbar from "../components/Navbar";
import AccountConnection from "../components/AccountConnection";

// MUDANÇA: Adicionamos o campo 'target_youtube' à nossa interface
export interface Video {
  id: string;
  title: string;
  video_url: string;
  scheduled_at: string;
  status: 'agendado' | 'postado' | 'falhou';
  youtube_video_id: string | null;
  post_error: string | null;
  target_youtube: boolean | null; // Adicionado para sabermos para qual rede é o post
}

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);

  const groupedVideos = useMemo(() => {
    const groups: { [key: string]: Video[] } = {};
    videos.forEach((video) => {
      const dateKey = new Date(video.scheduled_at).toISOString().split('T')[0];
      if (!groups[dateKey]) { groups[dateKey] = []; }
      groups[dateKey].push(video);
    });
    return groups;
  }, [videos]);

  const fetchPageData = useCallback(async (userId: string) => {
    // A query para buscar vídeos agora seleciona todas as colunas
    const { data: videosData, error: videosError } = await supabase
      .from("videos")
      .select("*")
      .eq("user_id", userId)
      .order("scheduled_at", { ascending: true });

    if (videosError) console.error("Erro ao buscar vídeos:", videosError);
    else setVideos(videosData || []);

    const { count, error: tokenError } = await supabase
      .from('youtube_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (tokenError) {
        console.error("Erro ao verificar token do YouTube:", tokenError);
    }
    
    setIsYouTubeConnected(count ? count > 0 : false); 

  }, [supabase]);

  useEffect(() => {
    const setupPage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) { await fetchPageData(user.id); }
      setLoading(false);
    };
    setupPage();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) { fetchPageData(currentUser.id); } 
      else { setVideos([]); setIsYouTubeConnected(false); }
    });
    return () => { authListener.subscription.unsubscribe(); };
  }, [supabase, fetchPageData]);
  
  // O useEffect para Realtime agora também chama fetchPageData para garantir consistência
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`videos_realtime_user_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
        if (user) { fetchPageData(user.id); }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); }
  }, [user, supabase, fetchPageData]);
  
  const handleDeleteVideo = async (videoId: string) => {
    const currentVideos = videos;
    setVideos(current => current.filter(v => v.id !== videoId));
    const { error } = await supabase.from('videos').delete().eq('id', videoId);
    if (error) {
      console.error('Erro ao deletar agendamento:', error);
      alert('Não foi possível excluir o agendamento. Revertendo.');
      setVideos(currentVideos);
    }
  };
  
  const handleDisconnectYouTube = async () => {
    if (!user) return;
    const { error } = await supabase.from('youtube_tokens').delete().eq('user_id', user.id);
    if (error) {
      alert("Erro ao desconectar a conta.");
    } else {
      setIsYouTubeConnected(false);
      alert("Conta do YouTube desconectada com sucesso.");
    }
  };

  if (loading) { return <div className="flex items-center justify-center min-h-screen bg-gray-900"><p className="text-white">Carregando...</p></div>; }
  if (!user) { return <Auth />; }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <header className="bg-gray-800/80 backdrop-blur-sm p-4 border-b border-gray-700 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-teal-400">Social Publisher</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Olá, <strong className="font-medium text-white">{user.email?.split("@")[0]}</strong></span>
            <button
              onClick={async () => await supabase.auth.signOut()}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Navbar />
        {/* MUDANÇA: Passando a função de callback para o formulário */}
        <div className="mt-8">
          <UploadForm onScheduleSuccess={() => user && fetchPageData(user.id)} />
        </div>
        <div className="mt-8">
          <AccountConnection 
            isYouTubeConnected={isYouTubeConnected}
            onDisconnectYouTube={handleDisconnectYouTube}
          />
        </div>
        <hr className="my-8 border-gray-700" />
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">Meus Agendamentos</h2>
            <button onClick={() => user && fetchPageData(user.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors" title="Atualizar lista">
                <RefreshCw size={14} /><span>Atualizar</span>
            </button>
        </div>
        <VideoList groupedVideos={groupedVideos} onDelete={handleDeleteVideo} />
      </main>
    </div>
  );
}
