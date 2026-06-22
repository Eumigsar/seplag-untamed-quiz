'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase, configured } from '@/lib/supabase';
import { useAuth } from '@/store/auth';
import { usePlayer } from '@/store/player';

const AuthScreen        = dynamic(() => import('@/components/auth/AuthScreen'),        { ssr: false });
const CharacterCreation = dynamic(() => import('@/components/game/CharacterCreation'), { ssr: false });
const GameContainer     = dynamic(() => import('@/components/GameContainer'),           { ssr: false });

export default function Page() {
  const { session, setSession, ready } = useAuth();
  const { character, setCharacter } = usePlayer();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!configured) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadChar(session.user.id).then(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, s) => {
      setSession(s);
      if (s) loadChar(s.user.id);
      else { setCharacter(null); }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadChar(uid: string) {
    const { data } = await supabase.from('characters').select('*').eq('user_id', uid).single();
    setCharacter(data);
  }

  if (!configured) return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-6">
      <div className="max-w-md w-full card p-8 text-center">
        <span className="text-5xl font-chinese text-gold animate-float inline-block mb-4">學</span>
        <h1 className="text-2xl font-bold text-gold mb-2">Mandarin Academy</h1>
        <p className="text-paper/50 text-sm mb-6 italic">Academia dos Mil Hanzi</p>
        <div className="text-left text-sm text-paper/60 space-y-3">
          <p className="text-paper/40">⚙ Configure as variáveis de ambiente no Vercel:</p>
          <pre className="bg-ink border border-gold/15 rounded-lg p-4 text-xs text-gold/70 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...`}
          </pre>
          <p className="text-paper/30 text-xs">Project → Settings → Environment Variables → Redeploy</p>
        </div>
      </div>
    </div>
  );

  if (!ready || loading) return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <div className="text-center">
        <span className="text-6xl font-chinese text-gold animate-float inline-block">學</span>
        <p className="text-paper/40 text-sm mt-4 animate-pulse">Carregando Academia...</p>
      </div>
    </div>
  );

  if (!session)   return <AuthScreen />;
  if (!character) return <CharacterCreation />;
  return <GameContainer />;
}
