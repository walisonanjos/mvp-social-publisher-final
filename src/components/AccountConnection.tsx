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
      setIsLoading(false);
    }
  };

  return (
    // O JSX é visualmente o mesmo
    // ...
  );
}
