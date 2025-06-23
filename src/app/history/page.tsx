// src/app/history/page.tsx

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "../../lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import Navbar from "../../components/Navbar";
import VideoList from "../../components/VideoList";
import { Video } from "../page";

export default function HistoryPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const groupedVideos = useMemo(() => {
    const groups: { [key: string]: Video[] } = {};
    videos.sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
    videos.forEach((video) => {
      const dateKey = new Date(video.scheduled_at).toISOString().split('T')[0];
      if (!groups[dateKey]) { groups[dateKey] = []; }
      groups[dateKey].push(video);
    });
    return groups;
  }, [videos]);

  const fetchHistoryData = useCallback(async (userId: string) => {
    setLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const todayISO = today.toISOString();

    const { data: videosData, error: videosError } = await supabase
      .from("videos")
      .select("*")
      .eq("user_id", userId)
      .lt('scheduled_at', todayISO)
      .order("scheduled_at", { ascending: false });

    if (videosError) {
      console.error("Erro ao buscar histórico de vídeos:", videosError);
    } else {
      setVideos(videosData || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const setupPage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchHistoryData(user.id);
      } else {
        setLoading(false);
      }
    };
    setupPage();
  // MUDANÇA: Adicionando 'supabase' à lista de dependências
  }, [fetchHistoryData, supabase]);

  if (loading) {
    return <div className="text-center p-8"><p className="text-white">Carregando histórico...</p></div>;
  }
  
  if (!user) {
    return <div className="text-center p-8"><p className="text-white">Faça login para ver seu histórico.</p></div>;
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Navbar />
      <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
              Histórico de Publicações
          </h2>
          <VideoList groupedVideos={groupedVideos} onDelete={() => { /* onDelete pode ser desabilitado ou implementado */ }} />
      </div>
    </main>
  );
}
