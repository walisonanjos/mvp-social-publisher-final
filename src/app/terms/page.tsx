// src/app/terms/page.tsx

export default function TermsOfServicePage() {
  return (
    <div className="bg-gray-900 min-h-screen text-gray-300">
      <div className="container mx-auto max-w-4xl py-12 px-6">
        <h1 className="text-4xl font-bold text-white mb-8">{`Termos de Serviço`}</h1>
        <div className="space-y-6 text-lg leading-relaxed">
          <p><strong>{`Data de vigência:`}</strong> {`21 de junho de 2025`}</p>
          <p>
            {`Bem-vindo ao Social Publisher MVP! Estes Termos de Serviço ("Termos") regem o seu uso de nosso website e serviços. Ao acessar ou usar o serviço, você concorda em cumprir estes Termos.`}
          </p>

          <h2 className="text-2xl font-semibold text-white pt-4">{`1. Descrição do Serviço`}</h2>
          <p>
            {`O Social Publisher MVP ("Serviço") é uma plataforma de software que permite aos usuários ("Usuários", "você") fazer upload, gerenciar e agendar a publicação de conteúdo de vídeo em suas próprias contas de mídias sociais de terceiros, como YouTube e TikTok ("Plataformas de Terceiros").`}
          </p>

          <h2 className="text-2xl font-semibold text-white pt-4">{`2. Contas de Usuário`}</h2>
          <p>
            {`Para usar o Serviço, você deve se registrar e criar uma conta. Você concorda em fornecer informações precisas e completas e é o único responsável por manter a confidencialidade de sua senha e por toda a atividade que ocorra em sua conta.`}
          </p>

          <h2 className="text-2xl font-semibold text-white pt-4">{`3. Conteúdo do Usuário`}</h2>
          <p>
            {`Você retém todos os direitos e a propriedade sobre o conteúdo (vídeos, títulos, descrições) que você envia ao nosso Serviço ("Conteúdo do Usuário"). Ao agendar uma publicação, você nos concede uma licença mundial e não exclusiva para armazenar, processar e transmitir seu Conteúdo do Usuário para as Plataformas de Terceiros que você designou, com o único propósito de prestar o Serviço a você. Você é o único responsável por seu Conteúdo e garante que possui todos os direitos necessários para nos conceder essa licença.`}
          </p>

          <h2 className="text-2xl font-semibold text-white pt-4">{`4. Integrações com Plataformas de Terceiros`}</h2>
           <p>
            {`Nosso Serviço depende das APIs fornecidas pelas Plataformas de Terceiros. Não somos responsáveis pela disponibilidade ou funcionalidade dessas plataformas. O uso de cada plataforma é regido por seus próprios termos de serviço e políticas de privacidade.`}
          </p>

          <h2 className="text-2xl font-semibold text-white pt-4">{`5. Isenção de Garantias e Limitação de Responsabilidade`}</h2>
          <p>
            {`O Serviço é fornecido "COMO ESTÁ", sem garantias de qualquer tipo. Em nenhuma circunstância o Social Publisher MVP será responsável por quaisquer danos diretos ou indiretos resultantes do uso ou da incapacidade de usar o serviço.`}
          </p>
          
          <h2 className="text-2xl font-semibold text-white pt-4">{`6. Contato`}</h2>
          <p>
            {`Se você tiver alguma dúvida sobre estes Termos de Serviço, entre em contato conosco em: `}<a href="mailto:contato.socialpublisher@gmail.com" className="text-teal-400 hover:underline">{`contato.socialpublisher@gmail.com`}</a>
          </p>
        </div>
      </div>
    </div>
  );
}