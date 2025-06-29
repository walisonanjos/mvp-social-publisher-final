// Este é o Server Component que define a rota /history
import HistoryPageClient from "@/components/HistoryPageClient";

// Tipagem para as props que a página recebe do Next.js
type Props = {
  params: {
    nicheId: string;
  };
};

export default function HistoryPage({ params }: Props) {
  const { nicheId } = params;

  // Ele simplesmente renderiza nosso componente de cliente, passando o ID
  return <HistoryPageClient nicheId={nicheId} />;
}
