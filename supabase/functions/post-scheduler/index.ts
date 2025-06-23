// supabase/functions/post-scheduler/index.ts
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface YouTubeTokenData {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expiry_date: string;
}

async function getValidAccessToken(tokenData: YouTubeTokenData, supabaseAdmin: SupabaseClient): Promise<string> {
    // ... (Esta função interna permanece exatamente a mesma da versão anterior)
    const now = new Date();
    const expiryDate = new Date(tokenData.expiry_date);
    expiryDate.setMinutes(expiryDate.getMinutes() - 5);
    if (now < expiryDate) {
        console.log('Access token ainda é válido.');
        return tokenData.access_token;
    }
    console.log('Access token expirado. Solicitando um novo...');
    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        refresh_token: tokenData.refresh_token,
        grant_type: 'refresh_token',
        }),
    });
    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Falha ao refrescar o token: ${errorBody.error_description}`);
    }
    const newTokens = await response.json();
    const newAccessToken = newTokens.access_token;
    const newExpiryDate = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();
    await supabaseAdmin
        .from('youtube_tokens')
        .update({ access_token: newAccessToken, expiry_date: newExpiryDate })
        .eq('user_id', tokenData.user_id);
    console.log('Token atualizado com sucesso no banco de dados.');
    return newAccessToken;
}

Deno.serve(async (_req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let videoId: string | null = null;

  try {
    const now = new Date().toISOString();
    // MUDANÇA: Procurando por status 'agendado' em vez de is_posted = false
    const { data: video, error: selectError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .lt('scheduled_at', now)
      .eq('status', 'agendado') // << MUDANÇA AQUI
      .limit(1)
      .single();

    if (selectError) {
      if (selectError.code === 'PGRST116') {
        return new Response(JSON.stringify({ message: 'Nenhum agendamento pendente.' }), { status: 200 });
      }
      throw selectError;
    }
    
    videoId = video.id; // Guarda o ID do vídeo que estamos processando
    console.log(`Processando vídeo ID: ${videoId}`);

    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('youtube_tokens')
      .select<"*", YouTubeTokenData>('*')
      .eq('user_id', video.user_id)
      .single();

    if (tokenError) throw new Error(`Tokens não encontrados para o usuário ${video.user_id}: ${tokenError.message}`);

    const accessToken = await getValidAccessToken(tokenData, supabaseAdmin);
    
    const videoResponse = await fetch(video.video_url);
    if (!videoResponse.ok) throw new Error('Falha ao baixar vídeo do Cloudinary.');
    const videoBlob = await videoResponse.blob();

    const metadata = {
      snippet: { title: video.title, description: video.description || ' ' },
      status: { privacyStatus: 'private' },
    };
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('video', videoBlob);
    
    const uploadUrl = 'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status';
    const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: formData,
    });

    if (!uploadResponse.ok) {
      const errorBody = await uploadResponse.json();
      throw new Error(`Erro no upload para o YouTube: ${JSON.stringify(errorBody)}`);
    }

    const youtubeResponseData = await uploadResponse.json();
    const uploadedVideoId = youtubeResponseData.id;
    if (!uploadedVideoId) throw new Error("API do YouTube não retornou um ID de vídeo.");

    console.log(`Upload bem-sucedido! ID no YouTube: ${uploadedVideoId}`);
    
    // MUDANÇA: Atualizando para o status 'postado'
    await supabaseAdmin
      .from('videos')
      .update({ status: 'postado', youtube_video_id: uploadedVideoId, post_error: null }) // << MUDANÇA AQUI
      .eq('id', videoId);

    return new Response(JSON.stringify({ message: `Vídeo postado! ID: ${uploadedVideoId}` }), { status: 200 });

  } catch (error) {
    console.error(`Erro na execução do post-scheduler ao processar vídeo ${videoId}:`, error);
    
    // MUDANÇA CRÍTICA: Se der erro, atualiza o status para 'falhou' e salva o erro
    if (videoId) {
      await supabaseAdmin
        .from('videos')
        .update({
          status: 'falhou',
          post_error: error.message,
        })
        .eq('id', videoId);
    }
    
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});