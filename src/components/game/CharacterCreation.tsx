'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlayerStore';

export default function CharacterCreation() {
  const { user } = useAuthStore();
  const { setCharacter } = usePlayerStore();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [skin, setSkin] = useState('light');
  const [hair, setHair] = useState('black');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const avatar_data = { skin, hair, outfit: 'apprentice_robe', eyes: 'brown', mascot: 'none' };
    const { data, error } = await supabase.from('characters').insert({ user_id: user.id, name, avatar_data }).select().single();
    if (error) alert(error.message);
    else setCharacter(data);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-4">
      <form onSubmit={handleSubmit} className="max-w-lg w-full p-8 bg-black/60 border border-jade rounded-lg">
        <h2 className="text-2xl font-bold text-jade mb-6 text-center">Crie seu Aluno</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-xs uppercase text-jade mb-1">Nome do Personagem</label>
            <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required maxLength={20} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-jade mb-2 text-center">Pele</label>
              <div className="flex justify-center gap-2">
                {['light', 'tan', 'dark'].map((s) => (
                  <button key={s} type="button" onClick={() => setSkin(s)} className={`w-8 h-8 rounded-full border-2 ${skin === s ? 'border-jade' : 'border-transparent'}`} style={{ backgroundColor: s === 'light' ? '#F3E5AB' : s === 'tan' ? '#D2B48C' : '#5C4033' }} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase text-jade mb-2 text-center">Cabelo</label>
              <div className="flex justify-center gap-2">
                {['black', 'brown', 'silver'].map((h) => (
                  <button key={h} type="button" onClick={() => setHair(h)} className={`w-8 h-8 rounded-full border-2 ${hair === h ? 'border-jade' : 'border-transparent'}`} style={{ backgroundColor: h }} />
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-4" disabled={loading || !name}>
            {loading ? 'Iniciando...' : 'Entrar na Academia'}
          </button>
        </div>
      </form>
    </div>
  );
}
