// src/components/VideoList.tsx
'use client';
import { Video } from '../app/page';
import { ChevronUp, ChevronDown, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VideoListProps {
  groupedVideos: { [key: string]: Video[] };
  onDelete: (videoId: string) => void;
}

const statusStyles = {
  agendado: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  postado: 'bg-green-500/20 text-green-300 border-green-500/30',
  falhou: 'bg-red-500/20 text-red-300 border-red-500/30',
};

function VideoCard({ video, onDelete }: { video: Video; onDelete: (id: string) => void }) {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col justify-between gap-3 border border-gray-700/80">
      <div className="flex justify-between items-start">
        <span className="font-medium text-white break-all">{video.title}</span>
        <div
          className={`text-xs font-bold px-2 py-1 rounded-full border ${statusStyles[video.status]}`}
        >
          {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-gray-400 text-sm">
          {format(new Date(video.scheduled_at), 'HH:mm')}
        </div>
        <div className="flex items-center gap-3">
          {/* Ícone de Link para Vídeos Postados */}
          {video.status === 'postado' && video.youtube_video_id && (
            <Link
              href={`https://youtu.be/${video.youtube_video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              title="Ver no YouTube"
            >
              <LinkIcon size={16} />
            </Link>
          )}
          {/* Ícone de Erro para Vídeos que Falharam */}
          {video.status === 'falhou' && video.post_error && (
            <div className="text-red-400 cursor-help" title={`Motivo da falha: ${video.post_error}`}>
              <AlertTriangle size={16} />
            </div>
          )}
          <button
            onClick={() => onDelete(video.id)}
            className="text-xs text-red-500 hover:text-red-400"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VideoList({ groupedVideos, onDelete }: VideoListProps) {
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});
  const sortedGroupKeys = Object.keys(groupedVideos).sort();

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (sortedGroupKeys.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-800/30 rounded-lg">
        <p className="text-gray-400">Você ainda não tem nenhum agendamento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedGroupKeys.map((dateKey) => {
        const date = new Date(dateKey + 'T12:00:00'); // Adiciona hora para evitar problemas de fuso
        const isGroupOpen = openGroups[dateKey] ?? true;
        return (
          <div key={dateKey}>
            <button
              onClick={() => toggleGroup(dateKey)}
              className="flex justify-between items-center w-full text-left mb-3"
            >
              <h3 className="text-lg font-semibold text-teal-400 capitalize">
                {format(date, "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
              {isGroupOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </button>
            {isGroupOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {groupedVideos[dateKey].map((video) => (
                  <VideoCard key={video.id} video={video} onDelete={onDelete} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}