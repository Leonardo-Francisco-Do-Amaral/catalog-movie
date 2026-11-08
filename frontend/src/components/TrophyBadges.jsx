import React from 'react';
import { CheckCircle2, Lock } from 'lucide-react';

export function getCleanTrophyTitle(title = '') {
  return String(title || '')
    .replace(
      /^(O\s+Ritual\s+do\s+Cin[eé]filo|Ritual\s+do\s+Cin[eé]filo|Sess[aã]o\s+Secreta|Cal[cç]ada\s+da\s+Fama|Tribunal\s+da\s+Cr[ií]tica|A\s+M[aá]fia\s+de\s+Hollywood|Anatomia\s+do\s+Cinema|Data\s+Limite|Universos\s*&\s*Sagas|DNA\s+Cin[eé]filo|Volta\s+ao\s+Mundo):\s*/i,
      ''
    )
    .trim();
}

export const CATEGORY_BADGE_CONFIG = {
  volta_ao_mundo: {
    label: 'VOLTA AO MUNDO',
    icon: '🌍',
    bg: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
  },
  dna_cinefilo: {
    label: 'DNA CINÉFILO',
    icon: '🧬',
    bg: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
  },
  anatomia_cinema: {
    label: 'ANATOMIA DO CINEMA',
    icon: '🎬',
    bg: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
  },
  data_limite: {
    label: 'DATA LIMITE',
    icon: '📅',
    bg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
  },
  universos_sagas: {
    label: 'UNIVERSOS & SAGAS',
    icon: '🌌',
    bg: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
  },
  mafia_hollywood: {
    label: 'A MÁFIA DE HOLLYWOOD',
    icon: '🕴️',
    bg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
  },
  tribunal_critica: {
    label: 'TRIBUNAL DA CRÍTICA',
    icon: '⚖️',
    bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
  },
  ritual_cinefilo: {
    label: 'O RITUAL DO CINÉFILO',
    icon: '🍿',
    bg: 'bg-yellow-950/80 text-yellow-300 border-yellow-500/40',
  },
  sessao_secreta: {
    label: 'SESSÃO SECRETA',
    icon: '🕵️‍♂️',
    bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
  },
  calcada_da_fama: {
    label: 'CALÇADA DA FAMA',
    icon: '⭐',
    bg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
  },
  multi: {
    label: 'MULTICATEGORIA',
    icon: '🔥',
    bg: 'bg-gradient-to-r from-orange-950/80 to-amber-950/80 text-orange-300 border-orange-500/40',
  },
};

export function TrophyCardBadges({ trophy, theme, isUnlocked, unlockedDateStr }) {
  // Resolve array de categorias da trophy
  let cats = trophy?.categories;
  if (!cats || !Array.isArray(cats) || cats.length === 0) {
    if (trophy?.target_metadata?.isHybrid) {
      cats = ['volta_ao_mundo', 'dna_cinefilo'];
    } else if (trophy?.category) {
      cats = [trophy.category];
    } else {
      cats = ['volta_ao_mundo'];
    }
  }

  return (
    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
      {/* 1. Tipo / Tier do Troféu */}
      {theme && (
        <span
          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${theme.badgeBg}`}
        >
          {theme.symbol} {theme.name}
        </span>
      )}

      {/* 2. Categoria(s) (Exibe todas lado a lado se for multicategoria) */}
      {cats.map((catKey) => {
        const conf = CATEGORY_BADGE_CONFIG[catKey] || {
          label: catKey.toUpperCase(),
          icon: '🏷️',
          bg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        };
        return (
          <span
            key={catKey}
            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 shadow-sm ${conf.bg}`}
          >
            <span>{conf.icon}</span>
            <span>{conf.label}</span>
          </span>
        );
      })}

      {/* 3. Status e Dia da Conquista */}
      {isUnlocked ? (
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Conquistado {unlockedDateStr ? `(${unlockedDateStr})` : ''}</span>
        </span>
      ) : trophy?.progress_current > 0 ? (
        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-md">
          Em Progresso
        </span>
      ) : (
        <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-1">
          <Lock className="w-2.5 h-2.5 text-zinc-600" />
          <span>Bloqueado</span>
        </span>
      )}
    </div>
  );
}
