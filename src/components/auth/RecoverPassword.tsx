'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Props { onSwitchLogin: () => void; }

export default function RecoverPassword({ onSwitchLogin }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setSuccess(true);
    setLoading(false);
  };

  return (
    <form onSubmit={handleRecover} className="space-y-4">
      <h2 className="text-center text-paper font-bold">Recuperar Senha</h2>
      {success ? (
        <div className="text-jade text-sm text-center italic">Link enviado! Verifique sua caixa de entrada.</div>
      ) : (
        <>
          <input type="email" placeholder="Seu email registrado" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Enviando...' : 'Enviar Link'}</button>
        </>
      )}
      <button type="button" onClick={onSwitchLogin} className="w-full text-sm text-paper/50 hover:text-jade transition-colors">Voltar ao Login</button>
    </form>
  );
}
