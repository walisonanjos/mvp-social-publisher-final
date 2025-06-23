// src/app/auth/callback/page.tsx

import { Suspense } from 'react';
import CallbackHandler from '../../../components/CallbackHandler';

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="p-8 bg-gray-800 rounded-lg text-center">
                <p>Processando autenticação...</p>
            </div>
        </div>
    )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="p-8 bg-gray-800 rounded-lg text-center">
            <CallbackHandler />
        </div>
      </div>
    </Suspense>
  );
}