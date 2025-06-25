// src/app/niche/[nicheId]/page.tsx

// Importando nosso novo componente de cliente
import NichePageClient from "./NichePageClient";

// Definindo o tipo de props que a página recebe do Next.js
type NichePageProps = {
  params: {
    nicheId: string;
  };
};

// Este é agora um Server Component. Note que não há "use client" nem hooks.
export default function NichePage({ params }: NichePageProps) {
  const { nicheId } = params;

  // A única responsabilidade desta página é renderizar o componente de cliente,
  // passando o nicheId que ela recebeu da URL.
  return <NichePageClient nicheId={nicheId} />;
}
