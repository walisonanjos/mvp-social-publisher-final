// src/app/niche/[nicheId]/page.tsx

import NichePageClient from "@/components/NichePageClient";

// Tipagem para as props que a página recebe do Next.js
type Props = {
  params: {
    nicheId: string;
  };
};

// Este é um Server Component (sem "use client").
export default function NichePage({ params }: Props) {
  const { nicheId } = params;
  return <NichePageClient nicheId={nicheId} />;
}