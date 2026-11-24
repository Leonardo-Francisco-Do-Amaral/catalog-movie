import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ScrollText,
  FlaskConical,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  Dices,
  RotateCcw,
  BookOpen,
  X,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Crown,
  CalendarClock,
  Target,
  Sparkles,
  Lock,
} from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';
import { triggerXPGainToast, dispatchXpStatusUpdate } from '../utils/xpSystem';
import { getNextMonthCountdownLabel, formatCycleKeyLabel } from '../utils/cycleCountdown';
import {
  playBingoCageSpinSound,
  playBingoStampSound,
  playBingoLineSound,
} from '../utils/trophyAudio';
import { ALL_CINEMA_CLASSES } from '../utils/analyticsEngine';
import {
  POWER_TIER_META,
  getClassPowers,
  getEquippedClassId,
  dispatchClassPowerSync,
} from '../utils/classPowersCatalog';

const FAMILY_META = {
  secret_draw: { label: 'Sessão Secreta', border: 'border-fuchsia-500/40', badge: 'bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/40' },
  chimera: { label: 'Quimera Cinéfila', border: 'border-emerald-500/40', badge: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/40' },
  stickers: { label: 'Álbum da Fama', border: 'border-rose-500/40', badge: 'bg-rose-500/15 text-rose-200 border-rose-400/40' },
  trophies: { label: 'Troféus PS5', border: 'border-purple-500/40', badge: 'bg-purple-500/15 text-purple-200 border-purple-400/40' },
  map_duel: { label: 'Mapa & Duelos', border: 'border-cyan-500/40', badge: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/40' },
  counters: { label: 'Contadores', border: 'border-sky-500/40', badge: 'bg-sky-500/15 text-sky-200 border-sky-400/40' },
  film_habit: { label: 'Hábitos de Tela', border: 'border-amber-500/40', badge: 'bg-amber-500/15 text-amber-200 border-amber-400/40' },
};

const TARGET_ACTION_META = {
  square_reroll: {
    label: '✒️ Pena Extra (Trocar 1 Contrato)',
    hint: 'Clique em qualquer contrato em aberto na mesa para sortear outro pergaminho do grimório.',
    ring: 'ring-sky-400/90 border-sky-300',
  },
  upgrade: {
    label: '⬆️ Sinete +Dif (+XP)',
    hint: 'Clique em um contrato em aberto para torná-lo mais difícil e aumentar a recompensa em XP.',
    ring: 'ring-orange-400/90 border-orange-300',
  },
  downgrade: {
    label: '⬇️ Pena Suave -Dif (-XP)',
    hint: 'Clique em um contrato em aberto para aliviar a exigência desta missão.',
    ring: 'ring-emerald-400/90 border-emerald-300',
  },
  lab_complete: {
    label: '🎯 Lab: Clicar no Contrato p/ Concluir',
    hint: 'Clique em qualquer pergaminho aberto na mesa para concluí-lo na hora e testar fileiras/Grande Sinete.',
    ring: 'ring-fuchsia-400/90 border-fuchsia-300',
  },
  class_power: {
    label: '⚡ Poder da Classe (Mirando Pergaminho)',
    hint: 'Clique em qualquer pergaminho em aberto na mesa para aplicar o poder da classe selecionada!',
    ring: 'ring-amber-400/95 border-amber-300',
  },
};

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];

const STAT_BADGE_META = {
  AGI: { key: 'AGI', icon: '⚡', label: 'Vigor de Tela', tone: 'text-amber-300 border-amber-400/45 bg-amber-950/55' },
  INT: { key: 'INT', icon: '🧠', label: 'Sabedoria Temporal', tone: 'text-cyan-300 border-cyan-400/45 bg-cyan-950/55' },
  DES: { key: 'DES', icon: '🌍', label: 'Diplomacia Global', tone: 'text-emerald-300 border-emerald-400/45 bg-emerald-950/55' },
  SOR: { key: 'SOR', icon: '🎯', label: 'Olhar Clínico & Fortuna', tone: 'text-rose-300 border-rose-400/45 bg-rose-950/55' },
  VIT: { key: 'VIT', icon: '🛡️', label: 'Caça-Troféus', tone: 'text-purple-300 border-purple-400/45 bg-purple-950/55' },
  FOR: { key: 'FOR', icon: '👑', label: 'Prestígio Áureo', tone: 'text-yellow-300 border-yellow-400/45 bg-yellow-950/55' },
  CAR: { key: 'CAR', icon: '🌟', label: 'Aura de Estrela', tone: 'text-pink-300 border-pink-400/45 bg-pink-950/55' },
};

const GOAL_STAT_KEY_MAP = {
  short_film_1: 'AGI',
  long_film_1: 'AGI',
  genres_25: 'AGI',
  streaming_3: 'AGI',
  dubbed_5: 'AGI',
  classic_pre_1980: 'INT',
  decades_4: 'INT',
  review_notes_3: 'INT',
  universe_franchise_film: 'INT',
  chimera_complete_1: 'INT',
  foreign_subbed_1: 'DES',
  countries_4: 'DES',
  new_year_or_country: 'DES',
  hidden_gem_cult_1: 'DES',
  physical_cinema_1: 'DES',
  sd_complete_1: 'SOR',
  sd_complete_2: 'SOR',
  sd_hard_1: 'SOR',
  chimera_jackpot: 'SOR',
  imdb_low_69: 'SOR',
  trophies_new_or_inf_10: 'VIT',
  trophy_infinite_1: 'VIT',
  trophies_new_10: 'VIT',
  trophies_progress_50: 'VIT',
  movies_10: 'VIT',
  oscar_movie_1: 'FOR',
  duel_champion: 'FOR',
  critic_acclaimed_1: 'FOR',
  imdb_high_7: 'FOR',
  user_rating_8: 'FOR',
  sticker_any: 'CAR',
  sticker_dublador: 'CAR',
  sticker_director: 'CAR',
  sticker_actor_couple: 'CAR',
  tags_50: 'CAR',
};

function resolveGoalStatKey(item) {
  return item?.statKey || GOAL_STAT_KEY_MAP[item?.goalKey || item?.key] || 'SOR';
}

function dispatchBingoSync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cine-bingo-sync'));
  }
}

function isPassportDiplomaticSquareClient(sq) {
  if (!sq) return false;
  const allowedKeys = new Set([
    'new_year_or_country',
    'decades_4',
    'countries_4',
    'foreign_subbed_1',
    'classic_pre_1980',
    'hidden_gem_cult_1',
    'imdb_low_69',
  ]);
  if (allowedKeys.has(sq.goalKey)) return true;
  if (resolveGoalStatKey(sq) === 'DES') return true;
  const ev = String(sq.evaluatorKey || '');
  return (
    ev.includes('country') ||
    ev.includes('decade') ||
    ev.includes('pre_19') ||
    ev.includes('non_us') ||
    ev.includes('votes_lt_')
  );
}

function isSquareEligibleForAction(square, action, activeClassId = '') {
  if (!square || square.completed || square.claimed) return false;
  if (action === 'upgrade') return square.difficultyState !== 'upgraded';
  if (action === 'downgrade') return square.difficultyState !== 'downgraded';
  if (action === 'class_power') {
    const target = Number(square.target || 0);
    if (
      activeClassId === 'andarilho_setima_arte' ||
      activeClassId === 'barbaro_imax' ||
      activeClassId === 'sicario_telonas' ||
      activeClassId === 'sacerdote_cinefilo' ||
      activeClassId === 'monge_tres_casas'
    ) {
      return target > 1;
    }
    if (activeClassId === 'bardo_herbert_richers') {
      return square.difficultyState !== 'downgraded';
    }
    if (activeClassId === 'carnical_grindhouse') {
      return square.difficultyState !== 'upgraded';
    }
    if (activeClassId === 'cartografo_195_reinos') {
      return isPassportDiplomaticSquareClient(square);
    }
    if (activeClassId === 'gladiador_ps5') {
      return !square.lineWildcard;
    }
    if (activeClassId === 'paladino_oscar' || activeClassId === 'arquiteto_multiverso') {
      return square.difficultyState !== 'upgraded' || target > 1;
    }
    return true;
  }
  return true;
}

function getClassPowerSquarePreview(square, activeClassId) {
  const t = Number(square?.target || 1);
  const p = Number(square?.progress || 0);
  switch (activeClassId) {
    case 'andarilho_setima_arte': {
      const delta = t >= 8 ? 3 : 1;
      return `APLICAR (Meta ${t} → ${Math.max(1, t - delta)})`;
    }
    case 'barbaro_imax':
      return `APLICAR (${p}/${t} → ${Math.min(t, p + 2)}/${t})`;
    case 'sicario_telonas': {
      const cut = Math.max(1, Math.round(t * 0.25));
      return `APLICAR (Meta ${t} → ${Math.max(1, t - cut)})`;
    }
    case 'bardo_herbert_richers':
      return 'APLICAR (❄️ -Dif c/ XP Normal)';
    case 'corsario_sete_mares':
      return 'APLICAR (🗺️ Sortear Outro)';
    case 'vampiro_madrugada':
      return `APLICAR (+20 XP → ${Number(square?.xpReward || 0) + 20})`;
    case 'carnical_grindhouse':
      return 'APLICAR (🔥 +Dif c/ Meta Normal)';
    case 'cacador_trufas':
      return `APLICAR (${p}/${t} → ${Math.min(t, p + 1)}/${t})`;
    case 'cartografo_195_reinos':
      return `APLICAR (${p}/${t} → ${t === 1 ? 1 : Math.min(t, p + 2)}/${t})`;
    case 'sacerdote_cinefilo': {
      const cut = Math.max(1, Math.round(t * 0.35));
      return `APLICAR (Meta ${t} → ${Math.max(1, t - cut)})`;
    }
    case 'monge_tres_casas':
      return `APLICAR (Meta ${t} → ${Math.max(1, Math.floor(t / 2))})`;
    case 'algoz_tomatometro':
      return t > 1
        ? `APLICAR (+25 XP & Meta ${t}→${Math.max(1, t - 1)})`
        : `APLICAR (+25 XP & ${p}/${t}→${Math.min(t, p + 1)}/${t})`;
    case 'gladiador_ps5':
      return 'APLICAR (⚔️ Coringa Fileira)';
    case 'arquimago_tempo':
      return `APLICAR (${p}/${t} → ${Math.min(t, p + 2)}/${t})`;
    case 'paladino_oscar':
      return 'APLICAR (🏆 +Dif & -25% Meta)';
    case 'cronista_creditos_pos':
      return 'APLICAR (📜 Reescrever Missão)';
    case 'oraculo_pelicula':
      return `APLICAR (+35 XP & ${p}/${t}→${Math.min(t, p + 1)}/${t})`;
    case 'arquiteto_multiverso':
      return 'APLICAR (🌌 +Dif & -50% Meta)';
    default:
      return 'APLICAR PODER';
  }
}

function formatTicketSerial(boardId) {
  return String(Number(boardId || 1)).padStart(4, '0');
}

function GuildCompletedGrimoireDisplay({ monthKey = '' }) {
  const sparkles = [
    { symbol: '✨', pos: 'top-3 left-7', delay: '0s', size: 'text-sm text-amber-300' },
    { symbol: '⭐', pos: 'top-6 right-5', delay: '0.45s', size: 'text-xs text-emerald-300' },
    { symbol: '⚜️', pos: 'bottom-7 left-4', delay: '0.9s', size: 'text-xs text-amber-200' },
    { symbol: '✨', pos: 'bottom-4 right-7', delay: '1.35s', size: 'text-sm text-emerald-200' },
    { symbol: '🕯️', pos: 'top-1/2 -left-1 -translate-y-1/2', delay: '0.6s', size: 'text-xs text-amber-300' },
    { symbol: '📜', pos: 'top-1/2 -right-1 -translate-y-1/2', delay: '1.1s', size: 'text-xs text-amber-200' },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-2 bingo-parchment-font">
      <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
        {/* Aura radial esmeralda & dourada */}
        <div className="bingo-sanctum-aura pointer-events-none absolute inset-2 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.28)_0%,rgba(245,158,11,0.18)_46%,transparent_72%)]" />

        {/* Astrolábio lunar giratório externo */}
        <svg
          viewBox="0 0 200 200"
          className="bingo-sanctum-orbit pointer-events-none absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="rgba(251, 191, 36, 0.38)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
          />
          <circle
            cx="100"
            cy="8"
            r="3"
            fill="#fde68a"
          />
          <circle
            cx="192"
            cy="100"
            r="2.5"
            fill="#6ee7b7"
          />
          <circle
            cx="100"
            cy="192"
            r="3"
            fill="#fde68a"
          />
          <circle
            cx="8"
            cy="100"
            r="2.5"
            fill="#6ee7b7"
          />
        </svg>

        {/* Anel interno rúnico contra-rotativo */}
        <div className="bingo-sanctum-orbit-reverse pointer-events-none absolute inset-5 rounded-full border border-dashed border-emerald-400/45 shadow-[inset_0_0_25px_rgba(16,185,129,0.14)]" />

        {/* Centelhas orbitando */}
        {sparkles.map((sp, idx) => (
          <span
            key={idx}
            style={{ animationDelay: sp.delay }}
            className={`bingo-sanctum-sparkle pointer-events-none absolute ${sp.pos} ${sp.size} select-none`}
          >
            {sp.symbol}
          </span>
        ))}

        {/* Tomo Sagrado / Grimório Dourado Lacrado */}
        <div className="bingo-sanctum-grimoire-float relative z-10 w-32 h-32 flex items-center justify-center">
          <svg viewBox="0 0 140 140" className="w-full h-full" aria-hidden="true">
            <defs>
              <linearGradient id="grimCoverGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6b3e1b" />
                <stop offset="55%" stopColor="#3f210d" />
                <stop offset="100%" stopColor="#221006" />
              </linearGradient>
              <linearGradient id="grimGoldTrim" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <radialGradient id="grimSealGreen" cx="38%" cy="32%" r="65%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="55%" stopColor="#059669" />
                <stop offset="100%" stopColor="#064e3b" />
              </radialGradient>
            </defs>

            {/* Penas cruzadas atrás do grimório */}
            <path
              d="M28 112 C42 78, 72 42, 114 20 C102 36, 94 46, 86 52 C74 64, 48 92, 28 112 Z"
              fill="rgba(253, 230, 138, 0.25)"
              stroke="url(#grimGoldTrim)"
              strokeWidth="1.2"
            />

            {/* Páginas laterais e lombada do livro fechado */}
            <rect x="33" y="25" width="76" height="92" rx="8" fill="#ebd7b2" stroke="#8b6339" strokeWidth="2" />
            <rect x="28" y="21" width="76" height="94" rx="9" fill="url(#grimCoverGrad)" stroke="url(#grimGoldTrim)" strokeWidth="2.5" />

            {/* Lombada esculpida */}
            <rect x="28" y="21" width="12" height="94" rx="5" fill="#2a1407" stroke="url(#grimGoldTrim)" strokeWidth="1.4" />
            <line x1="29" y1="40" x2="39" y2="40" stroke="url(#grimGoldTrim)" strokeWidth="2" />
            <line x1="29" y1="68" x2="39" y2="68" stroke="url(#grimGoldTrim)" strokeWidth="2" />
            <line x1="29" y1="96" x2="39" y2="96" stroke="url(#grimGoldTrim)" strokeWidth="2" />

            {/* Cantoneiras douradas */}
            <path d="M90 23 L102 23 L102 35" fill="none" stroke="url(#grimGoldTrim)" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M90 113 L102 113 L102 101" fill="none" stroke="url(#grimGoldTrim)" strokeWidth="2.4" strokeLinecap="round" />

            {/* Moldura arcana central da capa */}
            <rect x="46" y="33" width="50" height="70" rx="5" fill="none" stroke="rgba(251, 191, 36, 0.45)" strokeWidth="1.2" />

            {/* Fecho dourado lacrando o Grimório */}
            <rect x="94" y="61" width="20" height="14" rx="4" fill="url(#grimGoldTrim)" stroke="#451a03" strokeWidth="1.5" />
            <circle cx="106" cy="68" r="2.6" fill="#271306" />

            {/* Grande Sinete de Cera Esmeralda & Ouro no centro */}
            <circle cx="71" cy="68" r="19" fill="url(#grimSealGreen)" stroke="#fde68a" strokeWidth="2" />
            <circle cx="71" cy="68" r="13.5" fill="none" stroke="rgba(254, 243, 199, 0.55)" strokeWidth="1" strokeDasharray="2 2" />
            <path
              d="M71 57 L74.2 63.6 L81.4 64.6 L76.2 69.6 L77.4 76.7 L71 73.3 L64.6 76.7 L65.8 69.6 L60.6 64.6 L67.8 63.6 Z"
              fill="#fef3c7"
              stroke="#b45309"
              strokeWidth="0.9"
            />
          </svg>

          {/* Coroa e selo 16/16 flutuante */}
          <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-[9.5px] font-black bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950 border border-amber-100 shadow-[0_0_16px_rgba(16,185,129,0.55)]">
            👑 16/16
          </span>
        </div>
      </div>

      <div className="px-3.5 py-1 rounded-full bg-emerald-950/75 border border-emerald-400/50 text-[10.5px] font-black uppercase tracking-widest text-emerald-200 shadow-inner">
        ⚜️ Grimórios de {formatCycleKeyLabel(monthKey, { fallback: 'Mês Atual' })} • 100% Selados &amp; Arquivados
      </div>
    </div>
  );
}

function GuildScrollForgeDisplay({ label = 'Lacrando Pergaminhos da Guilda...', isForging = false }) {
  const miniScrolls = [
    { roman: 'I', pos: 'top-2 left-1/2 -translate-x-1/2', rot: '-4deg', delay: '0s', green: false },
    { roman: 'IV', pos: 'top-9 right-2.5', rot: '14deg', delay: '0.25s', green: true },
    { roman: 'IX', pos: 'bottom-3 right-4', rot: '-12deg', delay: '0.5s', green: false },
    { roman: 'XII', pos: 'bottom-3 left-4', rot: '10deg', delay: '0.35s', green: true },
    { roman: 'XVI', pos: 'top-9 left-2.5', rot: '-14deg', delay: '0.15s', green: false },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-3.5 py-4 bingo-parchment-font">
      <div className="relative w-40 h-40 rounded-full border-4 border-[#9c6f3e]/80 bg-gradient-to-br from-[#2b1a0e] via-[#170e07] to-[#0c0703] shadow-[0_0_45px_rgba(217,119,6,0.28)] flex items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-3 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.22)_0%,transparent_72%)]" />
        <div
          className={`pointer-events-none absolute inset-2 rounded-full border-2 border-dashed border-amber-400/40 ${
            isForging ? 'bingo-cage-spin' : ''
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-5 rounded-full border border-[#c79f63]/25 ${
            isForging ? 'bingo-cage-spin' : ''
          }`}
          style={isForging ? { animationDirection: 'reverse' } : undefined}
        />

        {miniScrolls.map((ms) => (
          <div key={ms.roman} className={`absolute ${ms.pos}`}>
            <div
              style={{
                '--scroll-rot': ms.rot,
                animationDelay: ms.delay,
                animationDuration: isForging ? '0.65s' : '2.6s',
              }}
              className="parchment-scroll-float relative w-11 h-5 rounded-full bingo-rolled-scroll-body flex items-center justify-between px-1"
            >
              <span className="text-[7.5px] font-bold text-[#f2d6a2]/90 tracking-tighter">
                {ms.roman}
              </span>
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] text-amber-100 ${
                  ms.green ? 'bingo-wax-seal-green' : 'bingo-wax-seal'
                }`}
              >
                ⚜️
              </span>
            </div>
          </div>
        ))}

        {/* Sinete Real em Cera Vermelha 3D ao Centro */}
        <div
          className={`relative z-10 w-14 h-14 rounded-full bingo-wax-seal flex items-center justify-center ${
            isForging ? 'parchment-seal-stamp-anim' : 'shadow-[0_0_24px_rgba(217,119,6,0.35)]'
          }`}
        >
          <span className="w-9 h-9 rounded-full border border-amber-200/35 flex items-center justify-center text-xl text-amber-100 shadow-inner">
            ⚜️
          </span>
        </div>
      </div>

      <div
        className={`text-xs font-bold uppercase tracking-widest text-[#f2d6a2] ${
          isForging ? 'animate-pulse' : ''
        }`}
      >
        {label}
      </div>
    </div>
  );
}

function BingoBankerWalletStrip({ wallet }) {
  const chips = [
    { key: 'forge', icon: '📜', label: 'Nova Remessa', count: wallet.forgeChips, max: wallet.maxForgeChips, rate: '+1/mês', tone: 'border-[#8b6339]/60 bg-[#23150a]/90 text-[#f5deb3]' },
    { key: 'board_reroll', icon: '🕯️', label: 'Trocar Mesa', count: wallet.boardRerollChips, max: wallet.maxBoardRerollChips, rate: '+1/mês', tone: 'border-[#7e4a2b]/60 bg-[#21130b]/90 text-[#f3d1a4]' },
    { key: 'square_reroll', icon: '✒️', label: 'Trocar 1 Contrato', count: wallet.squareRerollChips, max: wallet.maxSquareRerollChips, rate: '+2/mês', tone: 'border-sky-400/35 bg-[#121d24]/90 text-sky-200' },
    { key: 'upgrade', icon: '🔥', label: 'Sinete +Dif', count: wallet.upgradeChips, max: wallet.maxUpgradeChips, rate: '+1/mês', tone: 'border-orange-400/40 bg-[#26120b]/90 text-orange-200' },
    { key: 'downgrade', icon: '❄️', label: 'Pena -Dif', count: wallet.downgradeChips, max: wallet.maxDowngradeChips, rate: '+1/mês', tone: 'border-emerald-400/35 bg-[#11211b]/90 text-emerald-200' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bingo-parchment-font">
      {chips.map((c) => (
        <div
          key={c.key}
          className={`rounded-2xl border px-3 py-2 flex items-center justify-between gap-2 shadow-inner ${c.tone}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-full bg-black/45 border border-[#c9a36b]/30 flex items-center justify-center text-sm shrink-0">
              {c.icon}
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-black truncate">{c.label}</div>
              <div className="text-[9.5px] opacity-75 font-mono">{c.rate}</div>
            </div>
          </div>
          <span className="font-mono text-sm font-black shrink-0">
            {c.count}/{c.max}
          </span>
        </div>
      ))}
    </div>
  );
}

function ParchmentContractTile({
  square,
  targetedAction,
  activePowerClassId,
  isHoveredLineMember,
  justStamped,
  acting,
  isScrollOpen,
  onSquareClick,
  onToggleScrollOpen,
}) {
  const roman = ROMAN_NUMERALS[square.index] || String(square.index + 1);
  const eligibleTarget = targetedAction
    ? isSquareEligibleForAction(square, targetedAction, activePowerClassId)
    : false;
  const isReadyToClaim = Boolean(square.completed && !square.claimed);
  const targetMeta = targetedAction ? TARGET_ACTION_META[targetedAction] : null;
  const clampedProg = Math.min(Number(square.progress || 0), Number(square.target || 1));

  const isUpgraded = square.difficultyState === 'upgraded';
  const isDowngraded = square.difficultyState === 'downgraded';
  const statKey = resolveGoalStatKey(square);
  const statMeta = STAT_BADGE_META[statKey] || STAT_BADGE_META.SOR;
  const statPts = isUpgraded ? 0.2 : isDowngraded ? (square.preserveNormalStat ? 0.1 : 0) : 0.1;
  const statPtsText = statPts > 0 ? `+${statPts.toFixed(1)}` : '0';
  const isRolledClosed = Boolean(square.claimed && !isScrollOpen);
  const canToggleScroll = Boolean(square.claimed && !targetedAction);
  const clickable = targetedAction ? eligibleTarget : (isReadyToClaim || canToggleScroll);

  const useGreenSeal = square.index % 3 === 0;
  const sealClass = useGreenSeal ? 'bingo-wax-seal-green' : 'bingo-wax-seal';

  const handleClick = () => {
    if (!clickable) return;
    if (canToggleScroll) {
      onToggleScrollOpen(square.index);
      return;
    }
    onSquareClick(square);
  };

  const hoverRingClass = isHoveredLineMember ? 'ring-2 ring-amber-400 scale-[1.015] z-20' : '';

  if (isRolledClosed) {
    return (
      <button
        type="button"
        disabled={acting || Boolean(targetedAction)}
        onClick={handleClick}
        title={`${square.title} (${statMeta.label}: ${statPtsText} ${statKey}) — Clique para abrir este pergaminho lacrado`}
        className={`group relative rounded-xl border border-[#54381e]/75 bg-[#180f07]/80 hover:border-[#b8894c]/85 hover:bg-[#22150a]/90 p-2.5 flex flex-col justify-between items-center gap-2 min-h-[168px] sm:min-h-[180px] transition-all bingo-parchment-font ${hoverRingClass} ${
          targetedAction
            ? 'opacity-35 saturate-50 pointer-events-none cursor-default'
            : 'cursor-pointer active:scale-[0.98]'
        }`}
      >
        <div className="w-full flex items-center justify-between gap-1 text-[9.5px]">
          <span className="tracking-[0.14em] font-bold text-[#c79f63] uppercase">
            Contrato #{roman}
          </span>
          <span className="font-bold text-amber-300/95">
            +{square.xpReward} XP • {statMeta.icon} {statPtsText} {statKey} ✓
          </span>
        </div>

        {/* Pergaminho enrolado na horizontal com cordão de sisal e lacre 3D */}
        <div className="relative w-full my-auto px-0.5 flex items-center justify-center">
          <div className="relative w-full h-14 rounded-full bingo-rolled-scroll-body flex items-center justify-between overflow-visible">
            <span className="w-3.5 h-14 rounded-l-full border-r border-[#1a0e05]/85 bg-[radial-gradient(circle_at_center,#b8894c_22%,#5e3b1b_55%,#1b0e05_92%)] shrink-0" />
            <div className="flex-1 h-full relative flex items-center justify-center">
              <span className="w-1.5 h-14 bg-gradient-to-r from-[#d4b483] via-[#a37d4c] to-[#6b4f2b] shadow-md" />
              <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-5 translate-y-2 w-5 h-1.5 rotate-[32deg] rounded-full bg-[#9c7849]/90" />
              <span className="pointer-events-none absolute top-1/2 left-1/2 translate-x-0.5 translate-y-2 w-5 h-1.5 -rotate-[32deg] rounded-full bg-[#87653a]/90" />
              <div
                className={`absolute w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${sealClass} ${
                  justStamped ? 'bingo-stamp-slam' : ''
                }`}
              >
                <span className="w-7 h-7 rounded-full border border-white/25 flex items-center justify-center text-sm text-amber-100/95 shadow-inner">
                  ⚜️
                </span>
              </div>
            </div>
            <span className="w-3.5 h-14 rounded-r-full border-l border-[#1a0e05]/85 bg-[radial-gradient(circle_at_center,#b8894c_22%,#5e3b1b_55%,#1b0e05_92%)] shrink-0" />
          </div>
        </div>

        <div className="w-full text-center flex flex-col gap-0.5">
          <div className="text-[11px] font-bold italic text-[#edd7b4] leading-tight line-clamp-1">
            {square.title}
          </div>
          <div className="text-[9.5px] font-bold text-[#d4a359] group-hover:text-amber-200 transition-colors">
            👁️ Clique para abrir pergaminho
          </div>
        </div>
      </button>
    );
  }

  let bodyToneClass = 'bingo-parchment-cell border-[#8c6236]/65 group-hover:border-[#d4a460]';
  if (targetedAction && !eligibleTarget) {
    bodyToneClass = 'bingo-parchment-cell border-[#5a3c20]/45 opacity-35 saturate-50';
  } else if (eligibleTarget && targetMeta) {
    bodyToneClass = `bingo-parchment-cell ring-2 ${targetMeta.ring} border-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.35)]`;
  } else if (isReadyToClaim) {
    bodyToneClass =
      'bingo-parchment-cell bingo-daub-pulse border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.34)]';
  } else if (isUpgraded) {
    bodyToneClass = 'bingo-parchment-cell-upgraded border-orange-500/80';
  } else if (isDowngraded) {
    bodyToneClass = 'bingo-parchment-cell-downgraded border-dashed border-sky-400/75';
  }

  return (
    <button
      type="button"
      disabled={acting || !clickable}
      onClick={handleClick}
      title={canToggleScroll ? 'Clique para enrolar este pergaminho novamente' : square.desc}
      className={`group relative flex flex-col items-stretch text-left min-h-[168px] sm:min-h-[180px] transition-all bingo-parchment-font ${
        square.claimed && isScrollOpen ? 'bingo-scroll-unroll-anim' : ''
      } ${hoverRingClass} ${clickable ? 'cursor-pointer active:scale-[0.985]' : 'cursor-default'}`}
    >
      <div className="bingo-scroll-roller w-full shrink-0" />

      <div
        className={`relative flex-1 mx-1 border-x px-2.5 py-2 flex flex-col justify-between gap-1.5 overflow-hidden ${bodyToneClass}`}
      >
        {isUpgraded && !square.claimed && (
          <div className="pointer-events-none absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/25 to-rose-600/15 blur-xl" />
        )}
        {isDowngraded && !square.claimed && (
          <div className="pointer-events-none absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-gradient-to-tr from-sky-400/25 to-cyan-500/10 blur-xl" />
        )}

        {/* Cabeçalho ornamental + Selo discreto de Atributo + Dificuldade modificada */}
        <div className="relative z-10 flex items-center justify-between gap-1 text-[9.5px]">
          <span className="font-bold tracking-[0.12em] uppercase text-[#dfba7a] truncate">
            ~ Contrato #{roman} ~
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <span
              title={`${statMeta.label}: ${statPtsText} ${statKey} ao lacrar`}
              className={`px-1.5 py-0.5 rounded border text-[8.5px] font-bold ${statMeta.tone}`}
            >
              {statMeta.icon} {statKey} {statPtsText}
            </span>
            {isUpgraded && (
              <span className="px-1.5 py-0.5 rounded bg-orange-900/70 border border-orange-400/70 text-[8.5px] font-bold text-orange-200">
                🔥 +Dif
              </span>
            )}
            {isDowngraded && (
              <span className="px-1.5 py-0.5 rounded bg-sky-900/70 border border-sky-400/70 text-[8.5px] font-bold text-sky-200">
                ❄️ -Dif
              </span>
            )}
            {square.lineWildcard && !square.completed && (
              <span
                title="Lacre de Ferro: conta como Coringa para fechar Fileiras (+75 XP) que passam por este pergaminho!"
                className="px-1.5 py-0.5 rounded bg-amber-900/75 border border-amber-400/80 text-[8.5px] font-bold text-amber-200 shadow"
              >
                ⚔️ Coringa Fileira
              </span>
            )}
          </div>
        </div>

        {/* Brasão escuro entalhado com título */}
        <div className="relative z-10 rounded-md border border-[#966a38]/45 bg-[#190f07]/70 px-2 py-1.5 shadow-inner flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#362110] border border-[#b8894c]/55 flex items-center justify-center text-sm leading-none shrink-0 select-none">
            {square.icon}
          </span>
          <span className="text-[11.5px] sm:text-[12px] font-bold italic text-[#faecd2] leading-tight line-clamp-2">
            {square.title}
          </span>
        </div>

        {/* Objetivo, Progresso e Recompensa */}
        <div className="relative z-10 flex flex-col gap-1 text-[10px] leading-snug">
          <div className="line-clamp-2 text-[#e8d5b5]">
            <span className="font-bold text-[#dfb97a]">Objetivo:</span> {square.desc}
          </div>
          <div className="flex items-center justify-between gap-1.5 text-[10px]">
            <span className="text-[#d6be96]">
              Progresso:{' '}
              <strong className={square.completed ? 'text-amber-300' : 'text-[#faf0dc]'}>
                {clampedProg}/{square.target}
              </strong>
            </span>
            <span className="text-[#d6be96]">
              Recompensa: <strong className="text-amber-300">+{square.xpReward} XP</strong>
            </span>
          </div>
        </div>

        {/* Rodapé com rubrica + lacre ou CTA */}
        <div className="relative z-10 flex items-center justify-between gap-1.5 pt-1 border-t border-[#8b6339]/30">
          <span className="text-[9.5px] italic text-[#bfa06e]/85 select-none truncate">
            ~ ✒️ Selo da Guilda ~
          </span>

          {square.claimed ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-[#180f07]/90 border border-[#b8894c]/60 text-[9px] font-bold text-[#f2d6a2] group-hover:border-amber-300">
                📜 Fechar
              </span>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-amber-100 ${sealClass}`}
              >
                ⚜️
              </span>
            </div>
          ) : isReadyToClaim && !targetedAction ? (
            <span
              className={`px-2 py-0.5 rounded-full text-[9.5px] font-black tracking-wide text-amber-100 animate-pulse shrink-0 ${sealClass}`}
            >
              ⚜️ LACRAR +{square.xpReward}
            </span>
          ) : eligibleTarget ? (
            <span className="px-2 py-0.5 rounded bg-amber-400/25 border border-amber-300 text-[9px] font-black text-amber-200 shrink-0">
              {targetedAction === 'class_power'
                ? `⚡ ${getClassPowerSquarePreview(square, activePowerClassId)}`
                : '⚡ APLICAR'}
            </span>
          ) : (
            <span className="text-[9.5px] font-bold text-[#c7a36b] shrink-0">ABERTO</span>
          )}
        </div>
      </div>

      <div className="bingo-scroll-roller w-full shrink-0" />
    </button>
  );
}

function LineBadgeButton({
  line,
  compactLabel,
  acting,
  onHoverLine,
  onClaimLine,
  fullWidth = false,
}) {
  const ready = line.completed && !line.claimed;
  const toneClass = line.claimed
    ? 'border-[#9a3412] bg-gradient-to-r from-[#6c1d13] to-[#4b120b] text-[#fde68a] font-serif shadow-[0_2px_10px_rgba(127,29,29,0.5)]'
    : ready
      ? 'border-amber-300 bg-gradient-to-r from-amber-500 to-yellow-400 text-[#261406] font-serif shadow-[0_0_16px_rgba(245,158,11,0.45)] animate-pulse cursor-pointer'
      : 'border-[#6e4e2e]/70 bg-[#24180d]/90 text-[#e8d5b5] font-serif hover:border-[#b8864b] hover:bg-[#322112]';

  return (
    <button
      type="button"
      disabled={acting || !ready}
      onMouseEnter={() => onHoverLine(line.indices)}
      onMouseLeave={() => onHoverLine(null)}
      onClick={() => ready && onClaimLine(line.id)}
      title={`${line.label} (+${line.xpReward} XP)`}
      className={`${fullWidth ? 'w-full' : ''} px-2 py-1.5 rounded-xl border text-[10px] font-black transition-all flex items-center justify-center gap-1 ${toneClass}`}
    >
      <span>{compactLabel}</span>
      <span>{line.claimed ? '✓' : `+${line.xpReward}`}</span>
    </button>
  );
}

function BingoGoalCatalogModal({ catalog, onClose }) {
  const [familyFilter, setFamilyFilter] = useState('all');
  const filtered =
    familyFilter === 'all' ? catalog : catalog.filter((g) => g.family === familyFilter);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[88vh] overflow-y-auto bg-[#160e08] border border-[#8b6339]/70 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl bingo-parchment-font"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#6e4e2e]/60 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#f8ead0] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-300" />
              Grimório das {catalog.length} Missões dos Pergaminhos
            </h3>
            <p className="text-xs text-[#d4b483]">
              Cada contrato sorteado na mesa pode permanecer normal, receber 🔥 +Dif (+XP) ou ❄️ -Dif.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#26190e] hover:bg-[#362314] text-[#e8d5b5] border border-[#6e4e2e]/60 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFamilyFilter('all')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer ${
              familyFilter === 'all'
                ? 'bg-amber-500/20 text-amber-200 border-amber-400/50'
                : 'bg-[#22150b] text-[#c9a36b] border-[#5a3b20]/60 hover:text-[#f5e6cb]'
            }`}
          >
            Todas ({catalog.length})
          </button>
          {Object.entries(FAMILY_META).map(([fKey, fMeta]) => {
            const count = catalog.filter((g) => g.family === fKey).length;
            return (
              <button
                key={fKey}
                type="button"
                onClick={() => setFamilyFilter(fKey)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer ${
                  familyFilter === fKey
                    ? fMeta.badge
                    : 'bg-[#22150b] text-[#c9a36b] border-[#5a3b20]/60 hover:text-[#f5e6cb]'
                }`}
              >
                {fMeta.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {filtered.map((g) => {
            const fam = FAMILY_META[g.family] || FAMILY_META.counters;
            const statKey = resolveGoalStatKey(g);
            const statMeta = STAT_BADGE_META[statKey] || STAT_BADGE_META.SOR;
            return (
              <div
                key={g.key}
                className={`rounded-2xl border ${fam.border} bg-[#22150a]/85 p-3 flex flex-col gap-2`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{g.icon}</span>
                    <span className="text-xs font-black text-[#f8ead0] truncate">{g.normal.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      title={`${statMeta.label} (${statKey})`}
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${statMeta.tone}`}
                    >
                      {statMeta.icon} {statKey}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${fam.badge}`}>
                      {fam.label}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-[#e8d5b5]">
                  <strong>Normal (+{g.normal.xpReward} XP • +0.1 {statKey}):</strong> {g.normal.desc}
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="rounded-xl bg-orange-950/35 border border-orange-500/30 p-2 text-orange-200">
                    <div className="font-black">⬆️ +Dif (+{g.upgraded.xpReward} XP • +0.2 {statKey})</div>
                    <div className="opacity-90">{g.upgraded.desc}</div>
                  </div>
                  <div className="rounded-xl bg-emerald-950/35 border border-emerald-500/30 p-2 text-emerald-200">
                    <div className="font-black">⬇️ -Dif (+{g.downgraded.xpReward} XP • 0 {statKey})</div>
                    <div className="opacity-90">{g.downgraded.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function BingoPage({
  onXpStatusChange = () => {},
  onStatusLoaded = () => {},
}) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [spinningGlobe, setSpinningGlobe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoBanner, setInfoBanner] = useState('');
  const [targetedAction, setTargetedAction] = useState(null);
  const [hoveredLineIndices, setHoveredLineIndices] = useState(null);
  const [justStampedSet, setJustStampedSet] = useState({});
  const [showGoalCatalog, setShowGoalCatalog] = useState(false);
  const [unrolledClaimedMap, setUnrolledClaimedMap] = useState({});
  const [classPowerWallet, setClassPowerWallet] = useState(null);
  const [equippedClassId, setEquippedClassId] = useState(() => getEquippedClassId());
  const [selectedGoalKeyForPower, setSelectedGoalKeyForPower] = useState('');
  const [actingClassPower, setActingClassPower] = useState(false);

  const handleToggleClaimedScroll = (squareIndex) => {
    setUnrolledClaimedMap((prev) => ({
      ...prev,
      [squareIndex]: !prev[squareIndex],
    }));
  };

  const [showLabTools, setShowLabTools] = useState(() => {
    try {
      const saved = window.localStorage.getItem('bingo_show_lab');
      return saved === null ? false : saved === '1';
    } catch {
      return false;
    }
  });

  const toggleLabTools = useCallback((forcedNext) => {
    setShowLabTools((prev) => {
      const next = typeof forcedNext === 'boolean' ? forcedNext : !prev;
      try {
        window.localStorage.setItem('bingo_show_lab', next ? '1' : '0');
      } catch {
        // ignore storage error
      }
      if (!next) {
        setTargetedAction((curr) => (curr === 'lab_complete' ? null : curr));
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleLabTools();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [toggleLabTools]);

  const applyServerState = useCallback(
    (data, xpStatus = null) => {
      if (data) {
        setStatusData(data);
        onStatusLoaded(data);
      }
      if (xpStatus) {
        onXpStatusChange(xpStatus);
        dispatchXpStatusUpdate(xpStatus);
      }
    },
    [onStatusLoaded, onXpStatusChange]
  );

  const loadStatus = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      setErrorMsg('');
      try {
        const res = await axios.get(`${API_BASE_URL}/bingo/status`);
        if (res.data?.success && res.data?.data) {
          applyServerState(res.data.data);
        }
      } catch (err) {
        setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao carregar Pergaminhos da Guilda.');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [applyServerState]
  );

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const loadClassPowerWallet = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/class-powers/status`);
      if (res.data?.success) {
        setClassPowerWallet(res.data.data);
      }
    } catch {
      // silent fallback
    }
  }, []);

  useEffect(() => {
    loadClassPowerWallet();
    const onSync = () => loadStatus({ silent: true });
    const onClassSync = () => {
      setEquippedClassId(getEquippedClassId());
      loadClassPowerWallet();
    };
    window.addEventListener('cine-bingo-sync', onSync);
    window.addEventListener('cine-class-power-sync', onClassSync);
    return () => {
      window.removeEventListener('cine-bingo-sync', onSync);
      window.removeEventListener('cine-class-power-sync', onClassSync);
    };
  }, [loadStatus, loadClassPowerWallet]);

  const markJustStamped = (indices) => {
    const map = {};
    for (const i of indices) map[i] = true;
    setJustStampedSet(map);
    setTimeout(() => setJustStampedSet({}), 950);
  };

  const runWithGlobeSpin = async (fn) => {
    if (acting) return;
    setActing(true);
    setSpinningGlobe(true);
    setErrorMsg('');
    playBingoCageSpinSound();
    try {
      await Promise.all([fn(), new Promise((r) => setTimeout(r, 1050))]);
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao distribuir os pergaminhos na mesa.');
    } finally {
      setSpinningGlobe(false);
      setActing(false);
    }
  };

  const runMutation = async (fn) => {
    if (acting) return;
    setActing(true);
    setErrorMsg('');
    try {
      await fn();
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao executar ação nos Pergaminhos da Guilda.');
    } finally {
      setActing(false);
    }
  };

  const handleForgeBoard = () =>
    runWithGlobeSpin(async () => {
      const res = await axios.post(`${API_BASE_URL}/bingo/forge`);
      if (res.data?.success) {
        applyServerState(res.data.data);
        setTargetedAction(null);
        setUnrolledClaimedMap({});
        setInfoBanner('📜 Os 16 pergaminhos foram distribuídos na mesa! Conclua missões, lacre fileiras (+75 XP) ou conquiste o Grande Sinete (+200 XP).');
        dispatchBingoSync();
      }
    });

  const handleArchiveBoard = (boardId) =>
    runMutation(async () => {
      const res = await axios.post(`${API_BASE_URL}/bingo/archive`, { boardId });
      if (res.data?.success) {
        applyServerState(res.data.data);
        setTargetedAction(null);
        setUnrolledClaimedMap({});
        setInfoBanner('📦 Remessa do mês anterior arquivada! A mesa está livre para os 16 novos contratos.');
        dispatchBingoSync();
      }
    });

  const handleBoardReroll = (boardId) =>
    runWithGlobeSpin(async () => {
      const res = await axios.post(`${API_BASE_URL}/bingo/action`, {
        boardId,
        action: 'board_reroll',
      });
      if (res.data?.success) {
        applyServerState(res.data.data);
        setTargetedAction(null);
        setInfoBanner('🕯️ Mesa renovada! Todos os contratos já concluídos ou lacrados foram mantidos intactos.');
        dispatchBingoSync();
      }
    });

  const handleClaimReward = (boardId, targetType, targetId = undefined) =>
    runMutation(async () => {
      const res = await axios.post(`${API_BASE_URL}/bingo/claim`, {
        boardId,
        targetType,
        targetId,
      });
      if (res.data?.success) {
        applyServerState(res.data.data, res.data.xpStatus);
        if (res.data.xpGain && res.data.xpStatus) {
          triggerXPGainToast(res.data.xpGain, res.data.xpStatus);
        }
        const gained = Number(res.data.claimedXp || 0);
        const completedAllForMonth =
          !res.data.data?.activeBoard &&
          Number(res.data.data?.wallet?.forgeChips || 0) <= 0;
        if (targetType === 'blackout' || targetType === 'all') {
          playBingoLineSound(targetType === 'blackout');
          markJustStamped(Array.from({ length: 16 }, (_, i) => i));
          setUnrolledClaimedMap({});
        } else if (targetType === 'line') {
          playBingoLineSound(false);
        } else {
          playBingoStampSound();
          if (targetId !== undefined) {
            const idxNum = Number(targetId);
            markJustStamped([idxNum]);
            setUnrolledClaimedMap((prev) => {
              if (!prev[idxNum]) return prev;
              const next = { ...prev };
              delete next[idxNum];
              return next;
            });
          }
        }
        setInfoBanner(
          completedAllForMonth
            ? `🏆 +${gained} XP colhido! Você já completou todos os grimórios desse mês — volte mês que vem!`
            : `✨ Lacre aplicado! +${gained} XP dos Pergaminhos da Guilda colhido!`
        );
        dispatchBingoSync();
      }
    });

  const handleSquareClick = (square) => {
    if (!activeBoard) return;
    const roman = ROMAN_NUMERALS[square.index] || String(square.index + 1);

    if (targetedAction === 'class_power') {
      if (!isSquareEligibleForAction(square, 'class_power', activePowerClass?.id)) return;
      if (activePowerSpec?.targetMode === 'pick_square_and_goal' && !selectedGoalKeyForPower) {
        setErrorMsg('Escolha primeiro no seletor qual missão do Grimório deseja escrever neste pergaminho!');
        return;
      }
      runMutation(async () => {
        const res = await axios.post(`${API_BASE_URL}/bingo/class-power`, {
          classId: activePowerClass?.id,
          boardId: activeBoard.id,
          squareIndex: square.index,
          chosenGoalKey:
            activePowerSpec?.targetMode === 'pick_square_and_goal'
              ? selectedGoalKeyForPower
              : undefined,
        });
        if (res.data?.success && res.data?.data) {
          const payload = res.data.data;
          playBingoStampSound();
          if (payload.status) applyServerState(payload.status);
          if (payload.classPowerWallet) setClassPowerWallet(payload.classPowerWallet);
          setTargetedAction(null);
          setSelectedGoalKeyForPower('');
          setInfoBanner(payload.message || `⚡ Poder aplicado no Contrato #${roman}!`);
          dispatchClassPowerSync();
          dispatchBingoSync();
        }
      });
      return;
    }

    if (targetedAction === 'lab_complete') {
      if (square.completed || square.claimed) return;
      runMutation(async () => {
        const res = await axios.post(`${API_BASE_URL}/bingo/lab/simulate`, {
          boardId: activeBoard.id,
          mode: 'complete_square',
          squareIndex: square.index,
        });
        if (res.data?.success) {
          playBingoStampSound();
          applyServerState(res.data.data);
          setInfoBanner(`🧪 Contrato #${roman} (${square.title}) concluído no Lab! Agora lacre para colher XP.`);
          dispatchBingoSync();
        }
      });
      return;
    }

    if (targetedAction) {
      if (!isSquareEligibleForAction(square, targetedAction)) return;
      const actionToRun = targetedAction;
      runMutation(async () => {
        const res = await axios.post(`${API_BASE_URL}/bingo/action`, {
          boardId: activeBoard.id,
          action: actionToRun,
          squareIndex: square.index,
        });
        if (res.data?.success) {
          playBingoStampSound();
          applyServerState(res.data.data);
          setTargetedAction(null);
          const actionMsg =
            actionToRun === 'square_reroll'
              ? `✒️ Contrato #${roman} substituído por outro pergaminho!`
              : actionToRun === 'upgrade'
                ? `🔥 Sinete +Dif aplicado no Contrato #${roman}!`
                : `❄️ Pena -Dif aplicada no Contrato #${roman}!`;
          setInfoBanner(actionMsg);
          dispatchBingoSync();
        }
      });
      return;
    }

    if (square.completed && !square.claimed) {
      handleClaimReward(activeBoard.id, 'square', square.index);
    }
  };

  const handleLabGrantChip = (chipType) =>
    runMutation(async () => {
      const res = await axios.post(`${API_BASE_URL}/bingo/lab/grant-chip`, { chipType, amount: 1 });
      if (res.data?.success) {
        applyServerState(res.data.data);
        setInfoBanner(
          chipType === 'all'
            ? '🧪 +1 de TODAS as 5 fichas adicionadas na mesa!'
            : `🧪 +1 ficha Lab (${chipType}) adicionada!`
        );
      }
    });

  const handleLabSimulate = (mode) => {
    if (!activeBoard) return;
    runMutation(async () => {
      const res = await axios.post(`${API_BASE_URL}/bingo/lab/simulate`, {
        boardId: activeBoard.id,
        mode,
      });
      if (res.data?.success) {
        playBingoStampSound();
        applyServerState(res.data.data);
        setInfoBanner('🧪 Simulação executada! Lacre os pergaminhos ou fileiras prontas para testar som e selo.');
        dispatchBingoSync();
      }
    });
  };

  const handleLabSimulateMonth = () =>
    runMutation(async () => {
      const res = await axios.post(`${API_BASE_URL}/bingo/lab/simulate-month`);
      if (res.data?.success) {
        applyServerState(res.data.data);
        setInfoBanner('📅 Virada de mês simulada! O estoque acumulou fichas mensais e a mesa ativa ficou marcada como mês anterior.');
        dispatchBingoSync();
      }
    });

  const handleLabReset = () =>
    runMutation(async () => {
      const res = await axios.post(`${API_BASE_URL}/bingo/lab/reset`);
      if (res.data?.success) {
        applyServerState(res.data.data, res.data.xpStatus);
        setTargetedAction(null);
        setUnrolledClaimedMap({});
        setInfoBanner('♻️ Lab resetado: mesas limpas e fichas restauradas para o ciclo inicial.');
        dispatchBingoSync();
      }
    });

  if (loading && !statusData) {
    return (
      <div className="min-h-[45vh] flex flex-col items-center justify-center gap-3 bingo-parchment-font">
        <ScrollText className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-xs text-[#d4b483]">Preparando a mesa da Taberna da Guilda...</p>
      </div>
    );
  }

  const wallet = statusData?.wallet || {
    monthKey: '',
    nextResetLabel: '01 do mês (Brasília)',
    forgeChips: 1,
    maxForgeChips: 3,
    boardRerollChips: 1,
    maxBoardRerollChips: 3,
    squareRerollChips: 2,
    maxSquareRerollChips: 4,
    upgradeChips: 1,
    maxUpgradeChips: 3,
    downgradeChips: 1,
    maxDowngradeChips: 3,
  };
  const activeBoard = statusData?.activeBoard || null;
  const history = Array.isArray(statusData?.history) ? statusData.history : [];
  const xpSummary = statusData?.xpSummary || { totalXp: 0, completedBoardsCount: 0, claimedRewardsCount: 0 };
  const goalCatalog = Array.isArray(statusData?.goalCatalog) ? statusData.goalCatalog : [];

  const boardData = activeBoard?.board || null;

  const activePowerClass =
    ALL_CINEMA_CLASSES.find((c) => c.id === equippedClassId) || ALL_CINEMA_CLASSES[0];
  const activePowerSpec = getClassPowers(activePowerClass?.id)?.powers?.bingo;
  const activePowerTier =
    POWER_TIER_META[activePowerSpec?.tier] || POWER_TIER_META.support;
  const bingoPowerCharges = Number(classPowerWallet?.bingoCharges ?? 0);
  const maxBingoPowerCharges = Number(classPowerWallet?.maxBingoCharges ?? 2);
  const usedBoardGoalKeys = new Set((boardData?.squares || []).map((sq) => sq.goalKey));
  const availableGrimorioChoices = goalCatalog.filter((g) => !usedBoardGoalKeys.has(g.key));
  const eligibleSquaresCount = (boardData?.squares || []).filter((sq) =>
    isSquareEligibleForAction(sq, 'class_power', activePowerClass?.id)
  ).length;

  const handleActivateInstantBingoPower = async () => {
    if (!activeBoard || !activePowerClass || acting || actingClassPower) return;
    setActingClassPower(true);
    setErrorMsg('');
    setInfoBanner('');
    try {
      const res = await axios.post(`${API_BASE_URL}/bingo/class-power`, {
        classId: activePowerClass.id,
        boardId: activeBoard.id,
      });
      if (res.data?.success && res.data?.data) {
        const payload = res.data.data;
        playBingoStampSound();
        if (payload.status) applyServerState(payload.status);
        if (payload.classPowerWallet) setClassPowerWallet(payload.classPowerWallet);
        setTargetedAction(null);
        setInfoBanner(payload.message || '⚡ Poder da classe ativado nos Pergaminhos!');
        dispatchClassPowerSync();
        dispatchBingoSync();
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao ativar poder nos Pergaminhos.');
    } finally {
      setActingClassPower(false);
    }
  };

  const handleLabGrantClassPower = async () => {
    if (acting || actingClassPower) return;
    setActingClassPower(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/class-powers/lab/grant`, {
        mode: 'bingo',
      });
      if (res.data?.success && res.data?.data) {
        setClassPowerWallet(res.data.data);
        setInfoBanner('⚡ +1 Carga de Poder da Classe (Pergaminhos) adicionada no Lab!');
        dispatchClassPowerSync();
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || err?.message || 'Erro ao conceder carga de classe.');
    } finally {
      setActingClassPower(false);
    }
  };
  const squares = Array.isArray(boardData?.squares) ? boardData.squares : [];
  const lines = Array.isArray(boardData?.lines) ? boardData.lines : [];
  const lineById = new Map(lines.map((l) => [l.id, l]));
  const blackout = boardData?.blackout || { completed: false, claimed: false, xpReward: 200, xpAwarded: 0 };

  const hoveredSet = new Set(hoveredLineIndices || []);
  const isBoardFromPastMonth = Boolean(activeBoard && wallet.monthKey && activeBoard.monthKey !== wallet.monthKey);
  const currentMonthCompletedBoards = history.filter(
    (hb) => hb.monthKey === wallet.monthKey && hb.status === 'completed'
  );
  const currentMonthBoardCount = currentMonthCompletedBoards.length;
  const currentMonthTotalXp = currentMonthCompletedBoards.reduce(
    (acc, hb) => acc + Number(hb.xpAwarded || 0),
    0
  );
  const hasCompletedCurrentMonth = currentMonthBoardCount > 0;
  const isMonthCompletedAllDone = !activeBoard && wallet.forgeChips <= 0 && hasCompletedCurrentMonth;
  const nextMonthCountdownLabel = isMonthCompletedAllDone ? getNextMonthCountdownLabel() : null;
  const claimedSquaresCount = squares.filter((sq) => sq.claimed).length;
  const hasAnyClosedClaimedScroll = squares.some((sq) => sq.claimed && !unrolledClaimedMap[sq.index]);
  const handleToggleAllClaimedScrolls = () => {
    const claimedSquares = squares.filter((sq) => sq.claimed);
    if (claimedSquares.length === 0) return;
    if (hasAnyClosedClaimedScroll) {
      const next = {};
      claimedSquares.forEach((sq) => {
        next[sq.index] = true;
      });
      setUnrolledClaimedMap(next);
    } else {
      setUnrolledClaimedMap({});
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* CABEÇALHO DA MESA DOS PERGAMINHOS DA GUILDA */}
      <section className="bingo-parchment-sheet bingo-parchment-font rounded-3xl border-2 border-[#6e4e2e] p-5 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg sm:text-2xl font-black text-[#faf0dc] flex items-center gap-2 tracking-tight">
                <span>📜</span>
                <span>Pergaminhos da Guilda 4×4</span>
              </h2>
              <span
                onDoubleClick={() => toggleLabTools()}
                title="Duplo clique ou Alt+L para alternar Laboratório"
                className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#1a1008]/90 border border-[#8b6339]/60 text-[#f2d6a2] select-none cursor-pointer"
              >
                📅 {formatCycleKeyLabel(wallet.monthKey, { fallback: 'Mês Atual' })} • Renova {wallet.nextResetLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black bg-[#3a1f0a]/85 border border-amber-400/50 text-amber-200">
                ⚡ +{Number(xpSummary.totalXp || 0).toLocaleString('pt-BR')} XP Colhidos
              </span>
            </div>
            <p className="text-xs text-[#d4b483] mt-1">
              {isMonthCompletedAllDone ? (
                <>
                  🏆 Você já gabaritou todos os grimórios de <strong className="text-emerald-300">{formatCycleKeyLabel(wallet.monthKey, { fallback: 'Mês Atual' })}</strong>! Novos contratos abrem em <strong className="text-amber-200">{wallet.nextResetLabel}</strong>.
                </>
              ) : (
                <>
                  Remessa mensal de 16 contratos: cumpra objetivos no catálogo, feche fileiras da mesa (<strong className="text-amber-300">+75 XP</strong> cada) ou conquiste o Grande Sinete 16/16 (<strong className="text-amber-200">+200 XP</strong>)!
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showLabTools && (
              <button
                type="button"
                onClick={() => toggleLabTools(false)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border cursor-pointer transition-colors bg-fuchsia-500/25 text-fuchsia-100 border-fuchsia-400/65 shadow-[0_0_16px_rgba(217,70,239,0.28)]"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Ocultar Lab
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowGoalCatalog(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#1a1008]/90 hover:bg-[#2a1a0e] text-amber-200 border border-[#8b6339]/65 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Grimório ({statusData?.goalCatalogCount || goalCatalog.length})
            </button>
            <button
              type="button"
              onClick={() => loadStatus()}
              disabled={loading || acting}
              className="p-2 rounded-xl bg-[#1a1008]/90 hover:bg-[#2a1a0e] text-[#e8d5b5] border border-[#6e4e2e]/70 cursor-pointer disabled:opacity-50"
              title="Atualizar Pergaminhos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ESTOQUE DE FICHAS MENSAIS DA GUILDA */}
        <BingoBankerWalletStrip wallet={wallet} />

        {/* LABORATÓRIO DE TESTES DOS PERGAMINHOS */}
        {showLabTools && (
          <div className="rounded-2xl border border-fuchsia-400/45 bg-[#120b09]/90 p-3.5 flex flex-col gap-2.5 shadow-inner font-sans">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-fuchsia-200 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5" />
                Laboratório dos Pergaminhos (Testes Instantâneos)
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Atalho: Alt+L</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10.5px] font-bold text-zinc-300 mr-1">Fichas:</span>
              {[
                { key: 'all', label: '+1 Todas Fichas', hi: true },
                { key: 'forge', label: '+1 Remessa' },
                { key: 'board_reroll', label: '+1 Trocar Mesa' },
                { key: 'square_reroll', label: '+1 Trocar Contrato' },
                { key: 'upgrade', label: '+1 +Dif' },
                { key: 'downgrade', label: '+1 -Dif' },
              ].map((btn) => (
                <button
                  key={btn.key}
                  type="button"
                  disabled={acting}
                  onClick={() => handleLabGrantChip(btn.key)}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-black border cursor-pointer disabled:opacity-45 ${
                    btn.hi
                      ? 'bg-fuchsia-500/30 hover:bg-fuchsia-500/45 text-white border-fuchsia-300/70'
                      : 'bg-fuchsia-500/15 hover:bg-fuchsia-500/30 text-fuchsia-100 border-fuchsia-400/40'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
              <button
                type="button"
                disabled={acting || actingClassPower}
                onClick={handleLabGrantClassPower}
                className="px-2.5 py-1 rounded-lg text-[10.5px] font-black border cursor-pointer disabled:opacity-45 bg-purple-500/20 hover:bg-purple-500/35 text-purple-100 border-purple-400/55"
                title="Adicionar +1 carga de Poder de Classe para os Pergaminhos"
              >
                ⚡ +1 Poder Classe
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/10">
              <span className="text-[10.5px] font-bold text-zinc-300 mr-1">Simular:</span>
              {activeBoard && (
                <>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => handleLabSimulate('complete_square')}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-100 border border-emerald-400/45 cursor-pointer disabled:opacity-45"
                  >
                    ⚡ Concluir 1 Contrato
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() =>
                      setTargetedAction((prev) => (prev === 'lab_complete' ? null : 'lab_complete'))
                    }
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-black border cursor-pointer disabled:opacity-45 ${
                      targetedAction === 'lab_complete'
                        ? 'bg-fuchsia-400 text-slate-950 border-fuchsia-200'
                        : 'bg-sky-500/20 hover:bg-sky-500/35 text-sky-100 border-sky-400/45'
                    }`}
                  >
                    <Target className="w-3 h-3" />
                    {targetedAction === 'lab_complete' ? 'Cancelar Clique Contrato' : 'Clicar no Contrato p/ Concluir'}
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => handleLabSimulate('complete_line')}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-amber-500/20 hover:bg-amber-500/35 text-amber-100 border border-amber-400/45 cursor-pointer disabled:opacity-45"
                  >
                    🏅 Fechar 1 Fileira
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => handleLabSimulate('almost_blackout')}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-orange-500/20 hover:bg-orange-500/35 text-orange-100 border border-orange-400/45 cursor-pointer disabled:opacity-45"
                  >
                    👑 Deixar 15/16
                  </button>
                  <button
                    type="button"
                    disabled={acting}
                    onClick={() => handleLabSimulate('advance_all')}
                    className="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-100 border border-cyan-400/45 cursor-pointer disabled:opacity-45"
                  >
                    📈 +1 em Todos
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={acting}
                onClick={handleLabSimulateMonth}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-100 border border-indigo-400/50 cursor-pointer disabled:opacity-45"
              >
                <CalendarClock className="w-3 h-3" />
                Simular Virada de Mês
              </button>
              <button
                type="button"
                disabled={acting}
                onClick={handleLabReset}
                className="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-rose-500/20 hover:bg-rose-500/35 text-rose-100 border border-rose-400/45 cursor-pointer disabled:opacity-45"
              >
                ♻️ Reset Lab
              </button>
            </div>
          </div>
        )}
      </section>

      {errorMsg && (
        <div className="rounded-2xl border border-rose-500/50 bg-rose-950/50 px-4 py-3 text-xs text-rose-200 flex items-center justify-between gap-2">
          <span>⚠️ {errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg('')} className="text-rose-300 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {infoBanner && (
        <div className="rounded-2xl border border-emerald-500/45 bg-emerald-950/40 px-4 py-2.5 text-xs text-emerald-200 flex items-center justify-between gap-2">
          <span>{infoBanner}</span>
          <button type="button" onClick={() => setInfoBanner('')} className="text-emerald-300 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BANNER DE CONTRATOS PRONTOS PARA LACRAR & COLHER XP */}
      {activeBoard && activeBoard.readyToClaimCount > 0 && (
        <section className="rounded-3xl border-2 border-amber-400 bg-gradient-to-r from-[#3b1c0b] via-[#261409] to-[#1a1008] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_32px_rgba(245,158,11,0.3)] bingo-parchment-font">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bingo-wax-seal flex items-center justify-center text-lg text-amber-100 animate-pulse shrink-0">
              ⚜️
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-200 uppercase tracking-wide">
                ⚜️ {activeBoard.readyToClaimCount} Lacre(s) Pronto(s) na Mesa!
              </h3>
              <p className="text-xs text-[#f2d6a2]/85">
                Lacre os pergaminhos ou fileiras douradas da mesa, ou recolha tudo de uma só vez.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={acting}
            onClick={() => handleClaimReward(activeBoard.id, 'all')}
            className="shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#991b1b] via-[#b45309] to-[#d97706] hover:brightness-110 text-[#fef3c7] border border-amber-300/70 shadow-lg cursor-pointer disabled:opacity-50"
          >
            ⚜️ Lacrar Tudo (+{activeBoard.readyToClaimXp} XP)
          </button>
        </section>
      )}

      {/* FORJA DO SINETE OU MESA DE PERGAMINHOS 4×4 */}
      {spinningGlobe ? (
        <section className="bingo-parchment-sheet bingo-parchment-font rounded-3xl border-2 border-[#8b6339]/80 p-8 flex flex-col items-center justify-center text-center shadow-2xl">
          <GuildScrollForgeDisplay
            isForging
            label="🕯️ Lacrando e Distribuindo os 16 Pergaminhos na Mesa da Taberna..."
          />
        </section>
      ) : isMonthCompletedAllDone ? (
        <section className="bingo-parchment-sheet bingo-sanctum-card bingo-parchment-font rounded-3xl border-2 border-emerald-400/55 p-7 sm:p-10 flex flex-col items-center justify-center text-center gap-5 shadow-2xl">
          <GuildCompletedGrimoireDisplay monthKey={wallet.monthKey} />

          <div className="max-w-xl flex flex-col items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-black text-[#fef3c7] tracking-tight leading-snug">
              Você já completou todos os grimórios desse mês — volte mês que vem!
            </h3>
            <p className="text-xs sm:text-sm text-[#e6cca1] leading-relaxed">
              Os escribas selaram o cofre de <strong className="text-emerald-300">{formatCycleKeyLabel(wallet.monthKey, { fallback: 'Mês Atual' })}</strong> com lacre real e recolheram todos os pergaminhos da taverna. Aproveite os filmes do catálogo, troféus e demais desafios até o próximo ciclo!
            </p>
          </div>

          <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left font-sans">
            <div className="rounded-2xl border border-emerald-400/35 bg-black/35 px-3.5 py-2.5 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-base shrink-0">
                📖
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/90">
                  Grimórios no Mês
                </div>
                <div className="text-xs font-black text-white truncate">
                  {currentMonthBoardCount} × 16/16 Gabaritada
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-400/35 bg-black/35 px-3.5 py-2.5 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-base shrink-0">
                ⚡
              </span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90">
                  Colheita de {formatCycleKeyLabel(wallet.monthKey, { short: true, fallback: 'Mês Atual' })}
                </div>
                <div className="text-xs font-black text-amber-200 truncate">
                  +{currentMonthTotalXp.toLocaleString('pt-BR')} XP Selado
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-400/35 bg-black/35 px-3.5 py-2.5 flex items-center gap-2.5">
              <CalendarClock className="w-8 h-8 p-1.5 rounded-xl bg-sky-500/15 border border-sky-400/35 text-sky-300 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300/90">
                  Próxima Abertura
                </div>
                <div className="text-[11px] font-black text-sky-100 truncate" title={wallet.nextResetLabel}>
                  {wallet.nextResetLabel}
                </div>
              </div>
            </div>
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl border border-emerald-400/40 bg-[#0d1f17]/85 text-xs font-bold text-emerald-200 shadow-inner">
            <Lock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>
              Cofre mensal trancado •{' '}
              {nextMonthCountdownLabel ? (
                <strong className="text-amber-200">{nextMonthCountdownLabel}</strong>
              ) : (
                <>
                  Recarga em <strong className="text-amber-200">{wallet.nextResetLabel}</strong>
                </>
              )}
            </span>
          </div>
        </section>
      ) : !activeBoard ? (
        <section className="bingo-parchment-sheet bingo-parchment-font rounded-3xl border-2 border-dashed border-[#8b6339]/75 p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-4 shadow-xl">
          <GuildScrollForgeDisplay
            label={`🕯️ Mesa da Taberna Livre • ${statusData?.goalCatalogCount || 35} Contratos no Grimório`}
          />
          {hasCompletedCurrentMonth && wallet.forgeChips > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/45 text-[11px] font-bold text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Você já gabaritou {currentMonthBoardCount} grimório(s) em {formatCycleKeyLabel(wallet.monthKey, { fallback: 'Mês Atual' })} — e possui {wallet.forgeChips} ficha(s) extra(s) acumulada(s)!
            </div>
          )}
          <div className="max-w-lg -mt-1">
            <h3 className="text-lg sm:text-xl font-black text-[#faf0dc]">
              Abra sua Remessa Mensal de 16 Pergaminhos!
            </h3>
            <p className="text-xs text-[#d4b483] mt-1 leading-relaxed">
              Apenas <strong>1 mesa de contratos ativa por vez</strong> (4×4 = 16 missões amplas do catálogo). Lacre pergaminhos concluídos, feche qualquer das 10 fileiras (<strong className="text-amber-300">+75 XP</strong>) ou conquiste o Grande Sinete 16/16 (<strong className="text-amber-200">+200 XP</strong>)!
            </p>
          </div>
          <button
            type="button"
            disabled={acting || wallet.forgeChips <= 0}
            onClick={handleForgeBoard}
            className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-[#7f1d1d] via-[#b45309] to-[#d97706] hover:brightness-110 text-[#fef3c7] border border-amber-300/75 shadow-[0_0_28px_rgba(180,83,9,0.45)] cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
          >
            📜 Romper Lacre &amp; Abrir 16 Pergaminhos ({wallet.forgeChips}/{wallet.maxForgeChips})
          </button>
          {wallet.forgeChips <= 0 && (
            <p className="text-[11px] text-amber-300 font-mono">
              Sem ficha de nova remessa no momento. Próxima recarga mensal: {wallet.nextResetLabel}.
            </p>
          )}
        </section>
      ) : (
        <div className="flex flex-col gap-4">
          {isBoardFromPastMonth && (
            <div className="rounded-2xl border border-amber-400/60 bg-amber-950/45 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-amber-100">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  Esta mesa pertence ao mês anterior (<strong>{formatCycleKeyLabel(activeBoard.monthKey)}</strong>). Continue completando os contratos ou arquive para abrir a de <strong>{formatCycleKeyLabel(wallet.monthKey)}</strong>.
                </span>
              </div>
              <button
                type="button"
                disabled={acting}
                onClick={() => handleArchiveBoard(activeBoard.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-400 text-slate-950 hover:brightness-110 cursor-pointer disabled:opacity-50"
              >
                <Archive className="w-3.5 h-3.5" />
                Arquivar Remessa Antiga
              </button>
            </div>
          )}

          {/* PODER DA CLASSE NOS PERGAMINHOS DA GUILDA */}
          {activePowerSpec && (
            <div className={`rounded-2xl border p-3.5 sm:p-4 flex flex-col gap-3 bingo-parchment-font ${activePowerTier.cardTone}`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                    {activePowerSpec.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                        ⚡ Poder da Classe • Pergaminhos da Guilda
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${activePowerTier.badgeTone}`}>
                        {activePowerTier.badge}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border ${
                          bingoPowerCharges > 0
                            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                        }`}
                        title={classPowerWallet?.nextResetMonthLabel ? `Recarga: ${classPowerWallet.nextResetMonthLabel}` : undefined}
                      >
                        ⚡ Cargas: {bingoPowerCharges}/{maxBingoPowerCharges} (mensal)
                      </span>
                    </div>
                    <div className="text-sm font-black text-white flex flex-wrap items-center gap-2">
                      <span>{activePowerSpec.title}</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-950/90 border border-zinc-700 text-xs font-bold text-amber-200">
                        <span>{activePowerClass?.classIcon}</span>
                        <span>{activePowerClass?.className}</span>
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{activePowerSpec.desc}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {activePowerSpec.targetMode === 'pick_square_and_goal' && (
                    <select
                      value={selectedGoalKeyForPower}
                      onChange={(e) => setSelectedGoalKeyForPower(e.target.value)}
                      aria-label="Selecionar missão do Grimório para a Super Ficha"
                      className="px-3 py-2 rounded-xl bg-zinc-950/90 border border-amber-400/55 text-xs font-bold text-amber-200 max-w-[260px] focus:outline-none focus:border-amber-300"
                    >
                      <option value="">Escolha a missão do Grimório...</option>
                      {availableGrimorioChoices.map((g) => (
                        <option key={g.key} value={g.key}>
                          {g.icon} {g.normal?.title || g.key} ({g.normal?.target || 1}× • +{g.normal?.xpReward || 0} XP)
                        </option>
                      ))}
                    </select>
                  )}

                  {activePowerSpec.targetMode === 'instant' ? (
                    <button
                      type="button"
                      disabled={acting || actingClassPower || bingoPowerCharges <= 0}
                      onClick={handleActivateInstantBingoPower}
                      className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 shadow-lg cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                    >
                      {actingClassPower ? 'Ativando...' : '⚡ Ativar Poder Agora'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        acting ||
                        actingClassPower ||
                        bingoPowerCharges <= 0 ||
                        eligibleSquaresCount === 0 ||
                        (activePowerSpec.targetMode === 'pick_square_and_goal' && !selectedGoalKeyForPower)
                      }
                      onClick={() =>
                        setTargetedAction((prev) => (prev === 'class_power' ? null : 'class_power'))
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                        targetedAction === 'class_power'
                          ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.45)] animate-pulse'
                          : 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 border-amber-200 shadow'
                      }`}
                    >
                      {eligibleSquaresCount === 0
                        ? 'Sem Pergaminhos Elegíveis na Mesa'
                        : targetedAction === 'class_power'
                          ? `🎯 Clique num Pergaminho Iluminado (${eligibleSquaresCount})...`
                          : `🎯 Mirar Pergaminho na Mesa (${eligibleSquaresCount})`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* UTENSÍLIOS DO CARTÓRIO DA GUILDA */}
          <div className="rounded-2xl border border-[#6e4e2e]/60 bg-[#1a1008]/90 px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 bingo-parchment-font">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-200">
                🧰 Utensílios do Cartório:
              </span>
              {targetedAction && (
                <span className="text-[11px] text-amber-100 bg-amber-500/15 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                  <strong>{TARGET_ACTION_META[targetedAction].label}:</strong> {TARGET_ACTION_META[targetedAction].hint}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {targetedAction && (
                <button
                  type="button"
                  onClick={() => setTargetedAction(null)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                >
                  ✖ Cancelar Modo
                </button>
              )}
              <button
                type="button"
                disabled={acting || wallet.squareRerollChips <= 0}
                onClick={() => setTargetedAction((prev) => (prev === 'square_reroll' ? null : 'square_reroll'))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                  targetedAction === 'square_reroll'
                    ? 'bg-sky-400 text-slate-950 border-sky-200'
                    : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 border-sky-400/45'
                }`}
              >
                <Dices className="w-3.5 h-3.5" />
                Trocar 1 Contrato ({wallet.squareRerollChips}/{wallet.maxSquareRerollChips})
              </button>

              <button
                type="button"
                disabled={acting || wallet.upgradeChips <= 0}
                onClick={() => setTargetedAction((prev) => (prev === 'upgrade' ? null : 'upgrade'))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                  targetedAction === 'upgrade'
                    ? 'bg-orange-400 text-slate-950 border-orange-200'
                    : 'bg-orange-500/15 hover:bg-orange-500/25 text-orange-200 border-orange-400/45'
                }`}
              >
                <ArrowUpCircle className="w-3.5 h-3.5" />
                +Dif ({wallet.upgradeChips}/{wallet.maxUpgradeChips})
              </button>

              <button
                type="button"
                disabled={acting || wallet.downgradeChips <= 0}
                onClick={() => setTargetedAction((prev) => (prev === 'downgrade' ? null : 'downgrade'))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                  targetedAction === 'downgrade'
                    ? 'bg-emerald-400 text-slate-950 border-emerald-200'
                    : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border-emerald-400/45'
                }`}
              >
                <ArrowDownCircle className="w-3.5 h-3.5" />
                -Dif ({wallet.downgradeChips}/{wallet.maxDowngradeChips})
              </button>

              <button
                type="button"
                disabled={acting || wallet.boardRerollChips <= 0 || activeBoard.completedSquaresCount >= 16}
                onClick={() => handleBoardReroll(activeBoard.id)}
                title="Reescreve apenas os contratos em aberto; pergaminhos concluídos permanecem intactos!"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-[#3a210f] hover:bg-[#4e2d15] text-[#f5deb3] border border-[#b8894c]/60 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Trocar Mesa ({wallet.boardRerollChips}/{wallet.maxBoardRerollChips})
              </button>
            </div>
          </div>

          {/* MESA ESCURA DE TABERNA 4×4 COM 16 MINI-PERGAMINHOS */}
          <section className="relative overflow-hidden rounded-[2rem] border-2 p-4 sm:p-6 flex flex-col gap-3.5 bingo-parchment-sheet bingo-parchment-font border-[#5a3b20] text-[#f2e2c4]">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1.5 border-b border-[#6e4e2e]/40 text-[10.5px] font-serif italic text-[#c9a36b]">
              <span>🕯️ Mesa de Contratos da Taberna — Quatro Fileiras de Desafios</span>
              <span>Pergaminhos concluídos ficam enrolados e lacrados; clique neles para ler</span>
            </div>

            {/* Cabeçalho da Remessa */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-dashed border-[#6e4e2e]/65">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg border text-[11px] font-black bg-[#26190e]/90 border-[#6e4e2e]/75 text-[#f2e2c4] font-serif">
                  REMESSA Nº {formatTicketSerial(activeBoard.id)}
                </span>
                <span className="text-xs font-bold text-[#d4b483] font-serif italic">
                  EDIÇÃO {formatCycleKeyLabel(activeBoard.monthKey).toUpperCase()} • {activeBoard.completedSquaresCount}/16 LACRADOS
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {claimedSquaresCount > 0 && (
                  <button
                    type="button"
                    onClick={handleToggleAllClaimedScrolls}
                    className="px-2.5 py-1 rounded-lg border border-[#8b6339]/75 bg-[#26190e]/90 hover:border-amber-300 text-[#f2d6a2] font-serif text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    {hasAnyClosedClaimedScroll ? '📜 Abrir Todos os Lacrados' : '📜 Enrolar Todos'}
                  </button>
                )}
                {['diag_main', 'diag_anti'].map((diagId) => {
                  const diag = lineById.get(diagId);
                  if (!diag) return null;
                  return (
                    <LineBadgeButton
                      key={diagId}
                      line={diag}
                      compactLabel={diagId === 'diag_main' ? '↘ Diag.' : '↙ Diag.'}
                      acting={acting}
                      onHoverLine={setHoveredLineIndices}
                      onClaimLine={(id) => handleClaimReward(activeBoard.id, 'line', id)}
                    />
                  );
                })}
                <span className="px-2.5 py-1 rounded-lg border text-[11px] font-black bg-[#26190e]/90 border-[#6e4e2e]/70 text-amber-300 font-serif">
                  +{Number(activeBoard.xpAwarded || 0)} XP na Mesa
                </span>
              </div>
            </div>

            {/* GRADE 4×4 + SELOS LATERAIS DE FILEIRA */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_76px] gap-2.5 items-stretch">
              <div className="flex flex-col gap-2">
                {/* CORPO DA MESA (16 PERGAMINHOS) */}
                <div className="relative rounded-2xl border-2 p-2 shadow-inner border-[#4a311a]/80 bg-[#1a1008]/65">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {squares.map((sq) => (
                      <ParchmentContractTile
                        key={`cell_${sq.index}`}
                        square={sq}
                        targetedAction={targetedAction}
                        activePowerClassId={activePowerClass?.id}
                        isHoveredLineMember={hoveredSet.has(sq.index)}
                        justStamped={Boolean(justStampedSet[sq.index])}
                        acting={acting}
                        isScrollOpen={Boolean(unrolledClaimedMap[sq.index])}
                        onSquareClick={handleSquareClick}
                        onToggleScrollOpen={handleToggleClaimedScroll}
                      />
                    ))}
                  </div>
                </div>

                {/* 4 SELOS DE COLUNA VERTICAL ALINHADOS NA BASE */}
                <div className="grid grid-cols-4 gap-2">
                  {['col_0', 'col_1', 'col_2', 'col_3'].map((colId, cIdx) => {
                    const colLine = lineById.get(colId);
                    if (!colLine) return null;
                    return (
                      <LineBadgeButton
                        key={colId}
                        line={colLine}
                        compactLabel={`↓ Col ${cIdx + 1}`}
                        acting={acting}
                        onHoverLine={setHoveredLineIndices}
                        onClaimLine={(id) => handleClaimReward(activeBoard.id, 'line', id)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* 4 SELOS DE FILEIRA HORIZONTAL ALINHADOS À DIREITA */}
              <div className="flex lg:flex-col justify-between gap-2 lg:py-2 lg:pb-[38px]">
                {['row_0', 'row_1', 'row_2', 'row_3'].map((rowId, rIdx) => {
                  const rowLine = lineById.get(rowId);
                  if (!rowLine) return null;
                  return (
                    <div key={rowId} className="flex-1 flex items-center">
                      <div className="w-full h-full flex items-center">
                        <LineBadgeButton
                          line={rowLine}
                          compactLabel={`L${rIdx + 1}`}
                          acting={acting}
                          onHoverLine={setHoveredLineIndices}
                          onClaimLine={(id) => handleClaimReward(activeBoard.id, 'line', id)}
                          fullWidth
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RODAPÉ DA MESA: GRANDE SINETE 16/16 */}
            <div
              className={`mt-1 rounded-2xl border-2 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                blackout.claimed
                  ? 'border-[#9a3412] bg-[#2a150b]/95 shadow-[0_0_24px_rgba(180,83,9,0.28)]'
                  : blackout.completed
                    ? 'border-amber-400 bg-gradient-to-r from-[#4a2c0f] to-[#2e1b0a] shadow-[0_0_24px_rgba(245,158,11,0.35)]'
                    : 'border-[#6e4e2e]/65 bg-[#24180d]/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 shrink-0 text-amber-400" />
                <div>
                  <div className="text-xs sm:text-sm font-black text-[#f5e6cb] font-serif">
                    GRANDE SINETE DA GUILDA • MESA COMPLETA (16/16)
                  </div>
                  <div className="text-[11px] text-[#d4b483] font-serif">
                    {activeBoard.completedSquaresCount}/16 contratos lacrados • Bônus de encerramento: +{blackout.xpReward} XP
                  </div>
                </div>
              </div>

              {blackout.claimed ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black bg-[#6c1d13] border-[#9a3412] text-[#fde68a] font-serif">
                  <CheckCircle2 className="w-4 h-4" />
                  Grande Sinete Conquistado (+{blackout.xpAwarded || blackout.xpReward} XP)
                </span>
              ) : blackout.completed ? (
                <button
                  type="button"
                  disabled={acting}
                  onClick={() => handleClaimReward(activeBoard.id, 'blackout')}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-lg hover:brightness-110 cursor-pointer disabled:opacity-50"
                >
                  👑 Selar Grande Sinete +{blackout.xpReward} XP
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-28 h-2 rounded-full overflow-hidden border bg-[#160d06] border-[#6e4e2e]/60">
                    <div
                      className="h-full transition-all bg-gradient-to-r from-[#9a3412] to-[#d97706]"
                      style={{ width: `${Math.round((activeBoard.completedSquaresCount / 16) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-amber-300 font-serif">
                    +{blackout.xpReward} XP
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* HISTÓRICO DE REMESSAS PASSADAS */}
      {history.length > 0 && (
        <section className="bingo-parchment-sheet bingo-parchment-font rounded-3xl border border-[#6e4e2e]/75 p-4 sm:p-5 flex flex-col gap-3">
          <h3 className="text-sm font-black text-[#faf0dc] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Arquivo de Remessas da Guilda ({history.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {history.map((hb) => (
              <div
                key={`hist_${hb.id}`}
                className="rounded-2xl border border-[#6e4e2e]/60 bg-[#22150a]/85 p-3 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-black text-[#f8ead0]">
                    Remessa #{formatTicketSerial(hb.id)} • {formatCycleKeyLabel(hb.monthKey, { short: true })}
                  </div>
                  <div className="text-[10.5px] text-[#c9a36b] font-mono">
                    {hb.completedSquaresCount}/16 contratos • {hb.completedLinesCount}/10 fileiras •{' '}
                    {hb.status === 'completed' ? '✅ Gabaritada' : '📦 Arquivada'}
                  </div>
                </div>
                <span className="font-mono text-xs font-black text-amber-300 shrink-0">
                  +{Number(hb.xpAwarded || 0)} XP
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {showGoalCatalog && (
        <BingoGoalCatalogModal catalog={goalCatalog} onClose={() => setShowGoalCatalog(false)} />
      )}
    </div>
  );
}
