// src/components/UploadForm.tsx
'use client';
import { useState, FormEvent, useRef } from 'react';
import { createClient } from '../lib/supabaseClient';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { addDays } from 'date-fns'; // MUDANÇA: Importando função para adicionar dias
import { ptBR } from 'date-fns/locale';

interface UploadFormProps {
  onScheduleSuccess: () => void;
}

export default function UploadForm({ onScheduleSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date());
  // MUDANÇA: O estado do horário agora tem um valor inicial para o select
  const [scheduleTime, setScheduleTime] = useState('09:00'); 
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [postToYouTube, setPostToYouTube] = useState(false);
  const supabase = createClient();

  // MUDANÇA: Definindo as datas para o limite de 10 dias
  const today = new Date();
  const tenDaysFromNow = addDays(today, 9); // Hoje + 9 dias = 10 dias de janela
  const availableTimes = ['09:00', '11:00', '13:00', '15:00', '17:00'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !title || !scheduleDate || !scheduleTime) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (!postToYouTube) {
        setError('Por favor, selecione pelo menos uma rede social para postar.');
        return;
    }

    setIsUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      
      const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!cloudinaryResponse.ok) throw new Error('Falha no upload para o Cloudinary.');
      
      const cloudinaryData = await cloudinaryResponse.json();
      const videoUrl = cloudinaryData.secure_url;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');
      
      const [hours, minutes] = scheduleTime.split(':');
      const finalScheduleDate = new Date(scheduleDate);
      finalScheduleDate.setHours(parseInt(hours, 10));
      finalScheduleDate.setMinutes(parseInt(minutes, 10));
      const scheduled_at = finalScheduleDate.toISOString();

      const { error: insertError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title,
          description,
          video_url: videoUrl,
          scheduled_at,
          target_youtube: postToYouTube,
        });

      if (insertError) throw insertError;
      
      setSuccessMessage('Seu vídeo foi agendado com sucesso!');
      onScheduleSuccess();

      setFile(null);
      setTitle('');
      setDescription('');
      setScheduleDate(new Date());
      setScheduleTime('09:00');
      setPostToYouTube(false);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error('Erro no agendamento:', err);
      if (err instanceof Error) {
        setError(`Ocorreu um erro inesperado: ${err.message}`);
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-6">Novo Agendamento</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">
            Arquivo de Vídeo
          </label>
          <input id="file-upload" type="file" accept="video/mp4,video/quicktime" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-500/10 file:text-teal-300 hover:file:bg-teal-500/20" />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">Título</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Descrição</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">
              Data do Agendamento
            </label>
            <DayPicker
              mode="single"
              selected={scheduleDate}
              onSelect={setScheduleDate}
              locale={ptBR}
              fromDate={today}      // MUDANÇA: Bloqueia datas passadas
              toDate={tenDaysFromNow} // MUDANÇA: Bloqueia datas após 10 dias
              className="bg-gray-900 p-2 rounded-md"
              classNames={{
                caption: 'flex justify-center py-2 mb-2 relative items-center',
                caption_label: 'text-sm font-medium text-white',
                nav: 'flex items-center',
                nav_button: 'h-6 w-6 bg-transparent hover:bg-gray-700 p-1 rounded-full',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse',
                head_row: 'flex font-medium text-gray-400',
                head_cell: 'w-8 font-normal text-xs',
                row: 'flex w-full mt-2',
                cell: 'text-white h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-teal-500/20 rounded-full',
                day: 'h-8 w-8 p-0 font-normal hover:bg-teal-500/30 rounded-full transition-colors',
                day_selected: 'bg-teal-600 text-white hover:bg-teal-700 rounded-full',
                day_today: 'text-teal-400',
                day_outside: 'text-gray-500 opacity-50',
                day_disabled: 'text-gray-600 opacity-50',
              }}
            />
          </div>
          <div>
            {/* MUDANÇA: Substituindo o input de hora por um select */}
            <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-300 mb-2">
              Hora do Agendamento
            </label>
            <select
              id="scheduleTime"
              value={scheduleTime} 
              onChange={(e) => setScheduleTime(e.target.value)} 
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            >
              {availableTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Postar em:</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-gray-500"><input type="checkbox" className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-teal-600 focus:ring-teal-500" disabled /> Instagram</label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-500"><input type="checkbox" className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-teal-600 focus:ring-teal-500" disabled /> Facebook</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={postToYouTube} onChange={(e) => setPostToYouTube(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-teal-600 focus:ring-teal-500" /> YouTube</label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-500"><input type="checkbox" className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-teal-600 focus:ring-teal-500" disabled /> Tiktok</label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-500"><input type="checkbox" className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-teal-600 focus:ring-teal-500" disabled /> Kwai</label>
          </div>
        </div>
        <div>
          <button type="submit" disabled={isUploading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 disabled:opacity-50">
            {isUploading ? 'Agendando...' : 'Agendar Post'}
          </button>
        </div>
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm">{error}</div>}
        {successMessage && <div className="bg-green-500/20 text-green-300 p-3 rounded-md text-sm">{successMessage}</div>}
      </form>
    </div>
  );
}
