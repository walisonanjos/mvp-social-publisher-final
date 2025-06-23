// src/components/CallbackHandler.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function CallbackHandler() {
  const [message, setMessage] = useState('Autenticando com o Google, por favor aguarde...');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    const supabase = createClient();

    if (code) {
      const exchangeCodeForTokens = async () => {
        try {
          const { error: invokeError } = await supabase.functions.invoke('exchange-auth-code', {
            body: { code },
          });

          if (invokeError) throw invokeError;

          setMessage('Sucesso! Redirecionando para o seu painel...');
          setTimeout(() => {
            router.push('/');
          }, 2000);

        } catch (e) {
          const errorMsg = (e as Error).message;
          console.error(e);
          setError(`Erro ao conectar sua conta: ${errorMsg}`);
        }
      };
      exchangeCodeForTokens();
    } else {
      setError('Nenhum código de autorização encontrado. Voltando ao início...');
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [searchParams, router]);

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return <p>{message}</p>;
}