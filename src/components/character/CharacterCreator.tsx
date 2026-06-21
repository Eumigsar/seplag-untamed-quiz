'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/playerStore';
import { useGameStore } from '@/store/gameStore';
import type { Gender, HairStyle, SkinTone, StartingOutfit } from '@/types';
import { cn } from '@/lib/utils';

const GENDERS: { value: Gender; label: string; hanzi: string; pinyin: string }[] = [
  { value: 'male',   label: 'Masculino', hanzi: '男',  pinyin: 'nán' },
  { value: 'female', label: 'Feminino',  hanzi: '女',  pinyin: 'nǚ' },
  { value: 'other',  label: 'Outro',     hanzi: '其他', pinyin: 'qítā' },
];

const HAIRSTYLES: { value: HairStyle; label: string }[] = [
  { value: 'topknot',  label: 'Coque Clássico' },
  { value: 'flowing',  label: 'Cabelo Solto' },
  { value: 'braided',  label: 'Trançado' },
  { value: 'short',    label: 'Curto' },
  { value: 'shaved',   label: 'Raspado (Monge)' },
];

const SKIN_TONES: { value: SkinTone; label: string; color: string }[] = [
  { value: 'light',        label: 'Clara',        color: 'bg-amber-100' },
  { value: 'medium-light', label: 'Médio-Clara',  color: 'bg-amber-200' },
  { value: 'medium',       label: 'Média',        color: 'bg-amber-400' },
  { value: 'medium-dark',  label: 'Médio-Escura', color: 'bg-amber-600' },
  { value: 'dark',         label: 'Escura',       color: 'bg-amber-900' },
];

const OUTFITS: { value: StartingOutfit; label: string; hanzi: string; pinyin: string; desc: string }[] = [
  { value: 'student',  label: 'Estudante',       hanzi: '学生', pinyin: 'xuéshēng', desc: 'Trajes simples de estudante Confuciano' },
  { value: 'martial',  label: 'Artista Marcial', hanzi: '武者', pinyin: 'wǔzhě',    desc: 'Uniforme de treino de kung fu' },
  { value: 'merchant', label: 'Mercador',        hanzi: '商人', pinyin: 'shāngrén', desc: 'Roupas de seda colorida' },
  { value: 'monk',     label: 'Monge',           hanzi: '僧侣', pinyin: 'sēnglǚ',  desc: 'Robes de mosteiro budista' },
];

const STEPS = [
  { id: 'name',    title: 'Seu Nome',         hanzi: '名字', pinyin: 'míngzi'   },
  { id: 'gender',  title: 'Gênero',           hanzi: '性别', pinyin: 'xìngbié'  },
  { id: 'skin',    title: 'Tom de Pele',      hanzi: '肤色', pinyin: 'fūsè'     },
  { id: 'hair',    title: 'Estilo de Cabelo', hanzi: '发型', pinyin: 'fàxíng'   },
  { id: 'outfit',  title: 'Vestimenta',       hanzi: '服装', pinyin: 'fúzhuāng' },
  { id: 'confirm', title: 'Confirmar',        hanzi: '确认', pinyin: 'quèrèn'   },
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
    <div className="min-h-screen bg-[var(--gi-abyss)] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 font-chinese text-[200px] text-[rgba(201,168,108,0.04)] leading-none select-none">道</div>
        <div className="absolute bottom-10 right-10 font-chinese text-[150px] text-[rgba(116,212,168,0.04)] leading-none select-none">武</div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Title */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="font-chinese text-4xl text-gi-geo text-shadow-gold mb-1">创建角色</div>
          <div className="text-sm text-gi-anemo">chuàngjiàn juésè</div>
          <div className="text-xs text-gi-text-dim">Criação de Personagem</div>
        </motion.div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === step
                  ? 'bg-[rgba(201,168,108,0.9)] w-6'
                  : i < step
                    ? 'bg-[rgba(116,212,168,0.6)] w-2'
                    : 'bg-[rgba(30,37,88,0.8)] w-2',
              )}
            />
          ))}
        </div>

        {/* Step card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          className="gi-panel p-6"
        >
          <div className="gi-corner-tr" /><div className="gi-corner-bl" />

          <div className="text-center mb-6">
            <div className="font-chinese text-2xl text-gi-text">{currentStep.hanzi}</div>
            <div className="text-xs text-gi-anemo">{currentStep.pinyin}</div>
            <div className="text-sm text-gi-text-dim mt-1">{currentStep.title}</div>
          </div>

          <div className="gi-divider mb-6" />

          {/* Name */}
          {currentStep.id === 'name' && (
            <div>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Seu nome de herói..."
                maxLength={20}
                className="w-full bg-[rgba(5,8,20,0.7)] border border-[rgba(201,168,108,0.25)] rounded px-4 py-3
                           text-gi-text text-lg text-center placeholder-[#445060]
                           focus:outline-none focus:border-[rgba(201,168,108,0.65)] transition-colors"
              />
              <p className="text-xs text-gi-text-dim text-center mt-2">2-20 caracteres</p>
              {nickname.length >= 2 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center text-gi-anemo text-sm mt-2">
                  欢迎, {nickname}! · Bem-vindo!
                </motion.p>
              )}
            </div>
          )}

          {/* Gender */}
          {currentStep.id === 'gender' && (
            <div className="grid grid-cols-3 gap-3">
              {GENDERS.map(g => (
                <button
                  key={g.value}
                  onClick={() => setGender(g.value)}
                  className={cn(
                    'gi-btn flex flex-col items-center gap-2 p-4 transition-all',
                    gender === g.value && 'gi-btn-active',
                  )}
                >
                  <div className="font-chinese text-3xl text-gi-geo">{g.hanzi}</div>
                  <div className="text-xs text-gi-anemo">{g.pinyin}</div>
                  <div className="text-xs text-gi-text-dim">{g.label}</div>
                </button>
              ))}
            </div>
          )}

          {/* Skin */}
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
                    skin === s.value
                      ? 'border-[rgba(201,168,108,0.9)] scale-110 shadow-gi-gold'
                      : 'border-transparent hover:border-[rgba(201,168,108,0.4)]',
                  )}
                />
              ))}
              <p className="w-full text-center text-xs text-gi-text-dim mt-2">
                {SKIN_TONES.find(s => s.value === skin)?.label}
              </p>
            </div>
          )}

          {/* Hair */}
          {currentStep.id === 'hair' && (
            <div className="space-y-2">
              {HAIRSTYLES.map(h => (
                <button
                  key={h.value}
                  onClick={() => setHair(h.value)}
                  className={cn(
                    'gi-btn w-full py-2.5 px-4 text-sm text-left',
                    hair === h.value && 'gi-btn-active',
                  )}
                >
                  <span className={hair === h.value ? 'text-gi-geo' : 'text-gi-text-dim'}>
                    {hair === h.value ? '◆ ' : '○ '}
                  </span>
                  <span className={hair === h.value ? 'text-gi-text' : 'text-gi-text-dim'}>
                    {h.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Outfit */}
          {currentStep.id === 'outfit' && (
            <div className="grid grid-cols-2 gap-3">
              {OUTFITS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setOutfit(o.value)}
                  className={cn(
                    'gi-btn flex flex-col items-center gap-1 p-3 text-center',
                    outfit === o.value && 'gi-btn-active',
                  )}
                >
                  <div className="font-chinese text-xl text-gi-geo">{o.hanzi}</div>
                  <div className="text-xs text-gi-anemo">{o.pinyin}</div>
                  <div className="text-xs text-gi-text-dim">{o.label}</div>
                  <div className="text-[10px] text-[#445] mt-1">{o.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Confirm */}
          {currentStep.id === 'confirm' && (
            <div className="space-y-3">
              <div className="gi-panel-inner p-4 space-y-2 text-sm">
                {[
                  ['Nome', <span className="text-gi-geo font-bold">{nickname}</span>],
                  ['Gênero', <span className="text-gi-text"><span className="font-chinese">{genderInfo.hanzi}</span> {genderInfo.label}</span>],
                  ['Pele', <span className="text-gi-text">{SKIN_TONES.find(s => s.value === skin)?.label}</span>],
                  ['Cabelo', <span className="text-gi-text">{HAIRSTYLES.find(h => h.value === hair)?.label}</span>],
                  ['Vestimenta', <span className="text-gi-text"><span className="font-chinese">{outfitInfo.hanzi}</span> {outfitInfo.label}</span>],
                ].map(([label, val], i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-gi-text-dim">{label}:</span>
                    {val}
                  </div>
                ))}
              </div>
              <div className="gi-divider" />
              <p className="text-xs text-center text-gi-text-dim">
                Sua aventura começa na 永竹村 (Yǒngzhú Cūn) — Vila do Bambu Eterno
              </p>
              <p className="text-xs text-center text-gi-anemo">
                師父 Sifu Lóng Yún 龙云 aguarda por você!
              </p>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between mt-5 gap-3">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="gi-btn px-6 py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Voltar
          </button>

          {isLast ? (
            <button
              onClick={handleConfirm}
              disabled={creating}
              className="gi-btn gi-btn-primary flex-1 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? '创建中...' : '开始游戏 · Iniciar Jornada →'}
            </button>
          ) : (
            <button
              onClick={() => canAdvance() && setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="gi-btn gi-btn-teal flex-1 py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continuar →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
