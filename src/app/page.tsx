// src/app/page.tsx

"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from "../lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import Auth from "../components/Auth";
import { Loader2, PlusCircle } from "lucide-react";

// Definindo a interface para nossos nichos
export interface Niche {
  id: string;
  name: string;
}

// A interface Video agora vive aqui, mas poderia ser movida para um arquivo de tipos no futuro
export interface Video {
  id: string;
  title: string;
  video_url: string;
  scheduled_at: string;
  status: 'agendado' | 'postado' | 'falhou';
  youtube_video_id: string | null;
  post_error: string | null;
  target_youtube: boolean | null;
}

export default function HomePage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNicheName, setNewNicheName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Efeito para buscar o usuário e seus nichos existentes
  useEffect(() => {
    const fetchUserAndNiches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: nichesData, error } = await supabase
          .from('niches')
          .select('id, name')
          .eq('user_id', user.id);

        if (error) {
          console.error("Erro ao buscar nichos:", error);
        } else if (nichesData) {
          // Se o usuário tem apenas um nicho, redireciona direto para ele
          if (nichesData.length === 1) {
            router.push(`/niche/${nichesData[0].id}`);
          } else {
            setNiches(nichesData);
          }
        }
      }
      setLoading(false);
    };

    fetchUserAndNiches();
  }, [supabase, router]);
  
  const handleCreateNiche = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNicheName.trim() || !user) return;
    setIsCreating(true);

    const { data, error } = await supabase
      .from('niches')
      .insert({ name: newNicheName, user_id: user.id })
      .select('id')
      .single();

    if (error) {
      console.error("Erro ao criar nicho:", error);
      alert("Não foi possível criar o workspace.");
      setIsCreating(false);
    } else if (data) {
      // Redireciona para a página do novo workspace
      router.push(`/niche/${data.id}`);
    }
  };

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

  // Se o usuário está logado e não tem nichos (ou se tem mais de um, a lógica acima não redirecionou)
  // Mostra a tela de criação do primeiro nicho ou de seleção
  if (niches.length === 0) {
    // Cenário 1: Usuário Novo, sem nichos
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md text-center">
                <h1 className="text-4xl font-bold text-teal-400 mb-2">Bem-vindo(a)!</h1>
                <p className="text-lg text-gray-300 mb-8">Vamos começar criando seu primeiro workspace.</p>
                <form onSubmit={handleCreateNiche} className="flex flex-col items-center gap-4">
                    <input
                        type="text"
                        placeholder="Ex: Cliente de Restaurante"
                        value={newNicheName}
                        onChange={(e) => setNewNicheName(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 disabled:opacity-50"
                    >
                        {isCreating ? <Loader2 className="animate-spin" /> : 'Criar Workspace e Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
  }

  // Cenário 2: Usuário já tem mais de um nicho
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Selecione um Workspace</h1>
        <p className="text-lg text-gray-400 mb-8">Escolha um workspace para continuar.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {niches.map(niche => (
            <Link href={`/niche/${niche.id}`} key={niche.id} className="block group">
              <div className="p-8 bg-gray-800 rounded-lg border border-gray-700 group-hover:border-teal-500 group-hover:bg-gray-700/50 transition-all duration-300 transform group-hover:scale-105 h-full flex items-center justify-center">
                <span className="text-xl font-semibold text-white">{niche.name}</span>
              </div>
            </Link>
          ))}
          {/* Futuramente, o botão de criar novo pode ser aqui */}
        </div>
        
         <button onClick={() => supabase.auth.signOut()} className="mt-12 text-sm text-gray-500 hover:text-white transition-colors">Sair</button>
      </div>
    </div>
  );
}
