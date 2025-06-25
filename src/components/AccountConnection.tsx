// src/components/AccountConnection.tsx
'use client';
import { useState } from 'react';
import { Youtube, CheckCircle } from 'lucide-react';
import { createClient } from '../lib/supabaseClient';

// O componente agora recebe o nicheId
interface AccountConnectionProps {
  isYouTubeConnected: boolean;
  onDisconnectYouTube: () => void;
  nicheId: string;
}

export default function AccountConnection({ isYouTubeConnected, onDisconnectYouTube, nicheId }: AccountConnectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // MUDANÇA: Passando o nicheId para a função de backend
      // (Isso será uma melhoria futura, por enquanto o fluxo de auth ainda é simples)
      const { data, error } = await supabase.functions.invoke('generate-youtube-auth-url');
      if (error) throw error;
      if (data.url) {
        // Armazenamos o nicheId no localStorage para que a página de callback saiba
        localStorage.setItem('connectingNicheId', nicheId);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erro ao gerar URL de autorização:', error);
      alert('Não foi possível iniciar a conexão com o YouTube. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Conectar Contas</h2>
      <p className="text-gray-400 mb-6">
        {isYouTubeConnected 
          ? 'Sua conta do YouTube está pronta para postagens neste workspace.' 
          : 'Conecte suas contas de redes sociais para começar a agendar.'
        }
      </p>

      {isYouTubeConnected ? (
        // UI para quando a conta ESTÁ conectada
        <div className="p-4 bg-green-900/50 border border-green-500/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-400" size={24} />
            <span className="font-medium text-green-300">YouTube Conectado</span>
          </div>
          <button
            onClick={onDisconnectYouTube}
            className="text-xs text-red-400 hover:text-red-300 hover:underline"
          >
            Desconectar
          </button>
        </div>
      ) : (
        // UI para quando a conta NÃO ESTÁ conectada
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-red-600/50 bg-red-600/20 hover:bg-red-600/30 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
        >
          <Youtube size={20} />
          <span>{isLoading ? 'Aguarde...' : 'Conectar com YouTube'}</span>
        </button>
      )}
    </div>
  );
}
