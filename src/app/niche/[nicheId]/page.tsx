// src/app/niche/[nicheId]/page.tsx

import NichePageClient from "@/components/NichePageClient";

// Tipagem para as props que a página recebe do Next.js
type Props = {
  params: {
    nicheId: string;
  };
};

// Este é um Server Component (sem "use client"). É assíncrono por padrão.
export default function NichePage({ params }: Props) {
  // Extraímos o nicheId dos parâmetros da URL...
  const { nicheId } = params;

  // ...e passamos como uma prop simples para o nosso componente de cliente.
  return <NichePageClient nicheId={nicheId} />;
}