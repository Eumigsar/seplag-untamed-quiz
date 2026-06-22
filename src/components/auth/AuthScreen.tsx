'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type View = 'login' | 'register' | 'recover';

export default function AuthScreen() {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'ok'; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    if (view === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ type: 'error', text: error.message });
    } else if (view === 'register') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg({ type: 'error', text: error.message });
      else setMsg({ type: 'ok', text: 'Cadastro realizado! Verifique seu email.' });
    } else {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      setMsg({ type: 'ok', text: 'Link de recuperação enviado!' });
    }
    setLoading(false);
  };

  const titles: Record<View, string> = {
    login: 'Entrar na Academia',
    register: 'Criar Conta',
    recover: 'Recuperar Senha',
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-ink overflow-hidden">
      <div className="absolute inset-0 flex flex-wrap gap-16 p-8 opacity-[0.03] pointer-events-none select-none font-chinese text-[120px] text-gold leading-none overflow-hidden">
        {'人山水火木日月大小中道德仁义礼智信'.split('').map((c, i) => <span key={i}>{c}</span>)}
      </div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-jade/5 blur-3xl pointer-events-none" />
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-gold/40 bg-stone/60 mb-4 animate-pulse-gold">
            <span className="text-4xl font-chinese text-gold">學</span>
          </div>
          <h1 className="text-3xl font-bold text-gold tracking-wide">Mandarin Academy</h1>
          <p className="text-paper/50 mt-1 text-sm italic">Academia dos Mil Hanzi</p>
        </div>
        <div className="card p-8 shadow-[0_0_40px_#D4AF3715]">
          <h2 className="text-xl font-semibold text-paper mb-6">{titles[view]}</h2>
          {msg && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.type === 'error' ? 'bg-crimson/20 border border-crimson/40 text-red-300' : 'bg-jade/20 border border-jade/40 text-jade'}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gold/60 mb-2">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" />
            </div>
            {view !== 'recover' && (
              <div>
                <label className="block text-xs uppercase tracking-widest text-gold/60 mb-2">Senha</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
              </div>
            )}
            <button type="submit" className="btn-gold w-full mt-2" disabled={loading}>
              {loading ? '...' : titles[view]}
            </button>
          </form>
          <div className="mt-6 flex flex-col gap-2 text-center text-sm">
            {view === 'login' && <>
              <button onClick={() => { setView('register'); setMsg(null); }} className="btn-ghost">Criar conta gratuita</button>
              <button onClick={() => { setView('recover'); setMsg(null); }} className="text-paper/30 hover:text-paper/60 transition-colors text-xs">Esqueci a senha</button>
            </>}
            {view !== 'login' && (
              <button onClick={() => { setView('login'); setMsg(null); }} className="text-paper/40 hover:text-gold transition-colors text-xs">← Voltar ao login</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
