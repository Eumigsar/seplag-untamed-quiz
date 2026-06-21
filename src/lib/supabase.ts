import { createClient } from '@supabase/supabase-js';
import type { DbProfile, PlayerCharacter, VocabProgress, QuestStatus, UserSettings } from '@/types';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const isSupabaseConfigured = !!supabase;

// ─── Auth helpers ──────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase) return;
  return supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ─── Profile helpers ───────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<DbProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as DbProfile;
}

export async function upsertProfile(profile: Partial<DbProfile> & { id: string }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ ...profile, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) console.error('upsertProfile error:', error);
  return data;
}

export async function saveCharacter(userId: string, character: PlayerCharacter) {
  if (!supabase) {
    localStorage.setItem('guest_character', JSON.stringify(character));
    return;
  }
  await upsertProfile({ id: userId, character_data: character });
}

export async function saveVocabProgress(userId: string, progress: VocabProgress[]) {
  if (!supabase) {
    localStorage.setItem('guest_vocab', JSON.stringify(progress));
    return;
  }
  await upsertProfile({ id: userId, vocab_progress: progress });
}

export async function saveQuestProgress(userId: string, progress: Record<string, QuestStatus>) {
  if (!supabase) {
    localStorage.setItem('guest_quests', JSON.stringify(progress));
    return;
  }
  await upsertProfile({ id: userId, quest_progress: progress });
}

// ─── Guest mode local storage helpers ─────────────────────────────────────

export function loadGuestCharacter(): PlayerCharacter | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('guest_character');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function loadGuestVocab(): VocabProgress[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem('guest_vocab');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function loadGuestQuests(): Record<string, QuestStatus> {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem('guest_quests');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

export const defaultSettings: UserSettings = {
  accessibility: {
    dyslexiaMode:  false,
    largeFont:     false,
    highContrast:  false,
    screenReader:  false,
  },
  audio: {
    sfxVolume:              0.7,
    musicVolume:            0.4,
    voiceVolume:            1.0,
    autoPlayPronunciation:  true,
  },
  language: {
    showPinyin:     true,
    showTranslation: true,
    uiLanguage:     'pt-BR',
  },
};
