'use client';

import { usePlayerStore } from '@/store/usePlayerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, Book, User, Settings } from 'lucide-react';

export default function HUD() {
  const { character } = usePlayerStore();
  const { signOut } = useAuthStore();

  if (!character) return null;

  return (
    <div className="w-full h-full p-4 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4 pointer-events-auto">
          <div className="bg-black/70 border border-jade/50 p-2 rounded flex items-center gap-3">
            <div className="w-12 h-12 bg-jade/20 rounded-full border border-jade flex items-center justify-center font-bold text-xl text-jade">
              {character.level}
            </div>
            <div>
              <p className="font-bold text-jade leading-none mb-1">{character.name}</p>
              <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-jade transition-all" style={{ width: `${character.xp % 100}%` }} />
              </div>
              <p className="text-[10px] uppercase text-paper/50 mt-1">Qi: {character.qi}/100</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button className="p-2 bg-black/70 border border-jade/50 rounded hover:bg-jade/20 transition-colors text-jade">
            <Book size={20} />
          </button>
          <button className="p-2 bg-black/70 border border-jade/50 rounded hover:bg-jade/20 transition-colors text-jade">
            <Settings size={20} />
          </button>
          <button
            onClick={() => signOut()}
            className="p-2 bg-black/70 border border-imperial/50 rounded hover:bg-imperial/20 transition-colors text-imperial"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Bottom Bar / Quick Actions */}
      <div className="flex justify-center">
        <div className="bg-black/70 border-t border-x border-jade/50 px-6 py-2 rounded-t-xl flex gap-8 pointer-events-auto">
          <button className="flex flex-col items-center text-jade/70 hover:text-jade">
            <User size={24} />
            <span className="text-[10px] uppercase font-bold">Perfil</span>
          </button>
          <button className="flex flex-col items-center text-jade/70 hover:text-jade">
            <Book size={24} />
            <span className="text-[10px] uppercase font-bold">Hanzi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
