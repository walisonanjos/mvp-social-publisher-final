"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { Video } from "@/types";
import MainHeader from "./MainHeader";
import Navbar from "./Navbar";
import VideoList from "./VideoList";
import Auth from "./Auth";

export default function HistoryPageClient({ nicheId }: { nicheId: string }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [nicheName, setNicheName] = useState("Carregando...");

  const groupedVideos = useMemo(() => {
    const groups: { [key: string]: Video[] } = {};
    videos.forEach((video) => {
      const dateKey = new Date(video.scheduled_at).toISOString().split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(video);
    });
    return groups;
  }, [videos]);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const todayISO = new Date().toISOString();

        const { data: videosData, error: videosError } = await supabase
          .from("videos")
          .select<"*", Video>("*")
          .eq("user_id", user.id)
          .eq("niche_id", nicheId)
          .lt("scheduled_at", todayISO) // Busca vídeos com data no passado
          .order("scheduled_at", { ascending: false });

        if (videosError)
          console.error("Erro ao buscar histórico:", videosError);
        else setVideos(videosData || []);

        const { data: nicheData } = await supabase
          .from("niches")
          .select("name")
          .eq("id", nicheId)
          .single();
        if (nicheData) setNicheName(nicheData.name);
      }
      setLoading(false);
    };

    fetchPageData();
  }, [supabase, nicheId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="h-12 w-12 text-teal-400 animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Auth />;
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <MainHeader user={user} pageTitle={nicheName} backLink="/niches" />

      <main className="container mx-auto p-4 md:p-8">
        <Navbar nicheId={nicheId} />

        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
            Histórico de Posts
          </h2>
          {/* A prop onDelete pode ser uma função vazia aqui, já que não implementamos a exclusão nesta tela */}
          <VideoList
            groupedVideos={groupedVideos}
            onDelete={() => {}}
            sortOrder="desc"
          />
        </div>
      </main>
    </div>
  );
}  
