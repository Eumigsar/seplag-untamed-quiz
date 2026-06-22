'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/auth';
import { usePlayer } from '@/store/player';

const SKINS = [
  { id: 'light',  color: '#F3DFB0' },
  { id: 'medium', color: '#C8955A' },
  { id: 'dark',   color: '#6B3E26' },
];
const HAIRS = [
  { id: 'black',  color: '#111111' },
  { id: 'brown',  color: '#6B3A2A' },
  { id: 'silver', color: '#C8C8C8' },
];

export default function CharacterCreation() {
  const { user } = useAuth();
  const { setCharacter } = usePlayer();
  const [name, setName] = useState('');
  const [skin, setSkin] = useState('light');
  const [hair, setHair] = useState('black');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('characters')
      .insert({ user_id: user.id, name, avatar: { skin, hair }, level: 1, xp: 0, qi: 100, position_x: 400, position_y: 300 })
      .select().single();
    if (error) { setError(error.message); setLoading(false); return; }
    setCharacter(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-ink">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="text-center mb-8">
          <span className="text-5xl font-chinese animate-float inline-block">武</span>
          <h2 className="text-2xl font-bold text-gold mt-3">Crie seu Aluno</h2>
          <p className="text-paper/40 text-sm mt-1">Escolha sua aparência para entrar na Academia</p>
        </div>
        <form onSubmit={submit} className="card p-8 space-y-6">
          {error && <div className="p-3 bg-crimson/20 border border-crimson/40 text-red-300 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gold/60 mb-2">Nome do Aluno</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required maxLength={20} placeholder="Ex: Xiao Ming" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gold/60 mb-3 text-center">Tom de Pele</label>
              <div className="flex justify-center gap-3">
                {SKINS.map(s => (
                  <button key={s.id} type="button" onClick={() => setSkin(s.id)}
                    className={`w-10 h-10 rounded-full transition-all ${skin === s.id ? 'ring-2 ring-gold ring-offset-2 ring-offset-stone scale-110' : 'opacity-60 hover:opacity-100'}`}
                    style={{ background: s.color }} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gold/60 mb-3 text-center">Cor do Cabelo</label>
              <div className="flex justify-center gap-3">
                {HAIRS.map(h => (
                  <button key={h.id} type="button" onClick={() => setHair(h.id)}
                    className={`w-10 h-10 rounded-full transition-all ${hair === h.id ? 'ring-2 ring-gold ring-offset-2 ring-offset-stone scale-110' : 'opacity-60 hover:opacity-100'}`}
                    style={{ background: h.color }} />
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="btn-gold w-full" disabled={loading || !name.trim()}>
            {loading ? 'Entrando...' : '⚔ Entrar na Academia'}
          </button>
        </form>
      </div>
    </div>
  );
}
