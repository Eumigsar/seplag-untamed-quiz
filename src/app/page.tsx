'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { isSupabaseConfigured, signIn, signUp } from '@/lib/supabase';
import { initSpeech } from '@/lib/speech';

type Screen = 'landing' | 'auth';

const INTRO_WORDS = [
  { hanzi: '道', pinyin: 'Dào', translation: 'O Caminho' },
  { hanzi: '武', pinyin: 'Wǔ',  translation: 'Arte Marcial' },
  { hanzi: '学', pinyin: 'Xué', translation: 'Aprender' },
  { hanzi: '师', pinyin: 'Shī', translation: 'Mestre' },
  { hanzi: '心', pinyin: 'Xīn', translation: 'Coração' },
];

const FEATURES = ['HSK 1-4', '3000+ Palavras', 'Pronúncia Real', 'Kung Fu', 'Mundo Aberto', 'Gratuito'];

export default function LandingPage() {
  const router = useRouter();
  const { character } = usePlayerStore();
  const { setPhase, setGuestMode } = useGameStore();

  const [screen, setScreen] = useState<Screen>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    initSpeech();
    if (character) { setPhase('playing'); router.replace('/game'); }
  }, [character]);

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % INTRO_WORDS.length), 2500);
    return () => clearInterval(t);
  }, []);

  const continueAsGuest = () => {
    setGuestMode(true);
    router.push(character ? '/game' : '/create-character');
    if (character) setPhase('playing');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const { error } = authMode === 'signup'
        ? await signUp(email, password)
        : await signIn(email, password);
      if (error) { setAuthError(error.message); return; }
      if (character) { setPhase('playing'); router.push('/game'); }
      else router.push('/create-character');
    } finally {
      setAuthLoading(false);
    }
  };

  const word = INTRO_WORDS[wordIdx];

  return (
    <div className="min-h-screen bg-[var(--gi-abyss)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient background characters */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute -top-20 -left-20 font-chinese text-[400px] text-[rgba(201,168,108,0.04)] leading-none">龍</div>
        <div className="absolute -bottom-20 -right-20 font-chinese text-[400px] text-[rgba(116,212,168,0.04)] leading-none">武</div>
        <div className="absolute top-1/4 right-10 font-chinese text-[200px] text-[rgba(240,64,80,0.03)] leading-none">道</div>
      </div>

      {/* Floating geo particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: i % 3 === 0 ? 'rgba(201,168,108,0.4)' : i % 3 === 1 ? 'rgba(116,212,168,0.3)' : 'rgba(138,155,191,0.25)',
              left: `${10 + i * 7.5}%`,
              top: `${15 + i * 5.3}%`,
            }}
            animate={{ y: [0, -28, 0], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {screen === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl w-full"
          >
            {/* Rotating word */}
            <div className="mb-8 h-36 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={wordIdx}
                  initial={{ opacity: 0, y: 20, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.85 }}
                  transition={{ duration: 0.45 }}
                  className="text-center"
                >
                  <div className="font-chinese text-[7rem] leading-none text-gi-geo text-shadow-gold mb-2">
                    {word.hanzi}
                  </div>
                  <div className="text-gi-anemo text-lg">{word.pinyin}</div>
                  <div className="text-gi-text-dim text-sm">{word.translation}</div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Title panel */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="gi-panel px-8 py-6 mb-8 relative"
            >
              <div className="gi-corner-tr" /><div className="gi-corner-bl" />
              <h1 className="font-chinese text-4xl text-gi-text mb-1">武侠学堂</h1>
              <p className="text-gi-anemo text-lg mb-1">Wǔxiá Xuétáng</p>
              <p className="text-gi-text-dim text-sm mb-5">Aprenda Mandarim através da Arte Marcial</p>
              <div className="gi-divider mb-5" />

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {FEATURES.map(f => (
                  <span key={f} className="gi-btn text-xs px-3 py-1 cursor-default">
                    {f}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                <button
                  onClick={continueAsGuest}
                  className="gi-btn gi-btn-primary w-full py-3.5 text-base"
                >
                  🎋 Jogar Gratuitamente
                </button>

                {isSupabaseConfigured && (
                  <button
                    onClick={() => setScreen('auth')}
                    className="gi-btn w-full py-3 text-sm"
                  >
                    👤 Entrar / Criar Conta
                  </button>
                )}
              </div>
            </motion.div>

            {/* Sifu quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center"
            >
              <p className="font-chinese text-gi-text-dim text-sm">「千里之行，始于足下」</p>
              <p className="text-xs text-[#445] mt-1">Uma jornada de mil li começa com um único passo</p>
              <p className="text-[10px] text-[#334] mt-0.5">— 老子 Lǎozǐ</p>
            </motion.div>
          </motion.div>
        )}

        {screen === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md px-6"
          >
            <div className="gi-panel p-8">
              <div className="gi-corner-tr" /><div className="gi-corner-bl" />

              <button
                onClick={() => setScreen('landing')}
                className="gi-btn text-xs px-3 py-1 mb-5"
              >
                ← Voltar
              </button>

              <div className="text-center mb-5">
                <div className="font-chinese text-3xl text-gi-geo text-shadow-gold mb-1">
                  {authMode === 'login' ? '登录' : '注册'}
                </div>
                <p className="text-gi-text-dim text-sm">
                  {authMode === 'login' ? 'Entrar na sua conta' : 'Criar nova conta'}
                </p>
              </div>

              <div className="gi-divider mb-5" />

              <form onSubmit={handleAuth} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full bg-[rgba(5,8,20,0.7)] border border-[rgba(201,168,108,0.2)] rounded px-4 py-3
                             text-gi-text placeholder-[#445060] focus:outline-none
                             focus:border-[rgba(201,168,108,0.6)] transition-colors"
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Senha"
                  required
                  minLength={6}
                  className="w-full bg-[rgba(5,8,20,0.7)] border border-[rgba(201,168,108,0.2)] rounded px-4 py-3
                             text-gi-text placeholder-[#445060] focus:outline-none
                             focus:border-[rgba(201,168,108,0.6)] transition-colors"
                />
                {authError && (
                  <p className="text-crimson-400 text-xs text-center">{authError}</p>
                )}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="gi-btn gi-btn-primary w-full py-3 text-sm disabled:opacity-50"
                >
                  {authLoading ? '...' : authMode === 'login' ? '登录 Entrar' : '注册 Registrar'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setAuthMode(m => m === 'login' ? 'signup' : 'login')}
                  className="text-xs text-gi-text-dim hover:text-gi-anemo transition-colors"
                >
                  {authMode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-[rgba(201,168,108,0.1)]">
                <button
                  onClick={continueAsGuest}
                  className="w-full py-2 text-xs text-gi-text-dim hover:text-gi-text transition-colors"
                >
                  Continuar sem conta (progresso local)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
