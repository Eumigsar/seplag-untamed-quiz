'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  onSwitchRegister: () => void;
  onSwitchRecover: () => void;
}

export default function LoginForm({ onSwitchRegister, onSwitchRecover }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <div className="p-2 text-sm text-red-500 bg-red-100/10 rounded">{error}</div>}
      <div>
        <label className="block text-xs uppercase text-jade mb-1">Email</label>
        <input
          type="email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-xs uppercase text-jade mb-1">Senha</label>
        <input
          type="password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar na Academia'}
      </button>
      <div className="flex justify-between text-sm mt-4">
        <button
          type="button"
          onClick={onSwitchRecover}
          className="text-paper/50 hover:text-jade transition-colors"
        >
          Esqueci a senha
        </button>
        <button
          type="button"
          onClick={onSwitchRegister}
          className="text-jade hover:text-white transition-colors"
        >
          Criar Conta
        </button>
      </div>
    </form>
  );
}
