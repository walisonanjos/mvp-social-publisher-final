// src/app/history/page.tsx

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "../../lib/supabaseClient"; // Ajustado o caminho do import
import { User } from "@supabase/supabase-js";
import Navbar from "../../components/Navbar"; // Ajustado o caminho do import
import VideoList from "../../components/VideoList"; // Ajustado o caminho do import
import { Video } from "../page"; // Reutilizando a mesma interface 'Video'

export default function HistoryPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const groupedVideos = useMemo(() => {
    const groups: { [key: string]: Video[] } = {};
    // Ordena para mostrar os mais recentes primeiro
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

    // MUDANÇA PRINCIPAL: Usando .lt() para buscar agendamentos ANTES de hoje
    const { data: videosData, error: videosError } = await supabase
      .from("videos")
      .select("*")
      .eq("user_id", userId)
      .lt('scheduled_at', todayISO) // lt = less than (menor que)
      .order("scheduled_at", { ascending: false }); // Mostra os mais recentes primeiro

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
    // Idealmente redirecionaria para o login, mas por enquanto mostramos uma mensagem.
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
    // Esta página não precisa do header principal, pois será renderizada dentro do layout
    <main className="container mx-auto p-4 md:p-8">
      <Navbar />
      <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
              Histórico de Publicações
          </h2>
          {/* A função de deletar pode ser diferente ou desabilitada no histórico */}
          <VideoList groupedVideos={groupedVideos} onDelete={(videoId) => console.log(`Deletar ${videoId} do histórico.`)} />
      </div>
    </main>
  );
}
