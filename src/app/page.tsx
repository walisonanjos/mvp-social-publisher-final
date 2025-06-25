// src/app/page.tsx

"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "../lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import Auth from "../components/Auth";
import { Loader2 } from "lucide-react";
// CORREÇÃO: Importando o tipo 'Niche' do nosso arquivo central de tipos.
import { Niche } from '@/types';

// CORREÇÃO: A definição de 'Video' foi removida daqui.

export default function HomePage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [niches, setNichesState] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNicheName, setNewNicheName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
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
          if (nichesData.length === 1) {
            router.push(`/niche/${nichesData[0].id}`);
          } else if (nichesData.length > 1) {
             router.push('/niches');
          } else {
            setNichesState([]);
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

  if (niches.length === 0) {
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
                 <button onClick={() => supabase.auth.signOut()} className="mt-12 text-sm text-gray-500 hover:text-white transition-colors">Sair</button>
            </div>
        </div>
    );
  }
  
  return (
       <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white">Redirecionando...</p>
      </div>
  )
}