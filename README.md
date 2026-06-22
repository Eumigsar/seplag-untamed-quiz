# Mandarin Legends: Academia dos Mil Hanzi

> RPG de sobrevivência e crafting no navegador para aprender **Mandarim (HSK 1–4)**. O jogador é um "Escriba do Destino" que reconstrói a Academia dos Mil Hanzi, aprendendo caracteres para progredir.

Stack: **Next.js 14** + **Phaser 3** + **Supabase** + **Zustand** + **Tailwind CSS**, deploy na **Vercel**.

> ⚠ **Estado atual: scaffold MVP.** A base (auth, criação de personagem, mundo navegável, diálogo com o Sifu e aprendizado de Hanzi) está montada. Os assets de arte (spritesheets `player.png`/`sifu.png` e o tileset `academy_tileset.png`) ainda **não existem no repositório** — enquanto não forem adicionados em `public/assets/`, o jogo usa **placeholders verdes** gerados automaticamente. O mapa (chão + paredes) já renderiza via tilemap.

---

## 🚀 Deploy na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new) e importe **`Eumigsar/seplag-untamed-quiz`**
2. Selecione a branch (ex.: `claude/mandarim-rpg-game-iwwsk5`)
3. Em **Environment Variables**, adicione (**obrigatório** — sem isso o jogo mostra um aviso de configuração):
   | Nome | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave `anon public` do Supabase |
4. Clique **Deploy** → você recebe `https://<seu-projeto>.vercel.app`

A configuração de build está em [`vercel.json`](./vercel.json).

> Sem as variáveis do Supabase, o app **não dá tela branca** — ele mostra uma tela explicando que falta configurar (a autenticação é obrigatória nesta arquitetura).

### Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. **Project Settings → API**: copie `URL` e a chave `anon public`
3. **SQL Editor**: rode o script [`supabase/migrations/20231027_initial_schema.sql`](./supabase/migrations/20231027_initial_schema.sql) (cria tabelas + RLS)
4. Defina as variáveis (local em `.env.local` ou no painel da Vercel)

---

## 💻 Rodar localmente

> **Requisito:** Node.js 18.18+ (recomendado 20 — veja `.nvmrc`).

```bash
git clone https://github.com/Eumigsar/seplag-untamed-quiz.git
cd seplag-untamed-quiz
npm install

cp .env.example .env.local   # edite com suas chaves do Supabase

npm run dev                  # http://localhost:3000
```

| Script | Ação |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Servir o build |
| `npm run lint` | ESLint |
| `npm run type-check` | Checagem de tipos |

---

## 🏗 Arquitetura

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root (fonte Inter, tema escuro)
│   ├── page.tsx            # Fluxo: Auth → Criação de Personagem → Jogo
│   └── globals.css
├── components/
│   ├── auth/               # AuthScreen, Login, Register, RecoverPassword
│   ├── game/               # HUD, DialogBox, CharacterCreation, Joystick, GameManager
│   └── GameContainer.tsx   # Une o canvas Phaser + overlay React
├── game/                   # Camada Phaser
│   ├── EventBus.ts         # Ponte de eventos React ↔ Phaser
│   ├── main.ts             # Config do Phaser.Game
│   ├── PhaserGame.tsx      # Wrapper React (client-only)
│   └── scenes/             # Boot → Preloader → Academy
├── store/                  # Zustand: useAuthStore, usePlayerStore
├── services/               # characterService (persistência Supabase)
├── lib/                    # supabaseClient (com guard de configuração)
├── utils/                  # learning-content (Hanzi)
└── types/                  # game.ts
supabase/migrations/        # schema SQL + RLS
public/assets/
├── maps/academy_initial.json   # mapa Tiled (chão + paredes)
├── maps/academy_tileset.png    # (a adicionar)
└── entities/player.png|sifu.png # (a adicionar)
```

**Comunicação React ↔ Phaser:** feita via `EventBus` (um `Phaser.Events.EventEmitter`). O React cuida da UI pesada (auth, diálogos, HUD) e o Phaser do mundo. O `GameContainer` é carregado com `dynamic(..., { ssr: false })` para evitar conflitos de SSR.

---

## 🎮 Loop atual (MVP)

1. **Login / Cadastro** (Supabase Auth)
2. **Criação de personagem** (nome, pele, cabelo) → salvo em `characters`
3. **Mundo (AcademyScene)** — mova-se com WASD/setas (ou joystick no mobile)
4. **Encoste no Sifu Li** → diálogo abre
5. **Aprenda os 5 Hanzi iniciais** → ganha XP, persiste em `learning_progress`
6. **Autosave** de posição a cada 10s

---

## 🗺 Próximos passos

- Adicionar artes reais (spritesheets do herói/Sifu, tileset da Academia)
- Combate "Duelo de Pincéis" (identificar Hanzi/tom)
- Motor de Repetição Espaçada (SRS / SM-2)
- Demais regiões/biomas e sistema de construção da Academia

---

## 📄 Licença

Projeto educacional, sem fins comerciais.
