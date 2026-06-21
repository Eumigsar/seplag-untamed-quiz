'use client';

let voices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }
    const loaded = window.speechSynthesis.getVoices();
    if (loaded.length > 0) {
      voices = loaded;
      voicesLoaded = true;
      resolve(loaded);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      voicesLoaded = true;
      resolve(voices);
    };
  });
}

function getChineseVoice(): SpeechSynthesisVoice | null {
  if (!voicesLoaded) return null;
  return (
    voices.find(v => v.lang === 'zh-CN') ??
    voices.find(v => v.lang.startsWith('zh')) ??
    null
  );
}

export async function initSpeech() {
  if (typeof window === 'undefined') return;
  await loadVoices();
}

export function speakMandarin(text: string, rate = 1.0): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = 'zh-CN';
    utter.rate  = rate;
    utter.pitch = 1.1;
    const voice = getChineseVoice();
    if (voice) utter.voice = voice;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

export function speakSlow(text: string) {
  return speakMandarin(text, 0.6);
}

export function speakNormal(text: string) {
  return speakMandarin(text, 0.9);
}

export function cancelSpeech() {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
