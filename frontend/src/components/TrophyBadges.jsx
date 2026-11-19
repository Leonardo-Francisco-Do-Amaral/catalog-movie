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
  multi: {
    label: 'MULTICATEGORIA',
    icon: '🔥',
    bg: 'bg-gradient-to-r from-orange-950/80 to-amber-950/80 text-orange-300 border-orange-500/40',
  },
};

export const MAX_VISIBLE_STARS = 6;

export const INFINITE_STAR_VISUAL = {
  name: 'Infinito',
  symbol: '🌟',
  color: '#38BDF8',
  border: 'border-cyan-400/80 ring-1 ring-fuchsia-400/35',
  glow: 'shadow-[0_0_28px_rgba(34,211,238,0.28)]',
  badgeBg:
    'bg-gradient-to-r from-cyan-500/25 via-fuchsia-500/25 to-amber-500/25 text-cyan-100 border-cyan-300/75 shadow-[0_0_12px_rgba(34,211,238,0.25)]',
  iconBg: 'from-cyan-500/35 via-fuchsia-600/30 to-amber-500/30',
  accentColor: '#38BDF8',
  rayColor: '#38BDF8',
};

export function InfiniteStarsRow({ count = 0, compact = false, maxVisible = MAX_VISIBLE_STARS }) {
  const total = Math.max(0, Math.floor(Number(count) || 0));
  if (total <= 0) return null;
  const visibleCount = Math.min(total, maxVisible);
  const overflow = Math.max(0, total - visibleCount);

  return (
    <span
      title={`Progressão Infinita: ${total} estrela${total === 1 ? '' : 's'} acumulada${total === 1 ? '' : 's'} (+${total * 55} XP)`}
      className={`inline-flex items-center gap-0.5 rounded-lg border border-cyan-400/45 bg-gradient-to-r from-cyan-950/80 via-fuchsia-950/60 to-amber-950/70 shadow-[0_0_12px_rgba(34,211,238,0.22)] ${
        compact ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-sm'
      }`}
    >
      {Array.from({ length: visibleCount }).map((_, idx) => (
        <span
          key={idx}
          className="leading-none text-amber-300 animate-pulse select-none"
          style={{
            animationDuration: `${1.8 + (idx % 3) * 0.45}s`,
            animationDelay: `${idx * 0.14}s`,
            textShadow: '0 0 8px rgba(34,211,238,0.9), 0 0 14px rgba(251,191,36,0.85)',
          }}
        >
          ★
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={`ml-0.5 font-mono font-black text-cyan-200 ${
            compact ? 'text-[9px]' : 'text-[10px]'
          }`}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}

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

      {/* Badge de Rank quando for troféu evolutivo de 5 patamares */}
      {trophy?.kind === 'rank' && Array.isArray(trophy.ranks) && (
        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-sm">
          🏅 Rank {trophy.unlocked_ranks_count || 0}/{trophy.ranks.length}
        </span>
      )}

      {/* Badge de Troféu Especial Híbrido (Rank + Único) */}
      {trophy?.target_metadata?.isSpecialMemorial && (
        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border bg-fuchsia-950/60 text-fuchsia-200 border-fuchsia-400/50 shadow-sm">
          🕯️ Especial • Rank + Único
        </span>
      )}

      {/* Badge especial Infinito quando já acumulou Estrelas além do Mítico */}
      {trophy?.kind === 'rank' && (trophy?.extra_stars || 0) > 0 && (
        <InfiniteStarsRow count={trophy.extra_stars} compact />
      )}

      {/* 3. Status e Dia da Conquista */}
      {isUnlocked ? (
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Conquistado {unlockedDateStr ? `(${unlockedDateStr})` : ''}</span>
        </span>
      ) : (trophy?.kind === 'rank' && (trophy?.unlocked_ranks_count || 0) > 0) || trophy?.progress_current > 0 ? (
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
