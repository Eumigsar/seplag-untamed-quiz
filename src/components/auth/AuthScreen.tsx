'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import RecoverPassword from './RecoverPassword';

export default function AuthScreen() {
  const [view, setView] = useState<'login' | 'register' | 'recover'>('login');

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-4">
      <div className="w-full max-w-md p-8 bg-black/80 border-2 border-jade/50 rounded-lg shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-jade mb-2">Mandarin Legends</h1>
          <p className="text-paper/60 italic">Academia dos Mil Hanzi</p>
        </div>
        {view === 'login' && (
          <LoginForm
            onSwitchRegister={() => setView('register')}
            onSwitchRecover={() => setView('recover')}
          />
        )}
        {view === 'register' && <RegisterForm onSwitchLogin={() => setView('login')} />}
        {view === 'recover' && <RecoverPassword onSwitchLogin={() => setView('login')} />}
      </div>
    </div>
  );
}
