'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase, configured } from '@/lib/supabase';
import { useAuth } from '@/store/auth';
import { usePlayer } from '@/store/player';

const GameContainer = dynamic(() => import('@/components/GameContainer'), { ssr: false });
const AuthScreen = dynamic(() => import('@/components/auth/AuthScreen'), { ssr: false });
const CharacterCreation = dynamic(() => import('@/components/game/CharacterCreation'), { ssr: false });

function ConfigNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-4">
      <div className="card p-8 max-w-md text-center space-y-4">
        <span className="text-5xl font-chinese text-gold">學</span>
        <h1 className="text-2xl font-bold text-gold">Mandarin Academy</h1>
        <p className="text-paper/60 text-sm">
          Configure as variáveis de ambiente do Supabase para começar.
        </p>
        <p className="text-paper/40 text-xs font-mono">
          NEXT_PUBLIC_SUPABASE_URL<br />
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const { session, ready, setSession } = useAuth();
  const { character } = usePlayer();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!configured) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, [setSession]);

  if (!configured) return <ConfigNotice />;
  if (loading || !ready) return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <div className="text-center space-y-4">
        <span className="text-6xl font-chinese text-gold animate-float inline-block">學</span>
        <p className="text-paper/40 text-sm">Carregando Academia...</p>
      </div>
    </div>
  );
  if (!session) return <AuthScreen />;
  if (!character) return <CharacterCreation />;
  return <GameContainer />;
}
