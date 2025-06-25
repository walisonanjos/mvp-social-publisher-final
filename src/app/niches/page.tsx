// src/app/niches/page.tsx

"use client";

import { useEffect, useState, FormEvent } from "react";
import { createClient } from "../../lib/supabaseClient";
import Navbar from "../../components/Navbar";
import { User } from "@supabase/supabase-js";

// Definindo um tipo para nossos nichos para manter o código limpo
interface Niche {
  id: string;
  name: string;
  created_at: string;
}

export default function NichesPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [newNicheName, setNewNicheName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: nichesData, error: nichesError } = await supabase
          .from('niches')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (nichesError) {
          setError('Erro ao carregar seus nichos.');
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
    if (!newNicheName.trim()) {
      setError("O nome do nicho não pode estar em branco.");
      return;
    }
    if (!user) {
      setError("Você precisa estar logado para criar um nicho.");
      return;
    }

    const { data, error: insertError } = await supabase
      .from('niches')
      .insert({ name: newNicheName, user_id: user.id })
      .select()
      .single();

    if (insertError) {
      setError("Ocorreu um erro ao criar o nicho.");
      console.error(insertError);
    } else if (data) {
      // Adiciona o novo nicho à lista na tela sem precisar recarregar tudo
      setNiches(currentNiches => [...currentNiches, data]);
      setNewNicheName(""); // Limpa o campo do formulário
      setError("");
    }
  };

  if (loading) {
    return <div className="text-center p-8"><p className="text-white">Carregando...</p></div>;
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Navbar />
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
          Gerenciar Nichos (Workspaces)
        </h2>
        
        {/* Formulário para criar novo nicho */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
          <form onSubmit={handleCreateNiche} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Nome do novo nicho (ex: Cliente de Advocacia)"
              value={newNicheName}
              onChange={(e) => setNewNicheName(e.target.value)}
              className="flex-grow bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Criar Nicho
            </button>
          </form>
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        </div>

        {/* Lista de nichos existentes */}
        <div className="space-y-4">
            {niches.length > 0 ? (
                niches.map(niche => (
                    <div key={niche.id} className="bg-gray-800/50 p-4 rounded-lg flex justify-between items-center border border-gray-700/80">
                        <span className="font-medium text-white">{niche.name}</span>
                        {/* Futuramente, aqui teremos botões para gerenciar e conectar contas */}
                    </div>
                ))
            ) : (
                <p className="text-gray-400 text-center py-4">Você ainda não criou nenhum nicho.</p>
            )}
        </div>
      </div>
    </main>
  );
}
