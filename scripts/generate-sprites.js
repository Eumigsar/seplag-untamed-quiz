#!/usr/bin/env node
'use strict';
const fs   = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '..', 'public', 'sprites');
fs.mkdirSync(OUT, { recursive: true });

// ── Color utilities ────────────────────────────────────────────────────────────
function toRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}
function toHex(r,g,b) {
  return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
}
function lighten(hex, amt=30) { const [r,g,b]=toRgb(hex); return toHex(r+amt,g+amt,b+amt); }
function darken(hex,  amt=30) { const [r,g,b]=toRgb(hex); return toHex(r-amt,g-amt,b-amt); }
function mix(hex1, hex2, t=0.5) {
  const [r1,g1,b1]=toRgb(hex1), [r2,g2,b2]=toRgb(hex2);
  return toHex(r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t);
}

// ── Outfit data ────────────────────────────────────────────────────────────────
// headStyle options: 'short'|'long'|'bald'|'topknot'|'headband'|'scholar-hat'|'helmet'|'white-hair'
const OUTFITS = {
  default: {
    m: { robe:'#3d6b9a', accent:'#7eb8e8', inner:'#f0e4b8', belt:'#8b5e1a', shoe:'#2a1a0a', hair:'#1a1212', headStyle:'short' },
    f: { robe:'#7a4f9a', accent:'#c09ade', inner:'#f8e8d0', belt:'#8b5e1a', shoe:'#2a1a0a', hair:'#1a1212', headStyle:'long'  },
  },
  'shaolin-monk': {
    m: { robe:'#d97706', accent:'#fbbf24', inner:'#fef9e7', belt:'#78350f', shoe:'#7c2d12', hair:'#1a1212', headStyle:'bald' },
    f: { robe:'#d97706', accent:'#fbbf24', inner:'#fef9e7', belt:'#78350f', shoe:'#7c2d12', hair:'#1a1212', headStyle:'bald' },
  },
  'silk-merchant': {
    m: { robe:'#a21caf', accent:'#e879f9', inner:'#fdf4ff', belt:'#92400e', shoe:'#1c1917', hair:'#1a1212', headStyle:'topknot' },
    f: { robe:'#be185d', accent:'#fb7185', inner:'#fff1f2', belt:'#92400e', shoe:'#1c1917', hair:'#1a1212', headStyle:'topknot' },
  },
  'wandering-warrior': {
    m: { robe:'#1f2937', accent:'#6b7280', inner:'#c7d2fe', belt:'#6d28d9', shoe:'#111827', hair:'#1a1212', headStyle:'headband' },
    f: { robe:'#1f2937', accent:'#9ca3af', inner:'#ddd6fe', belt:'#6d28d9', shoe:'#111827', hair:'#1a1212', headStyle:'headband' },
  },
  'jade-scholar': {
    m: { robe:'#065f46', accent:'#34d399', inner:'#ecfdf5', belt:'#92400e', shoe:'#1c1917', hair:'#1a1212', headStyle:'scholar-hat' },
    f: { robe:'#065f46', accent:'#6ee7b7', inner:'#f0fdf4', belt:'#92400e', shoe:'#1c1917', hair:'#1a1212', headStyle:'scholar-hat' },
  },
  'imperial-guard': {
    m: { robe:'#1e3a8a', accent:'#60a5fa', inner:'#eff6ff', belt:'#b45309', shoe:'#1e293b', hair:'#1a1212', headStyle:'helmet' },
    f: { robe:'#1e3a8a', accent:'#93c5fd', inner:'#eff6ff', belt:'#b45309', shoe:'#1e293b', hair:'#1a1212', headStyle:'helmet' },
  },
  'taoist-hermit': {
    m: { robe:'#374151', accent:'#d1d5db', inner:'#f1f5f9', belt:'#1f2937', shoe:'#111827', hair:'#c8ccd8', headStyle:'white-hair' },
    f: { robe:'#374151', accent:'#e5e7eb', inner:'#f8fafc', belt:'#1f2937', shoe:'#111827', hair:'#d8dce8', headStyle:'white-hair' },
  },
};

const SKIN = {
  m: { hi:'#fde8c8', base:'#f0b87a', shadow:'#c8844a', lip:'#c06848' },
  f: { hi:'#fff0e0', base:'#f5c899', shadow:'#d48860', lip:'#d4706c' },
};

// ── SVG helpers ────────────────────────────────────────────────────────────────
let _uid = 0;
function uid() { return `g${++_uid}`; }

function linGrad(id, x1,y1,x2,y2, stops) {
  const s = stops.map(([o,c,a='1'])=>`<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">${s}</linearGradient>`;
}
function radGrad(id, cx,cy,r, stops, fx, fy) {
  const fAttr = fx!=null ? ` fx="${fx}" fy="${fy}"` : '';
  const s = stops.map(([o,c,a='1'])=>`<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fAttr} gradientUnits="userSpaceOnUse">${s}</radialGradient>`;
}

// ── Character generator ────────────────────────────────────────────────────────
function makeSVG(gender, outfitId) {
  const o  = OUTFITS[outfitId][gender];
  const sk = SKIN[gender];
  _uid = 0; // reset per sprite so IDs are short

  // Gradient IDs (short, local to this SVG)
  const G = {
    skin:    uid(), skinSide: uid(),
    robe:    uid(), sleeve:   uid(),
    inner:   uid(),
    iris:    uid(), iris2:    uid(),
    shoe:    uid(),
    hair:    uid(),
    helmetG: uid(),
    hatG:    uid(),
  };

  const defs = [
    // Skin — radial with soft shadow on left
    radGrad(G.skin, 32, 18, 17, [['0%',sk.hi],['55%',sk.base],['100%',sk.shadow]], 28, 14),
    // Robe body — top lighter, bottom darker
    linGrad(G.robe, 32,42, 32,116, [['0%',lighten(o.robe,18)],['40%',o.robe],['100%',darken(o.robe,22)]]),
    // Sleeves — slightly different angle
    linGrad(G.sleeve, 8,48, 56,92, [['0%',lighten(o.robe,12)],['100%',darken(o.robe,28)]]),
    // Inner robe
    linGrad(G.inner, 32,48, 32,116, [['0%',o.inner],['100%',darken(o.inner,12)]]),
    // Eyes
    radGrad(G.iris,  26,24, 3.5, [['0%','#7dd3fc'],['45%','#2563eb'],['100%','#1e3a8a']], 25,23),
    radGrad(G.iris2, 38,24, 3.5, [['0%','#7dd3fc'],['45%','#2563eb'],['100%','#1e3a8a']], 37,23),
    // Shoes
    linGrad(G.shoe, 20,118, 44,126, [['0%',lighten(o.shoe,20)],['100%',o.shoe]]),
    // Hair
    linGrad(G.hair, 32,6, 32,28, [['0%',lighten(o.hair,25)],['100%',o.hair]]),
    // Helmet
    linGrad(G.helmetG, 32,4, 32,24, [['0%',lighten(o.accent,35)],['50%',darken(o.accent,10)],['100%',darken(o.accent,30)]]),
    // Scholar hat
    linGrad(G.hatG, 32,2, 32,18, [['0%',lighten(o.hair,20)],['100%',darken(o.hair,10)]]),
  ].join('\n');

  const layers = [];

  // ── BACK HAIR (long styles only) ────────────────────────────────────────────
  if (o.headStyle === 'long' || o.headStyle === 'white-hair') {
    const hc = o.hair;
    // Two strands flowing down behind shoulders
    layers.push(`<!-- back hair -->
<path d="M 22,24 C 16,40 14,70 18,98 L 24,96 C 22,68 22,40 28,24 Z" fill="${hc}" opacity="0.92"/>
<path d="M 42,24 C 48,40 50,70 46,98 L 40,96 C 42,68 42,40 36,24 Z" fill="${hc}" opacity="0.92"/>
${o.headStyle==='white-hair' ? `<path d="M 21,26 C 14,44 12,72 16,100 L 20,99 C 14,72 15,46 21,28 Z" fill="${lighten(hc,18)}" opacity="0.55"/>
<path d="M 43,26 C 50,44 52,72 48,100 L 44,99 C 50,72 49,46 43,28 Z" fill="${lighten(hc,18)}" opacity="0.55"/>` : ''}`);
  }

  // ── ROBE BACK (visible at bottom hem sides) ──────────────────────────────────
  layers.push(`<!-- robe shadow sides -->
<path d="M 12,46 C 8,68 5,90 6,116 L 10,116 C 9,90 12,68 16,46 Z" fill="${darken(o.robe,35)}" opacity="0.45"/>
<path d="M 52,46 C 56,68 59,90 58,116 L 54,116 C 55,90 52,68 48,46 Z" fill="${darken(o.robe,35)}" opacity="0.45"/>`);

  // ── LEFT SLEEVE ─────────────────────────────────────────────────────────────
  layers.push(`<!-- left sleeve -->
<path d="M 6,50 C 2,60 0,76 2,94 L 14,92 C 12,76 14,62 18,50 Z"
  fill="url(#${G.sleeve})" stroke="${darken(o.robe,45)}" stroke-width="0.7" stroke-linejoin="round"/>`);

  // ── RIGHT SLEEVE ─────────────────────────────────────────────────────────────
  layers.push(`<!-- right sleeve -->
<path d="M 58,50 C 62,60 64,76 62,94 L 50,92 C 52,76 50,62 46,50 Z"
  fill="url(#${G.sleeve})" stroke="${darken(o.robe,45)}" stroke-width="0.7" stroke-linejoin="round"/>`);

  // ── INNER ROBE (hem) ─────────────────────────────────────────────────────────
  layers.push(`<!-- inner robe hem -->
<path d="M 22,110 L 32,118 L 42,110 L 48,116 L 32,126 L 16,116 Z" fill="url(#${G.inner})"/>`);

  // ── MAIN ROBE BODY ───────────────────────────────────────────────────────────
  // Wuxia-style: narrow at neck, wide flare at hem
  layers.push(`<!-- main robe -->
<path d="M 18,46 C 14,58 10,78 8,116 L 56,116 C 54,78 50,58 46,46 Z"
  fill="url(#${G.robe})" stroke="${darken(o.robe,45)}" stroke-width="0.8" stroke-linejoin="round"/>`);

  // ── V-NECK INNER ROBE ────────────────────────────────────────────────────────
  layers.push(`<!-- v-neck inner -->
<path d="M 23,46 L 32,60 L 41,46" fill="none" stroke="${o.inner}" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 25,46 L 32,58 L 39,46" fill="${darken(o.inner,8)}" opacity="0.5"/>`);

  // ── OUTFIT-SPECIFIC BODY DETAILS ─────────────────────────────────────────────
  if (outfitId === 'shaolin-monk') {
    // Diagonal drape line (one-shoulder robe)
    layers.push(`<path d="M 22,46 C 26,60 30,80 34,116" stroke="${darken(o.robe,15)}" stroke-width="2" fill="none" opacity="0.7"/>`);
    // Gold collar band
    layers.push(`<path d="M 20,46 L 32,54 L 44,46" fill="none" stroke="${o.accent}" stroke-width="2.5" stroke-linecap="round"/>`);
  }
  if (outfitId === 'imperial-guard') {
    // Armor chest plates
    const ap = o.accent;
    layers.push(`
<rect x="22" y="52" width="9" height="6" rx="1" fill="${ap}" stroke="${darken(ap,40)}" stroke-width="0.6" opacity="0.9"/>
<rect x="33" y="52" width="9" height="6" rx="1" fill="${ap}" stroke="${darken(ap,40)}" stroke-width="0.6" opacity="0.9"/>
<rect x="21" y="60" width="10" height="6" rx="1" fill="${ap}" stroke="${darken(ap,40)}" stroke-width="0.6" opacity="0.85"/>
<rect x="33" y="60" width="10" height="6" rx="1" fill="${ap}" stroke="${darken(ap,40)}" stroke-width="0.6" opacity="0.85"/>
<line x1="19" y1="50" x2="19" y2="114" stroke="${ap}" stroke-width="1.2" opacity="0.6"/>
<line x1="45" y1="50" x2="45" y2="114" stroke="${ap}" stroke-width="1.2" opacity="0.6"/>`);
  }
  if (outfitId === 'jade-scholar') {
    // Scroll/ink motif on chest
    layers.push(`
<line x1="28" y1="76" x2="36" y2="76" stroke="${o.accent}" stroke-width="1.2" opacity="0.8"/>
<line x1="26" y1="82" x2="38" y2="82" stroke="${o.accent}" stroke-width="1.2" opacity="0.8"/>
<line x1="28" y1="88" x2="36" y2="88" stroke="${o.accent}" stroke-width="1.2" opacity="0.7"/>
<path d="M 29,94 C 29,91 35,91 35,94 L 35,100 C 35,103 29,103 29,100 Z" fill="none" stroke="${o.accent}" stroke-width="1" opacity="0.6"/>`);
  }
  if (outfitId === 'silk-merchant') {
    // Embroidered pattern
    layers.push(`
<path d="M 24,68 C 26,64 30,64 32,68 C 34,64 38,64 40,68" fill="none" stroke="${o.accent}" stroke-width="1.2" opacity="0.7"/>
<path d="M 22,78 C 24,74 28,74 30,78 C 32,74 36,74 38,78 C 40,74 44,74 46,78" fill="none" stroke="${o.accent}" stroke-width="1.1" opacity="0.65"/>
<path d="M 24,88 C 26,84 30,84 32,88 C 34,84 38,84 40,88" fill="none" stroke="${o.accent}" stroke-width="1.2" opacity="0.7"/>`);
  }
  if (outfitId === 'taoist-hermit') {
    // Yin-yang symbol suggestion
    layers.push(`
<circle cx="32" cy="84" r="7" fill="none" stroke="${o.accent}" stroke-width="1.2" opacity="0.6"/>
<path d="M 32,77 A 3.5,3.5 0 0 1 32,84 A 3.5,3.5 0 0 0 32,91" fill="none" stroke="${o.accent}" stroke-width="1.2" opacity="0.6"/>
<circle cx="32" cy="80.5" r="1.5" fill="${darken(o.robe,10)}" opacity="0.7"/>
<circle cx="32" cy="87.5" r="1.5" fill="${o.accent}" opacity="0.7"/>`);
  }
  if (outfitId === 'wandering-warrior') {
    // Arm guard strips on sleeves
    layers.push(`
<rect x="2" y="78" width="12" height="5" rx="1" fill="${darken(o.robe,25)}" stroke="${o.accent}" stroke-width="0.7" opacity="0.85"/>
<rect x="50" y="78" width="12" height="5" rx="1" fill="${darken(o.robe,25)}" stroke="${o.accent}" stroke-width="0.7" opacity="0.85"/>
<line x1="20" y1="46" x2="18" y2="116" stroke="${o.accent}" stroke-width="1" opacity="0.35"/>
<line x1="44" y1="46" x2="46" y2="116" stroke="${o.accent}" stroke-width="1" opacity="0.35"/>`);
  }

  // ── BELT / SASH ──────────────────────────────────────────────────────────────
  const beltLight = lighten(o.belt, 22);
  layers.push(`<!-- belt -->
<path d="M 16,72 L 48,72 L 48,78 L 16,78 Z" fill="${o.belt}" stroke="${darken(o.belt,25)}" stroke-width="0.7"/>
<!-- belt knot -->
<path d="M 28,69 L 32,73 L 36,69 L 36,81 L 32,77 L 28,81 Z" fill="${beltLight}" stroke="${darken(o.belt,20)}" stroke-width="0.6"/>
<ellipse cx="32" cy="75" rx="3" ry="2.5" fill="${beltLight}" stroke="${darken(o.belt,30)}" stroke-width="0.5"/>`);

  // ── NECK ─────────────────────────────────────────────────────────────────────
  layers.push(`<!-- neck -->
<rect x="27" y="36" width="10" height="12" rx="3" fill="url(#${G.skin})"/>
<path d="M 27,38 L 37,38" stroke="${sk.shadow}" stroke-width="0.5" opacity="0.4"/>`);

  // ── HEAD ─────────────────────────────────────────────────────────────────────
  // Slightly taller than wide for anime look
  layers.push(`<!-- head -->
<ellipse cx="32" cy="21" rx="14" ry="16" fill="url(#${G.skin})" stroke="${darken(sk.base,22)}" stroke-width="0.8"/>
<!-- cheek blush (female) -->
${gender === 'f' ? `<ellipse cx="22" cy="25" rx="4" ry="2.5" fill="#f08090" opacity="0.25"/>
<ellipse cx="42" cy="25" rx="4" ry="2.5" fill="#f08090" opacity="0.25"/>` : ''}`);

  // ── HEAD STYLE (hair/hat) ─────────────────────────────────────────────────────
  const hc = o.hair;
  const hcL = lighten(hc, 22);
  const hcD = darken(hc, 22);

  switch (o.headStyle) {
    case 'short':
      layers.push(`<!-- short hair -->
<path d="M 18,12 C 18,4 46,4 46,12 C 44,8 20,8 18,12 Z" fill="url(#${G.hair})"/>
<path d="M 18,12 C 15,14 15,20 17,24" fill="none" stroke="${hc}" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 46,12 C 49,14 49,20 47,24" fill="none" stroke="${hc}" stroke-width="2.5" stroke-linecap="round"/>`);
      break;

    case 'long':
      layers.push(`<!-- long hair (front) -->
<path d="M 18,8 C 14,12 13,18 15,26" fill="none" stroke="${hc}" stroke-width="3.5" stroke-linecap="round"/>
<path d="M 46,8 C 50,12 51,18 49,26" fill="none" stroke="${hc}" stroke-width="3.5" stroke-linecap="round"/>
<path d="M 18,10 C 18,4 46,4 46,10 C 40,6 24,6 18,10 Z" fill="url(#${G.hair})"/>
<!-- decorative hair pin (female) -->
<line x1="36" y1="4" x2="42" y2="10" stroke="${lighten(o.accent,10)}" stroke-width="1.5"/>
<circle cx="36" cy="4" r="2" fill="${o.accent}"/>`);
      break;

    case 'bald':
      // Shaved head shine, no hair
      layers.push(`<!-- bald shine -->
<ellipse cx="28" cy="11" rx="6" ry="3.5" fill="${sk.hi}" opacity="0.38"/>
<ellipse cx="36" cy="8" rx="3" ry="2" fill="${sk.hi}" opacity="0.22"/>`);
      break;

    case 'topknot':
      layers.push(`<!-- topknot -->
<path d="M 18,12 C 18,6 46,6 46,12 C 42,8 22,8 18,12 Z" fill="url(#${G.hair})"/>
<!-- topknot pillar -->
<rect x="29" y="-2" width="6" height="14" rx="3" fill="${hc}"/>
<!-- top of topknot -->
<ellipse cx="32" cy="-2" rx="4" ry="3" fill="${hcL}"/>
<!-- gold hairpin -->
<line x1="24" y1="7" x2="40" y2="7" stroke="#d4af37" stroke-width="1.8"/>
<circle cx="40" cy="7" r="1.5" fill="#fbbf24"/>
<!-- side strands -->
<path d="M 18,12 C 15,16 15,22 17,26" fill="none" stroke="${hc}" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 46,12 C 49,16 49,22 47,26" fill="none" stroke="${hc}" stroke-width="2.5" stroke-linecap="round"/>`);
      break;

    case 'headband':
      layers.push(`<!-- hair + headband -->
<path d="M 18,12 C 18,5 46,5 46,12 C 42,8 22,8 18,12 Z" fill="url(#${G.hair})"/>
<path d="M 18,12 C 15,16 15,24 17,28" fill="none" stroke="${hc}" stroke-width="2.8" stroke-linecap="round"/>
<path d="M 46,12 C 49,16 49,24 47,28" fill="none" stroke="${hc}" stroke-width="2.8" stroke-linecap="round"/>
<!-- headband -->
<path d="M 16,17 C 18,15 46,15 48,17 L 48,21 C 46,23 18,23 16,21 Z"
  fill="${o.belt}" stroke="${darken(o.belt,25)}" stroke-width="0.7"/>
<!-- band knot at side -->
<path d="M 14,16 L 17,19 L 14,22 Z" fill="${lighten(o.belt,20)}" stroke="${darken(o.belt,20)}" stroke-width="0.5"/>`);
      break;

    case 'scholar-hat':
      layers.push(`<!-- scholar hat -->
<!-- wide brim -->
<rect x="8" y="13" width="48" height="5" rx="1.5"
  fill="url(#${G.hatG})" stroke="${hcD}" stroke-width="0.8"/>
<!-- tall crown -->
<rect x="20" y="0" width="24" height="16" rx="2"
  fill="${hc}" stroke="${hcD}" stroke-width="0.8"/>
<!-- crown highlight line -->
<line x1="22" y1="7" x2="42" y2="7" stroke="${hcL}" stroke-width="0.8" opacity="0.6"/>
<!-- gold trim on brim -->
<line x1="8" y1="13" x2="56" y2="13" stroke="#c9a86c" stroke-width="1.2"/>
<!-- hair at sides -->
<path d="M 18,18 C 15,22 15,28 17,32" fill="none" stroke="${hc}" stroke-width="2.2" stroke-linecap="round"/>
<path d="M 46,18 C 49,22 49,28 47,32" fill="none" stroke="${hc}" stroke-width="2.2" stroke-linecap="round"/>`);
      break;

    case 'helmet': {
      const hmet = darken(o.accent, 20);
      const hmetL = lighten(o.accent, 30);
      layers.push(`<!-- helmet -->
<!-- dome -->
<path d="M 16,22 C 16,4 48,4 48,22" fill="${hmet}" stroke="${darken(hmet,30)}" stroke-width="0.8"/>
<!-- dome highlight -->
<path d="M 20,16 C 20,9 26,6 32,6" fill="none" stroke="${hmetL}" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/>
<!-- crest -->
<path d="M 29,4 L 32,-2 L 35,4" fill="${lighten(o.accent,10)}" stroke="${darken(o.accent,35)}" stroke-width="0.6"/>
<!-- left cheek guard -->
<path d="M 14,21 L 14,34 C 16,37 20,37 21,34 L 21,21 Z"
  fill="${hmet}" stroke="${darken(hmet,30)}" stroke-width="0.7"/>
<!-- right cheek guard -->
<path d="M 50,21 L 50,34 C 48,37 44,37 43,34 L 43,21 Z"
  fill="${hmet}" stroke="${darken(hmet,30)}" stroke-width="0.7"/>
<!-- chin strap -->
<path d="M 21,34 C 24,37 40,37 43,34" fill="none" stroke="${hmet}" stroke-width="1.5"/>
<!-- rivets -->
<circle cx="17" cy="26" r="1.2" fill="${hmetL}" opacity="0.8"/>
<circle cx="47" cy="26" r="1.2" fill="${hmetL}" opacity="0.8"/>
<circle cx="17" cy="31" r="1.2" fill="${hmetL}" opacity="0.8"/>
<circle cx="47" cy="31" r="1.2" fill="${hmetL}" opacity="0.8"/>`);
      break;
    }
    case 'white-hair':
      layers.push(`<!-- white/silver hair (front) -->
<path d="M 18,8 C 14,12 13,20 15,27" fill="none" stroke="${hc}" stroke-width="3.5" stroke-linecap="round"/>
<path d="M 46,8 C 50,12 51,20 49,27" fill="none" stroke="${hc}" stroke-width="3.5" stroke-linecap="round"/>
<path d="M 18,10 C 18,4 46,4 46,10 C 40,6 24,6 18,10 Z" fill="${hc}"/>
<!-- highlights -->
<path d="M 22,6 C 28,4 38,4 42,7" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.5"/>
<!-- partial beard/fu manchu for male taoist -->
${gender==='m' ? `<path d="M 27,32 C 28,36 30,40 32,42" fill="none" stroke="${hc}" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
<path d="M 37,32 C 36,36 34,40 32,42" fill="none" stroke="${hc}" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>` : ''}`);
      break;
  }

  // ── EYEBROWS ─────────────────────────────────────────────────────────────────
  const browC = o.headStyle === 'bald' ? darken(sk.base, 30) : darken(hc, 5);
  layers.push(`<!-- eyebrows -->
<path d="M 21,18 C 23,16.5 27,16.5 29,18" fill="none" stroke="${browC}" stroke-width="1.4" stroke-linecap="round"/>
<path d="M 35,18 C 37,16.5 41,16.5 43,18" fill="none" stroke="${browC}" stroke-width="1.4" stroke-linecap="round"/>`);

  // ── EYES ─────────────────────────────────────────────────────────────────────
  layers.push(`<!-- eyes -->
<!-- sclera -->
<ellipse cx="26" cy="24" rx="4.5" ry="3.8" fill="white" stroke="${darken(sk.base,25)}" stroke-width="0.6"/>
<ellipse cx="38" cy="24" rx="4.5" ry="3.8" fill="white" stroke="${darken(sk.base,25)}" stroke-width="0.6"/>
<!-- iris -->
<circle cx="26" cy="24.5" r="3.2" fill="url(#${G.iris})"/>
<circle cx="38" cy="24.5" r="3.2" fill="url(#${G.iris2})"/>
<!-- pupil -->
<circle cx="26" cy="24.5" r="1.6" fill="#070714"/>
<circle cx="38" cy="24.5" r="1.6" fill="#070714"/>
<!-- catch light -->
<circle cx="24.8" cy="23.1" r="0.9" fill="white" opacity="0.95"/>
<circle cx="36.8" cy="23.1" r="0.9" fill="white" opacity="0.95"/>
<!-- upper eyelid crease -->
<path d="M 21.5,21.5 C 24,20 28,20 30.5,21.5" fill="none" stroke="${darken(sk.base,38)}" stroke-width="0.9" stroke-linecap="round"/>
<path d="M 33.5,21.5 C 36,20 40,20 42.5,21.5" fill="none" stroke="${darken(sk.base,38)}" stroke-width="0.9" stroke-linecap="round"/>
${gender==='f' ? `<!-- lashes -->
<path d="M 21.5,21.5 L 20,19 M 23,20.5 L 22.5,18 M 25,20.2 L 25,18 M 27,20.5 L 28,18.5 M 30.5,21.5 L 31.5,19.5" stroke="${browC}" stroke-width="0.85" stroke-linecap="round"/>
<path d="M 33.5,21.5 L 32,19 M 35,20.5 L 34.5,18 M 37,20.2 L 37,18 M 39,20.5 L 40,18.5 M 42.5,21.5 L 43.5,19.5" stroke="${browC}" stroke-width="0.85" stroke-linecap="round"/>` : ''}`);

  // ── NOSE + MOUTH ─────────────────────────────────────────────────────────────
  layers.push(`<!-- nose + mouth -->
<path d="M 30.5,28.5 C 31,30 33,30 33.5,28.5" fill="none" stroke="${darken(sk.base,28)}" stroke-width="0.9" stroke-linecap="round"/>
<path d="M 27,32.5 C 29.5,35 34.5,35 37,32.5" fill="none" stroke="${sk.lip}" stroke-width="1.1" stroke-linecap="round"/>
<!-- nostril hints -->
<circle cx="30" cy="29.5" r="0.7" fill="${darken(sk.base,35)}" opacity="0.5"/>
<circle cx="34" cy="29.5" r="0.7" fill="${darken(sk.base,35)}" opacity="0.5"/>`);

  // ── HANDS ────────────────────────────────────────────────────────────────────
  layers.push(`<!-- hands -->
<ellipse cx="5" cy="94" rx="4.5" ry="3.5" fill="${sk.base}" stroke="${darken(sk.base,22)}" stroke-width="0.6"/>
<ellipse cx="59" cy="94" rx="4.5" ry="3.5" fill="${sk.base}" stroke="${darken(sk.base,22)}" stroke-width="0.6"/>
<!-- finger lines -->
<path d="M 2,93 L 3,96 M 4.5,92 L 5,96 M 7,92 L 7.5,96" stroke="${darken(sk.base,30)}" stroke-width="0.5" opacity="0.5"/>
<path d="M 56,92 L 56.5,96 M 58.5,92 L 59,96 M 61,93 L 61.5,96" stroke="${darken(sk.base,30)}" stroke-width="0.5" opacity="0.5"/>`);

  // ── SHOES ────────────────────────────────────────────────────────────────────
  layers.push(`<!-- shoes -->
<path d="M 14,116 C 12,118 10,122 12,126 L 26,126 C 28,124 28,120 26,116 Z"
  fill="url(#${G.shoe})" stroke="${darken(o.shoe,15)}" stroke-width="0.7"/>
<path d="M 50,116 C 52,118 54,122 52,126 L 38,126 C 36,124 36,120 38,116 Z"
  fill="url(#${G.shoe})" stroke="${darken(o.shoe,15)}" stroke-width="0.7"/>
<!-- shoe sole line -->
<path d="M 12,124 L 26,124" stroke="${lighten(o.shoe,20)}" stroke-width="0.7" opacity="0.5"/>
<path d="M 38,124 L 52,124" stroke="${lighten(o.shoe,20)}" stroke-width="0.7" opacity="0.5"/>`);

  // ── COMPOSE SVG ───────────────────────────────────────────────────────────────
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128" width="64" height="128">
  <defs>
${defs}
  </defs>
${layers.join('\n')}
</svg>`;
}

// ── Generate all 14 sprites ────────────────────────────────────────────────────
let count = 0;
for (const [outfitId] of Object.entries(OUTFITS)) {
  for (const gender of ['m', 'f']) {
    const svg = makeSVG(gender, outfitId);
    const name = outfitId === 'default' ? `player-${gender}.svg` : `player-${gender}-${outfitId}.svg`;
    fs.writeFileSync(path.join(OUT, name), svg, 'utf8');
    console.log(`✓  ${name}`);
    count++;
  }
}
console.log(`\n✅ Generated ${count} sprites → ${OUT}`);
