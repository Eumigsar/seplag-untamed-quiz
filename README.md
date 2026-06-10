# 修道 · Simulado SEPLAG-RJ · 陈情令

> Simulador de questões com IA para o concurso **SEPLAG-RJ FGV 2026** (cargos EPPGG e APO), com tema visual de **The Untamed / 陈情令**.

---

## ✨ Funcionalidades

| Feature | Descrição |
|---|---|
| 🤖 **IA Claude Sonnet 4.6** | Gera questões inéditas com gabarito e comentário FGV-contextualizado |
| 👤 **Perfil de cultivador** | Nome salvo, progresso por usuário no localStorage |
| ⏱ **Cronômetro** | Tempo de sessão + tempo acumulado por matéria |
| 📊 **Desempenho** | Aproveitamento, questões feitas e horas de estudo por matéria |
| ☯ **Revisão de erros** | Questões erradas ficam salvas para revisão posterior |
| 🎵 **Áudio** | Som de guqin no acerto, tom grave no erro, música pentatônica ambiente |
| 🌸 **Visual** | Pétalas caindo, 3 fundos temáticos (Lotus Pier · Cloud Recesses · Burial Mounds) |
| 🗣 **Personagens** | Wei Wuxian e Lan Zhan aparecem com falas de incentivo/consolo |

---

## 🖼 Cenários temáticos

| Aba | Local | Atmosfera |
|---|---|---|
| ⚔ Simulado | **Lotus Pier 莲花坞** | Céu noturno roxo-azul, lótus dourados, lanternas vermelhas, pavilhão sobre o lago |
| ☯ Revisão | **Cloud Recesses 雲深不知處** | Montanhas nevadas com névoa, portão com caligrafia, wistéria roxa |
| 卷 Desempenho | **Burial Mounds 乱葬岗** | Céu escarlate-negro, árvores retorcidas, talismãs flutuantes (符咒魂止煞) |

---

## 📚 Matérias disponíveis

- Língua Portuguesa
- Raciocínio Lógico
- Direito Administrativo
- Direito Constitucional
- Administração e Governança Pública
- Políticas Públicas
- Administração Financeira e Orçamentária
- Finanças Públicas
- Estatuto dos Servidores RJ
- Reforma Administrativa
- Tecnologia da Informação
- Ética no Serviço Público

---

## 🚀 Como usar

### Opção 1 — Instalar o .exe (Windows)

1. Baixe o instalador na seção [Releases](../../releases)
2. Execute e instale normalmente
3. Abra o app e insira sua **chave API Anthropic** no campo no topo (obtenha em [console.anthropic.com](https://console.anthropic.com))
4. Clique **✦ salvar** — a chave fica armazenada localmente
5. Crie seu perfil de cultivador e comece!

### Opção 2 — Rodar em modo desenvolvimento

```bash
git clone https://github.com/Eumigsar/seplag-untamed-quiz.git
cd seplag-untamed-quiz
npm install
npm start
```

> **Requisito:** Node.js 18+ e uma chave API Anthropic válida.

### Gerar o instalador .exe

```bash
npm run build-win
```

> O instalador é gerado em `dist/` — procure por `Simulado SEPLAG-RJ Setup 1.0.0.exe`

---

## 🔑 Chave API

- A chave começa com `sk-ant-api...`
- Ela é salva localmente no seu computador
- Custo estimado: ~R$ 0,05 a R$ 0,10 por simulado de 10 questões
- Sem chave, o app não gera questões

---

## 🏗 Estrutura do projeto

```
seplag-untamed-quiz/
├── main.js              # Processo principal Electron (CORS, gerador de fundos)
├── package.json
├── src/
│   ├── index.html       # App completo (HTML + CSS + JS inline)
│   └── gen-bg.html      # Gerador SVG dos 3 fundos temáticos
└── assets/
    ├── bg-sim.jpg       # Lotus Pier (gerado automaticamente na 1ª execução)
    ├── bg-rev.jpg       # Cloud Recesses (gerado automaticamente)
    └── bg-hist.jpg      # Burial Mounds (gerado automaticamente)
```

> Os fundos em `assets/` são gerados automaticamente via SVG → Canvas na primeira execução.

---

## ⚙ Tecnologias

- **Electron 26** — app desktop Windows/Mac/Linux
- **Anthropic Claude Sonnet 4.6** — geração de questões via API
- **Web Audio API** — sons e música pentatônica sem arquivos externos
- **HTML5 Canvas** — animação de pétalas e geração dos fundos SVG
- **localStorage** — persistência de progresso por usuário

---

## 🐛 Problemas comuns

**"electron não reconhecido"** → Feche e reabra o terminal após instalar o Node.js

**"npm install falha"** → Tente `npm install --legacy-peer-deps`

**"Erro ao gerar questões"** → Verifique a chave API e os créditos na conta Anthropic

**Fundo preto/sem imagem** → Os fundos são gerados na primeira execução; aguarde alguns segundos

---

## 📄 Licença

Projeto educacional, sem fins comerciais. Não afiliado à SEPLAG-RJ, FGV ou à produção de *The Untamed / 陈情令*.

---

*陈情令 · The Untamed · 修道 · 莲花坞 · 雲深不知處 · 乱葬岗*
