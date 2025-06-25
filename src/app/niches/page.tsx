// src/app/niches/page.tsx

"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from 'next/link';
import { createClient } from "../../lib/supabaseClient";
import Navbar from "../../components/Navbar";
import { User } from "@supabase/supabase-js";
import { Loader2, PlusCircle } from "lucide-react";

interface Niche {
  id: string;
  name: string;
}

export default function NichesPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [newNicheName, setNewNicheName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: nichesData, error: nichesError } = await supabase
          .from('niches')
          .select('id, name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (nichesError) {
          setError('Erro ao carregar seus workspaces.');
          console.error(nichesError);
        } else {
          setNiches(nichesData || []);
        }
      }
      setLoading(false);
    };

    fetchInitialData();
  }, [supabase]);

  const handleCreateNiche = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNicheName.trim() || !user) return;
    setIsCreating(true);
    setError("");

    const { data, error: insertError } = await supabase
      .from('niches')
      .insert({ name: newNicheName, user_id: user.id })
      .select('id, name')
      .single();

    if (insertError) {
      setError("Ocorreu um erro ao criar o workspace.");
      console.error(insertError);
    } else if (data) {
      setNiches(currentNiches => [...currentNiches, data]);
      setNewNicheName("");
    }
    setIsCreating(false);
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white">Seus Workspaces</h1>
                <p className="text-lg text-gray-400 mt-2">Selecione um workspace para gerenciar ou crie um novo.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                {niches.map(niche => (
                    <Link href={`/niche/${niche.id}`} key={niche.id} className="block group">
                    <div className="p-8 bg-gray-800 rounded-lg border border-gray-700 group-hover:border-teal-500 group-hover:bg-gray-700/50 transition-all duration-300 transform group-hover:scale-105 h-40 flex items-center justify-center text-center">
                        <span className="text-xl font-semibold text-white">{niche.name}</span>
                    </div>
                    </Link>
                ))}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Criar Novo Workspace</h3>
                <form onSubmit={handleCreateNiche} className="flex flex-col sm:flex-row gap-4">
                    <input
                    type="text"
                    placeholder="Nome do novo workspace"
                    value={newNicheName}
                    onChange={(e) => setNewNicheName(e.target.value)}
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                    <button
                    type="submit"
                    disabled={isCreating}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center w-full sm:w-auto"
                    >
                    {isCreating ? <Loader2 className="animate-spin" /> : <PlusCircle size={20} className="mr-2"/>}
                    {isCreating ? '' : 'Criar'}
                    </button>
                </form>
                {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
            </div>
        </div>
    </main>
  );
}
