import React, { useState, useEffect, useMemo } from 'react';
import { X, Play, RefreshCw, RotateCcw, Sparkles, Check, AlertCircle, Clock, Layers } from 'lucide-react';
import { DUEL_EFFECT_PRESETS } from '../utils/duelEffectPresets';
import {
  triggerPS5TrophyToast,
  triggerPS5ProgressToast,
  triggerTrophyBatch,
  getToastSettings,
  saveToastSettings,
  TIER_THEMES,
} from './PS5TrophyToastContainer';
import { evaluateTrophiesClientSide } from '../utils/trophyEngineClient';
import {
  triggerXPGainToast,
  triggerTimeMachineUnlock,
  triggerWorldChallengeUnlock,
  dispatchXpStatusUpdate,
} from '../utils/xpSystem';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const MOCK_TROPHIES_FOR_SIMULATION = [
  {
    id: 'sim_bronze',
    tier: 'bronze',
    category: 'volta_ao_mundo',
    title: 'É do Brasil!',
    description: 'Conquistar 1 filme do Brasil (1 filme).',
    icon: '🇧🇷',
  },
  {
    id: 'sim_silver',
    tier: 'silver',
    category: 'volta_ao_mundo',
    title: 'No Futebol Eles São Bons, e no Cinema?',
    description: 'Conquistar os campeões mundiais: Alemanha, Argentina, Brasil, Espanha, França...',
    icon: '🏆',
  },
  {
    id: 'sim_epic',
    tier: 'epic',
    category: 'volta_ao_mundo',
    title: 'Seu Primeiro Mítico!',
    description: 'Conquistar 1 país com classificação Mítico no Desafio dos 195.',
    icon: '💎',
  },
  {
    id: 'sim_gold',
    tier: 'gold',
    category: 'volta_ao_mundo',
    title: 'Um de Cada!',
    description: 'Conquistar pelo menos 1 país de cada raridade no Desafio dos 195.',
    icon: '🌈',
  },
  {
    id: 'sim_mythic',
    tier: 'mythic',
    category: 'volta_ao_mundo',
    title: 'O Panteão dos 18 Míticos',
    description: 'Conquistar todos os 18 países classificados como Míticos no Desafio dos 195.',
    icon: '⚡',
  },
  {
    id: 'sim_platinum',
    tier: 'platinum',
    category: 'volta_ao_mundo',
    title: 'A Lenda Definitiva do Cinema',
    description: 'Conquistar 100% dos troféus da categoria Volta ao Mundo!',
    icon: '🏆',
  },
];

export default function TrophyTestPanelModal({
  isOpen = true,
  trophies = [],
  movies = [],
  onSyncSuccess,
  _onRefreshData,
  onClose,
}) {
  const [selectedTrophyId, setSelectedTrophyId] = useState(trophies[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [toastSettings, setToastSettings] = useState(getToastSettings);
  const [duelArenaMode, setDuelArenaMode] = useState('both');

  const sampleDuelPairs = useMemo(() => {
    const withPoster = (Array.isArray(movies) ? movies : []).filter((m) => Boolean(m?.poster_url));
    const findMatch = (needle) =>
      withPoster.find((m) => String(m.title || '').toLowerCase().includes(needle));

    const matrix = findMatch('matrix');
    const fightClub = findMatch('clube da luta');
    const movies1999 = withPoster.filter((m) => Number(m.release_year) === 1999);

    const tmNew = matrix || movies1999[0] || withPoster[0];
    const tmOld =
      fightClub ||
      movies1999.find((m) => m.movie_id !== tmNew?.movie_id) ||
      withPoster.find((m) => m.movie_id !== tmNew?.movie_id);

    const monster = findMatch('monster');
    const nobodyKnows =
      findMatch('ninguém pode saber') ||
      findMatch('shoplifters') ||
      findMatch('assunto de família');
    const jpMovies = withPoster.filter(
      (m) => Array.isArray(m.countries) && m.countries.some((c) => /jap[aã]o|japan/i.test(c))
    );

    const wcNew = monster || jpMovies[0] || withPoster[1] || withPoster[0];
    const wcOld =
      nobodyKnows ||
      jpMovies.find((m) => m.movie_id !== wcNew?.movie_id) ||
      withPoster.find((m) => m.movie_id !== wcNew?.movie_id);

    const tmPrevRating = Number(tmOld?.user_rating || 8.95);
    const wcPrevRating = Number(wcOld?.user_rating || 9.01);

    return {
      timeMachine: {
        year: Number(tmNew?.release_year || 1999),
        movieTitle: tmNew?.title || 'Matrix',
        posterUrl: tmNew?.poster_url || null,
        userRating: Math.max(Number(tmNew?.user_rating || 9.65), tmPrevRating + 0.55),
        previousMovieTitle: tmOld?.title || 'Clube da Luta',
        previousPosterUrl: tmOld?.poster_url || null,
        previousUserRating: tmPrevRating,
      },
      worldChallenge: {
        countryCode: 'jp',
        countryName: 'Japão',
        rarity: 'common',
        movieTitle: wcNew?.title || 'Monster',
        posterUrl: wcNew?.poster_url || null,
        userRating: Math.max(Number(wcNew?.user_rating || 9.73), wcPrevRating + 0.5),
        previousMovieTitle: wcOld?.title || 'Ninguém Pode Saber',
        previousPosterUrl: wcOld?.poster_url || null,
        previousUserRating: wcPrevRating,
      },
    };
  }, [movies]);

  // Fecha no ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleUpdateDurationUnlocked = (ms) => {
    const updated = { ...toastSettings, durationUnlocked: ms };
    setToastSettings(updated);
    saveToastSettings(updated);
  };

  const handleUpdateDurationProgress = (ms) => {
    const updated = { ...toastSettings, durationProgress: ms };
    setToastSettings(updated);
    saveToastSettings(updated);
  };

  const handleUpdateMaxProgress = (val) => {
    const updated = { ...toastSettings, maxProgress: val };
    setToastSettings(updated);
    saveToastSettings(updated);
  };

  const simulateSingleToast = (tier) => {
    const item = MOCK_TROPHIES_FOR_SIMULATION.find((m) => m.tier === tier) || {
      id: `sim_${tier}`,
      tier,
      title: `Simulação: Troféu de ${TIER_THEMES[tier]?.name || tier}`,
      description: `Efeito sonoro e HUD translúcido do tier ${TIER_THEMES[tier]?.name || tier}`,
      icon: TIER_THEMES[tier]?.symbol || '🏆',
    };
    triggerPS5TrophyToast(item);
  };

  const simulateCollectibleToast = () => {
    triggerPS5ProgressToast({
      id: 'sim_collectible_47_50',
      category: 'volta_ao_mundo',
      tier: 'gold',
      title: 'Volta ao Mundo: O Panteão dos Continentes',
      description: 'Assistir a filmes de 50 países diferentes ao redor do globo.',
      icon: '🧭',
      currentCount: 47,
      targetCount: 50,
      previousPercentage: 92,
      progress_percentage: 94,
      increasedBy: 1,
    });
  };

  const simulateComboProgressoEConquistado = () => {
    triggerTrophyBatch({
      progressed: [
        {
          id: 'sim_combo_prog_1',
          category: 'volta_ao_mundo',
          tier: 'gold',
          title: 'Volta ao Mundo: Explorador Global',
          description: 'Assistir a filmes de 50 países diferentes.',
          icon: '🧭',
          currentCount: 47,
          targetCount: 50,
          previousPercentage: 92,
          progress_percentage: 94,
          increasedBy: 1,
        },
        {
          id: 'sim_combo_prog_2',
          category: 'dna_cinefilo',
          tier: 'silver',
          title: 'DNA Cinéfilo: Mestre dos Clássicos',
          description: 'Assistir a 10 obras-primas da era de ouro do cinema.',
          icon: '🏛️',
          currentCount: 9,
          targetCount: 10,
          previousPercentage: 80,
          progress_percentage: 90,
          increasedBy: 1,
        },
      ],
      unlocked: [
        {
          id: 'sim_combo_unlocked_1',
          tier: 'gold',
          category: 'volta_ao_mundo',
          title: 'Volta ao Mundo: Soberano das Américas',
          description: '100% dos países da América do Sul e América do Norte conquistados!',
          icon: '🌎',
        },
      ],
    });
  };

  const simulateComboWithXp = () => {
    // 1. Dispara o lote de troféus (1 ouro conquistado + 1 colecionável de progresso)
    triggerTrophyBatch({
      unlocked: [
        {
          id: 'sim_combo_xp_gold',
          tier: 'gold',
          category: 'volta_ao_mundo',
          title: 'Volta ao Mundo: Soberano das Américas',
          description: '100% dos países da América do Sul e América do Norte conquistados!',
          icon: '🌎',
        },
      ],
      progressed: [
        {
          id: 'sim_combo_xp_prog',
          category: 'dna_cinefilo',
          tier: 'silver',
          title: 'DNA Cinéfilo: Mestre dos Clássicos',
          description: 'Assistir a 10 obras-primas da era de ouro do cinema.',
          icon: '🏛️',
          currentCount: 9,
          targetCount: 10,
          previousPercentage: 80,
          progress_percentage: 90,
          increasedBy: 1,
        },
      ],
    });

    // 2. Dispara o ganho total de XP (fica no buffer e só surge triunfante quando todos os troféus saírem da tela)
    triggerXPGainToast({
      gainedXp: 105,
      prevTotalXp: 7300,
      nextTotalXp: 7405,
      prevLevel: 21,
      newLevel: 21,
      prevPercentage: 42,
      newPercentage: 68,
      leveledUp: false,
      levelsGained: 0,
      prevTitle: 'Quantas Armadilhas Você Fez para Chegar Aqui?',
      newTitle: 'Quantas Armadilhas Você Fez para Chegar Aqui?',
      titleChanged: false,
      xpInCurrentLevel: 273,
      xpNeededForNextLevel: 400,
      xpRemaining: 127,
      tags: [
        { type: 'movie', icon: '🎬', label: '+10 XP Filme Cadastrado', xp: 10 },
        { type: 'trophy', icon: '🥇', label: '+70 XP Troféu Ouro', xp: 70, rarityOrTier: 'gold' },
        { type: 'country', icon: '🟢', label: '+25 XP Bônus de Curadoria', xp: 25, rarityOrTier: 'common' },
      ],
    });
  };

  const simulateTimeMachinePortal = (presetKey = 'epic') => {
    const presets = {
      mythic: {
        id: `sim_tm_mythic_${Date.now()}`,
        kind: 'year',
        year: 1941,
        rarity: 'mythic',
        xp: 200,
        movieTitle: 'Cidadão Kane',
        userRating: 9.65,
      },
      legendary: {
        id: `sim_tm_legendary_${Date.now()}`,
        kind: 'year',
        year: 1968,
        rarity: 'legendary',
        xp: 90,
        movieTitle: '2001: Uma Odisseia no Espaço',
        userRating: 9.52,
      },
      epic: {
        id: `sim_tm_epic_${Date.now()}`,
        kind: 'year',
        year: 1985,
        rarity: 'epic',
        xp: 55,
        movieTitle: 'De Volta para o Futuro',
        userRating: 9.78,
      },
      rare: {
        id: `sim_tm_rare_${Date.now()}`,
        kind: 'year',
        year: 2008,
        rarity: 'rare',
        xp: 35,
        movieTitle: 'Batman: O Cavaleiro das Trevas',
        userRating: 9.81,
      },
      common: {
        id: `sim_tm_common_${Date.now()}`,
        kind: 'year',
        year: 2024,
        rarity: 'common',
        xp: 20,
        movieTitle: 'Duna: Parte Dois',
        userRating: 9.44,
      },
      decade: {
        id: `sim_tm_decade_${Date.now()}`,
        kind: 'decade',
        decadeId: '1990s',
        decadeLabel: 'Anos 1990',
        rarity: 'decade_relic',
        xp: 100,
      },
      year_dethrone: {
        id: `sim_tm_dethrone_${Date.now()}`,
        kind: 'year_dethrone',
        year: sampleDuelPairs.timeMachine.year,
        rarity: 'rare',
        xp: 0,
        movieTitle: sampleDuelPairs.timeMachine.movieTitle,
        posterUrl: sampleDuelPairs.timeMachine.posterUrl,
        userRating: sampleDuelPairs.timeMachine.userRating,
        previousMovieTitle: sampleDuelPairs.timeMachine.previousMovieTitle,
        previousPosterUrl: sampleDuelPairs.timeMachine.previousPosterUrl,
        previousUserRating: sampleDuelPairs.timeMachine.previousUserRating,
        winReason: 'higher_rating',
      },
    };
    triggerTimeMachineUnlock([presets[presetKey] || presets.epic], true);
  };

  const simulateWorldChallengeCard = (kind = 'country_unlock') => {
    const sample =
      kind === 'country_dethrone'
        ? {
            id: `sim_wc_dethrone_${Date.now()}`,
            kind: 'country_dethrone',
            countryCode: sampleDuelPairs.worldChallenge.countryCode,
            countryName: sampleDuelPairs.worldChallenge.countryName,
            rarity: sampleDuelPairs.worldChallenge.rarity,
            xp: 0,
            movieTitle: sampleDuelPairs.worldChallenge.movieTitle,
            posterUrl: sampleDuelPairs.worldChallenge.posterUrl,
            userRating: sampleDuelPairs.worldChallenge.userRating,
            previousMovieTitle: sampleDuelPairs.worldChallenge.previousMovieTitle,
            previousPosterUrl: sampleDuelPairs.worldChallenge.previousPosterUrl,
            previousUserRating: sampleDuelPairs.worldChallenge.previousUserRating,
            winReason: 'higher_rating',
            sourceTrigger: 'coproduction_curate',
          }
        : {
            id: `sim_wc_unlock_${Date.now()}`,
            kind: 'country_unlock',
            countryCode: 'ma',
            countryName: 'Marrocos',
            rarity: 'epic',
            xp: 65,
            movieTitle: 'O Caçador de Pipas (Exemplo)',
            userRating: 9.2,
            sourceTrigger: 'movie_add',
          };
    triggerWorldChallengeUnlock([sample], true);
  };

  const simulateDuelEffectPreview = (effectKey = null) => {
    const stamp = Date.now();
    const idTag = effectKey || 'rand';
    const runTemporal = duelArenaMode === 'time_machine' || duelArenaMode === 'both';
    const runCountry = duelArenaMode === 'world_195' || duelArenaMode === 'both';

    if (runTemporal) {
      triggerTimeMachineUnlock(
        [
          {
            id: `lab_tm_${idTag}_${stamp}`,
            kind: 'year_dethrone',
            year: sampleDuelPairs.timeMachine.year,
            rarity: 'rare',
            xp: 0,
            movieTitle: sampleDuelPairs.timeMachine.movieTitle,
            posterUrl: sampleDuelPairs.timeMachine.posterUrl,
            userRating: sampleDuelPairs.timeMachine.userRating,
            previousMovieTitle: sampleDuelPairs.timeMachine.previousMovieTitle,
            previousPosterUrl: sampleDuelPairs.timeMachine.previousPosterUrl,
            previousUserRating: sampleDuelPairs.timeMachine.previousUserRating,
            winReason: 'higher_rating',
            ...(effectKey ? { duelEffect: effectKey } : {}),
          },
        ],
        true
      );
    }

    if (runCountry) {
      triggerWorldChallengeUnlock(
        [
          {
            id: `lab_wc_${idTag}_${stamp}`,
            kind: 'country_dethrone',
            countryCode: sampleDuelPairs.worldChallenge.countryCode,
            countryName: sampleDuelPairs.worldChallenge.countryName,
            rarity: sampleDuelPairs.worldChallenge.rarity,
            xp: 0,
            movieTitle: sampleDuelPairs.worldChallenge.movieTitle,
            posterUrl: sampleDuelPairs.worldChallenge.posterUrl,
            userRating: sampleDuelPairs.worldChallenge.userRating,
            previousMovieTitle: sampleDuelPairs.worldChallenge.previousMovieTitle,
            previousPosterUrl: sampleDuelPairs.worldChallenge.previousPosterUrl,
            previousUserRating: sampleDuelPairs.worldChallenge.previousUserRating,
            winReason: 'higher_rating',
            sourceTrigger: 'coproduction_curate',
            ...(effectKey ? { duelEffect: effectKey } : {}),
          },
        ],
        !runTemporal
      );
    }
  };

  const simulateTripleSequence = () => {
    // 1º ESTÁGIO: Troféus PS5 no canto superior direito
    triggerTrophyBatch({
      unlocked: [
        {
          id: `sim_triple_gold_${Date.now()}`,
          tier: 'gold',
          category: 'sessao_secreta',
          title: 'Sessão Secreta: 88 Milhas por Hora!',
          description: 'Conquistou um clássico imortal viajando na Máquina do Tempo!',
          icon: '⚡',
        },
      ],
      progressed: [
        {
          id: `sim_triple_prog_${Date.now()}`,
          category: 'dna_cinefilo',
          tier: 'silver',
          title: 'DNA Cinéfilo: Viajante das Décadas',
          description: 'Conquistar todos os anos dos Anos 1980.',
          icon: '🕹️',
          currentCount: 9,
          targetCount: 10,
          previousPercentage: 80,
          progress_percentage: 90,
          increasedBy: 1,
        },
      ],
    });

    // 2º ESTÁGIO: Portal da Máquina do Tempo (aguarda os troféus sumirem completamente!)
    triggerTimeMachineUnlock([
      {
        id: `sim_triple_tm_${Date.now()}`,
        kind: 'year',
        year: 1985,
        rarity: 'epic',
        xp: 55,
        movieTitle: 'De Volta para o Futuro',
        userRating: 9.78,
      },
    ]);

    // 3º ESTÁGIO: Barra de XP somando Filme + Ano + País + Troféu (só aparece após o Portal Temporal fechar!)
    triggerXPGainToast({
      gainedXp: 165,
      prevTotalXp: 7300,
      nextTotalXp: 7465,
      prevLevel: 21,
      newLevel: 21,
      prevPercentage: 42,
      newPercentage: 83,
      leveledUp: false,
      levelsGained: 0,
      prevTitle: 'Quantas Armadilhas Você Fez para Chegar Aqui?',
      newTitle: 'Quantas Armadilhas Você Fez para Chegar Aqui?',
      titleChanged: false,
      xpInCurrentLevel: 333,
      xpNeededForNextLevel: 400,
      xpRemaining: 67,
      tags: [
        { type: 'movie', icon: '🎬', label: '+10 XP Filme', xp: 10 },
        { type: 'time_machine', icon: '⏳', label: '+55 XP Ano Era VHS & Cult (1985)', xp: 55, rarityOrTier: 'epic' },
        { type: 'country', icon: '🟢', label: '+30 XP País Comum (EUA)', xp: 30, rarityOrTier: 'common' },
        { type: 'trophy', icon: '🥇', label: '+70 XP Troféu Ouro', xp: 70, rarityOrTier: 'gold' },
      ],
    });
  };

  const simulateCascade = () => {
    // Dispara 6 troféus mistos (Platina, Mítico, Ouro, Bronze, e 2 Colecionáveis)
    // O sistema de fila inteligente:
    // 1. Prioriza por dificuldade: Platina -> Mítico -> Ouro -> Bronze -> Colecionáveis por último
    // 2. Coloca no máximo 4 na tela e os 2 restantes na fila de espera (+2 na fila de espera)
    triggerTrophyBatch({
      unlocked: [
        {
          id: 'sim_casc_bronze',
          tier: 'bronze',
          category: 'volta_ao_mundo',
          title: 'Volta ao Mundo: É do Brasil!',
          description: '1 filme do Brasil conquistado.',
          icon: '🇧🇷',
        },
        {
          id: 'sim_casc_gold',
          tier: 'gold',
          category: 'volta_ao_mundo',
          title: 'Volta ao Mundo: Mestre Continental',
          description: 'Todos os países da América do Sul conquistados!',
          icon: '🥇',
        },
        {
          id: 'sim_casc_plat',
          tier: 'platinum',
          category: 'volta_ao_mundo',
          title: 'Volta ao Mundo: A Lenda Definitiva',
          description: '100% dos troféus conquistados!',
          icon: '🏆',
        },
        {
          id: 'sim_casc_mythic',
          tier: 'mythic',
          category: 'volta_ao_mundo',
          title: 'Volta ao Mundo: Panteão dos Míticos',
          description: 'Todos os 18 países míticos conquistados.',
          icon: '💎',
        },
      ],
      progressed: [
        {
          id: 'sim_casc_prog_1',
          category: 'dna_cinefilo',
          tier: 'gold',
          title: 'DNA Cinéfilo: Mestre dos Clássicos',
          description: 'Assistir a 50 clássicos.',
          icon: '🏛️',
          currentCount: 47,
          targetCount: 50,
          previousPercentage: 92,
          progress_percentage: 94,
          increasedBy: 1,
        },
        {
          id: 'sim_casc_prog_2',
          category: 'anatomia_cinema',
          tier: 'silver',
          title: 'Anatomia do Cinema: Maratona Épica',
          description: 'Assistir a 10 filmes com +3h de duração.',
          icon: '⏱️',
          currentCount: 8,
          targetCount: 10,
          previousPercentage: 70,
          progress_percentage: 80,
          increasedBy: 1,
        },
      ],
    });
  };

  const handleTestOverride = async (overrideState) => {
    if (!selectedTrophyId) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/trophies/test/override`, {
        trophyId: selectedTrophyId,
        overrideState,
      });
      if (res.data?.success) {
        setMessage({
          type: 'success',
          text: `Status do troféu atualizado para: ${
            overrideState === true
              ? 'Desbloqueado (Teste)'
              : overrideState === false
                ? 'Bloqueado (Teste)'
                : 'Automático'
          }`,
        });
        if (overrideState === true) {
          const t = trophies.find((x) => x.id === selectedTrophyId);
          if (t) triggerPS5TrophyToast(t);
        }
        if (res.data.xpGain) {
          triggerXPGainToast(res.data.xpGain, res.data.xpStatus);
        } else if (res.data.xpStatus) {
          dispatchXpStatusUpdate(res.data.xpStatus);
        }
        if (onSyncSuccess) onSyncSuccess(res.data.data);
        return;
      }
    } catch {
      try {
        const localOverrides = { [selectedTrophyId]: overrideState };
        const localData = evaluateTrophiesClientSide(movies, localOverrides);
        setMessage({
          type: 'success',
          text: `[Modo Local] Status atualizado: ${
            overrideState === true
              ? 'Desbloqueado (Teste)'
              : overrideState === false
                ? 'Bloqueado (Teste)'
                : 'Automático'
          }`,
        });
        if (overrideState === true) {
          const t = trophies.find((x) => x.id === selectedTrophyId);
          if (t) triggerPS5TrophyToast(t);
        }
        if (onSyncSuccess) onSyncSuccess(localData);
      } catch (err2) {
        setMessage({ type: 'error', text: err2.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDatabase = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/trophies/evaluate`, { markNew: false });
      if (res.data?.success) {
        setMessage({
          type: 'success',
          text: `Banco sincronizado! ${res.data.data.unlockedCount} de ${res.data.data.totalTrophies} troféus conquistados.`,
        });
        if (res.data.data?.xpStatus) {
          dispatchXpStatusUpdate(res.data.data.xpStatus);
        }
        if (onSyncSuccess) onSyncSuccess(res.data.data);
        return;
      }
    } catch {
      try {
        const localData = evaluateTrophiesClientSide(movies, {});
        setMessage({
          type: 'success',
          text: `[Modo Local] Sincronizado! ${localData.unlockedCount} de ${localData.totalTrophies} troféus conquistados.`,
        });
        if (onSyncSuccess) onSyncSuccess(localData);
      } catch (err2) {
        setMessage({ type: 'error', text: err2.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetAllTests = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/trophies/test/reset-all`);
      if (res.data?.success) {
        setMessage({
          type: 'success',
          text: 'Todos os testes foram resetados com sucesso! Estado original restaurado.',
        });
        if (res.data.xpStatus) {
          dispatchXpStatusUpdate(res.data.xpStatus);
        }
        if (onSyncSuccess) onSyncSuccess(res.data.data);
        return;
      }
    } catch {
      try {
        const localData = evaluateTrophiesClientSide(movies, {});
        setMessage({
          type: 'success',
          text: '[Modo Local] Testes resetados com sucesso! Estado original restaurado.',
        });
        if (onSyncSuccess) onSyncSuccess(localData);
      } catch (err2) {
        setMessage({ type: 'error', text: err2.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5"
      >
        {/* Glow sutil */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-100 uppercase tracking-wider">
                Painel de Testes & Homologação
              </h3>
              <p className="text-xs text-zinc-400">
                Toasts PS5, HUD Colecionável (47/50), tempo de tela e testes de troféus.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerta de feedback */}
        {message && (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* SEÇÃO 1: Simulações Especiais de Notificação (Colecionável HUD & Combos) */}
        <div className="flex flex-col gap-2.5 relative z-10 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>🎯</span>
              <span>1. Simulação de Progresso & Colecionáveis PS5</span>
            </span>
            <button
              type="button"
              onClick={simulateCascade}
              className="text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
            >
              ⚡ Testar Fila (6 Troféus)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={simulateCollectibleToast}
              className="p-2.5 rounded-xl border border-amber-500/50 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-2 text-left">
                <span className="text-base">🎯</span>
                <div>
                  <div className="text-[11px] leading-tight">Simular Colecionável</div>
                  <div className="text-[9px] font-mono text-amber-400/80 lowercase">progresso 47/50 (+1)</div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              type="button"
              onClick={simulateComboProgressoEConquistado}
              className="p-2.5 rounded-xl border border-purple-500/50 bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-2 text-left">
                <span className="text-base">🔥</span>
                <div>
                  <div className="text-[11px] leading-tight">Combo Completo</div>
                  <div className="text-[9px] font-mono text-purple-300/80 lowercase">2 progressos + 100%</div>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Botões individuais por Tier */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
            {Object.keys(TIER_THEMES).map((tier) => {
              const theme = TIER_THEMES[tier];
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => simulateSingleToast(tier)}
                  className={`p-1.5 rounded-xl border ${theme.border} bg-zinc-900/60 hover:bg-zinc-850 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer`}
                  title={`Simular conquista ${theme.name}`}
                >
                  <span className="text-sm">{theme.symbol}</span>
                  <span className="text-[10px] font-bold text-zinc-300 truncate">{theme.name}</span>
                </button>
              );
            })}
          </div>

          {/* Botão de Sequência Completa: Troféus -> Máquina do Tempo -> Barra de XP */}
          <div className="pt-2 border-t border-zinc-800/60 mt-1 flex flex-col gap-2">
            {/* NOVO: Sequência Tripla Oficial */}
            <button
              type="button"
              onClick={simulateTripleSequence}
              className="p-3 rounded-xl border border-cyan-400/70 bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-amber-500/20 hover:from-cyan-500/30 hover:to-amber-500/30 text-cyan-100 text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer shadow-md group"
            >
              <div className="flex items-center gap-2.5 text-left">
                <span className="text-lg">⏳</span>
                <div>
                  <div className="text-[12px] font-black text-cyan-200 leading-tight">
                    Combo Triplo: Troféus → Máquina do Tempo → Barra de XP
                  </div>
                  <div className="text-[10px] font-mono text-zinc-300 font-normal">
                    1º Troféus PS5 somem → 2º Portal 1985 abre/fecha → 3º Barra +165 XP!
                  </div>
                </div>
              </div>
              <Play className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform shrink-0" />
            </button>

            {/* Botões rápidos para testar apenas o Portal da Máquina do Tempo */}
            <div className="bg-zinc-950/70 border border-cyan-500/25 rounded-xl p-2.5 flex flex-col gap-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300 flex items-center justify-between">
                <span>⏳ Testar Animação da Máquina do Tempo (Isolada)</span>
                <span className="font-mono text-[9px] text-zinc-500">Odômetro + Som Flux</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[
                  { key: 'mythic', icon: '💎', label: '1941', sub: '+200 XP', cls: 'border-rose-500/50 text-rose-200 hover:bg-rose-500/15' },
                  { key: 'legendary', icon: '🥇', label: '1968', sub: '+90 XP', cls: 'border-amber-400/50 text-amber-200 hover:bg-amber-500/15' },
                  { key: 'epic', icon: '💜', label: '1985', sub: '+55 XP', cls: 'border-purple-400/50 text-purple-200 hover:bg-purple-500/15' },
                  { key: 'rare', icon: '🔵', label: '2008', sub: '+35 XP', cls: 'border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/15' },
                  { key: 'common', icon: '🟢', label: '2024', sub: '+20 XP', cls: 'border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/15' },
                  { key: 'decade', icon: '🕰️', label: '1990s', sub: '+100 XP', cls: 'border-amber-300/65 text-amber-100 hover:bg-amber-500/20' },
                ].map((btn) => (
                  <button
                    key={btn.key}
                    type="button"
                    onClick={() => simulateTimeMachinePortal(btn.key)}
                    className={`p-1.5 rounded-lg border bg-zinc-900/80 transition-all cursor-pointer flex flex-col items-center justify-center ${btn.cls}`}
                  >
                    <span className="text-xs font-mono font-black">
                      {btn.icon} {btn.label}
                    </span>
                    <span className="text-[9px] font-mono opacity-80">{btn.sub}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 border-t border-zinc-800/70">
                <button
                  type="button"
                  onClick={() => simulateTimeMachinePortal('year_dethrone')}
                  className="p-1.5 rounded-lg border border-amber-400/55 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>⚔️ Duelo de Ano (1999)</span>
                </button>
                <button
                  type="button"
                  onClick={() => simulateWorldChallengeCard('country_unlock')}
                  className="p-1.5 rounded-lg border border-emerald-400/55 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>🏴 País Inédito (195)</span>
                </button>
                <button
                  type="button"
                  onClick={() => simulateWorldChallengeCard('country_dethrone')}
                  className="p-1.5 rounded-lg border border-rose-400/55 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>👑 Duelo de País (195)</span>
                </button>
              </div>
            </div>

            {/* Efeitos Visuais de Destronamento em Produção (Sorteio Aleatório) */}
            <div className="bg-zinc-950/80 border border-fuchsia-500/30 rounded-xl p-3 flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-fuchsia-300 flex items-center gap-1.5">
                    <span>🎲 Efeitos Ativos nos Duelos (Sorteio Aleatório)</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Cada tomada de trono (Ano ou País 195) sorteia 1 destes 4 efeitos automaticamente, sem rótulo no card
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => simulateDuelEffectPreview(null)}
                  className="px-2.5 py-1 rounded-lg border border-fuchsia-400/60 bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-100 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all shrink-0"
                >
                  🎲 Sortear Aleatório
                </button>
              </div>

              {/* Seletor de Arena alvo */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'time_machine', label: '⏳ Só Trono Temporal' },
                  { key: 'world_195', label: '👑 Só Trono do País' },
                  { key: 'both', label: '⚡ Ambos em Fila' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setDuelArenaMode(opt.key)}
                    className={`px-2 py-1.5 rounded-lg border text-[10px] font-black transition-all cursor-pointer ${
                      duelArenaMode === opt.key
                        ? 'border-fuchsia-400/80 bg-fuchsia-500/20 text-fuchsia-100 shadow-sm'
                        : 'border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* 4 Botões dos Efeitos Selecionados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {DUEL_EFFECT_PRESETS.map((fx) => (
                  <button
                    key={fx.key}
                    type="button"
                    onClick={() => simulateDuelEffectPreview(fx.key)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 text-left group ${fx.accentClass}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{fx.icon}</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-black leading-tight truncate">
                          {fx.label}
                        </div>
                        <div className="text-[9px] text-zinc-300/80 truncate">
                          {fx.shortDesc}
                        </div>
                      </div>
                    </div>
                    <Play className="w-3.5 h-3.5 shrink-0 opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={simulateComboWithXp}
              className="p-2.5 rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-amber-200 text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer shadow-md group"
            >
              <div className="flex items-center gap-2.5 text-left">
                <span className="text-lg">🎮</span>
                <div>
                  <div className="text-[12px] font-black text-amber-200 leading-tight">
                    Simular Sequência (Troféus → Barra de XP Somando Tudo)
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 font-normal">
                    Troféus no topo primeiro → quando sumirem, surge a barra somando +105 XP
                  </div>
                </div>
              </div>
              <Play className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
            </button>

            {/* Botões para testar animação da Barra de XP e Level Up */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
              onClick={() =>
                triggerXPGainToast({
                  gainedXp: 135,
                  prevTotalXp: 7300,
                  nextTotalXp: 7435,
                  prevLevel: 21,
                  newLevel: 21,
                  prevPercentage: 42,
                  newPercentage: 76,
                  leveledUp: false,
                  levelsGained: 0,
                  prevTitle: 'Quantas Armadilhas Você Fez para Chegar Aqui?',
                  newTitle: 'Quantas Armadilhas Você Fez para Chegar Aqui?',
                  titleChanged: false,
                  xpInCurrentLevel: 303,
                  xpNeededForNextLevel: 400,
                  xpRemaining: 97,
                  tags: [
                    { type: 'movie', icon: '🎬', label: '+10 XP Filme', xp: 10 },
                    { type: 'time_machine', icon: '⏳', label: '+55 XP Ano Era VHS & Cult (1994)', xp: 55, rarityOrTier: 'epic' },
                    { type: 'country', icon: '🔵', label: '+45 XP País Raro (Suécia)', xp: 45, rarityOrTier: 'rare' },
                    { type: 'trophy', icon: '🥈', label: '+25 XP Troféu Prata', xp: 25, rarityOrTier: 'silver' },
                  ],
                  statGains: [
                    { key: 'AGI', icon: '⚡', label: '+0.8 AGI' },
                    { key: 'INT', icon: '🧠', label: '+1.0 INT' },
                    { key: 'FOR', icon: '👑', label: '+0.7 FOR' },
                  ],
                })
              }
              className="p-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-wider flex items-center justify-between cursor-pointer transition-all"
            >
              <span>✨ +135 XP (Barra)</span>
              <Play className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                triggerXPGainToast({
                  gainedXp: 185,
                  prevTotalXp: 8680,
                  nextTotalXp: 8865,
                  prevLevel: 24,
                  newLevel: 25,
                  prevPercentage: 78,
                  newPercentage: 22,
                  leveledUp: true,
                  levelsGained: 1,
                  prevTitle: 'Quantas Armadilhas Você Fez para Chegar Aqui?',
                  newTitle: 'Você Já Deve Ter Visto Bastante a Mulher do Paul W.S. Anderson!',
                  titleChanged: true,
                  xpInCurrentLevel: 92,
                  xpNeededForNextLevel: 420,
                  xpRemaining: 328,
                  tags: [
                    { type: 'movie', icon: '🎬', label: '+10 XP Filme', xp: 10 },
                    { type: 'country', icon: '🥇', label: '+100 XP País Lendário', xp: 100, rarityOrTier: 'legendary' },
                    { type: 'trophy', icon: '🥇', label: '+70 XP Troféu Ouro', xp: 70, rarityOrTier: 'gold' },
                  ],
                  statGains: [
                    { key: 'DES', icon: '🎯', label: '+1.2 DES' },
                    { key: 'VIT', icon: '🏆', label: '+1.5 VIT' },
                  ],
                })
              }
              className="p-2 rounded-xl border border-amber-400/50 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-[11px] font-black uppercase tracking-wider flex items-center justify-between cursor-pointer transition-all"
            >
              <span>🎉 LEVEL UP!</span>
              <Play className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                triggerXPGainToast({
                  gainedXp: 210,
                  prevTotalXp: 9100,
                  nextTotalXp: 9310,
                  prevLevel: 26,
                  newLevel: 26,
                  prevPercentage: 45,
                  newPercentage: 82,
                  leveledUp: false,
                  levelsGained: 0,
                  prevTitle: 'Você Já Deve Ter Visto Bastante a Mulher do Paul W.S. Anderson!',
                  newTitle: 'Você Já Deve Ter Visto Bastante a Mulher do Paul W.S. Anderson!',
                  titleChanged: false,
                  xpInCurrentLevel: 310,
                  xpNeededForNextLevel: 440,
                  xpRemaining: 130,
                  tags: [
                    { type: 'movie', icon: '🎬', label: '+10 XP Obra Rara', xp: 10 },
                    { type: 'trophy', icon: '💎', label: '+200 XP Troféu Mítico', xp: 200, rarityOrTier: 'mythic' },
                  ],
                  statGains: [
                    { key: 'INT', icon: '🧠', label: '+1.5 INT' },
                    { key: 'SOR', icon: '🎲', label: '+1.0 SOR' },
                  ],
                  unlockedClass: {
                    name: 'O Monge das Três Casas Decimais',
                    icon: '⚖️',
                  },
                })
              }
              className="p-2 rounded-xl border border-purple-400/50 bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 text-[11px] font-black uppercase tracking-wider flex items-center justify-between cursor-pointer transition-all"
            >
              <span>👑 Nova Classe!</span>
              <Play className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

        {/* SEÇÃO 2: Configuração de Duração dos Toasts & Filtros Anti-Spam */}
        <div className="flex flex-col gap-3 relative z-10 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-blue-300">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>2. Tempo de Exibição na Tela & Filtro (Salvo no Navegador)</span>
          </div>

          {/* Duração Desbloqueados (100%) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
            <span className="text-zinc-300 font-bold">
              🏆 Conquistados (100%):
            </span>
            <div className="flex items-center gap-1.5">
              {[5000, 8000, 10000, 12000, 15000].map((ms) => {
                const isSelected = toastSettings.durationUnlocked === ms;
                return (
                  <button
                    key={ms}
                    type="button"
                    onClick={() => handleUpdateDurationUnlocked(ms)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-500/30 border-blue-400 text-blue-200 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {ms / 1000}s
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duração Colecionáveis / Progresso */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
            <span className="text-zinc-300 font-bold">
              🎯 Progresso / Colecionável:
            </span>
            <div className="flex items-center gap-1.5">
              {[4000, 6000, 8000, 10000].map((ms) => {
                const isSelected = toastSettings.durationProgress === ms;
                return (
                  <button
                    key={ms}
                    type="button"
                    onClick={() => handleUpdateDurationProgress(ms)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {ms / 1000}s
                  </button>
                );
              })}
            </div>
          </div>

          {/* Máximo de Notificações de Progresso por Filme */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs border-t border-zinc-800/60 pt-2">
            <span className="text-zinc-300 font-bold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Notificações de Progresso Simultâneas:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { label: 'Top 3', val: 3 },
                { label: 'Top 5', val: 5 },
                { label: 'Todos', val: 99 },
              ].map(({ label, val }) => {
                const isSelected = toastSettings.maxProgress === val;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleUpdateMaxProgress(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-500/30 border-purple-400 text-purple-200 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: Forçar Troféu do Banco */}
        <div className="flex flex-col gap-2.5 relative z-10">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-300">
            3. Forçar Troféu Específico do Banco de Dados
          </span>

          <select
            value={selectedTrophyId}
            onChange={(e) => setSelectedTrophyId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50"
          >
            {trophies.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} [{t.tier?.toUpperCase()}] {t.title} {t.is_unlocked ? '✅' : '🔒'}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTestOverride(true)}
              className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
            >
              🔓 Forçar Desbloqueio
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTestOverride(false)}
              className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
            >
              🔒 Forçar Bloqueio
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTestOverride(null)}
              className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-xs font-bold transition-colors cursor-pointer"
              title="Restaura a avaliação normal calculada pelo motor"
            >
              Restaurar Auto
            </button>
          </div>
        </div>

        {/* SEÇÃO 4: Sincronização Geral e Reset */}
        <div className="flex items-center justify-between gap-3 border-t border-zinc-800/80 pt-4 relative z-10 flex-wrap">
          <button
            type="button"
            disabled={loading}
            onClick={handleSyncDatabase}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>🔄 Sincronizar Banco</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleResetAllTests}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>🧹 Limpar Todos os Testes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
