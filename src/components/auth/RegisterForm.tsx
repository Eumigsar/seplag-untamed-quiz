'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Props { onSwitchLogin: () => void; }

export default function RegisterForm({ onSwitchLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <p className="text-jade">Conta criada! Verifique seu email para confirmar.</p>
        <button onClick={onSwitchLogin} className="btn-primary w-full">Voltar ao Login</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && <div className="p-2 text-sm text-red-500 bg-red-100/10 rounded">{error}</div>}
      <div>
        <label className="block text-xs uppercase text-jade mb-1">Email</label>
        <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="block text-xs uppercase text-jade mb-1">Senha</label>
        <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Cadastrando...' : 'Iniciar Jornada'}
      </button>
      <button type="button" onClick={onSwitchLogin} className="w-full text-sm text-paper/50 hover:text-jade transition-colors">Já tenho uma conta</button>
    </form>
  );
}
