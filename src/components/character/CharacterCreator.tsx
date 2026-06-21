'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import type { Gender, HairStyle, SkinTone, StartingOutfit } from '@/types';
import { cn } from '@/lib/utils';

const GENDERS: { value: Gender; label: string; hanzi: string; pinyin: string }[] = [
  { value: 'male',   label: 'Masculino', hanzi: '男', pinyin: 'nán' },
  { value: 'female', label: 'Feminino',  hanzi: '女', pinyin: 'nǚ' },
  { value: 'other',  label: 'Outro',     hanzi: '其他', pinyin: 'qítā' },
];

const HAIRSTYLES: { value: HairStyle; label: string }[] = [
  { value: 'topknot',   label: 'Coque Clássico' },
  { value: 'flowing',   label: 'Cabelo Solto' },
  { value: 'braided',   label: 'Trançado' },
  { value: 'short',     label: 'Curto' },
  { value: 'shaved',    label: 'Raspado (Monge)' },
];

const SKIN_TONES: { value: SkinTone; label: string; color: string }[] = [
  { value: 'light',       label: 'Clara',      color: 'bg-amber-100' },
  { value: 'medium-light',label: 'Médio-Clara', color: 'bg-amber-200' },
  { value: 'medium',      label: 'Média',       color: 'bg-amber-400' },
  { value: 'medium-dark', label: 'Médio-Escura',color: 'bg-amber-600' },
  { value: 'dark',        label: 'Escura',      color: 'bg-amber-900' },
];

const OUTFITS: { value: StartingOutfit; label: string; hanzi: string; pinyin: string; desc: string }[] = [
  { value: 'student',    label: 'Estudante',        hanzi: '学生',  pinyin: 'xuéshēng', desc: 'Trajes simples de estudante Confuciano' },
  { value: 'martial',    label: 'Artista Marcial',  hanzi: '武者',  pinyin: 'wǔzhě',   desc: 'Uniforme de treino de kung fu' },
  { value: 'merchant',   label: 'Mercador',         hanzi: '商人',  pinyin: 'shāngrén', desc: 'Roupas de seda colorida' },
  { value: 'monk',       label: 'Monge',            hanzi: '僧侣',  pinyin: 'sēnglǚ',  desc: 'Robes de mosteiro budista' },
];

interface Step {
  id: string;
  title: string;
  hanzi: string;
  pinyin: string;
}

const STEPS: Step[] = [
  { id: 'name',     title: 'Seu Nome',         hanzi: '名字', pinyin: 'míngzi'  },
  { id: 'gender',   title: 'Gênero',           hanzi: '性别', pinyin: 'xìngbié' },
  { id: 'skin',     title: 'Tom de Pele',      hanzi: '肤色', pinyin: 'fūsè'    },
  { id: 'hair',     title: 'Estilo de Cabelo', hanzi: '发型', pinyin: 'fàxíng'  },
  { id: 'outfit',   title: 'Vestimenta',       hanzi: '服装', pinyin: 'fúzhuāng'},
  { id: 'confirm',  title: 'Confirmar',        hanzi: '确认', pinyin: 'quèrèn'  },
];

export default function CharacterCreator() {
  const router = useRouter();
  const { createCharacter } = usePlayerStore();
  const { setPhase } = useGameStore();

  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [skin, setSkin] = useState<SkinTone>('medium');
  const [hair, setHair] = useState<HairStyle>('topknot');
  const [outfit, setOutfit] = useState<StartingOutfit>('student');
  const [creating, setCreating] = useState(false);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const canAdvance = () => {
    if (currentStep.id === 'name') return nickname.trim().length >= 2;
    return true;
  };

  const handleConfirm = () => {
    if (creating) return;
    setCreating(true);
    createCharacter({
      nickname: nickname.trim(),
      gender,
      appearance: { skinTone: skin, hairStyle: hair, hairColor: 'black', eyeColor: 'brown' },
      startingOutfit: outfit,
    });
    setPhase('playing');
    router.push('/game');
  };

  const genderInfo = GENDERS.find(g => g.value === gender)!;
  const outfitInfo = OUTFITS.find(o => o.value === outfit)!;

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 font-chinese text-[200px] text-gold-900/10 leading-none select-none">道</div>
        <div className="absolute bottom-10 right-10 font-chinese text-[150px] text-jade-900/10 leading-none select-none">武</div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Title */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="font-chinese text-4xl text-gold-300 mb-1">创建角色</div>
          <div className="text-sm text-jade-300">chuàngjiàn juésè</div>
          <div className="text-xs text-gray-500">Criação de Personagem</div>
        </motion.div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                i === step ? 'bg-gold-400 w-4' :
                i < step ? 'bg-jade-500' : 'bg-gray-700'
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="bg-ink-900/90 border border-gold-700/40 rounded-xl p-6 shadow-2xl"
        >
          <div className="text-center mb-6">
            <div className="font-chinese text-2xl text-parchment-200">{currentStep.hanzi}</div>
            <div className="text-xs text-jade-300">{currentStep.pinyin}</div>
            <div className="text-sm text-gray-400 mt-1">{currentStep.title}</div>
          </div>

          {/* Name step */}
          {currentStep.id === 'name' && (
            <div>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Seu nome de herói..."
                maxLength={20}
                className="w-full bg-ink-800 border border-gold-700/40 rounded-lg px-4 py-3
                           text-white text-lg text-center placeholder-gray-600
                           focus:outline-none focus:border-gold-400 transition-colors"
              />
              <p className="text-xs text-gray-500 text-center mt-2">2-20 caracteres</p>
              {nickname.length >= 2 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center text-jade-300 text-sm mt-2">
                  欢迎, {nickname}! · Bem-vindo!
                </motion.p>
              )}
            </div>
          )}

          {/* Gender step */}
          {currentStep.id === 'gender' && (
            <div className="grid grid-cols-3 gap-3">
              {GENDERS.map(g => (
                <button
                  key={g.value}
                  onClick={() => setGender(g.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                    gender === g.value
                      ? 'border-gold-400 bg-gold-900/30'
                      : 'border-ink-700 bg-ink-800 hover:border-gold-700'
                  )}
                >
                  <div className="font-chinese text-3xl text-gold-300">{g.hanzi}</div>
                  <div className="text-xs text-jade-300">{g.pinyin}</div>
                  <div className="text-xs text-gray-400">{g.label}</div>
                </button>
              ))}
            </div>
          )}

          {/* Skin step */}
          {currentStep.id === 'skin' && (
            <div className="flex justify-center gap-3 flex-wrap">
              {SKIN_TONES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSkin(s.value)}
                  title={s.label}
                  className={cn(
                    'w-14 h-14 rounded-full border-4 transition-all',
                    s.color,
                    skin === s.value ? 'border-gold-400 scale-110' : 'border-transparent hover:border-gold-700'
                  )}
                />
              ))}
              <p className="w-full text-center text-xs text-gray-400 mt-2">
                {SKIN_TONES.find(s => s.value === skin)?.label}
              </p>
            </div>
          )}

          {/* Hair step */}
          {currentStep.id === 'hair' && (
            <div className="space-y-2">
              {HAIRSTYLES.map(h => (
                <button
                  key={h.value}
                  onClick={() => setHair(h.value)}
                  className={cn(
                    'w-full py-3 px-4 rounded-lg border text-sm text-left transition-all',
                    hair === h.value
                      ? 'border-gold-400 bg-gold-900/30 text-gold-200'
                      : 'border-ink-700 bg-ink-800 text-gray-300 hover:border-gold-700'
                  )}
                >
                  {hair === h.value ? '● ' : '○ '}{h.label}
                </button>
              ))}
            </div>
          )}

          {/* Outfit step */}
          {currentStep.id === 'outfit' && (
            <div className="grid grid-cols-2 gap-3">
              {OUTFITS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setOutfit(o.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-center',
                    outfit === o.value
                      ? 'border-gold-400 bg-gold-900/30'
                      : 'border-ink-700 bg-ink-800 hover:border-gold-700'
                  )}
                >
                  <div className="font-chinese text-xl text-gold-300">{o.hanzi}</div>
                  <div className="text-xs text-jade-300">{o.pinyin}</div>
                  <div className="text-xs text-gray-400">{o.label}</div>
                  <div className="text-[10px] text-gray-600 mt-1">{o.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Confirm step */}
          {currentStep.id === 'confirm' && (
            <div className="space-y-3">
              <div className="bg-ink-800/80 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nome:</span>
                  <span className="text-gold-300 font-bold">{nickname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gênero:</span>
                  <span className="text-parchment-200">
                    <span className="font-chinese">{genderInfo.hanzi}</span> {genderInfo.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pele:</span>
                  <span className="text-parchment-200">{SKIN_TONES.find(s => s.value === skin)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cabelo:</span>
                  <span className="text-parchment-200">{HAIRSTYLES.find(h => h.value === hair)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vestimenta:</span>
                  <span className="text-parchment-200">
                    <span className="font-chinese">{outfitInfo.hanzi}</span> {outfitInfo.label}
                  </span>
                </div>
              </div>
              <p className="text-xs text-center text-gray-500">
                Sua aventura começa na 永竹村 (Yǒngzhú Cūn) — Vila do Bambu Eterno
              </p>
              <p className="text-xs text-center text-jade-400">
                師父 Sifu Lóng Yún 龙云 aguarda por você!
              </p>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between mt-6 gap-3">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-6 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Voltar
          </button>

          {isLast ? (
            <button
              onClick={handleConfirm}
              disabled={creating}
              className="flex-1 py-3 bg-gradient-to-r from-gold-700 to-gold-600 hover:from-gold-600 hover:to-gold-500
                         text-white font-bold rounded-lg transition-all shadow-lg
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? '创建中...' : '开始游戏 · Iniciar Jornada →'}
            </button>
          ) : (
            <button
              onClick={() => canAdvance() && setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="flex-1 py-2 bg-jade-700 hover:bg-jade-600 text-white text-sm rounded-lg
                         disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Continuar →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
