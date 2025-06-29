import NichePageClient from "@/components/NichePageClient";

// A tipagem para as props da página
type Props = {
  params: {
    nicheId: string;
  };
};

// CORREÇÃO: Adicionamos a palavra 'async' na função
export default async function NichePage({ params }: Props) {
  const { nicheId } = params;

  // Renderiza o componente de cliente, passando o ID do nicho
  return <NichePageClient nicheId={nicheId} />;
}
