'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        alert('Por favor, preencha e-mail e senha.');
        return;
    }
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
    } catch (error) {
      alert('Erro ao cadastrar: ' + (error as Error).message);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!email || !password) {
        alert('Por favor, preencha e-mail e senha.');
        return;
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      alert('Erro no login: ' + (error as Error).message);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full py-12 px-4">
      
      <div className="text-center mb-8">
        <img
          src="/icon.png"
          alt="Social Publisher MVP Logo"
          className="mx-auto h-20 w-auto"
        />
        <h1 className="mt-6 text-4xl font-extrabold text-white tracking-tight">
          Social Publisher MVP
        </h1>
        <p className="mt-2 text-lg text-teal-400">
          Agende seu conteúdo. Otimize seu tempo.
        </p>
      </div>

      <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
        <form className="space-y-6" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Senha
            </label>
            <div className="mt-1">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="button"
              onClick={handleSignUp}
              className="w-full flex justify-center py-3 px-4 border border-teal-500 text-teal-400 font-medium rounded-md shadow-sm hover:bg-teal-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-colors"
            >
              Cadastrar
            </button>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-colors"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}