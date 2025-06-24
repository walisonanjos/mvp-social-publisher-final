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
    // A ordenação agora acontece no componente VideoList para maior consistência
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

    // CORREÇÃO: A ordenação da busca no banco agora é 'ascending: true'
    const { data: videosData, error: videosError } = await supabase
      .from("videos")
      .select("*")
      .eq("user_id", userId)
      .lt('scheduled_at', todayISO)
      .order("scheduled_at", { ascending: true }); // A ordem agora é crescente

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
  }, [fetchHistoryData, supabase]);

  if (loading) {
    return (
        <main className="container mx-auto p-4 md:p-8">
            <Navbar />
            <div className="text-center p-8 mt-8">
                <p className="text-white">Carregando histórico...</p>
            </div>
        </main>
    );
  }
  
  if (!user) {
    return (
        <main className="container mx-auto p-4 md:p-8">
            <Navbar />
            <div className="text-center p-8 mt-8">
                <p className="text-white">Faça login para ver seu histórico.</p>
            </div>
        </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Navbar />
      <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
              Histórico de Publicações
          </h2>
          {/* A ordenação agora é controlada diretamente no componente VideoList */}
          <VideoList groupedVideos={groupedVideos} onDelete={(videoId) => console.log(`Deletar ${videoId} do histórico.`)} sortOrder="asc" />
      </div>
    </main>
  );
}
