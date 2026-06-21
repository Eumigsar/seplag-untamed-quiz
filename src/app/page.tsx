'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import { isSupabaseConfigured, signIn, signUp } from '@/lib/supabase';
import { initSpeech } from '@/lib/speech';
import { cn } from '@/lib/utils';

type Screen = 'landing' | 'auth' | 'loading';

const INTRO_WORDS = [
  { hanzi: '道', pinyin: 'Dào',   translation: 'O Caminho' },
  { hanzi: '武', pinyin: 'Wǔ',    translation: 'Arte Marcial' },
  { hanzi: '学', pinyin: 'Xué',   translation: 'Aprender' },
  { hanzi: '师', pinyin: 'Shī',   translation: 'Mestre' },
  { hanzi: '心', pinyin: 'Xīn',   translation: 'Coração' },
];

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
    if (character) {
      setPhase('playing');
      router.replace('/game');
    }
  }, [character]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIdx(i => (i + 1) % INTRO_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const continueAsGuest = () => {
    setGuestMode(true);
    if (character) {
      setPhase('playing');
      router.push('/game');
    } else {
      router.push('/create-character');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) { setAuthError(error.message); return; }
        router.push('/create-character');
      } else {
        const { error } = await signIn(email, password);
        if (error) { setAuthError(error.message); return; }
        if (character) {
          setPhase('playing');
          router.push('/game');
        } else {
          router.push('/create-character');
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const word = INTRO_WORDS[wordIdx];

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Chinese characters */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 font-chinese text-[400px] text-gold-900/5 leading-none select-none">龍</div>
        <div className="absolute -bottom-20 -right-20 font-chinese text-[400px] text-jade-900/5 leading-none select-none">武</div>
        <div className="absolute top-1/4 right-10 font-chinese text-[200px] text-crimson-900/5 leading-none select-none">道</div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold-500/30 rounded-full"
            style={{
              left: `${10 + (i * 7.5)}%`,
              top: `${15 + (i * 5.3)}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.3,
            }}
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
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl"
          >
            {/* Rotating word showcase */}
            <div className="mb-8 h-32 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={wordIdx}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="font-chinese text-8xl text-gold-300 text-shadow-gold leading-none mb-2">
                    {word.hanzi}
                  </div>
                  <div className="text-jade-300 text-lg">{word.pinyin}</div>
                  <div className="text-gray-400 text-sm">{word.translation}</div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="font-chinese text-4xl text-parchment-100 mb-1">武侠学堂</h1>
              <p className="text-jade-300 text-lg mb-1">Wǔxiá Xuétáng</p>
              <p className="text-gray-400 text-sm mb-6">Aprenda Mandarim através da Arte Marcial</p>
              <div className="brush-divider w-48 mx-auto mb-6" />
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-2 mb-8"
            >
              {['HSK 1-4', '3000+ Palavras', 'Pronúncia Real', 'Kung Fu', 'Mundo Aberto', 'Gratuito'].map(f => (
                <span key={f} className="text-xs bg-ink-800 border border-gold-700/40 text-gold-300 px-3 py-1 rounded-full">
                  {f}
                </span>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col gap-3 w-full max-w-xs"
            >
              <button
                onClick={continueAsGuest}
                className="w-full py-4 bg-gradient-to-r from-jade-700 to-jade-600
                           hover:from-jade-600 hover:to-jade-500 text-white font-bold rounded-xl
                           transition-all shadow-lg text-lg"
              >
                🎋 Jogar Gratuitamente
              </button>

              {isSupabaseConfigured && (
                <>
                  <button
                    onClick={() => setScreen('auth')}
                    className="w-full py-3 bg-ink-800 hover:bg-ink-700 border border-gold-700/40
                               hover:border-gold-500 text-gold-300 rounded-xl transition-all"
                  >
                    👤 Entrar / Criar Conta
                  </button>
                  <p className="text-xs text-gray-600">Com conta: progresso salvo na nuvem</p>
                </>
              )}
            </motion.div>

            {/* Sifu quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-10 text-center"
            >
              <p className="font-chinese text-parchment-400 text-sm">「千里之行，始于足下」</p>
              <p className="text-xs text-gray-500 mt-1">Uma jornada de mil li começa com um único passo</p>
              <p className="text-[10px] text-gray-600 mt-0.5">— 老子 Lǎozǐ</p>
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
            <div className="bg-ink-900/95 border border-gold-700/40 rounded-xl p-8 shadow-2xl">
              <button
                onClick={() => setScreen('landing')}
                className="text-gray-500 hover:text-gray-300 text-sm mb-4 flex items-center gap-1"
              >
                ← Voltar
              </button>

              <div className="text-center mb-6">
                <div className="font-chinese text-3xl text-gold-300 mb-1">
                  {authMode === 'login' ? '登录' : '注册'}
                </div>
                <p className="text-gray-400 text-sm">
                  {authMode === 'login' ? 'Entrar na sua conta' : 'Criar nova conta'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full bg-ink-800 border border-gold-700/30 rounded-lg px-4 py-3
                             text-white placeholder-gray-500 focus:outline-none focus:border-gold-400
                             transition-colors"
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Senha"
                  required
                  minLength={6}
                  className="w-full bg-ink-800 border border-gold-700/30 rounded-lg px-4 py-3
                             text-white placeholder-gray-500 focus:outline-none focus:border-gold-400
                             transition-colors"
                />

                {authError && (
                  <p className="text-red-400 text-xs text-center">{authError}</p>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-gold-700 hover:bg-gold-600 text-white font-bold rounded-lg
                             transition-colors disabled:opacity-50"
                >
                  {authLoading ? '...' : authMode === 'login' ? '登录 Entrar' : '注册 Registrar'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setAuthMode(m => m === 'login' ? 'signup' : 'login')}
                  className="text-xs text-gray-400 hover:text-jade-300 transition-colors"
                >
                  {authMode === 'login'
                    ? 'Não tem conta? Criar agora'
                    : 'Já tem conta? Entrar'}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <button
                  onClick={continueAsGuest}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
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
