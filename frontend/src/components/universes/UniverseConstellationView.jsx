import React, { useState, useMemo } from 'react';
import {
  Play,
  Sparkles,
  Lock,
  MessageSquare,
  Compass,
  CheckCircle2,
  Film,
  Target,
  Star,
} from 'lucide-react';
import { UNIVERSE_TIER_META } from './universeThemeConfig';
import { UniversePosterTile } from './UniversePosterTile';

const NODE_ANGLES_BY_COUNT = {
  3: [-90, 30, 150],
  4: [-135, -45, 45, 135],
  5: [-90, -18, 54, 126, 198],
  6: [-90, -30, 30, 90, 150, -150],
  7: [-90, -38, 13, 64, 116, 167, 218],
  8: [-90, -45, 0, 45, 90, 135, 180, 225],
  9: [-90, -50, -10, 30, 70, 110, 150, 190, 230],
};

// Rótulos curtos sem reticências ("...") para os nós do mapa estelar
const SHORT_NODE_LABELS = {
  saga_01_mcu_f1: 'Fase 1',
  saga_02_mcu_f2: 'Fase 2',
  saga_03_mcu_f3: 'Fase 3',
  saga_04_mcu_f4: 'Fase 4',
  saga_05_mcu_f5: 'Fase 5',
  saga_06_mcu_f6: 'Fase 6',
  saga_07_batman_classic: 'Batman Clássico',
  saga_08_batman_modern: 'Batman Moderno',
  saga_09_dceu_snyderverse: 'DCEU Snyder',
  saga_10_dcu_reboot: 'DCU Novo',
  saga_11_dc_showcase: 'DC Showcase',
  saga_12_dcamu: 'DCAMU (Novos 52)',
  saga_13_tomorrowverse: 'Tomorrowverse',
  saga_14_dc_elseworlds: 'Elseworlds',
  saga_15_xmen_main: 'X-Men Saga',
  saga_16_wolverine: 'Wolverine',
  saga_17_deadpool: 'Deadpool',
  saga_18_spider_tobey: 'Tobey Maguire',
  saga_19_spider_garfield: 'Andrew Garfield',
  saga_20_spider_holland: 'Tom Holland',
  saga_21_venom: 'Venom',
  saga_89_sony_villains: 'Vilões Sony',
  saga_90_spider_verse: 'Aranhaverso',
  saga_22_sw_classic: 'Trilogia Clássica',
  saga_23_sw_prequel: 'Trilogia Prequel',
  saga_24_sw_sequel: 'Trilogia Sequel',
  saga_25_sw_stories: 'Histórias Paralelas',
  // Mega-Saga 7: Games
  saga_27_resident_evil: 'Resident Evil',
  saga_33_sonic: 'Sonic',
  saga_37_doom: 'DOOM',
  saga_38_mortal_kombat: 'Mortal Kombat',
  saga_67_super_mario: 'Super Mario',
  saga_68_street_fighter: 'Street Fighter',
  saga_39_console_fever: 'Consoles Live',
  // Mega-Saga 8: Serial Killers
  saga_26_saw: 'Jogos Mortais',
  saga_40_the_purge: 'Uma Noite de Crime',
  saga_41_scream: 'Pânico',
  saga_42_friday_13th: 'Sexta-Feira 13',
  saga_43_halloween: 'Halloween',
  // Mega-Saga 9: Stephen King
  saga_44_shining: 'Overlook & Sono',
  saga_45_children_of_the_corn: 'Colheita & Campo',
  saga_46_it_pennywise: 'It: A Coisa',
  saga_47_king_paranormal: 'Carrie & Chamas',
  saga_69_pet_sematary: 'Cemitério Maldito',
  saga_48_king_mist_relics: 'Neblina & Relíquias',
  // Mega-Saga 10: Warren & James Wan
  saga_49_conjuring: 'Invocação do Mal',
  saga_50_annabelle: 'Annabelle',
  saga_51_nun_llorona: 'Freira & Chorona',
  saga_52_insidious: 'Sobrenatural',
  // Mega-Saga 11: Animações DreamWorks & Pixar
  saga_31_toy_story: 'Toy Story',
  saga_32_kung_fu_panda: 'Kung Fu Panda',
  saga_53_shrek_puss: 'Shrek & Gato',
  saga_54_httyd: 'Seu Dragão',
  saga_55_pixar_incredibles_monsters: 'Incríveis & Monstros',
  // Mega-Saga 12: Pátria Amada, Brasil!
  saga_70_br_oscar: 'Esquadrão Oscar',
  saga_71_br_trash: 'Trash Nacional',
  saga_72_br_tropa: 'Tropa de Elite',
  saga_73_br_laranja_lima: 'Laranja Lima',
  saga_74_br_compadecida: 'Compadecida',
  saga_75_br_minha_mae: 'Minha Mãe',
  saga_76_br_terror: 'Terror Nacional',
  saga_77_br_anos_de_chumbo: 'Anos de Chumbo',
  saga_78_br_perolas: 'Pérolas BR',

  // Mega-Saga 13: This is Japan! (Ou Quase...)
  saga_79_jp_fullmetal: 'Fullmetal',
  saga_80_jp_given: 'Given',
  saga_81_jp_digimon: 'Digimon',
  saga_82_jp_ghibli: 'Studio Ghibli',
  saga_83_jp_koreeda: 'Kore-eda',
  saga_84_jp_death_note: 'Death Note',
  saga_85_jp_samurai_x: 'Samurai X',

  // Mega-Saga 14: Clube da Insônia
  saga_29_black_phone: 'Telefone Preto',
  saga_30_speak_no_evil: 'Não Fale o Mal',
  saga_58_sinister: 'A Entidade',
  saga_59_let_the_right_one_in: 'Deixe Ela Entrar',
  saga_57_the_omen: 'A Profecia',
  saga_86_m3gan: 'M3GAN',
  saga_87_evil_dead: 'Evil Dead',
  saga_88_quiet_place: 'Lugar Silencioso',
};

const MEGA_CONSTELLATION_THEME = {
  mega_mcu: {
    ring: '#F43F5E',
    ringGlow: 'rgba(244, 63, 94, 0.5)',
    cardGrad: 'from-slate-950 via-rose-950/30 to-zinc-950',
    badgeText: 'text-rose-300',
    border: 'border-rose-500/35 hover:border-rose-400/65',
  },
  mega_dc_live: {
    ring: '#38BDF8',
    ringGlow: 'rgba(56, 189, 248, 0.45)',
    cardGrad: 'from-slate-950 via-sky-950/35 to-zinc-950',
    badgeText: 'text-sky-300',
    border: 'border-sky-500/35 hover:border-sky-400/65',
  },
  mega_dc_anim: {
    ring: '#22D3EE',
    ringGlow: 'rgba(34, 211, 238, 0.45)',
    cardGrad: 'from-slate-950 via-cyan-950/30 to-zinc-950',
    badgeText: 'text-cyan-300',
    border: 'border-cyan-500/35 hover:border-cyan-400/65',
  },
  mega_xmen: {
    ring: '#FBBF24',
    ringGlow: 'rgba(251, 191, 36, 0.48)',
    cardGrad: 'from-slate-950 via-amber-950/25 to-zinc-950',
    badgeText: 'text-amber-300',
    border: 'border-amber-500/35 hover:border-amber-400/65',
  },
  mega_spider: {
    ring: '#60A5FA',
    ringGlow: 'rgba(96, 165, 250, 0.48)',
    cardGrad: 'from-slate-950 via-blue-950/35 to-zinc-950',
    badgeText: 'text-blue-300',
    border: 'border-blue-500/35 hover:border-blue-400/65',
  },
  mega_star_wars: {
    ring: '#A855F7',
    ringGlow: 'rgba(168, 85, 247, 0.5)',
    cardGrad: 'from-slate-950 via-indigo-950/40 to-zinc-950',
    badgeText: 'text-fuchsia-300',
    border: 'border-indigo-500/35 hover:border-fuchsia-400/65',
  },
  mega_games: {
    ring: '#10B981',
    ringGlow: 'rgba(16, 185, 129, 0.48)',
    cardGrad: 'from-slate-950 via-emerald-950/35 to-zinc-950',
    badgeText: 'text-emerald-300',
    border: 'border-emerald-500/35 hover:border-emerald-400/65',
  },
  mega_serial_killers: {
    ring: '#EF4444',
    ringGlow: 'rgba(239, 68, 68, 0.5)',
    cardGrad: 'from-slate-950 via-red-950/40 to-zinc-950',
    badgeText: 'text-red-300',
    border: 'border-red-500/35 hover:border-red-400/65',
  },
  mega_stephen_king: {
    ring: '#F97316',
    ringGlow: 'rgba(249, 115, 22, 0.48)',
    cardGrad: 'from-slate-950 via-orange-950/30 to-zinc-950',
    badgeText: 'text-orange-300',
    border: 'border-orange-500/35 hover:border-orange-400/65',
  },
  mega_warren_wan: {
    ring: '#8B5CF6',
    ringGlow: 'rgba(139, 92, 246, 0.48)',
    cardGrad: 'from-slate-950 via-violet-950/35 to-zinc-950',
    badgeText: 'text-violet-300',
    border: 'border-violet-500/35 hover:border-violet-400/65',
  },
  mega_animation: {
    ring: '#FACC15',
    ringGlow: 'rgba(250, 204, 21, 0.48)',
    cardGrad: 'from-slate-950 via-teal-950/35 to-zinc-950',
    badgeText: 'text-yellow-300',
    border: 'border-teal-500/35 hover:border-yellow-400/65',
  },
  mega_brasil: {
    ring: '#22C55E',
    ringGlow: 'rgba(250, 204, 21, 0.48)',
    cardGrad: 'from-slate-950 via-emerald-950/35 to-amber-950/20',
    badgeText: 'text-emerald-300',
    border: 'border-emerald-500/40 hover:border-yellow-400/70',
  },
  mega_japan: {
    ring: '#F43F5E',
    ringGlow: 'rgba(244, 63, 94, 0.48)',
    cardGrad: 'from-slate-950 via-rose-950/35 to-amber-950/20',
    badgeText: 'text-rose-300',
    border: 'border-rose-500/40 hover:border-amber-400/70',
  },
  mega_insomnia: {
    ring: '#E11D48',
    ringGlow: 'rgba(225, 29, 72, 0.5)',
    cardGrad: 'from-slate-950 via-purple-950/35 to-rose-950/30',
    badgeText: 'text-rose-300',
    border: 'border-rose-500/40 hover:border-purple-400/70',
  },
};

function getNodeLabel(saga) {
  return SHORT_NODE_LABELS[saga.id] || saga.title.replace(/^MCU:\s*|^Star Wars:\s*/i, '');
}

function computeSagaUserAvg(saga) {
  const vals = (saga?.movies || [])
    .map((m) => Number(m?.userRating))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (vals.length === 0) return null;
  return {
    avg: vals.reduce((acc, cur) => acc + cur, 0) / vals.length,
    count: vals.length,
  };
}

function getMovieUniqueKey(m) {
  if (m?.movieId) return `id_${m.movieId}`;
  return `${String(m?.matchedTitle || m?.title || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()}_${m?.year || ''}`;
}

function buildFourPointStarPath(x, y, size) {
  const outer = size;
  const inner = size * 0.24;
  return [
    `M ${x.toFixed(1)} ${(y - outer).toFixed(1)}`,
    `L ${(x + inner).toFixed(1)} ${(y - inner).toFixed(1)}`,
    `L ${(x + outer).toFixed(1)} ${y.toFixed(1)}`,
    `L ${(x + inner).toFixed(1)} ${(y + inner).toFixed(1)}`,
    `L ${x.toFixed(1)} ${(y + outer).toFixed(1)}`,
    `L ${(x - inner).toFixed(1)} ${(y + inner).toFixed(1)}`,
    `L ${(x - outer).toFixed(1)} ${y.toFixed(1)}`,
    `L ${(x - inner).toFixed(1)} ${(y - inner).toFixed(1)} Z`,
  ].join(' ');
}

function sortSagasByMode(list, sortMode) {
  if (sortMode === 'almost') {
    return [...list].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      const remA = Math.max((a.totalCount || 0) - (a.watchedCount || 0), 0);
      const remB = Math.max((b.totalCount || 0) - (b.watchedCount || 0), 0);
      if (remA !== remB) return remA - remB;
      return Number(b.progressPct || 0) - Number(a.progressPct || 0);
    });
  }
  if (sortMode === 'progress') {
    return [...list].sort(
      (a, b) => Number(b.progressPct || 0) - Number(a.progressPct || 0) || Number(b.watchedCount || 0) - Number(a.watchedCount || 0)
    );
  }
  if (sortMode === 'rating') {
    return [...list].sort((a, b) => {
      const avgA = computeSagaUserAvg(a)?.avg ?? -1;
      const avgB = computeSagaUserAvg(b)?.avg ?? -1;
      if (avgB !== avgA) return avgB - avgA;
      return Number(b.watchedCount || 0) - Number(a.watchedCount || 0);
    });
  }
  if (sortMode === 'xp') {
    return [...list].sort(
      (a, b) => Number(b.completionXp || 0) - Number(a.completionXp || 0) || Number(b.totalCount || 0) - Number(a.totalCount || 0)
    );
  }
  return list;
}

function ConstellationCard({
  megaSaga,
  childSagas,
  selectedSagaId,
  matchingSagaIds,
  onSelectSaga,
  onReplayMegaVictory,
}) {
  const [clickBursts, setClickBursts] = useState([]);

  const count = childSagas.length;
  const angles =
    NODE_ANGLES_BY_COUNT[count] ||
    childSagas.map((_, i) => -90 + (360 / Math.max(count, 1)) * i);

  const theme = MEGA_CONSTELLATION_THEME[megaSaga.id] || {
    ring: '#C084FC',
    ringGlow: 'rgba(192, 132, 252, 0.45)',
    cardGrad: 'from-slate-950 via-indigo-950/35 to-zinc-950',
    badgeText: 'text-fuchsia-300',
    border: 'border-indigo-500/35 hover:border-indigo-400/65',
  };

  const handleEmptySkyClick = (e) => {
    // Ignora cliques em botões (nós da constelação ou botão Letreiro)
    if (e.target.closest('button')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    // Direção do meteoro apontando para o centro ou diagonal aleatória sutil
    const angleDeg = (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 26);
    const rad = (angleDeg * Math.PI) / 180;
    const dist = 155;
    const dx = Math.cos(rad) * dist * (x > rect.width / 2 ? -1 : 1);
    const dy = Math.sin(Math.abs(rad)) * dist;
    const finalAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

    setClickBursts((prev) => [
      ...prev.slice(-8),
      { id, x, y, dx, dy, angle: finalAngle },
    ]);
    setTimeout(() => {
      setClickBursts((prev) => prev.filter((b) => b.id !== id));
    }, 900);
  };

  const cx = 160;
  const cy = 128;
  const rx = count >= 8 ? 115 : 110;
  const ry = count >= 8 ? 92 : 84;

  // Anel de progresso SVG no Núcleo Central baseado em filmes assistidos da Mega-Saga
  const coreRadius = 29;
  const coreCircumference = 2 * Math.PI * coreRadius;
  const blockPct = Number(megaSaga.progressPct || 0);
  const rawMoviePct =
    megaSaga.totalMoviesCount > 0
      ? Math.round((megaSaga.watchedMoviesCount / megaSaga.totalMoviesCount) * 100)
      : 0;
  const displayPct = megaSaga.isCompleted
    ? 100
    : megaSaga.watchedMoviesCount > 0
    ? Math.min(Math.max(rawMoviePct, 1), 99)
    : 0;
  const coreDashOffset = coreCircumference * (1 - Math.min(displayPct, 100) / 100);

  const nodes = childSagas.map((saga, i) => {
    const rad = (angles[i] * Math.PI) / 180;
    return {
      saga,
      rad,
      x: cx + Math.cos(rad) * rx,
      y: cy + Math.sin(rad) * ry,
    };
  });

  // 1 estrela no céu da constelação por cada filme do Universo Mítico (piscando e mudando de lugar)
  const movieStars = useMemo(() => {
    const clampStarPos = (rawX, rawY) => {
      let x = Math.max(12, Math.min(308, rawX));
      let y = Math.max(12, Math.min(244, rawY));
      const distFromCore = Math.hypot(x - cx, y - cy);
      if (distFromCore < 41) {
        const push = 43 / Math.max(distFromCore, 1);
        x = Math.max(12, Math.min(308, cx + (x - cx) * push));
        y = Math.max(12, Math.min(244, cy + (y - cy) * push));
      }
      return { x, y };
    };

    const stars = [];
    const totalNodes = Math.max(childSagas.length, 1);
    const sectorSpan = (Math.PI * 1.45) / totalNodes;

    childSagas.forEach((saga, sIdx) => {
      const baseAngle = ((angles[sIdx] ?? -90) * Math.PI) / 180;
      const list = saga.movies || [];
      const mTotal = Math.max(list.length, 1);

      list.forEach((movie, mIdx) => {
        const hash = ((sIdx * 31 + mIdx * 17 + 7) % 13) / 13;
        const frac = mTotal === 1 ? 0 : mIdx / (mTotal - 1) - 0.5;
        const starAngle = baseAngle + frac * sectorSpan + (hash - 0.5) * 0.14;
        const ringBand = mIdx % 3;
        const rMult = ringBand === 0 ? 0.58 + hash * 0.14 : ringBand === 1 ? 1.18 + hash * 0.16 : 0.76 + hash * 0.12;
        const basePos = clampStarPos(
          cx + Math.cos(starAngle) * rx * rMult,
          cy + Math.sin(starAngle) * ry * rMult
        );

        const waypoint = (step) => {
          const seed = sIdx * 53 + mIdx * 29 + step * 41;
          const altAngle = starAngle + Math.sin(seed) * 0.95;
          const altR = 0.55 + ((seed % 11) / 11) * 0.72;
          return clampStarPos(
            cx + Math.cos(altAngle) * rx * altR,
            cy + Math.sin(altAngle) * ry * altR
          );
        };

        const wp1 = waypoint(1);
        const wp2 = waypoint(2);
        const wp3 = waypoint(3);

        stars.push({
          key: `star_${saga.id}_${movie.order}_${mIdx}`,
          x: basePos.x,
          y: basePos.y,
          dx1: wp1.x - basePos.x,
          dy1: wp1.y - basePos.y,
          dx2: wp2.x - basePos.x,
          dy2: wp2.y - basePos.y,
          dx3: wp3.x - basePos.x,
          dy3: wp3.y - basePos.y,
          twinkleDuration: (2.3 + ((sIdx * 7 + mIdx * 13) % 17) * 0.16).toFixed(2),
          twinkleDelay: (-(((sIdx * 11 + mIdx * 5) % 19) * 0.27)).toFixed(2),
          driftDuration: (13 + ((sIdx * 5 + mIdx * 19) % 11) * 1.1).toFixed(2),
          driftDelay: (-(((sIdx * 3 + mIdx * 7) % 13) * 0.9)).toFixed(2),
          size: movie.watched ? 3.2 + (mIdx % 3) * 0.7 : 1.1,
          watched: Boolean(movie.watched),
          label: `${movie.matchedTitle || movie.title}${movie.year ? ` (${movie.year})` : ''}`,
          sagaTitle: getNodeLabel(saga),
        });
      });
    });

    return stars;
  }, [childSagas, angles, rx, ry]);

  const hasSearchMatch = childSagas.some((s) => matchingSagaIds.has(s.id));

  return (
    <div
      onClick={handleEmptySkyClick}
      className={`relative overflow-hidden rounded-3xl border p-4 bg-gradient-to-br ${theme.cardGrad} flex flex-col gap-3 transition-all cursor-crosshair select-none ${
        megaSaga.isCompleted
          ? 'border-fuchsia-400/85 shadow-[0_0_48px_rgba(217,70,239,0.28)]'
          : hasSearchMatch
          ? 'border-amber-400/75 shadow-[0_0_30px_rgba(251,191,36,0.18)]'
          : theme.border
      }`}
    >
      {/* Fundo Cósmico Temático Animado */}
      {megaSaga.isCompleted ? (
        <div
          className="pointer-events-none absolute -inset-10 opacity-45 blur-2xl mythic-aurora-spin"
          style={{
            background:
              'conic-gradient(from 0deg at 50% 50%, rgba(217,70,239,0.45), rgba(251,191,36,0.35), rgba(56,189,248,0.4), rgba(168,85,247,0.45), rgba(217,70,239,0.45))',
          }}
        />
      ) : (
        <div
          className="pointer-events-none absolute -inset-6 opacity-50 blur-2xl mythic-nebula-breathe"
          style={{
            background: `radial-gradient(circle at 75% 25%, ${theme.ringGlow}, transparent 58%), radial-gradient(circle at 20% 80%, rgba(99,102,241,0.22), transparent 55%)`,
          }}
        />
      )}

      {/* Fundo estrelado sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 16% 22%, #fff 100%, transparent), radial-gradient(1.5px 1.5px at 78% 18%, #c084fc 100%, transparent), radial-gradient(1px 1px at 42% 84%, #38bdf8 100%, transparent), radial-gradient(1.5px 1.5px at 88% 72%, #fbbf24 100%, transparent), radial-gradient(1px 1px at 62% 40%, #f472b6 100%, transparent)',
        }}
      />

      {/* Chuva sutil de estrelas cadentes dentro do card */}
      <div
        className="pointer-events-none absolute top-6 left-4 w-20 h-[1.5px] rounded-full mythic-meteor"
        style={{
          animationDelay: '1.1s',
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.85), ${theme.ring})`,
        }}
      />
      {megaSaga.isCompleted && (
        <div
          className="pointer-events-none absolute top-16 right-6 w-24 h-[2px] rounded-full mythic-meteor-reverse"
          style={{
            animationDelay: '3.4s',
            background: 'linear-gradient(90deg, transparent, #fde047, #e879f9)',
          }}
        />
      )}

      {/* Efeitos interativos disparados ao clicar no céu vazio */}
      {clickBursts.map((burst) => (
        <React.Fragment key={burst.id}>
          <span
            className="pointer-events-none absolute w-16 h-16 rounded-full border-2 mythic-click-ripple z-30"
            style={{
              left: burst.x,
              top: burst.y,
              borderColor: theme.ring,
              boxShadow: `0 0 18px ${theme.ringGlow}`,
            }}
          />
          <span
            className="pointer-events-none absolute text-base leading-none mythic-click-spark z-30"
            style={{
              left: burst.x,
              top: burst.y,
              color: '#fff',
              textShadow: `0 0 10px ${theme.ring}`,
            }}
          >
            ✦
          </span>
          <span
            className="pointer-events-none absolute w-14 h-[2px] rounded-full mythic-click-shoot z-30 origin-left"
            style={{
              left: burst.x,
              top: burst.y,
              '--shoot-dx': `${burst.dx}px`,
              '--shoot-dy': `${burst.dy}px`,
              '--shoot-angle': `${burst.angle}deg`,
              background: `linear-gradient(90deg, ${theme.ring}, #ffffff)`,
              boxShadow: `0 0 10px ${theme.ring}`,
            }}
          />
        </React.Fragment>
      ))}

      {/* Cabeçalho da Constelação (sem truncar com "...") */}
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${theme.badgeText}`}
            >
              <Sparkles className="w-3 h-3" /> Constelação Mítica • {megaSaga.completedBlocks}/
              {megaSaga.totalBlocks} Nós
            </span>
            <span className="text-[9px] font-mono text-zinc-400">
              ({megaSaga.watchedMoviesCount}/{megaSaga.totalMoviesCount} filmes)
            </span>
            <span
              title={`${megaSaga.watchedMoviesCount} estrela(s) acesa(s) — 1 estrela por cada filme conquistado neste Universo Mítico`}
              className={`inline-flex items-center gap-0.5 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full border ${
                megaSaga.watchedMoviesCount > 0
                  ? 'bg-amber-400/15 border-amber-300/45 text-amber-200'
                  : 'bg-zinc-900/70 border-zinc-800 text-zinc-500'
              }`}
            >
              ✦ {megaSaga.watchedMoviesCount}★
            </span>
          </div>
          <h4 className="text-sm font-black text-white leading-snug mt-0.5">{megaSaga.title}</h4>
        </div>

        {megaSaga.isCompleted ? (
          <button
            type="button"
            onClick={() => onReplayMegaVictory(megaSaga)}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-fuchsia-400 to-amber-300 text-slate-950 text-[9px] font-black uppercase cursor-pointer shrink-0 shadow"
          >
            💎 Letreiro
          </button>
        ) : (
          <span className="px-2 py-0.5 rounded-lg bg-black/50 border border-white/10 text-[9px] font-mono font-bold text-zinc-300 shrink-0">
            +{megaSaga.completionXp} XP
          </span>
        )}
      </div>

      {/* Mapa SVG de Nós Conectados ao Núcleo Central */}
      <div className="relative z-10 w-full aspect-[320/256] max-h-[280px] mx-auto">
        <svg viewBox="0 0 320 256" className="w-full h-full">
          <defs>
            <filter
              id={`glow_${megaSaga.id}`}
              filterUnits="userSpaceOnUse"
              x="-40"
              y="-40"
              width="400"
              height="336"
            >
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Estrelas dos Filmes da Constelação (1 estrela acesa por filme conquistado, piscando e vagando) */}
          <g className="pointer-events-none" aria-label="Estrelas dos filmes conquistados">
            {movieStars.map((st) =>
              st.watched ? (
                <g
                  key={st.key}
                  className="mythic-star-drift"
                  style={{
                    '--sd-dx1': `${st.dx1.toFixed(1)}px`,
                    '--sd-dy1': `${st.dy1.toFixed(1)}px`,
                    '--sd-dx2': `${st.dx2.toFixed(1)}px`,
                    '--sd-dy2': `${st.dy2.toFixed(1)}px`,
                    '--sd-dx3': `${st.dx3.toFixed(1)}px`,
                    '--sd-dy3': `${st.dy3.toFixed(1)}px`,
                    animationDuration: `${st.driftDuration}s`,
                    animationDelay: `${st.driftDelay}s`,
                  }}
                >
                  <g
                    className="mythic-star-twinkle"
                    style={{
                      animationDuration: `${st.twinkleDuration}s`,
                      animationDelay: `${st.twinkleDelay}s`,
                    }}
                  >
                    <circle
                      cx={st.x}
                      cy={st.y}
                      r={st.size * 1.55}
                      fill="rgba(253, 224, 71, 0.22)"
                    />
                    <path
                      d={buildFourPointStarPath(st.x, st.y, st.size)}
                      fill="#FEF08A"
                    >
                      <title>{`${st.label} [${st.sagaTitle}] — ★ Conquistado`}</title>
                    </path>
                    <circle
                      cx={st.x}
                      cy={st.y}
                      r={Math.max(0.75, st.size * 0.3)}
                      fill="#FFFFFF"
                    />
                  </g>
                </g>
              ) : (
                <circle
                  key={st.key}
                  cx={st.x}
                  cy={st.y}
                  r={1.05}
                  fill="rgba(228, 228, 231, 0.16)"
                >
                  <title>{`${st.label} [${st.sagaTitle}] — Pendente`}</title>
                </circle>
              )
            )}
          </g>

          {/* Anel orbital externo giratório */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke={megaSaga.isCompleted ? 'rgba(251, 191, 36, 0.35)' : 'rgba(148, 163, 184, 0.18)'}
            strokeDasharray="4 4"
            strokeWidth="1.2"
            className="mythic-svg-orbit"
          />

          {/* Segundo anel místico contra-rotativo quando a Mega-Saga estiver 100% */}
          {megaSaga.isCompleted && (
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx - 22}
              ry={ry - 18}
              fill="none"
              stroke="rgba(217, 70, 239, 0.35)"
              strokeDasharray="2 6"
              strokeWidth="1.2"
              className="mythic-svg-orbit-reverse"
            />
          )}

          {/* Linhas de energia de cada bloco até o Núcleo */}
          {nodes.map(({ saga, x, y }) => {
            const active = saga.isCompleted;
            const inProg = !active && saga.watchedCount > 0;
            const isMatched = matchingSagaIds.has(saga.id);
            return (
              <line
                key={`line_${saga.id}`}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={
                  active
                    ? '#FBBF24'
                    : isMatched
                    ? '#F59E0B'
                    : inProg
                    ? '#38BDF8'
                    : 'rgba(113, 113, 122, 0.4)'
                }
                strokeWidth={active ? 2.8 : inProg || isMatched ? 2.1 : 1.2}
                strokeDasharray={active ? undefined : '4 3'}
                className={inProg && !active ? 'mythic-beam-flow' : undefined}
                filter={active ? `url(#glow_${megaSaga.id})` : undefined}
              />
            );
          })}
        </svg>

        {/* Núcleo Central da Mega-Saga com Anel SVG preenchido proporcionalmente pelos filmes */}
        <div
          style={{ left: `${(cx / 320) * 100}%`, top: `${(cy / 256) * 100}%` }}
          title={`${megaSaga.watchedMoviesCount}/${megaSaga.totalMoviesCount} filmes (${displayPct}%) • ${megaSaga.completedBlocks}/${megaSaga.totalBlocks} blocos completos (${blockPct}%)`}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-[68px] h-[68px] flex items-center justify-center"
        >
          {/* SVG circular do preenchimento de progresso */}
          <svg viewBox="0 0 68 68" className="absolute inset-0 w-full h-full -rotate-90">
            {/* Fundo do núcleo */}
            <circle
              cx="34"
              cy="34"
              r={coreRadius}
              fill={megaSaga.isCompleted ? 'rgba(217, 70, 239, 0.25)' : 'rgba(9, 9, 11, 0.96)'}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="4.5"
            />
            {/* Arco preenchido proporcional ao % de filmes assistidos */}
            {displayPct > 0 && (
              <circle
                cx="34"
                cy="34"
                r={coreRadius}
                fill="none"
                stroke={megaSaga.isCompleted ? '#FBBF24' : theme.ring}
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={coreCircumference}
                strokeDashoffset={coreDashOffset}
                style={{
                  filter: `drop-shadow(0 0 6px ${
                    megaSaga.isCompleted ? 'rgba(251,191,36,0.85)' : theme.ringGlow
                  })`,
                  transition: 'stroke-dashoffset 0.6s ease',
                }}
              />
            )}
          </svg>

          {/* Preenchimento interno sutil estilo orbe subindo pelo % */}
          <div className="relative w-[52px] h-[52px] rounded-full overflow-hidden flex flex-col items-center justify-center z-10 pointer-events-none">
            {displayPct > 0 && !megaSaga.isCompleted && (
              <div
                className="absolute inset-x-0 bottom-0 opacity-25 transition-all duration-500"
                style={{
                  height: `${displayPct}%`,
                  background: `linear-gradient(to top, ${theme.ring}, transparent)`,
                }}
              />
            )}
            <span className="relative text-xl leading-none drop-shadow">{megaSaga.icon}</span>
            <span
              className={`relative text-[9px] font-mono font-black mt-0.5 ${
                megaSaga.isCompleted
                  ? 'text-amber-200'
                  : displayPct > 0
                  ? 'text-white'
                  : 'text-zinc-400'
              }`}
            >
              {displayPct}%
            </span>
          </div>
        </div>

        {/* Nós Clicáveis dos Blocos */}
        {nodes.map(({ saga, x, y }) => {
          const isSelected = selectedSagaId === saga.id;
          const isMatched = matchingSagaIds.has(saga.id);
          const pct = saga.progressPct || 0;
          const shortLabel = getNodeLabel(saga);
          const nodeAvg = saga.isCompleted ? computeSagaUserAvg(saga) : null;

          return (
            <button
              key={`node_${saga.id}`}
              type="button"
              onClick={() => onSelectSaga(saga)}
              style={{ left: `${(x / 320) * 100}%`, top: `${(y / 256) * 100}%` }}
              title={`${saga.title} (${saga.watchedCount}/${saga.totalCount})${
                nodeAvg ? ` • ⭐ Média Minha: ${nodeAvg.avg.toFixed(3)}` : ''
              }`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border text-center transition-all cursor-pointer ${
                count >= 8
                  ? 'px-1.5 py-1 min-w-[66px] max-w-[92px]'
                  : 'px-2.5 py-1.5 min-w-[84px] max-w-[118px]'
              } ${
                isSelected
                  ? 'scale-110 z-20 ring-2 ring-white bg-indigo-950 border-white shadow-2xl'
                  : saga.isCompleted
                  ? 'bg-amber-950/90 border-amber-400/80 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.35)] hover:scale-105'
                  : isMatched
                  ? 'bg-amber-950/75 border-amber-300 text-amber-100 ring-2 ring-amber-400/70 shadow-[0_0_16px_rgba(251,191,36,0.35)] hover:scale-105'
                  : saga.watchedCount > 0
                  ? 'bg-sky-950/85 border-cyan-400/65 text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.2)] hover:scale-105'
                  : 'bg-zinc-950/95 border-zinc-700/80 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-[10px] font-black leading-none">
                <span>{saga.isCompleted ? '✅' : isMatched ? '🎯' : saga.icon}</span>
                <span className="font-mono">
                  {saga.watchedCount}/{saga.totalCount}
                </span>
                {nodeAvg && (
                  <span className="text-[9px] font-mono text-amber-300">
                    ★{count >= 8 ? nodeAvg.avg.toFixed(1) : nodeAvg.avg.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="text-[9px] font-bold mt-0.5 leading-tight whitespace-nowrap">
                {shortLabel}
              </div>
              <div className="w-full h-1 bg-black/55 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    saga.isCompleted ? 'bg-amber-300' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function UniverseConstellationView({
  megaSagas = [],
  sagas = [],
  searchQuery = '',
  filterMode = 'all',
  tierFilter = 'all',
  sortMode = 'default',
  onReplaySagaVictory,
  onReplayMegaVictory,
  onAddMovie,
}) {
  const sagaById = useMemo(() => {
    const m = new Map();
    sagas.forEach((s) => m.set(s.id, s));
    return m;
  }, [sagas]);

  const [selectedSaga, setSelectedSaga] = useState(
    () => sagas.find((s) => s.watchedCount > 0) || sagas[0] || null
  );
  const [inspectorTab, setInspectorTab] = useState('all'); // 'all' | 'pending' | 'watched'
  const [movieViewLayout, setMovieViewLayout] = useState('by_saga'); // 'by_saga' | 'flat_unique'

  const q = searchQuery.trim().toLowerCase();

  // Sagas que casam com a busca por título ou por filme dentro da saga
  const matchingSagaIds = useMemo(() => {
    const set = new Set();
    if (!q) return set;
    sagas.forEach((s) => {
      const hitTitle = s.title.toLowerCase().includes(q) || getNodeLabel(s).toLowerCase().includes(q);
      const hitMovie = (s.movies || []).some((m) =>
        `${m.title} ${m.originalTitle || ''} ${m.matchedTitle || ''}`.toLowerCase().includes(q)
      );
      if (hitTitle || hitMovie) set.add(s.id);
    });
    return set;
  }, [sagas, q]);

  const activeSaga = selectedSaga ? sagaById.get(selectedSaga.id) || selectedSaga : null;
  const independentSagas = useMemo(() => sagas.filter((s) => !s.megaSagaId), [sagas]);
  const isMovieGalleryMode = filterMode === 'missing_movies' || filterMode === 'conquered_movies';
  const showConstellations = filterMode === 'all' || filterMode === 'mythic';

  const visibleMegaSagas = useMemo(() => {
    if (!showConstellations) return [];
    const list = megaSagas.filter((ms) => {
      const children = (ms.childSagaIds || []).map((id) => sagaById.get(id)).filter(Boolean);
      if (tierFilter !== 'all' && !children.some((c) => c.tier === tierFilter)) return false;
      if (!q) return true;
      const msHit = ms.title.toLowerCase().includes(q);
      const childHit = children.some((c) => matchingSagaIds.has(c.id));
      return msHit || childHit;
    });

    if (sortMode === 'almost') {
      return [...list].sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return (
          (a.totalMoviesCount - a.watchedMoviesCount) - (b.totalMoviesCount - b.watchedMoviesCount) ||
          b.progressPct - a.progressPct
        );
      });
    }
    if (sortMode === 'progress') {
      return [...list].sort(
        (a, b) => Number(b.progressPct || 0) - Number(a.progressPct || 0) || Number(b.watchedMoviesCount || 0) - Number(a.watchedMoviesCount || 0)
      );
    }
    if (sortMode === 'xp') {
      return [...list].sort((a, b) => Number(b.completionXp || 0) - Number(a.completionXp || 0));
    }
    return list;
  }, [showConstellations, megaSagas, sagaById, tierFilter, q, matchingSagaIds, sortMode]);

  const flatSagasList = useMemo(() => {
    if (filterMode === 'mythic' || isMovieGalleryMode) return [];
    const base =
      filterMode === 'all' || filterMode === 'independent' ? independentSagas : sagas;

    const filtered = base.filter((s) => {
      if (tierFilter !== 'all' && s.tier !== tierFilter) return false;
      if (filterMode === 'completed' && !s.isCompleted) return false;
      if (filterMode === 'almost_done') {
        const rem = Math.max((s.totalCount || 0) - (s.watchedCount || 0), 0);
        if (rem < 1 || rem > 2) return false;
      }
      if (filterMode === 'in_progress' && (s.isCompleted || s.watchedCount === 0)) return false;
      if (filterMode === 'not_started' && s.watchedCount > 0) return false;
      if (!q) return true;
      return matchingSagaIds.has(s.id);
    });

    if (sortMode !== 'default') {
      return sortSagasByMode(filtered, sortMode);
    }

    if (filterMode === 'almost_done') {
      return [...filtered].sort((a, b) => {
        const remA = (a.totalCount || 0) - (a.watchedCount || 0);
        const remB = (b.totalCount || 0) - (b.watchedCount || 0);
        if (remA !== remB) return remA - remB;
        return (b.watchedCount || 0) - (a.watchedCount || 0);
      });
    }

    if (filterMode === 'in_progress' || filterMode === 'completed') {
      return [...filtered].sort((a, b) => {
        if (b.watchedCount !== a.watchedCount) return b.watchedCount - a.watchedCount;
        if (b.progressPct !== a.progressPct) return b.progressPct - a.progressPct;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
    }

    return filtered;
  }, [filterMode, isMovieGalleryMode, independentSagas, sagas, tierFilter, q, matchingSagaIds, sortMode]);

  // Dados para as abas exclusivas de Filmes Faltantes / Filmes Conquistados
  const movieGalleryData = useMemo(() => {
    if (!isMovieGalleryMode) return { groups: [], uniqueMovies: [] };
    const wantWatched = filterMode === 'conquered_movies';

    const sagaGroups = [];
    const uniqueMap = new Map();

    sagas.forEach((s) => {
      if (tierFilter !== 'all' && s.tier !== tierFilter) return;
      const hitSagaTitle = !q || s.title.toLowerCase().includes(q) || getNodeLabel(s).toLowerCase().includes(q);
      const matchingMovies = (s.movies || []).filter((m) => {
        if (Boolean(m.watched) !== wantWatched) return false;
        if (!q || hitSagaTitle) return true;
        return `${m.title} ${m.originalTitle || ''} ${m.matchedTitle || ''}`.toLowerCase().includes(q);
      });

      if (matchingMovies.length === 0) return;

      sagaGroups.push({
        saga: s,
        movies: matchingMovies,
        remainingCount: Math.max((s.totalCount || 0) - (s.watchedCount || 0), 0),
        userAvg: s.isCompleted ? computeSagaUserAvg(s) : null,
      });

      matchingMovies.forEach((m) => {
        const uKey = getMovieUniqueKey(m);
        if (!uniqueMap.has(uKey)) {
          uniqueMap.set(uKey, {
            movie: m,
            sagas: [s],
            minRemaining: Math.max((s.totalCount || 0) - (s.watchedCount || 0), 0),
          });
        } else {
          const entry = uniqueMap.get(uKey);
          if (!entry.sagas.some((x) => x.id === s.id)) {
            entry.sagas.push(s);
            entry.minRemaining = Math.min(entry.minRemaining, Math.max((s.totalCount || 0) - (s.watchedCount || 0), 0));
          }
        }
      });
    });

    const sortedGroups = [...sagaGroups].sort((a, b) => {
      if (sortMode === 'rating') {
        const ra = computeSagaUserAvg(a.saga)?.avg ?? -1;
        const rb = computeSagaUserAvg(b.saga)?.avg ?? -1;
        if (rb !== ra) return rb - ra;
      } else if (sortMode === 'xp') {
        if ((b.saga.completionXp || 0) !== (a.saga.completionXp || 0)) {
          return (b.saga.completionXp || 0) - (a.saga.completionXp || 0);
        }
      } else if (sortMode === 'progress') {
        if ((b.saga.progressPct || 0) !== (a.saga.progressPct || 0)) {
          return (b.saga.progressPct || 0) - (a.saga.progressPct || 0);
        }
      } else if (wantWatched) {
        if ((b.saga.isCompleted ? 1 : 0) !== (a.saga.isCompleted ? 1 : 0)) {
          return b.saga.isCompleted ? 1 : -1;
        }
        if ((b.saga.watchedCount || 0) !== (a.saga.watchedCount || 0)) {
          return (b.saga.watchedCount || 0) - (a.saga.watchedCount || 0);
        }
      } else {
        // Filmes Faltantes: prioriza sagas iniciadas e com menos filmes faltando para fechar 100%
        const startedA = (a.saga.watchedCount || 0) > 0 ? 1 : 0;
        const startedB = (b.saga.watchedCount || 0) > 0 ? 1 : 0;
        if (startedB !== startedA) return startedB - startedA;
        if (a.remainingCount !== b.remainingCount) return a.remainingCount - b.remainingCount;
      }
      return (a.saga.sortOrder || 0) - (b.saga.sortOrder || 0);
    });

    const uniqueMovies = Array.from(uniqueMap.values()).sort((a, b) => {
      if (wantWatched) {
        if (sortMode === 'rating') {
          return Number(b.movie.userRating || 0) - Number(a.movie.userRating || 0);
        }
        return Number(b.movie.userRating || 0) - Number(a.movie.userRating || 0) || (b.movie.year || 0) - (a.movie.year || 0);
      }
      if (a.minRemaining !== b.minRemaining) return a.minRemaining - b.minRemaining;
      return (b.sagas.length || 0) - (a.sagas.length || 0);
    });

    return { groups: sortedGroups, uniqueMovies };
  }, [isMovieGalleryMode, filterMode, sagas, tierFilter, q, sortMode]);

  const flatListHeader = useMemo(() => {
    if (filterMode === 'almost_done') return `🎯 Quase Lá — Faltam 1 ou 2 Filmes (${flatSagasList.length})`;
    if (filterMode === 'completed') return `🏆 Sagas Dominadas 100% (${flatSagasList.length})`;
    if (filterMode === 'in_progress') return `🔥 Sagas em Progresso (${flatSagasList.length})`;
    if (filterMode === 'not_started') return `🔒 Sagas Não Iniciadas (${flatSagasList.length})`;
    if (filterMode === 'independent') return `🧭 Sagas Independentes (${flatSagasList.length})`;
    return `Cinturão Independente (${flatSagasList.length} Sagas)`;
  }, [filterMode, flatSagasList.length]);

  const activeTier = activeSaga
    ? UNIVERSE_TIER_META[activeSaga.tier] || UNIVERSE_TIER_META.silver
    : null;
  const activeSagaUserAvg = useMemo(() => computeSagaUserAvg(activeSaga), [activeSaga]);

  const inspectorMovies = useMemo(() => {
    if (!activeSaga) return [];
    const list = activeSaga.movies || [];
    if (inspectorTab === 'pending') return list.filter((m) => !m.watched);
    if (inspectorTab === 'watched') return list.filter((m) => m.watched);
    return list;
  }, [activeSaga, inspectorTab]);

  // Próximo marco ou conclusão faltante
  const nextCheckpoint = useMemo(() => {
    if (!activeSaga) return null;
    return (activeSaga.checkpoints || []).find((cp) => !cp.unlocked) || null;
  }, [activeSaga]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.95fr] gap-6 items-start">
      {/* Esquerda: Mapa de Constelações + Cinturão Independente */}
      <div
        className={`flex flex-col gap-5 ${
          filterMode === 'mythic'
            ? 'relative overflow-hidden rounded-3xl border border-fuchsia-500/35 bg-slate-950/95 p-4 sm:p-5 shadow-[0_0_60px_rgba(168,85,247,0.18)]'
            : ''
        }`}
      >
        {/* Fundo Cósmico Animado exclusivo da aba 💎 Mega-Sagas Míticas */}
        {filterMode === 'mythic' && (
          <>
            <div
              className="pointer-events-none absolute -inset-24 opacity-30 blur-3xl mythic-aurora-spin"
              style={{
                background:
                  'conic-gradient(from 45deg at 50% 50%, rgba(168,85,247,0.45), rgba(56,189,248,0.3), rgba(217,70,239,0.45), rgba(251,191,36,0.28), rgba(168,85,247,0.45))',
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-45"
              style={{
                backgroundImage:
                  'radial-gradient(1.5px 1.5px at 10% 15%, #fff 100%, transparent), radial-gradient(1px 1px at 32% 48%, #e879f9 100%, transparent), radial-gradient(1.5px 1.5px at 64% 22%, #38bdf8 100%, transparent), radial-gradient(1.5px 1.5px at 85% 60%, #fde047 100%, transparent), radial-gradient(1px 1px at 22% 82%, #c084fc 100%, transparent), radial-gradient(1.5px 1.5px at 74% 88%, #fff 100%, transparent)',
              }}
            />
            {/* Chuva de estrelas cadentes no Santuário Mítico */}
            <div
              className="pointer-events-none absolute top-10 left-8 w-28 h-[2px] rounded-full mythic-meteor"
              style={{
                animationDelay: '0s',
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.92), rgba(232,121,249,0.85))',
              }}
            />
            <div
              className="pointer-events-none absolute top-28 left-1/3 w-36 h-[2px] rounded-full mythic-meteor"
              style={{
                animationDelay: '2.4s',
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), rgba(56,189,248,0.85))',
              }}
            />
            <div
              className="pointer-events-none absolute top-16 right-12 w-32 h-[2px] rounded-full mythic-meteor-reverse"
              style={{
                animationDelay: '1.3s',
                background:
                  'linear-gradient(90deg, transparent, rgba(254,240,138,0.9), rgba(217,70,239,0.85))',
              }}
            />
            <div
              className="pointer-events-none absolute top-1/2 right-16 w-28 h-[2px] rounded-full mythic-meteor-reverse"
              style={{
                animationDelay: '4.8s',
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.88), rgba(168,85,247,0.85))',
              }}
            />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-fuchsia-500/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">💎</span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-fuchsia-200">
                    Santuário das Mega-Sagas Míticas
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Feche todos os nós de uma constelação para despertar a Ascensão Supernova (+105 XP).
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-400/40 text-[10px] font-mono font-bold text-fuchsia-200">
                {megaSagas.filter((m) => m.isCompleted).length}/{megaSagas.length} Míticas Conquistadas
              </span>
            </div>
          </>
        )}

        {visibleMegaSagas.length > 0 && (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleMegaSagas.map((ms) => {
              const children = (ms.childSagaIds || [])
                .map((id) => sagaById.get(id))
                .filter(Boolean);
              return (
                <ConstellationCard
                  key={ms.id}
                  megaSaga={ms}
                  childSagas={children}
                  selectedSagaId={activeSaga?.id}
                  matchingSagaIds={matchingSagaIds}
                  onSelectSaga={(saga) => {
                    setSelectedSaga(saga);
                    setInspectorTab('all');
                  }}
                  onReplayMegaVictory={onReplayMegaVictory}
                />
              );
            })}
          </div>
        )}

        {/* Lista em formato Cinturão (Independentes no modo Todas, ou TODAS as sagas nos filtros) */}
        {flatSagasList.length > 0 && (
          <div className="rounded-3xl border border-indigo-500/30 bg-slate-950/95 p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                <Compass className="w-4 h-4" />
                <span>{flatListHeader}</span>
              </h4>
              <span className="text-[10px] font-mono text-zinc-500">
                {(filterMode === 'in_progress' || filterMode === 'completed') &&
                  'Ordenado por filmes conquistados • '}
                Clique em qualquer saga para inspecionar →
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {flatSagasList.map((s) => {
                const isSelected = activeSaga?.id === s.id;
                const isMatched = matchingSagaIds.has(s.id);
                const sUserAvg = s.isCompleted ? computeSagaUserAvg(s) : null;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedSaga(s);
                      setInspectorTab('all');
                    }}
                    className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-indigo-950 border-white ring-2 ring-indigo-300 text-white scale-[1.03]'
                        : s.isCompleted
                        ? 'bg-amber-950/60 border-amber-400/65 text-amber-100 hover:border-amber-300'
                        : isMatched
                        ? 'bg-amber-950/45 border-amber-300 ring-1 ring-amber-400/70 text-amber-100'
                        : s.watchedCount > 0
                        ? 'bg-cyan-950/45 border-cyan-400/45 text-cyan-100 hover:border-cyan-300'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                    }`}
                  >
                    <span className="text-base">{s.isCompleted ? '✅' : isMatched ? '🎯' : s.icon}</span>
                    <div>
                      <div className="text-[11px] font-black leading-tight">{s.title}</div>
                      <div className="text-[9px] font-mono opacity-80 flex items-center gap-1 flex-wrap">
                        <span>
                          {s.watchedCount}/{s.totalCount} filmes • +{s.completionXp} XP
                        </span>
                        {sUserAvg && (
                          <span className="text-amber-300 font-black">
                            • ★ {sUserAvg.avg.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Galeria Global de Filmes Faltantes ou Conquistados */}
        {isMovieGalleryMode && (
          <div className="rounded-3xl border border-indigo-500/30 bg-slate-950/95 p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
              <div>
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <span>{filterMode === 'missing_movies' ? '⏳' : '✅'}</span>
                  <span>
                    {filterMode === 'missing_movies'
                      ? `Filmes Faltantes no Códice (${movieGalleryData.uniqueMovies.length} únicos)`
                      : `Filmes Conquistados no Códice (${movieGalleryData.uniqueMovies.length} únicos)`}
                  </span>
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {filterMode === 'missing_movies'
                    ? 'Sagas com menos filmes restantes aparecem primeiro. Clique no pôster para cadastrar!'
                    : 'Filmes já catalogados com suas notas e sagas desbloqueadas.'}
                </p>
              </div>

              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setMovieViewLayout('by_saga')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer transition ${
                    movieViewLayout === 'by_saga'
                      ? 'bg-indigo-500/30 text-indigo-100 border border-indigo-400/50'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  🌌 Por Saga ({movieGalleryData.groups.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMovieViewLayout('flat_unique')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer transition ${
                    movieViewLayout === 'flat_unique'
                      ? 'bg-indigo-500/30 text-indigo-100 border border-indigo-400/50'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  🎞️ Todos Únicos ({movieGalleryData.uniqueMovies.length})
                </button>
              </div>
            </div>

            {movieGalleryData.groups.length === 0 ? (
              <div className="py-10 text-center text-sm text-zinc-400">
                Nenhum filme encontrado para esse filtro/busca.
              </div>
            ) : movieViewLayout === 'by_saga' ? (
              <div className="flex flex-col gap-4">
                {movieGalleryData.groups.map(({ saga, movies, remainingCount, userAvg }) => {
                  const tMeta = UNIVERSE_TIER_META[saga.tier] || UNIVERSE_TIER_META.silver;
                  return (
                    <div
                      key={`gal_saga_${saga.id}`}
                      className="rounded-2xl border border-zinc-800/90 bg-zinc-900/55 p-3.5 flex flex-col gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSaga(saga);
                            setInspectorTab(filterMode === 'missing_movies' ? 'pending' : 'watched');
                          }}
                          className="flex items-center gap-2.5 text-left cursor-pointer group"
                        >
                          <span className="text-xl">{saga.icon}</span>
                          <div>
                            <div className="text-xs sm:text-sm font-black text-white group-hover:text-indigo-300 transition-colors">
                              {saga.title}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-zinc-400 mt-0.5">
                              <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${tMeta.badge}`}>
                                {tMeta.icon} {tMeta.label}
                              </span>
                              <span>
                                {saga.watchedCount}/{saga.totalCount} ({saga.progressPct}%)
                              </span>
                              {filterMode === 'missing_movies' && (
                                <span className="text-amber-300 font-bold">
                                  • Falta{remainingCount === 1 ? '' : 'm'} {remainingCount}
                                </span>
                              )}
                              {userAvg && (
                                <span className="text-amber-300 font-black">
                                  • ⭐ Média Minha: {userAvg.avg.toFixed(3)}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {movies.map((movie) => (
                          <UniversePosterTile
                            key={`gal_${saga.id}_${movie.order}`}
                            movie={movie}
                            onAddMovie={onAddMovie}
                            size="sm"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-4 gap-3">
                {movieGalleryData.uniqueMovies.map(({ movie, sagas: linkedSagas }) => {
                  const primarySaga = linkedSagas[0];
                  return (
                    <div
                      key={`uniq_${getMovieUniqueKey(movie)}`}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <UniversePosterTile movie={movie} onAddMovie={onAddMovie} size="sm" />
                      {primarySaga && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSaga(primarySaga);
                            setInspectorTab(filterMode === 'missing_movies' ? 'pending' : 'watched');
                          }}
                          className="w-20 sm:w-24 px-1.5 py-0.5 rounded-md bg-zinc-900 hover:bg-indigo-950 border border-zinc-800 hover:border-indigo-400/50 text-[9px] font-bold text-zinc-400 hover:text-indigo-200 truncate cursor-pointer text-center"
                          title={`Inspecionar: ${linkedSagas.map((x) => x.title).join(' • ')}`}
                        >
                          {primarySaga.icon} {getNodeLabel(primarySaga)}
                          {linkedSagas.length > 1 ? ` +${linkedSagas.length - 1}` : ''}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!isMovieGalleryMode && visibleMegaSagas.length === 0 && flatSagasList.length === 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 text-center text-sm text-zinc-400">
            Nenhuma constelação ou saga encontrada para esse filtro/busca.
          </div>
        )}
      </div>

      {/* Direita: Painel Inspetor Fixo (Sem sair do mapa!) */}
      <div className="xl:sticky xl:top-24 rounded-3xl border border-indigo-400/45 bg-zinc-950/95 p-5 shadow-2xl flex flex-col gap-4">
        {activeSaga ? (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-400/45 flex items-center justify-center text-2xl shrink-0">
                  {activeSaga.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${activeTier.badge}`}
                    >
                      {activeTier.icon} {activeTier.label} • +{activeSaga.completionXp} XP
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {activeSaga.watchedCount}/{activeSaga.totalCount} ({activeSaga.progressPct}%)
                    </span>
                    {activeSaga.isCompleted && activeSagaUserAvg && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/55 text-[10px] font-mono font-black text-amber-200">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-300" />
                        Média Minha: {activeSagaUserAvg.avg.toFixed(3)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    {activeSaga.title}
                  </h3>
                </div>
              </div>

              {activeSaga.isCompleted && (
                <button
                  type="button"
                  onClick={() => onReplaySagaVictory(activeSaga)}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer shrink-0 shadow"
                >
                  <Play className="w-3 h-3 fill-current" /> Letreiro
                </button>
              )}
            </div>

            {/* Barra de Progresso + Próximo Objetivo */}
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-zinc-300 flex items-center gap-1.5">
                  {activeSaga.isCompleted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">
                        Bloco 100% Dominado!
                        {activeSagaUserAvg && (
                          <span className="text-amber-300 ml-1.5 font-mono">
                            • ⭐ Média {activeSagaUserAvg.avg.toFixed(3)}
                          </span>
                        )}
                      </span>
                    </>
                  ) : nextCheckpoint ? (
                    <>
                      <Target className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        Próximo Marco ({nextCheckpoint.threshold} filmes): faltam{' '}
                        <strong className="text-cyan-300">
                          {Math.max(nextCheckpoint.threshold - activeSaga.watchedCount, 0)}
                        </strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <Film className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Faltam{' '}
                        <strong className="text-amber-300">
                          {Math.max(activeSaga.totalCount - activeSaga.watchedCount, 0)}
                        </strong>{' '}
                        para 100%
                      </span>
                    </>
                  )}
                </span>
                <span className="font-mono text-zinc-400">{activeSaga.progressPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/70 overflow-hidden border border-white/5">
                <div
                  className={`h-full bg-gradient-to-r ${activeTier.bar} transition-all duration-500`}
                  style={{ width: `${activeSaga.progressPct}%` }}
                />
              </div>
            </div>

            {/* Filtro rápido de pôsteres dentro da saga */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Filmes da Saga
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                {[
                  { id: 'all', label: `Todos (${activeSaga.totalCount})` },
                  {
                    id: 'pending',
                    label: `Faltando (${Math.max(activeSaga.totalCount - activeSaga.watchedCount, 0)})`,
                  },
                  { id: 'watched', label: `Vistos (${activeSaga.watchedCount})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setInspectorTab(t.id)}
                    className={`px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                      inspectorTab === t.id
                        ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pôsteres do Nó Selecionado */}
            <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-3 gap-2.5 max-h-[42vh] overflow-y-auto pr-1">
              {inspectorMovies.length > 0 ? (
                inspectorMovies.map((movie) => (
                  <UniversePosterTile
                    key={`insp_${activeSaga.id}_${movie.order}`}
                    movie={movie}
                    onAddMovie={onAddMovie}
                    size="sm"
                  />
                ))
              ) : (
                <div className="col-span-full py-6 text-center text-xs text-zinc-500">
                  Nenhum filme nesta aba.
                </div>
              )}
            </div>

            {/* Marcos +30 XP */}
            {(activeSaga.checkpoints || []).length > 0 && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-800">
                {activeSaga.checkpoints.map((cp) =>
                  cp.unlocked ? (
                    <div
                      key={cp.threshold}
                      className="rounded-xl bg-indigo-500/15 border border-indigo-400/45 px-3 py-2 text-[11px]"
                    >
                      <div className="flex items-center justify-between font-black text-indigo-200 mb-0.5">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Marco {cp.threshold} filmes
                        </span>
                        <span className="font-mono text-amber-300">+{cp.xp} XP</span>
                      </div>
                      <p className="italic text-zinc-100">&ldquo;{cp.quote}&rdquo;</p>
                    </div>
                  ) : (
                    <div
                      key={cp.threshold}
                      className="rounded-xl bg-zinc-900/70 border border-zinc-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-zinc-500"
                    >
                      <span className="flex items-center gap-1.5 font-bold">
                        <Lock className="w-3 h-3" /> Marco {cp.threshold} filmes (+{cp.xp} XP)
                      </span>
                      <span className="font-mono">
                        Faltam {Math.max(cp.threshold - activeSaga.watchedCount, 0)}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}

            {activeSaga.isCompleted && (
              <div className="rounded-xl bg-amber-500/15 border border-amber-400/50 px-3 py-2.5 text-xs italic font-bold text-amber-100">
                🏆 &ldquo;{activeSaga.finalQuote}&rdquo;
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-sm text-zinc-500">
            Selecione qualquer nó da constelação para ver seus filmes e marcos.
          </div>
        )}
      </div>
    </div>
  );
}
