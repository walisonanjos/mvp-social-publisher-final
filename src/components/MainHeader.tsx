// src/components/MainHeader.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";

// O Header agora recebe o usuário e opcionalmente um título e link de 'voltar'
interface MainHeaderProps {
  user: User | null;
  pageTitle?: string;
  backLink?: string;
}

export default function MainHeader({
  user,
  pageTitle,
  backLink,
}: MainHeaderProps) {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Força a atualização da página para refletir o estado de deslogado
    // e te envia para a página inicial, evitando o bug de redirect.
    router.push("/");
    router.refresh();
  };

  if (!user) return null; // Não mostra nada se não houver usuário

  return (
    <header className="bg-gray-800/80 backdrop-blur-sm p-4 border-b border-gray-700 sticky top-0 z-20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {backLink && (
            <Link
              href={backLink}
              className="text-gray-400 hover:text-white transition-colors"
              title="Voltar"
            >
              <ArrowLeft size={20} />
            </Link>
          )}
          {pageTitle && (
            <h1 className="text-xl font-bold text-white">{pageTitle}</h1>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 hidden sm:inline">
            Olá,{" "}
            <strong className="font-medium text-white">
              {user.email?.split("@")[0]}
            </strong>
          </span>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
