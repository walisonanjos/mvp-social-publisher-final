"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Precisamos do router de volta
import { createClient } from "../../lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import MainHeader from "@/components/MainHeader";
import { Niche } from "@/types";
import Auth from "@/components/Auth";

export default function NichesPage() {
  const supabase = createClient();
  const router = useRouter(); // Inicialize o router
  const [user, setUser] = useState<User | null>(null);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newNicheName, setNewNicheName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Busca inicial de dados
    const fetchInitialData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: nichesData, error: nichesError } = await supabase
          .from("niches")
          .select("id, name")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (nichesError) {
          setError("Erro ao carregar seus workspaces.");
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
    setIsProcessing(true);
    setError("");

    const { data: newNiche, error: insertError } = await supabase
      .from("niches")
      .insert({ name: newNicheName, user_id: user.id })
      .select()
      .single();

    if (insertError) {
      setError("Ocorreu um erro ao criar o workspace.");
      console.error(insertError);
    } else if (newNiche) {
      // ATUALIZAÇÃO MANUAL PARA REATIVIDADE INSTANTÂNEA
      setNiches((currentNiches) => [...currentNiches, newNiche]);
      setNewNicheName("");
    }
    setIsProcessing(false);
  };

  const handleDeleteNiche = async (nicheId: string, nicheName: string) => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir o workspace "${nicheName}"?`,
      )
    ) {
      return;
    }
    setIsProcessing(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("niches")
      .delete()
      .eq("id", nicheId);

    if (deleteError) {
      setError("Ocorreu um erro ao excluir o workspace.");
      console.error(deleteError);
    } else {
      // ATUALIZAÇÃO MANUAL PARA REATIVIDADE INSTANTÂNEA
      setNiches((currentNiches) =>
        currentNiches.filter((niche) => niche.id !== nicheId),
      );
    }
    setIsProcessing(false);
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

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <MainHeader user={user} pageTitle="Seus Workspaces" />
      <main className="container mx-auto p-4 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* O JSX continua o mesmo, a mudança foi na lógica das funções */}
          <p className="text-lg text-center text-gray-400 -mt-8 mb-12">
            Selecione um workspace para gerenciar ou crie um novo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {niches.map((niche) => (
              <div key={niche.id} className="relative group">
                <Link href={`/niche/${niche.id}`} className="block">
                  <div className="p-8 bg-gray-800 rounded-lg border border-gray-700 group-hover:border-teal-500 group-hover:bg-gray-700/50 transition-all duration-300 transform group-hover:scale-105 h-40 flex items-center justify-center text-center">
                    <span className="text-xl font-semibold text-white">
                      {niche.name}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNiche(niche.id, niche.name);
                  }}
                  disabled={isProcessing}
                  className="absolute top-2 right-2 p-1.5 bg-gray-900/50 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                  title={`Excluir ${niche.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Criar Novo Workspace
            </h3>
            <form
              onSubmit={handleCreateNiche}
              className="flex flex-col sm:flex-row gap-4"
            >
              <input
                type="text"
                placeholder="Nome do novo workspace"
                value={newNicheName}
                onChange={(e) => setNewNicheName(e.target.value)}
                className="flex-grow bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center w-full sm:w-auto disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <PlusCircle size={20} className="mr-2" />
                    <span>Criar</span>
                  </>
                )}
              </button>
            </form>
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
