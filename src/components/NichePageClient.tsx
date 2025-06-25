// src/components/NichePageClient.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
import Link from 'next/link';
import Auth from "./Auth";
import UploadForm from "./UploadForm";
import VideoList from "./VideoList";
import Navbar from "./Navbar";
import AccountConnection from "./AccountConnection";
// CORREÇÃO: Agora este import puxa a definição completa e unificada de 'Video'.
import { Video } from "@/types"; 

export default function NichePageClient({ nicheId }: { nicheId: string }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
  const [nicheName, setNicheName] = useState("Carregando...");

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
    // Como nossa query agora é 'select *', o Supabase retornará todos os campos.
    // O tipo 'Video' agora corresponde a todos os campos possíveis da tabela.
    const { data: videosData, error: videosError } = await supabase
      .from("videos")
      .select<"*", Video>("*") // Especificando o tipo para o select
      .eq("user_id", userId)
      .eq("niche_id", nicheId)
      .order("scheduled_at", { ascending: true });

    if (videosError) console.error("Erro ao buscar vídeos:", videosError);
    else setVideos(videosData || []);

    const { count } = await supabase
      .from('social_connections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('niche_id', nicheId)
      .eq('platform', 'youtube');

    setIsYouTubeConnected(!!count && count > 0);

    const { data: nicheData } = await supabase.from('niches').select('name').eq('id', nicheId).single();
    if (nicheData) setNicheName(nicheData.name);

  }, [supabase, nicheId]);

  useEffect(() => {
    const setupPage = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) { 
        await fetchPageData(user.id); 
      }
      setLoading(false);
    };
    setupPage();
  // A dependência de `fetchPageData` está correta.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);
  
  const handleDeleteVideo = async (videoId: string) => {
    setVideos(current => current.filter(v => v.id !== videoId));
    const { error } = await supabase.from('videos').delete().eq('id', videoId);
    if (error) console.error('Erro ao deletar agendamento:', error);
    else {
      // Opcional: recarregar os dados para ter certeza que está sincronizado.
      if(user) await fetchPageData(user.id);
    }
  };

  const handleDisconnectYouTube = async () => {
    if (!user) return;
    const { error } = await supabase.from('social_connections')
      .delete()
      .match({ user_id: user.id, niche_id: nicheId, platform: 'youtube' });

    if (error) alert("Erro ao desconectar a conta.");
    else {
      setIsYouTubeConnected(false);
      alert("Conta do YouTube desconectada com sucesso deste workspace.");
    }
  };

  if (loading) { return <div className="flex items-center justify-center min-h-screen bg-gray-900"><Loader2 className="h-12 w-12 text-teal-400 animate-spin" /></div>; }
  if (!user) { return <Auth />; }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <header className="bg-gray-800/80 backdrop-blur-sm p-4 border-b border-gray-700 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/niches" className="text-gray-400 hover:text-white transition-colors" title="Ver outros Workspaces">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-white">{nicheName}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 hidden sm:inline">Olá, <strong className="font-medium text-white">{user.email?.split("@")[0]}</strong></span>
            <button onClick={() => supabase.auth.signOut()} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Sair</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Navbar nicheId={nicheId} />
        <div className="mt-8">
          <UploadForm onScheduleSuccess={() => user && fetchPageData(user.id)} nicheId={nicheId} />
        </div>
        <div className="mt-8">
          <AccountConnection 
            isYouTubeConnected={isYouTubeConnected}
            onDisconnectYouTube={handleDisconnectYouTube}
            nicheId={nicheId}
          />
        </div>
        <hr className="my-8 border-gray-700" />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white">Meus Agendamentos</h2>
          <button onClick={() => user && fetchPageData(user.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors" title="Atualizar lista">
            <RefreshCw size={14} /><span>Atualizar</span>
          </button>
        </div>
        <VideoList groupedVideos={groupedVideos} onDelete={handleDeleteVideo} sortOrder="asc" />
      </main>
    </div>
  );
}