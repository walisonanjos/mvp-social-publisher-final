// src/app/privacy/page.tsx

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-900 min-h-screen text-gray-300">
      <div className="container mx-auto max-w-4xl py-12 px-6">
        <h1 className="text-4xl font-bold text-white mb-8">{`Política de Privacidade`}</h1>
        <div className="space-y-6 text-lg leading-relaxed">
          <p><strong>{`Data de vigência:`}</strong> {`21 de junho de 2025`}</p>
          <p>
            {`Bem-vindo ao Social Publisher MVP ("nós", "nosso" ou "aplicativo"). Esta Política de Privacidade explica como coletamos, usamos, armazenamos e compartilhamos suas informações quando você utiliza nossos serviços. Ao usar o Social Publisher MVP, você concorda com a coleta e uso de informações de acordo com esta política.`}
          </p>

          <h2 className="text-2xl font-semibold text-white pt-4">{`1. Informações que Coletamos`}</h2>
          <p>
            {`Coletamos diferentes tipos de informações para fornecer e melhorar nosso serviço para você.`}
          </p>
          <h3 className="text-xl font-medium text-white pt-2">{`a) Informações Fornecidas por Você:`}</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>{`Dados de Conta:`}</strong> {`Ao se registrar, coletamos seu endereço de e-mail e nome.`}</li>
            <li><strong>{`Conteúdo do Usuário:`}</strong> {`Coletamos os arquivos de vídeo, títulos, descrições e horários de agendamento que você nos fornece para publicação.`}</li>
          </ul>
          <h3 className="text-xl font-medium text-white pt-2">{`b) Informações Coletadas de Terceiros (com sua permissão):`}</h3>
          <p>
            {`Ao conectar suas contas de redes sociais (como YouTube ou TikTok), nós obtemos acesso a informações básicas do seu perfil e, crucialmente, aos tokens de autorização (\`access_token\` e \`refresh_token\`) necessários para publicar conteúdo em seu nome. Não armazenamos sua senha dessas plataformas.`}
          </p>

          <h2 className="text-2xl font-semibold text-white pt-4">{`2. Como Usamos Suas Informações`}</h2>
          <p>
            {`Utilizamos as informações que coletamos para as seguintes finalidades:`}
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>{`Para Fornecer e Manter nosso Serviço:`}</strong> {`A finalidade principal é executar a função central do nosso aplicativo: agendar e publicar seu conteúdo de vídeo nas plataformas que você conectou, no horário que você determinou.`}</li>
            <li><strong>{`Para Gerenciar Sua Conta:`}</strong> {`Usamos seus dados para identificá-lo, permitir o login e garantir a segurança da sua conta.`}</li>
            <li><strong>{`Para nos Comunicarmos com Você:`}</strong> {`Podemos usar seu endereço de e-mail para enviar informações importantes sobre sua conta, atualizações do serviço ou para responder às suas solicitações de suporte.`}</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white pt-4">{`3. Compartilhamento e Divulgação de Informações`}</h2>
          <p>
            {`Nós não vendemos suas informações pessoais. O compartilhamento de seus dados é limitado aos seguintes cenários e provedores de serviços terceirizados que nos ajudam a operar:`}
          </p>
           <ul className="list-disc list-inside space-y-2">
            <li><strong>{`Plataformas de Redes Sociais (YouTube, TikTok, etc.):`}</strong> {`Compartilhamos seu conteúdo de vídeo e os metadados associados (título, descrição) com as plataformas que você autorizou, com o único propósito de realizar a publicação em seu nome.`}</li>
            <li><strong>{`Provedores de Infraestrutura:`}</strong> {`Utilizamos serviços de terceiros para a operação técnica da nossa plataforma: Vercel (hospedagem), Supabase (banco de dados e autenticação) e Cloudinary (armazenamento de vídeos).`}</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white pt-4">{`4. Armazenamento e Segurança de Dados`}</h2>
          <p>
            {`Levamos a segurança dos seus dados a sério. Seus tokens de acesso são armazenados de forma criptografada em nosso banco de dados. Utilizamos provedores de serviços com altos padrões de segurança. No entanto, nenhum método de transmissão pela Internet ou armazenamento eletrônico é 100% seguro, e não podemos garantir segurança absoluta.`}
          </p>

          <h2 className="text-2xl font-semibold text-white pt-4">{`5. Seus Direitos e Controle`}</h2>
          <p>
            {`Você tem controle sobre suas informações pessoais: pode acessar e editar seus agendamentos, desconectar suas contas de redes sociais e solicitar a exclusão de sua conta entrando em contato conosco.`}
          </p>

          <h2 className="text-2xl font-semibold text-white pt-4">{`6. Contato`}</h2>
          <p>
            {`Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco em: `}<a href="mailto:contato.socialpublisher@gmail.com" className="text-teal-400 hover:underline">{`contato.socialpublisher@gmail.com`}</a>
          </p>
        </div>
      </div>
    </div>
  );
}