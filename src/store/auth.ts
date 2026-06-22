import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  session: Session | null;
  ready: boolean;
  setSession: (s: Session | null) => void;
  signOut: () => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  session: null,
  ready: false,
  setSession: (session) => set({ session, user: session?.user ?? null, ready: true }),
  signOut: () => set({ session: null, user: null }),
}));
