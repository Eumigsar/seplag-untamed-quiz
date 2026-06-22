'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlayerStore';

const GameContainer = dynamic(() => import('@/components/GameContainer'), { ssr: false });
const AuthScreen = dynamic(() => import('@/components/auth/AuthScreen'), { ssr: false });
const CharacterCreation = dynamic(() => import('@/components/game/CharacterCreation'), { ssr: false });

export default function Home() {
  const { session, setSession, initialized } = useAuthStore();
  const { character, setCharacter } = usePlayerStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchCharacter(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchCharacter(session.user.id);
      else {
        setCharacter(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCharacter(userId: string) {
    const { data } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) setCharacter(data);
    setLoading(false);
  }

  if (!isSupabaseConfigured) return <ConfigNotice />;

  if (!initialized || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink text-jade">
        Carregando...
      </div>
    );
  }

  if (!session) return <AuthScreen />;
  if (!character) return <CharacterCreation />;
  return <GameContainer />;
}

function ConfigNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-6">
      <div className="max-w-md w-full p-8 bg-black/70 border-2 border-jade/50 rounded-lg text-center">
        <h1 className="text-2xl font-bold text-jade mb-2">Mandarin Legends</h1>
        <p className="text-paper/70 mb-4 italic">Academia dos Mil Hanzi</p>
        <div className="text-left text-sm text-paper/80 space-y-2">
          <p>⚠ Supabase ainda não está configurado.</p>
          <p>Defina as variáveis de ambiente e refaça o deploy:</p>
          <pre className="bg-ink/80 border border-jade/20 rounded p-3 text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...`}
          </pre>
          <p className="text-paper/50">
            Na Vercel: Project → Settings → Environment Variables. Rode também a
            migration em <code className="text-jade">supabase/migrations</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
