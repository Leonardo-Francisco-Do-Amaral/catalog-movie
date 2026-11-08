import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Trash2 } from 'lucide-react';

const COUNTRY_TO_ISO = {
  'estados unidos': 'us',
  'brasil': 'br',
  'reino unido': 'gb',
  'frança': 'fr',
  'japão': 'jp',
  'coreia do sul': 'kr',
  'alemanha': 'de',
  'alemanha ocidental': 'de',
  'itália': 'it',
  'espanha': 'es',
  'suécia': 'se',
  'dinamarca': 'dk',
  'irlanda': 'ie',
  'canadá': 'ca',
  'líbano': 'lb',
  'chipre': 'cy',
  'catar': 'qa',
  'argentina': 'ar',
  'holanda': 'nl',
  'países baixos': 'nl',
  'polônia': 'pl',
  'islândia': 'is',
  'noruega': 'no',
  'áfrica do sul': 'za',
  'nova zelândia': 'nz',
  'rússia': 'ru',
  'méxico': 'mx',
  'colômbia': 'co',
  'chile': 'cl',
  'índia': 'in',
  'china': 'cn',
  'hong kong': 'hk',
  'taiwan': 'tw',
  'tailândia': 'th',
  'austrália': 'au',
  'áustria': 'at',
  'bélgica': 'be',
  'bulgária': 'bg',
  'finlândia': 'fi',
  'hungria': 'hu',
  'malta': 'mt',
  'marrocos': 'ma',
  'república checa': 'cz',
  'romênia': 'ro',
  'sérvia': 'rs',
  'singapura': 'sg',
  'união soviética': 'su'
};

const getFlagUrl = (countryName) => {
  if (!countryName || countryName === 'Desconhecido') return null;
  const key = countryName.toLowerCase().trim();
  const code = COUNTRY_TO_ISO[key];
  return code ? `https://flagcdn.com/w20/${code}.png` : null;
};

const formatVotes = (num) => {
  if (!num) return '0';
  const cleanNum = typeof num === 'string' ? parseInt(num.replace(/,/g, ''), 10) : num;
  
  if (cleanNum >= 1000000) {
    return (cleanNum / 1000000).toFixed(1).replace('.0', '') + 'M';
  }
  if (cleanNum >= 1000) {
    return (cleanNum / 1000).toFixed(1).replace('.0', '') + 'K';
  }
  return cleanNum.toString();
};

export default function MovieCard({ movie, onEdit, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);
  const [mouseHearts, setMouseHearts] = useState([]);
  const [clickHearts, setClickHearts] = useState([]);
  const [clickBloodDrops, setClickBloodDrops] = useState([]);
  
  // Estados para as Ações de Impacto dos Arquétipos
  const [popCombos, setPopCombos] = useState([]); // Adrenalina action combo pops
  const [cozySparks, setCozySparks] = useState([]); // Pop (Family Cozy) magic sparks
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [isMuzzleActive, setIsMuzzleActive] = useState(false);
  const [isGravityActive, setIsGravityActive] = useState(false);
  const [isSpeedrunActive, setIsSpeedrunActive] = useState(false);
  const [isTvOffActive, setIsTvOffActive] = useState(false); // Efeito TV Desligando no Curta
  const [isActionShakeActive, setIsActionShakeActive] = useState(false);
  
  // Estados de Drama (arquetipo-enigma)
  const [isEmotionalShatterActive, setIsEmotionalShatterActive] = useState(false);
  const [dramaticSubtitle, setDramaticSubtitle] = useState('[Silêncio Dramático]');
  const [isDramaticActive, setIsDramaticActive] = useState(false);
  const [isBandWMode, setIsBandWMode] = useState(false);
  const [isBwFlashActive, setIsBwFlashActive] = useState(false);
  const [isDramaFlashActive, setIsDramaFlashActive] = useState(false); // Flash de câmera fotográfica no clique
  const [bandWTimer, setBandWTimer] = useState(null);
  const [shatterClickPos, setShatterClickPos] = useState({ pctX: 50 });
  
  // Estados de Guerra (arquetipo-conflito)
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [isAirstrikeActive, setIsAirstrikeActive] = useState(false);
  const [warEmbersList, setWarEmbersList] = useState([]);

  // Estados de Família (arquetipo-pop - Holograma do Sofá Ativo por Padrão)
  const [isCozyPulsing, setIsCozyPulsing] = useState(false);
  const [isMovieMaskActive, setIsMovieMaskActive] = useState(false);
  const [isCozyStaticActive, setIsCozyStaticActive] = useState(false);

  // Estados de Space Invaders (arquetipo-especulativo)
  const [invaders, setInvaders] = useState([]);
  const [playerX, setPlayerX] = useState(50);
  const [lasers, setLasers] = useState([]);
  const [invaderProjectiles, setInvaderProjectiles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('idle'); // 'idle', 'playing', 'gameover', 'victory'
  const [isGameActive, setIsGameActive] = useState(false);

  // FPS e Ping de Ação
  const [fps, setFps] = useState(120);
  const [ping, setPing] = useState(14);

  const [speedrunTime, setSpeedrunTime] = useState('00:00:00');
  const speedrunIntervalRef = useRef(null);
  const lastParticleTime = useRef(0);
  
  // Lógica de Flash Jump Scare de Primeiro Hover
  const [hasFlashed, setHasFlashed] = useState(false);
  const [isScareActive, setIsScareActive] = useState(false);
  
  // Lógica de Aparições Sobrenaturais Cíclicas (S)
  const [activeIcons, setActiveIcons] = useState([1, 2]);
  const [iconPositions, setIconPositions] = useState([
    { top: '15%', left: '20%' },
    { top: '60%', left: '50%' }
  ]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [fadeTrigger, setFadeTrigger] = useState(false);

  const {
    title,
    poster_url,
    user_rating,
    imdb_rating,
    metacritic_score,
    rotten_tomatoes_score,
    tags = [],
    oscar_wins,
    oscar_nominations,
    genres = [],
    countries = [],
    release_year,
    year_seen,
    runtime,
    audio_type,
    platform
  } = movie;

  // Tratamento prévio das strings para busca segura e tolerante a tipos
  const getSafeList = (arr) => {
    if (!arr) return [];
    if (typeof arr === 'string') return [arr.toLowerCase().trim()];
    if (Array.isArray(arr)) {
      return arr.map(item => {
        if (typeof item === 'string') return item.toLowerCase().trim();
        if (item && typeof item === 'object' && item.name) return item.name.toLowerCase().trim();
        return '';
      }).filter(Boolean);
    }
    return [];
  };

  const genresList = getSafeList(genres);
  const tagsList = getSafeList(tags);

  const hasGenreOrTag = (term) => {
    const search = term.toLowerCase().trim();
    return genresList.some(g => g.includes(search)) || tagsList.some(t => t.includes(search));
  };

  const isOscarWinner = (Number(oscar_wins) || 0) > 0;
  const isOscarNominee = (Number(oscar_nominations) || 0) > 0;

  // Filmes abaixo de 50 minutos são considerados Curtas automaticamente
  const runtimeNum = Number(runtime);
  const isShortFilm = (runtimeNum > 0 && runtimeNum < 50) || hasGenreOrTag('curta');

  let cardTheme = 'default';

  // 👑 PRIORIDADE 1 & 2: CONQUISTAS DA ACADEMIA
  if (isOscarWinner) {
    cardTheme = 'oscar-winner';
  } else if (isOscarNominee) {
    cardTheme = 'oscar-nominee';

  // 🩸 PRIORIDADE 3: TERROR / SOBRENATURAL
  } else if (hasGenreOrTag('terror') || hasGenreOrTag('horror') || hasGenreOrTag('fantasma')) {
    cardTheme = 'terror';

  // 💖 PRIORIDADE 4: ROMANCE
  } else if (hasGenreOrTag('romance')) {
    cardTheme = 'romance';

  // ⏱️ PRIORIDADE 5: RECURSO EXCLUSIVO (CURTA-METRAGEM)
  } else if (isShortFilm) {
    cardTheme = 'curta';

  // 📝 ARQUÉTIPO A: CRÔNICAS DA REALIDADE ('biografia', 'documentário', 'história')
  } else if (hasGenreOrTag('biografia') || hasGenreOrTag('documentário') || hasGenreOrTag('história')) {
    cardTheme = 'arquetipo-realidade';

  // 🍿 ARQUÉTIPO B: POP E LÚDICO (Modo Família/Aconchego)
  } else if (hasGenreOrTag('animação') || hasGenreOrTag('comédia') || hasGenreOrTag('família') || hasGenreOrTag('música') || hasGenreOrTag('musical')) {
    cardTheme = 'arquetipo-pop';

  // ⚡ ARQUÉTIPO C: ALTA ADRENALINA ('ação', 'aventura')
  } else if (hasGenreOrTag('ação') || hasGenreOrTag('aventura')) {
    cardTheme = 'arquetipo-adrenalina';

  // ⚔️ ARQUÉTIPO D: SUBMUNDO E CONFLITO (Guerra / Drone HUD)
  } else if (hasGenreOrTag('policial') || hasGenreOrTag('guerra') || hasGenreOrTag('faroeste') || hasGenreOrTag('crime')) {
    cardTheme = 'arquetipo-conflito';

  // 🔍 ARQUÉTIPO E: DRAMA E ENIGMA (Melancolia / Roteiro Itálico)
  } else if (hasGenreOrTag('drama') || hasGenreOrTag('cinema tv') || hasGenreOrTag('mistério') || hasGenreOrTag('suspense')) {
    cardTheme = 'arquetipo-enigma';

  // 🌌 ARQUÉTIPO F: ESPECULATIVO E COGNITIVO ('ficção científica', 'fantasia')
  } else if (hasGenreOrTag('ficção científica') || hasGenreOrTag('fantasia')) {
    cardTheme = 'arquetipo-especulativo';
  }

  // Formata notas nulas
  const formattedUserRating = user_rating ? Number(user_rating).toFixed(3) : 'N/A';
  const formattedImdbRating = imdb_rating ? Number(imdb_rating).toFixed(1) : 'N/A';
  const formattedMetacritic = metacritic_score || 'N/A';

  // Limpa o timer de B&W no desmontar do componente
  useEffect(() => {
    return () => {
      if (bandWTimer) clearTimeout(bandWTimer);
    };
  }, [bandWTimer]);

  // Simula variação realista de FPS e Ping no Arquétipo de Ação
  useEffect(() => {
    if (cardTheme !== 'arquetipo-adrenalina' || !isHovered) return;
    const interval = setInterval(() => {
      setFps(Math.floor(118 + Math.random() * 5));
      setPing(Math.floor(10 + Math.random() * 6));
    }, 500);
    return () => clearInterval(interval);
  }, [cardTheme, isHovered]);

  // Cores do Metacritic texto
  const getMetacriticTextColor = (score) => {
    if (score === 'N/A') return 'text-zinc-550';
    const num = Number(score);
    if (num >= 61) return 'text-emerald-400';
    if (num >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  // Fallback se não houver poster_url
  const defaultPoster = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

  const getVotesBadgeColor = () => {
    switch (cardTheme) {
      case 'oscar-winner': return 'text-amber-400 border-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.6)]';
      case 'oscar-nominee': return 'text-blue-400 border-blue-400/60 shadow-[0_0_8px_rgba(59,130,246,0.6)]';
      case 'terror': return 'text-red-500 border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse';
      case 'romance': return 'text-pink-400 border-pink-400/60 shadow-[0_0_8px_rgba(244,114,182,0.6)]';
      case 'curta': return 'text-orange-400 border-orange-500/60 shadow-[0_0_8px_rgba(249,115,22,0.6)]';
      case 'arquetipo-pop': return 'text-fuchsia-400 border-fuchsia-500/60 shadow-[0_0_8px_rgba(217,70,239,0.6)]';
      case 'arquetipo-adrenalina': return 'text-cyan-400 border-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.6)]';
      case 'arquetipo-conflito': return 'text-red-400 border-red-700/60 shadow-[0_0_8px_rgba(185,28,28,0.6)]';
      case 'arquetipo-enigma': return 'text-violet-400 border-violet-600/60 shadow-[0_0_8px_rgba(124,58,237,0.6)]';
      case 'arquetipo-especulativo': return 'text-emerald-400 border-emerald-400/60 shadow-[0_0_8px_rgba(52,211,153,0.6)]';
      default: return 'text-zinc-300 border-zinc-700/50';
    }
  };

  const getVotesBadgeClass = () => {
    return "absolute top-3 right-3 z-30 bg-black/70 backdrop-blur-md border border-zinc-700/50 rounded-full px-2.5 py-0.5 flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-zinc-300 shadow-lg group-hover:opacity-0 transition-opacity duration-300 pointer-events-none select-none";
  };

  // Lógica do cronômetro Speedrun para o curta-metragem
  useEffect(() => {
    if (isHovered && cardTheme === 'curta' && !isSpeedrunActive) {
      const start = Date.now();
      speedrunIntervalRef.current = setInterval(() => {
        const diff = Date.now() - start;
        const mins = Math.floor(diff / 60000).toString().padStart(2, '0');
        const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        const ms = Math.floor((diff % 1000) / 10).toString().padStart(2, '0');
        setSpeedrunTime(`${mins}:${secs}:${ms}`);
      }, 35);
    } else {
      if (speedrunIntervalRef.current) {
        clearInterval(speedrunIntervalRef.current);
      }
    }
    return () => {
      if (speedrunIntervalRef.current) {
        clearInterval(speedrunIntervalRef.current);
      }
    };
  }, [isHovered, cardTheme, isSpeedrunActive]);

  // Game Loop de Space Invaders (Speculative theme)
  useEffect(() => {
    if (cardTheme !== 'arquetipo-especulativo' || gameState !== 'playing' || !isHovered || !isGameActive) return;

    let invaderDir = 1;
    let tickCount = 0;

    const interval = setInterval(() => {
      // 1. Move lasers
      setLasers(prev => prev.map(l => ({ ...l, y: l.y - 6 })).filter(l => l.y > 0));

      // 2. Move invader projectiles
      setInvaderProjectiles(prev => prev.map(p => ({ ...p, y: p.y + 4 })).filter(p => p.y < 100));

      // 3. Invaders movement
      tickCount++;
      let stepDown = false;
      let borderHit = false;

      if (tickCount % 6 === 0) {
        // Check border hit
        setInvaders(prev => {
          prev.forEach(inv => {
            if (!inv.alive) return;
            const nextX = inv.x + invaderDir * 4;
            if (nextX < 10 || nextX > 90) {
              borderHit = true;
            }
          });

          if (borderHit) {
            invaderDir = -invaderDir;
            stepDown = true;
          }

          return prev.map(inv => {
            if (!inv.alive) return inv;
            return {
              ...inv,
              x: stepDown ? inv.x : inv.x + invaderDir * 4,
              y: stepDown ? inv.y + 8 : inv.y
            };
          });
        });

        // Invader shoots sometimes
        if (Math.random() < 0.3) {
          setInvaders(prev => {
            const aliveInvaders = prev.filter(i => i.alive);
            if (aliveInvaders.length > 0) {
              const randomInv = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
              setInvaderProjectiles(proj => [...proj, {
                id: Math.random(),
                x: randomInv.x,
                y: randomInv.y + 3
              }]);
            }
            return prev;
          });
        }
      }

      // 4. Collision check: Lasers vs Invaders
      setLasers(currentLasers => {
        let lasersToKeep = [...currentLasers];
        setInvaders(currentInvaders => {
          let invadersUpdated = [...currentInvaders];
          let hitOccurred = false;

          lasersToKeep = lasersToKeep.filter(laser => {
            let hitIdx = invadersUpdated.findIndex(inv => 
              inv.alive && 
              Math.abs(inv.x - laser.x) < 8 && 
              Math.abs(inv.y - laser.y) < 6
            );
            if (hitIdx !== -1) {
              invadersUpdated[hitIdx] = { ...invadersUpdated[hitIdx], alive: false };
              setScore(s => s + 10);
              hitOccurred = true;
              return false; // remove laser
            }
            return true;
          });

          if (hitOccurred) {
            if (invadersUpdated.every(i => !i.alive)) {
              setGameState('victory');
            }
          }
          return invadersUpdated;
        });
        return lasersToKeep;
      });

      // 5. Collision check: Invader Projectiles vs Player
      setInvaderProjectiles(currentProjectiles => {
        let hitPlayer = false;
        currentProjectiles.forEach(p => {
          if (p.y >= 88 && p.y <= 94 && Math.abs(p.x - playerX) < 10) {
            hitPlayer = true;
          }
        });
        if (hitPlayer) {
          setGameState('gameover');
        }
        return currentProjectiles;
      });

      // 6. Invaders reach bottom check
      setInvaders(currentInvaders => {
        if (currentInvaders.some(inv => inv.alive && inv.y >= 85)) {
          setGameState('gameover');
        }
        return currentInvaders;
      });

    }, 50);

    return () => clearInterval(interval);
  }, [cardTheme, gameState, isHovered, playerX, isGameActive]);

  const startSpaceInvaders = () => {
    const initial = [];
    let id = 0;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        initial.push({
          id: id++,
          x: 20 + col * 20,
          y: 15 + row * 12,
          alive: true
        });
      }
    }
    setInvaders(initial);
    setLasers([]);
    setInvaderProjectiles([]);
    setScore(0);
    setGameState('playing');
  };

  // Border & Glow classes bases de acordo com o tema selecionado
  let borderGlowClasses = 'border-zinc-900 hover:border-zinc-800'; // Default limpo sem cordão branco/ciano
  if (cardTheme === 'oscar-winner') {
    borderGlowClasses = 'border-amber-500/25 border-2 hover:border-amber-400 hover:shadow-[0_0_25px_#fbbf24,_inset_0_0_15px_rgba(251,191,36,0.5)]';
  } else if (cardTheme === 'oscar-nominee') {
    borderGlowClasses = 'border-blue-500/20 hover:border-blue-400 hover:shadow-[0_0_18px_rgba(59,130,246,0.6),_inset_0_0_10px_rgba(59,130,246,0.4)]';
  } else if (cardTheme === 'terror') {
    borderGlowClasses = `border-red-900/20 border-2 ${isHovered ? 'hover-heartbeat' : ''}`;
  } else if (cardTheme === 'romance') {
    borderGlowClasses = `border-pink-500/20 border-2 ${isHovered ? 'animate-romantic-rgb' : ''}`;
  } else if (cardTheme === 'curta') {
    borderGlowClasses = `border-orange-500/25 border-2 hover:border-orange-500 ${isHovered ? 'hover:shadow-[0_0_20px_#f97316,_inset_0_0_10px_rgba(249,115,22,0.3)]' : ''}`;
  } else if (cardTheme === 'arquetipo-realidade') {
    borderGlowClasses = `border-zinc-400/20 border-2 hover:border-zinc-400 ${isHovered ? 'hover:shadow-[0_0_15px_rgba(161,161,170,0.5),_inset_0_0_8px_rgba(161,161,170,0.3)]' : ''}`;
  } else if (cardTheme === 'arquetipo-pop') {
    borderGlowClasses = `border-fuchsia-500/20 border-2 hover:border-fuchsia-500 ${isHovered ? 'hover:shadow-[0_0_20px_#d946ef,_inset_0_0_10px_rgba(217,70,239,0.3)]' : ''}`;
  } else if (cardTheme === 'arquetipo-adrenalina') {
    borderGlowClasses = `border-cyan-400/20 border-2 hover:border-cyan-400 ${isHovered ? 'hover:shadow-[0_0_20px_#22d3ee,_inset_0_0_10px_rgba(34,211,238,0.3)]' : ''}`;
  } else if (cardTheme === 'arquetipo-conflito') {
    borderGlowClasses = `border-red-700/20 border-2 hover:border-red-700 ${isHovered ? 'hover:shadow-[0_0_15px_#b91c1c,_inset_0_0_8px_rgba(185,28,28,0.3)]' : ''}`;
  } else if (cardTheme === 'arquetipo-enigma') {
    borderGlowClasses = `border-violet-600/20 border-2 hover:border-violet-600 ${isHovered ? 'hover:shadow-[0_0_20px_#7c3aed,_inset_0_0_10px_rgba(124,58,237,0.3)]' : ''}`;
  } else if (cardTheme === 'arquetipo-especulativo') {
    borderGlowClasses = `border-emerald-400/20 border-2 hover:border-emerald-400 ${isHovered ? 'hover:shadow-[0_0_20px_#34d399,_inset_0_0_10px_rgba(52,211,153,0.3)]' : ''}`;
  }

  // Fundo Temático no Hover
  let hoverBgClass = 'bg-zinc-955';
  if (cardTheme === 'oscar-winner') {
    hoverBgClass = 'bg-[radial-gradient(circle_at_center,_#27272a_0%,_#09090b_100%)]';
  } else if (cardTheme === 'oscar-nominee') {
    hoverBgClass = 'bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#09090b_100%)]';
  } else if (cardTheme === 'terror') {
    hoverBgClass = 'bg-[radial-gradient(circle_at_center,_#450a0a_0%,_#09090b_100%)]';
  } else if (cardTheme === 'romance' || cardTheme === 'curta') {
    hoverBgClass = 'bg-zinc-955/98';
  } else if (cardTheme === 'arquetipo-realidade') {
    hoverBgClass = 'bg-[#141416]/98';
  } else if (cardTheme === 'arquetipo-pop') {
    hoverBgClass = 'bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.12)_0%,_#09090b_100%)]';
  } else if (cardTheme === 'arquetipo-adrenalina') {
    hoverBgClass = 'bg-zinc-955/98';
  } else if (cardTheme === 'arquetipo-conflito') {
    hoverBgClass = 'bg-[#062419]/96';
  } else if (cardTheme === 'arquetipo-enigma') {
    hoverBgClass = 'bg-black/35';
  } else if (cardTheme === 'arquetipo-especulativo') {
    hoverBgClass = 'bg-[radial-gradient(circle_at_center,_#062f1f_0%,_#09090b_100%)]';
  }

  // Gestão do ciclo de aparições de terror e flicker branco a cada 10 segundos
  useEffect(() => {
    let intervalId = null;

    if (isHovered && cardTheme === 'terror') {
      const drawRandomIcons = () => {
        const num1 = Math.floor(Math.random() * 41) + 1;
        let num2 = Math.floor(Math.random() * 41) + 1;
        while (num2 === num1) {
          num2 = Math.floor(Math.random() * 41) + 1;
        }
        return [num1, num2];
      };

      const drawRandomPositions = () => {
        return [
          {
            top: `${Math.floor(Math.random() * 30) + 10}%`,
            left: `${Math.floor(Math.random() * 65) + 5}%`
          },
          {
            top: `${Math.floor(Math.random() * 30) + 48}%`,
            left: `${Math.floor(Math.random() * 65) + 5}%`
          }
        ];
      };

      const triggerCycle = () => {
        setIsFlashing(true);
        setFadeTrigger(false);
        setActiveIcons(drawRandomIcons());
        setIconPositions(drawRandomPositions());
        
        setTimeout(() => {
          setIsFlashing(false);
          setFadeTrigger(true);
        }, 150);
      };

      triggerCycle();

      intervalId = setInterval(() => {
        triggerCycle();
      }, 10000);
    } else {
      setIsFlashing(false);
      setFadeTrigger(false);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isHovered, cardTheme]);

  // Gestão de Entrada e Saída do Cursor (Controle do Flash)
  const handleMouseEnter = () => {
    setIsHovered(true);

    if (cardTheme === 'terror' && !hasFlashed) {
      setIsScareActive(true);
      setHasFlashed(true);
      setTimeout(() => {
        setIsScareActive(false);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsScareActive(false);
    setMouseHearts([]);
    setIsGameActive(false);
    setGameState('idle');
  };

  // Rastro Interativo do Mouse no Card / Movimento no Space Invaders
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (cardTheme === 'arquetipo-especulativo' && isGameActive && gameState === 'playing') {
      const pctX = (x / rect.width) * 100;
      setPlayerX(Math.max(5, Math.min(95, pctX)));
      return;
    }

    if (cardTheme !== 'romance' || !isHovered) return;

    const now = Date.now();
    if (now - lastParticleTime.current < 40) return;
    lastParticleTime.current = now;

    const colors = [
      'text-pink-400', 'text-purple-400', 'text-cyan-400', 'text-amber-400', 
      'text-rose-400', 'text-emerald-400', 'text-red-400', 'text-fuchsia-400', 'text-violet-400'
    ];

    const newParticle = {
      id: now + Math.random(),
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)],
      isFilled: Math.random() > 0.4,
      angle: Math.floor(Math.random() * 80) - 40
    };

    setMouseHearts((prev) => [...prev.slice(-29), newParticle]);
  };

  // Clique interativo no card
  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 🌌 ESPECULATIVO: Jogabilidade de Space Invaders
    if (cardTheme === 'arquetipo-especulativo' && isGameActive) {
      if (gameState === 'idle' || gameState === 'gameover' || gameState === 'victory') {
        startSpaceInvaders();
      } else if (gameState === 'playing') {
        setLasers(prev => [...prev, {
          id: Math.random(),
          x: playerX,
          y: 88
        }]);
      }
      return;
    }

    // 🍿 FAMÍLIA (arquetipo-pop): Cinema enquadramento e estrelas aconchegantes com outros significados
    if (cardTheme === 'arquetipo-pop') {
      setIsCozyPulsing(true);
      setIsMovieMaskActive(true);
      setIsCozyStaticActive(true);

      const symbols = ['✨', '🌟', '🎈', '🧸', '🍭', '✨', '🌟', '🎈', '🧸', '🍭'];
      const newSparks = Array.from({ length: 14 }).map((_, idx) => {
        const dx = (Math.random() - 0.5) * 160;
        const dy = -60 - Math.random() * 80;
        const scale = 0.6 + Math.random() * 0.8;
        return {
          id: Date.now() + idx + Math.random(),
          x,
          y,
          dx,
          dy,
          symbol: symbols[idx % symbols.length],
          scale,
          delay: idx * 30
        };
      });
      setCozySparks((prev) => [...prev, ...newSparks]);

      setTimeout(() => {
        setIsCozyPulsing(false);
      }, 200);

      setTimeout(() => {
        setIsMovieMaskActive(false);
        setIsCozyStaticActive(false);
        setCozySparks((prev) => prev.filter(s => !newSparks.includes(s)));
      }, 1200);
      return;
    }

    if (cardTheme === 'romance') {
      const colors = [
        'text-pink-500', 'text-purple-500', 'text-cyan-400', 'text-amber-400',
        'text-rose-500', 'text-emerald-400', 'text-red-500', 'text-fuchsia-400'
      ];

      const newBurst = Array.from({ length: 15 }).map((_, idx) => {
        const angle = (idx * 24) + Math.random() * 15;
        const distance = 40 + Math.random() * 80;
        const rad = (angle * Math.PI) / 180;
        return {
          id: Date.now() + idx + Math.random(),
          x,
          y,
          dx: Math.cos(rad) * distance,
          dy: Math.sin(rad) * distance,
          color: colors[idx % colors.length],
          isFilled: idx % 2 === 0,
          scale: Math.random() * 0.4 + 0.6,
          angle: Math.random() * 360
        };
      });

      setClickHearts((prev) => [...prev, ...newBurst]);

      setTimeout(() => {
        setClickHearts((prev) => prev.filter(h => !newBurst.includes(h)));
      }, 1200);
    }

    if (cardTheme === 'terror') {
      const newDrop = {
        id: Date.now() + Math.random(),
        x,
        y
      };
      setClickBloodDrops((prev) => [...prev, newDrop]);

      setTimeout(() => {
        setClickBloodDrops((prev) => prev.filter(d => d.id !== newDrop.id));
      }, 1800);
    }

    // ⚡ ADRENALINA: Explosão de Action Combo
    if (cardTheme === 'arquetipo-adrenalina') {
      const combatTexts = [
        'CRITICAL HIT!', 'COMBO X10!', 'STRIKE!', 'K.O.!', 'ULTRA COMBO!',
        'HEADSHOT!', 'RAMPAGE!', 'DOUBLE KILL!', 'TRIPLE KILL!', 'PENTAKILL!',
        'GODLIKE!', 'DOMINATING!', 'UNSTOPPABLE!', 'WICKED SICK!', 'MONSTER KILL!',
        'BRUTAL!', 'SAVAGE!'
      ];
      const text = combatTexts[Math.floor(Math.random() * combatTexts.length)];
      const newPop = {
        id: Date.now() + Math.random(),
        x,
        y,
        text
      };
      setPopCombos((prev) => [...prev, newPop]);
      setIsActionShakeActive(true);
      
      setTimeout(() => {
        setPopCombos((prev) => prev.filter(p => p.id !== newPop.id));
      }, 800);

      setTimeout(() => {
        setIsActionShakeActive(false);
      }, 300);
    }

    // ⚔️ CONFLITO (Guerra): Ataque Aéreo (Drone Lock & Airstrike Shock)
    if (cardTheme === 'arquetipo-conflito') {
      setLaserPos({ x, y });
      setIsLaserActive(true);
      
      // Laser brilha por 150ms antes da detonação
      setTimeout(() => {
        setIsLaserActive(false);
        setIsAirstrikeActive(true);
        setTimeout(() => setIsAirstrikeActive(false), 500);
      }, 150);

      // Fagulhas e fuligem
      const newEmbers = Array.from({ length: 12 }).map((_, idx) => {
        const dx = (Math.random() - 0.5) * 80;
        const scale = 0.4 + Math.random() * 0.8;
        return {
          id: Date.now() + idx + Math.random(),
          x: x + (Math.random() - 0.5) * 40,
          y,
          dx,
          scale,
          delay: idx * 50
        };
      });
      setWarEmbersList((prev) => [...prev, ...newEmbers]);
      setTimeout(() => {
        setWarEmbersList((prev) => prev.filter(e => !newEmbers.includes(e)));
      }, 1800);
    }

    // 🔍 ENIGMA (Drama): Melancolia Clicks logic (1º clique B&W Flash, 2º clique long diagonal crack at mouse position)
    if (cardTheme === 'arquetipo-enigma') {
      const clientWidth = e.currentTarget.clientWidth || 240;
      const pctX = (x / clientWidth) * 100;
      setShatterClickPos({ pctX });

      if (!isBandWMode) {
        // --- PRIMEIRO CLIQUE: Flash de foto bem rápido e depois fixa B&W ---
        setIsDramaFlashActive(true);
        setIsBandWMode(true);
        setIsDramaticActive(true);

        if (bandWTimer) clearTimeout(bandWTimer);

        // Termina o flash de câmera após 150ms
        setTimeout(() => {
          setIsDramaFlashActive(false);
        }, 150);

        // Fixado em B&W por 1 segundo apenas
        const timer = setTimeout(() => {
          setIsBandWMode(false);
          setIsDramaticActive(false);
        }, 1000);
        setBandWTimer(timer);
      } else {
        // --- SEGUNDO CLIQUE (se já estiver em modo B&W): Dispara a fratura diagonal longa na coordenada X do mouse ---
        setIsBandWMode(false);
        setIsDramaticActive(false);
        if (bandWTimer) clearTimeout(bandWTimer);

        setDramaticSubtitle(Math.random() > 0.5 ? '[Silêncio Dramático]' : '[Corte de Cena]');
        setIsEmotionalShatterActive(true);

        setTimeout(() => {
          setIsEmotionalShatterActive(false);
        }, 1500); // Corte longo de 1.5 segundos
      }
    }

    // ⏱️ CURTA: Efeito de desligar a TV (CRT) no clique
    if (cardTheme === 'curta') {
      setIsTvOffActive(true);
      setIsSpeedrunActive(true);
      setTimeout(() => {
        setIsTvOffActive(false);
        setIsSpeedrunActive(false);
      }, 700);
    }
  };

  // Lógica de Renderização das Barras de Volume Segmentadas
  const renderSegmentedBar = (score, maxScale = 10, activeColorClass = 'bg-amber-400 shadow-[0_0_8px_#fbbf24]') => {
    const num = Number(score);
    const activeCount = score !== null && score !== undefined && score !== 'N/A'
      ? Math.min(10, Math.max(0, Math.round((num / maxScale) * 10)))
      : 0;

    return (
      <div className="flex gap-0.5 w-full">
        {Array.from({ length: 10 }).map((_, i) => {
          const isActive = i < activeCount;
          const iLit = isActive && isHovered;

          return (
            <div 
              key={i} 
              className={`flex-1 h-1.5 rounded-[1px] transition-all duration-150 ease-out ${
                iLit 
                  ? activeColorClass 
                  : 'bg-zinc-800'
              }`}
              style={{ 
                transitionDelay: iLit ? `${i * 60}ms` : '0ms'
              }}
            />
          );
        })}
      </div>
    );
  };

  // Renderiza poeira de ouro flutuante para Vencedores de Oscar
  const renderGoldSparks = () => {
    if (!isHovered || cardTheme !== 'oscar-winner') return null;
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute bottom-2 left-[15%] w-1 h-1 rounded-full bg-amber-400/40 animate-floatUp" style={{ animationDelay: '0s', animationDuration: '3.5s' }}></div>
        <div className="absolute bottom-2 left-[35%] w-1.5 h-1.5 rounded-full bg-amber-300/30 animate-floatUp" style={{ animationDelay: '0.6s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-2 left-[55%] w-1 h-1 rounded-full bg-amber-500/40 animate-floatUp" style={{ animationDelay: '1.2s', animationDuration: '3.2s' }}></div>
        <div className="absolute bottom-2 left-[75%] w-1.5 h-1.5 rounded-full bg-amber-400/30 animate-floatUp" style={{ animationDelay: '1.8s', animationDuration: '4.5s' }}></div>
        <div className="absolute bottom-2 left-[90%] w-1 h-1 rounded-full bg-amber-300/35 animate-floatUp" style={{ animationDelay: '2.4s', animationDuration: '3.8s' }}></div>
      </div>
    );
  };

  // Renderiza spotlights cruzados e poeira de prata para Indicados de Oscar
  const renderOscarNomineeEffects = () => {
    if (!isHovered || cardTheme !== 'oscar-nominee') return null;
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div 
          className="absolute bottom-0 left-0 w-[120px] h-[400px] origin-bottom-left bg-gradient-to-t from-blue-500/20 to-transparent blur-sm animate-searchlight-left"
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 55% 100%, 45% 100%)' }}
        />
        <div 
          className="absolute bottom-0 right-0 w-[120px] h-[400px] origin-bottom-right bg-gradient-to-t from-blue-500/20 to-transparent blur-sm animate-searchlight-right"
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 55% 100%, 45% 100%)' }}
        />
        <div className="absolute bottom-2 left-[20%] w-1.5 h-1.5 rounded-full bg-blue-300/30 blur-[0.5px] animate-floatUp" style={{ animationDelay: '0s', animationDuration: '3.6s' }} />
        <div className="absolute bottom-2 left-[50%] w-1.5 h-1.5 rounded-full bg-slate-350/40 animate-floatUp" style={{ animationDelay: '1.2s', animationDuration: '4.0s' }} />
        <div className="absolute bottom-2 left-[80%] w-1.5 h-1.5 rounded-full bg-blue-200/25 blur-[1px] animate-floatUp" style={{ animationDelay: '2.4s', animationDuration: '4.8s' }} />
      </div>
    );
  };

  // Renderiza filetes de sangue viscoso e Aparições Aleatórias no Modo S
  const renderVisceralBloodAndIcons = () => {
    if (!isHovered || cardTheme !== 'terror' || !fadeTrigger) return null;
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-0 inset-x-0 h-1 bg-red-655" />
        <div className="absolute w-[1.5px] bg-red-655 animate-blood" style={{ left: '5%', animationDelay: '0.0s' }} />
        <div className="absolute w-[2px] bg-red-700 animate-blood" style={{ left: '18%', animationDelay: '0.7s' }} />
        <div className="absolute w-[1px] bg-red-600 animate-blood" style={{ left: '28%', animationDelay: '1.8s' }} />
        <div className="absolute w-[2.5px] bg-red-800 animate-blood" style={{ left: '40%', animationDelay: '0.3s' }} />
        <div className="absolute w-[1.5px] bg-red-650 animate-blood" style={{ left: '50%', animationDelay: '1.2s' }} />
        <div className="absolute w-[2px] bg-red-700 animate-blood" style={{ left: '62%', animationDelay: '0.9s' }} />
        <div className="absolute w-[1px] bg-red-600 animate-blood" style={{ left: '74%', animationDelay: '2.1s' }} />
        <div className="absolute w-[2.5px] bg-red-800 animate-blood" style={{ left: '84%', animationDelay: '1.5s' }} />
        <div className="absolute w-[1.5px] bg-red-700 animate-blood" style={{ left: '92%', animationDelay: '0.5s' }} />

        <img
          src={`/Imagens/terror-icon-${activeIcons[0]}.png`}
          alt="Aparição Sobrenatural 1"
          className="absolute w-14 h-14 object-contain transition-opacity duration-[1500ms] ease-in-out"
          style={{ ...iconPositions[0], opacity: 0.40 }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <img
          src={`/Imagens/terror-icon-${activeIcons[1]}.png`}
          alt="Aparição Sobrenatural 2"
          className="absolute w-14 h-14 object-contain transition-opacity duration-[1500ms] ease-in-out"
          style={{ ...iconPositions[1], opacity: 0.40 }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
    );
  };

  // Renderiza efeitos de Romance (Mode H default)
  const renderRomanceEffects = () => {
    if (!isHovered || cardTheme !== 'romance') return null;

    const heartCount = 20;
    const colors = [
      'text-pink-500', 'text-purple-500', 'text-cyan-400', 'text-amber-400',
      'text-rose-500', 'text-emerald-400', 'text-red-500', 'text-fuchsia-400'
    ];

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-4 h-4">
          {Array.from({ length: heartCount }).map((_, idx) => {
            const colorClass = colors[idx % colors.length];
            const isFilled = idx % 2 === 0;

            const translateX = Math.sin(idx * 1.7) * 120;
            const translateY = -80 - ((idx * 27) % 230);
            const scale = 0.5 + ((idx * 7) % 7) * 0.1;
            const rotate = (idx * 43) % 360;

            return (
              <div
                key={idx}
                className={`absolute ${colorClass}`}
                style={{
                  '--tw-translate-x': `${translateX}px`,
                  '--tw-translate-y': `${translateY}px`,
                  '--tw-scale-x': `${scale}`,
                  '--tw-rotate': `${rotate}deg`,
                  animation: 'heartBurst 2.5s infinite ease-out',
                  animationDelay: `${idx * 120}ms`,
                  left: '0',
                  top: '0'
                }}
              >
                {isFilled ? (
                  <svg className="w-5 h-5 fill-current drop-shadow-[0_0_4px_currentColor]" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 stroke-current fill-none drop-shadow-[0_0_4px_currentColor]" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderiza poeira mágica e calor aconchegante para arquetipo-pop (Família) no Hover
  const renderPopHoverEffects = () => {
    if (!isHovered || cardTheme !== 'arquetipo-pop') return null;
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-70">
        <div className="absolute bottom-2 left-[20%] w-1.5 h-1.5 rounded-full bg-amber-400 animate-floatUp" style={{ animationDelay: '0s', animationDuration: '4.2s' }} />
        <div className="absolute bottom-4 left-[42%] w-1 h-1 rounded-full bg-amber-300 animate-floatUp" style={{ animationDelay: '1.2s', animationDuration: '3.6s' }} />
        <div className="absolute bottom-2 left-[65%] w-2 h-2 rounded-full bg-amber-500/80 animate-floatUp" style={{ animationDelay: '0.5s', animationDuration: '4.8s' }} />
        <div className="absolute bottom-5 left-[85%] w-1.5 h-1.5 rounded-full bg-amber-400 animate-floatUp" style={{ animationDelay: '1.9s', animationDuration: '4.0s' }} />
      </div>
    );
  };

  const getPosterClass = () => {
    let classes = "w-full h-full object-cover transition-all duration-500";
    
    // Curta TV turn off click effect
    if (cardTheme === 'curta' && isTvOffActive) {
      return "w-full h-full object-cover animate-tv-turn-off";
    }

    // Se o card de Drama estiver sob o flash ou fixado em B&W, ele fica B&W independentemente do Hover, e usamos transição rápida
    if (cardTheme === 'arquetipo-enigma') {
      if (isBwFlashActive || isDramaFlashActive) {
        return "w-full h-full object-cover animate-bw-flash";
      }
      if (isBandWMode) {
        return "w-full h-full object-cover grayscale contrast-[1.3] brightness-[0.85]";
      }
    }
    
    // Caso contrário, adiciona as classes de hover normais
    if (isHovered) {
      classes += " group-hover:blur-[2px]";
      
      if (cardTheme === 'arquetipo-realidade') {
        classes += " sepia-[0.35] brightness-[0.85] contrast-[1.05]";
      } else if (cardTheme === 'arquetipo-enigma') {
        // Modo Hover Normal: Melancólico Azul (Refletindo tristeza/lágrimas)
        classes += " sepia-[0.4] hue-rotate-[190deg] saturate-[2] brightness-[0.7] contrast-[1.25]";
      } else if (cardTheme === 'arquetipo-conflito') {
        // ⚔️ GUERRA: Visão Térmica Esmeralda HUD
        classes += " sepia-[1] hue-rotate-[100deg] saturate-[3.5] brightness-[0.75] contrast-[1.3]";
      } else if (cardTheme === 'arquetipo-pop') {
        // Redução de saturação de 20% no Modo de Aconchego
        classes += " saturate-[0.8]";
      }
    }
    
    return classes;
  };

  // Classes de impacto do clique aplicadas dinamicamente ao container do card
  let activeClickAnimationClass = '';
  if (isNitroActive) {
    activeClickAnimationClass = 'animate-nitro';
  } else if (isMuzzleActive) {
    activeClickAnimationClass = 'animate-recoil';
  } else if (isGravityActive) {
    activeClickAnimationClass = 'animate-warp';
  } else if (isSpeedrunActive) {
    activeClickAnimationClass = 'animate-glitch';
  } else if (isActionShakeActive) {
    activeClickAnimationClass = 'animate-action-shake';
  } else if (isAirstrikeActive) {
    activeClickAnimationClass = 'animate-severe-shake animate-airstrike';
  } else if (isDramaticActive) {
    activeClickAnimationClass = 'animate-dramatic';
  } else if (isMovieMaskActive) {
    activeClickAnimationClass = 'animate-movie-mask';
  }

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleCardClick}
      className={`relative group overflow-hidden rounded-xl bg-zinc-955 aspect-[2/3] transition-all duration-500 ease-out transform hover:-translate-y-2 select-none border ${borderGlowClasses} ${
        isScareActive ? 'animate-jumpscare-flash' : ''
      } ${activeClickAnimationClass}`}
    >
      {/* Estilos CSS Embutidos para os Efeitos Estéticos Avançados de Videogame */}
      <style>{`
        @keyframes shine {
          0% { left: -150%; }
          50% { left: 150%; }
          100% { left: 150%; }
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.6) rotate(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(-180px) scale(1.1) rotate(15deg); opacity: 0; }
        }
        
        /* Batimento Cardíaco Real de Borda do Card de Terror */
        @keyframes heavyHeartbeat {
          0%, 100% { transform: translateY(-8px) scale(1.02); box-shadow: 0 0 15px #ef4444, inset 0 0 10px rgba(239,68,68,0.3); }
          20% { transform: translateY(-8px) scale(1.05); box-shadow: 0 0 35px #ef4444, inset 0 0 20px rgba(239,68,68,0.5); }
          40% { transform: translateY(-8px) scale(1.03); box-shadow: 0 0 20px #ef4444, inset 0 0 12px rgba(239,68,68,0.4); }
          60% { transform: translateY(-8px) scale(1.06); box-shadow: 0 0 40px #ef4444, inset 0 0 25px rgba(239,68,68,0.6); }
        }

        /* Escorrimento do Sangue */
        @keyframes bloodFlow {
          0% { height: 0; opacity: 0; }
          10% { opacity: 1; }
          100% { height: 75%; }
        }

        /* Efeito Stroboscópico de Jump Scare */
        @keyframes jumpscareFlash {
          0%, 100% { filter: invert(1) brightness(2.2); opacity: 0.95; }
          50% { filter: none; opacity: 1; }
        }

        /* Efeito de Canal Piscando em Branco Rápido (Susto/Troca de Sinal 150ms) */
        @keyframes signalSwitch {
          0% { opacity: 1; filter: brightness(2.5); }
          100% { opacity: 0; filter: none; }
        }

        @keyframes violent-shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-2px, 2px) rotate(-0.5deg); }
          20% { transform: translate(2px, -2px) rotate(0.8deg); }
          30% { transform: translate(-1px, 1px) rotate(-0.3deg); }
          40% { transform: translate(2px, 1px) rotate(0.5deg); }
          50% { transform: translate(-2px, -1px) rotate(-0.8deg); }
          60% { transform: translate(1px, 2px) rotate(0.3deg); }
          70% { transform: translate(-2px, 1px) rotate(-0.5deg); }
          80% { transform: translate(2px, -2px) rotate(0.8deg); }
          90% { transform: translate(-1px, -2px) rotate(-0.3deg); }
        }
        @keyframes pulse-fog {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          15% { opacity: 0.90; transform: scale(1.05); }
          30% { opacity: 0.55; transform: scale(1.01); }
          45% { opacity: 0.95; transform: scale(1.07); }
          70% { opacity: 0.45; transform: scale(1); }
        }

        /* Animações dos Canhões de Luz do Oscar */
        @keyframes searchlightLeft {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(20deg); }
        }

        @keyframes searchlightRight {
          0%, 100% { transform: rotate(15deg); }
          50% { transform: rotate(-20deg); }
        }

        /* MODO H: Explosão inicial e rotação dos corações */
        @keyframes heartBurst {
          0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 0; }
          50% { opacity: 1; }
          100% { 
            transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(var(--tw-scale-x)) rotate(var(--tw-rotate)); 
            opacity: 0; 
          }
        }

        /* MODO H: Gradiente RGB Gamer suave */
        @keyframes romanticRGB {
          0%, 100% { border-color: #f472b6; box-shadow: 0 0 20px #f472b6; }
          25% { border-color: #a855f7; box-shadow: 0 0 20px #a855f7; }
          50% { border-color: #ef4444; box-shadow: 0 0 20px #ef4444; }
          75% { border-color: #f97316; box-shadow: 0 0 20px #f97316; }
        }

        /* Rastro Interativo do Mouse */
        @keyframes mouseHeartFloat {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; filter: drop-shadow(0 0 4px currentColor); }
          100% { transform: translate(-50%, -100%) translateY(-50px) scale(1.3) rotate(var(--tw-rotate, 20deg)); opacity: 0; }
        }

        /* Explosão de Corações no Clique (Romance) */
        @keyframes clickHeartBurst {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; filter: drop-shadow(0 0 4px currentColor); }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(var(--scale)) rotate(var(--angle)); opacity: 0; }
        }

        /* Queda da Gota de Sangue no Clique (Terror) */
        @keyframes clickBloodFall {
          0% { top: var(--start-y); opacity: 1; }
          100% { top: 100%; opacity: 0.9; }
        }

        /* ⚡ ADRENALINA: Contador de Combo de Ação / Luta */
        @keyframes actionComboPop {
          0% { transform: scale(0.4) rotate(-10deg); opacity: 0; filter: drop-shadow(0 0 0px #22d3ee); }
          20% { transform: scale(1.3) rotate(5deg); opacity: 1; filter: drop-shadow(0 0 12px #22d3ee); }
          100% { transform: scale(1) translateY(-50px); opacity: 0; }
        }

        /* 🍿 FAMÍLIA: Brilho Mágico de Aconchego (Estilo Estrela Cadente) */
        @keyframes cozyGoldDust {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy) - 60px)) scale(1.2); opacity: 0; }
        }
        .animate-cozy {
          animation: cozyGoldDust 1.5s forwards ease-out;
        }

        /* 🍿 FAMÍLIA: Pulsação de Holograma Quente */
        @keyframes cozyHoloPulse {
          0%, 100% { opacity: 0.3; filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.4)); }
          50% { opacity: 0.6; filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.7)); }
        }

        /* 🍿 FAMÍLIA: "Fade-in de Cinema" (Widescreen Letterbox) */
        @keyframes movieStartLetterbox {
          0% {
            -webkit-mask-image: linear-gradient(to bottom, black 100%, transparent 100%);
            mask-image: linear-gradient(to bottom, black 100%, transparent 100%);
          }
          20% {
            -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 80%, transparent 20%, black 20%);
            mask-image: linear-gradient(to bottom, black 80%, transparent 80%, transparent 20%, black 20%);
          }
          100% {
            -webkit-mask-image: linear-gradient(to bottom, black 100%, transparent 100%);
            mask-image: linear-gradient(to bottom, black 100%, transparent 100%);
          }
        }
        .animate-movie-mask {
          animation: movieStartLetterbox 1s ease-in-out forwards;
        }

        /* 🍿 FAMÍLIA: Ruído Analógico Vintage */
        @keyframes cozyNoise {
          0%, 100% { background-position: 0 0; opacity: 0; }
          10% { background-image: radial-gradient(circle, #fff 10%, transparent 11%); background-size: 8px 8px; opacity: 0.25; }
          30% { background-image: radial-gradient(circle, #fff 15%, transparent 16%); background-size: 6px 6px; opacity: 0.15; }
          50% { background-image: radial-gradient(circle, #fff 8%, transparent 9%); background-size: 12px 12px; opacity: 0.2; }
          70% { background-image: radial-gradient(circle, #fff 12%, transparent 13%); background-size: 10px 10px; opacity: 0.1; }
          90% { background-image: radial-gradient(circle, #fff 6%, transparent 7%); background-size: 7px 7px; opacity: 0.2; }
        }
        .animate-cozy-noise {
          animation: cozyNoise 0.5s infinite steps(4);
        }

        /* 🔍 DRAMA: Foco de Holofote e Partículas de Poeira de Cinema */
        @keyframes cinematicDust {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(15px, -20px); opacity: 0.6; }
        }

        /* 🔍 DRAMA: Ripple de Impacto Emocional (Corte de Cena) */
        @keyframes dramaticFade {
          0% { filter: brightness(1) contrast(1); }
          20% { filter: brightness(1.5) contrast(1.25); }
          100% { filter: brightness(1) contrast(1); }
        }
        .animate-dramatic {
          animation: dramaticFade 0.5s forwards ease-out;
        }

        /* 🔍 DRAMA: Flash Strobe de Preto e Branco */
        @keyframes bwFlashStrobe {
          0% { filter: grayscale(1) brightness(1.8) contrast(1.4); }
          50% { filter: grayscale(0) brightness(1); }
          100% { filter: grayscale(1) contrast(1.3) brightness(0.85); }
        }
        .animate-bw-flash {
          animation: bwFlashStrobe 0.12s ease-out forwards;
        }

        /* 🔍 DRAMA: Flash de Câmera Fotográfica (Primeiro clique) */
        @keyframes cameraFlash {
          0% { opacity: 1; filter: brightness(2.5); }
          100% { opacity: 0; filter: none; }
        }
        .animate-camera-flash {
          animation: cameraFlash 0.15s ease-out forwards;
        }

        /* 🔍 DRAMA: Rachadura Interna / Fratura Emocional Longa - Metade Esquerda */
        @keyframes longShatterLeft {
          0% { opacity: 0; transform: none; }
          10% { opacity: 1; filter: brightness(1.8) contrast(1.2); }
          25% { transform: translate(-30px, -15px); opacity: 1; }
          85% { transform: translate(-30px, -15px); opacity: 1; }
          100% { transform: translate(-45px, -22px); opacity: 0; }
        }
        .animate-long-shatter-left {
          animation: longShatterLeft 1.5s forwards cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* 🔍 DRAMA: Rachadura Interna / Fratura Emocional Longa - Metade Direita */
        @keyframes longShatterRight {
          0% { opacity: 0; transform: none; }
          10% { opacity: 1; filter: brightness(1.8) contrast(1.2); }
          25% { transform: translate(30px, 15px); opacity: 1; }
          85% { transform: translate(30px, 15px); opacity: 1; }
          100% { transform: translate(45px, 22px); opacity: 0; }
        }
        .animate-long-shatter-right {
          animation: longShatterRight 1.5s forwards cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* 🔍 DRAMA: Gotas de Lágrimas Caindo */
        @keyframes tearFall {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(320px); opacity: 0; }
        }
        .animate-tear-fall {
          animation: tearFall 3.0s infinite linear;
        }

        /* Tremor Adrenalina Action Shake */
        @keyframes actionShake {
          0%, 100% { transform: translateY(-8px) scale(1.02); }
          20% { transform: translateY(-4px) scale(1.02) translateX(-4px); }
          40% { transform: translateY(-12px) scale(1.03) translateX(4px); }
          60% { transform: translateY(-6px) scale(1.02) translateX(-2px); }
          80% { transform: translateY(-10px) scale(1.02) translateX(2px); }
        }
        .animate-action-shake {
          animation: actionShake 0.3s forwards ease-out;
        }

        /* ⚡ ADRENALINA: Explosão de Nitro */
        @keyframes nitroBurst {
          0% { filter: blur(0px) brightness(1); transform: translateY(-8px) scale(1.02); }
          15% { filter: blur(4px) brightness(1.8); transform: translateY(-8px) scale(1.08); }
          100% { filter: blur(0px) brightness(1); transform: translateY(-8px) scale(1.02); }
        }
        .animate-nitro {
          animation: nitroBurst 0.5s forwards ease-out;
        }

        /* ⚔️ CONFLITO: Flash de Disparo (Muzzle Flash) */
        @keyframes muzzleFlash {
          0% { opacity: 1; background-color: rgba(255, 255, 255, 0.95); }
          100% { opacity: 0; background-color: transparent; }
        }
        .animate-muzzle {
          animation: muzzleFlash 0.3s forwards ease-out;
        }

        /* ⚔️ CONFLITO: Recuo do Card */
        @keyframes recoilShake {
          0% { transform: translateY(-8px) scale(1.02); }
          15% { transform: translateY(8px) scale(0.96) rotate(-1deg); }
          50% { transform: translateY(-12px) scale(1.04) rotate(0.5deg); }
          100% { transform: translateY(-8px) scale(1.02); }
        }
        .animate-recoil {
          animation: recoilShake 0.3s forwards ease-out;
        }

        /* ⚔️ GUERRA: Varredura de Interface de Drone Térmico (Scanline FLIR) */
        @keyframes thermalScan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-thermal-scan {
          animation: thermalScan 2.5s infinite linear;
        }

        /* ⚔️ GUERRA: Impacto de Ataque Aéreo (Explosão e Onda de Choque) */
        @keyframes airstrikeBlast {
          0% { transform: scale(1); filter: saturate(1) brightness(1) blur(0); }
          10% { transform: scale(1.08); filter: saturate(2) brightness(2.5) blur(2px); box-shadow: 0 0 50px #ef4444; }
          100% { transform: scale(1); filter: saturate(1) brightness(1) blur(0); }
        }
        .animate-airstrike {
          animation: airstrikeBlast 0.5s forwards ease-out;
        }

        /* ⚔️ GUERRA: Tremor Severo */
        @keyframes severeShake {
          0%, 100% { transform: translateY(-8px) scale(1.02); }
          10% { transform: translateY(-3px) scale(1.04) translateX(-8px) rotate(-1.5deg); }
          30% { transform: translateY(-13px) scale(1.06) translateX(8px) rotate(2deg); }
          50% { transform: translateY(-5px) scale(1.01) translateX(-6px) rotate(-1deg); }
          70% { transform: translateY(-11px) scale(1.03) translateX(6px) rotate(1deg); }
          90% { transform: translateY(-7px) scale(1.02) translateX(-2px); }
        }
        .animate-severe-shake {
          animation: severeShake 0.5s forwards ease-out;
        }

        /* ⚔️ GUERRA: Fuligem e Fagulhas de Incêndio Subindo */
        @keyframes warEmbers {
          0% { transform: translate(-50%, 0) translateY(40px) scale(1.2); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translate(calc(-50% + var(--dx)), -120px) scale(0.4); opacity: 0; }
        }
        .animate-embers {
          animation: warEmbers 1.5s forwards ease-out;
        }

        /* 🌌 ESPECULATIVO: Implosão de Buraco Negro/Singularidade */
        @keyframes gravityWarp {
          0% { transform: translateY(-8px) scale(1.02); filter: hue-rotate(0deg); }
          30% { transform: translateY(-8px) scale(0.92); filter: hue-rotate(180deg) brightness(1.5); }
          100% { transform: translateY(-8px) scale(1.02); filter: hue-rotate(360deg); }
        }
        .animate-warp {
          animation: gravityWarp 0.5s forwards ease-out;
        }

        /* ⏱️ CURTA: Glitch de Tela de Pause do Speedrun Customizado */
        @keyframes speedrunPause {
          0%, 100% { clip-path: inset(0 0 0 0); }
          20% { clip-path: inset(20% 0 60% 0); transform: skewX(-10deg); }
          40% { clip-path: inset(70% 0 10% 0); transform: skewX(10deg); }
        }
        .animate-glitch {
          animation: speedrunPause 0.5s forwards steps(5);
        }

        /* ⏱️ CURTA: Desligar a TV (CRT) */
        @keyframes tvTurnOff {
          0% { transform: scale(1); filter: brightness(1); }
          40% { transform: scaleY(0.01) scaleX(1.15); filter: brightness(2.0); opacity: 1; }
          100% { transform: scaleY(0) scaleX(0); filter: brightness(3.0); opacity: 0; }
        }
        .animate-tv-turn-off {
          animation: tvTurnOff 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        /* Mira sniper bobbing */
        @keyframes aimBob {
          0%, 100% { transform: translate(-50%, -50%) translate(0, 0); }
          25% { transform: translate(-50%, -50%) translate(-2px, 3px); }
          50% { transform: translate(-50%, -50%) translate(3px, -1px); }
          75% { transform: translate(-50%, -50%) translate(-1px, -2px); }
        }
        .animate-aim {
          animation: aimBob 4s infinite ease-in-out;
        }

        /* Fundo Cósmico Matrix rotação */
        @keyframes cosmicSpin {
          0% { transform: rotate(0deg) scale(1); }
          100% { transform: rotate(360deg) scale(1.25); }
        }
        .animate-cosmic {
          animation: cosmicSpin 40s infinite linear;
        }

        /* Linhas cinéticas para Adrenalina */
        @keyframes kineticLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-kinetic {
          animation: kineticLine 1.5s infinite linear;
        }

        .animate-shine {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.45), transparent);
          transform: skewX(-25deg);
          animation: shine 3s infinite ease-in-out;
        }
        .animate-floatUp {
          animation: floatUp 3s infinite ease-out;
        }
        .hover-heartbeat {
          animation: heavyHeartbeat 1.2s infinite ease-in-out !important;
        }
        .animate-blood {
          animation: bloodFlow 4.5s forwards ease-in-out;
          top: 0;
        }
        .animate-jumpscare-flash {
          animation: jumpscareFlash 0.15s steps(2) infinite;
        }
        .animate-signal-switch {
          animation: signalSwitch 0.15s forwards ease-out;
        }
        .animate-violent-shake {
          animation: violent-shake 0.2s infinite linear;
        }
        .animate-pulse-fog {
          animation: pulse-fog 1.2s infinite ease-in-out;
        }
        .animate-searchlight-left {
          animation: searchlightLeft 6s infinite ease-in-out;
        }
        .animate-searchlight-right {
          animation: searchlightRight 6s infinite ease-in-out;
        }
        .animate-romantic-rgb {
          animation: romanticRGB 6s infinite linear !important;
        }
        .animate-mouse-heart {
          animation: mouseHeartFloat 1.2s forwards ease-out;
        }
        .animate-click-heart {
          animation: clickHeartBurst 1.2s forwards ease-out;
        }
        .animate-click-blood {
          animation: clickBloodFall 1.8s forwards ease-in;
        }
      `}</style>

      {/* Shine overlay para Oscar Winners */}
      {isHovered && cardTheme === 'oscar-winner' && (
        <div className="animate-shine z-20 pointer-events-none" />
      )}

      {/* Medalha do Oscar (Selo de Conquista) no Pôster */}
      {(isOscarWinner || isOscarNominee) && (
        <div className="absolute top-2.5 left-2.5 z-20 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none select-none">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-lg ${
            isOscarWinner 
              ? 'bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.35)]' 
              : 'bg-gradient-to-b from-zinc-400 to-zinc-655 border-zinc-400'
          }`}>
            <span className="text-[12px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {isOscarWinner ? '🏆' : '🎬'}
            </span>
          </div>
        </div>
      )}

      {/* Rating Badge */}
      <div className={getVotesBadgeClass()}>
        <span>⭐</span>
        <span>NOTA: {formattedUserRating}</span>
      </div>

      {/* Letterbox Widescreen Bars para o arquetipo-enigma (Drama) ao Clicar (z-30) */}
      {cardTheme === 'arquetipo-enigma' && (
        <>
          <div className={`absolute top-0 inset-x-0 bg-black transition-all duration-150 z-30 pointer-events-none ${isDramaticActive ? 'h-5 opacity-100' : 'h-0 opacity-0 invisible'}`} />
          <div className={`absolute bottom-0 inset-x-0 bg-black transition-all duration-150 z-30 pointer-events-none ${isDramaticActive ? 'h-5 opacity-100' : 'h-0 opacity-0 invisible'}`} />
        </>
      )}

      {/* Gradiente de fundo escuro para legibilidade */}
      <div className="bg-gradient-to-t from-black/95 via-black/45 to-transparent absolute bottom-0 inset-x-0 h-1/3 z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-300" />

      {/* HUD da Frente - Canto Inferior Esquerdo (Bandeiras) e Direito (Qtd Votos) */}
      <div className="absolute bottom-2.5 inset-x-2.5 z-20 flex justify-between items-center group-hover:opacity-0 transition-opacity duration-300 pointer-events-none select-none">
        
        {/* Fila de Bandeiras */}
        <div className="flex gap-1 bg-black/60 backdrop-blur-sm border border-zinc-800/80 rounded px-1.5 py-0.5 items-center min-h-[22px]">
          {countries.length > 0 ? (
            countries.map((country, idx) => {
              const url = getFlagUrl(country);
              if (country === 'Desconhecido' || !url) return <span key={idx} className="text-[9px]">🌐</span>;
              return (
                <img 
                  key={idx}
                  src={url} 
                  alt={country} 
                  className="w-4 h-2.5 object-cover rounded-sm border border-zinc-900/50 shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              );
            })
          ) : (
            <span className="text-[9px]">🌐</span>
          )}
        </div>

        {/* Qtd Votos Pílula */}
        <div className="bg-black/60 backdrop-blur-sm border border-zinc-800/80 rounded px-2 py-0.5 text-amber-400 font-mono font-bold text-xs tracking-wider flex items-center gap-1">
          <span>👥</span>
          <span>{formatVotes(movie.vote_count)}</span>
        </div>
      </div>

      {/* Imagem do Poster */}
      <img
        src={poster_url ? (poster_url.startsWith('/') ? `http://localhost:5000${poster_url}` : poster_url) : defaultPoster}
        alt={title}
        className={`${getPosterClass()} ${isEmotionalShatterActive ? 'opacity-0' : ''}`}
        loading="lazy"
      />

      {/* 🔍 ENIGMA (Drama): Ilusão Óptica de Rachadura Diagonal ao Clicar (z-30) cortando EXATAMENTE onde o mouse está */}
      {cardTheme === 'arquetipo-enigma' && isEmotionalShatterActive && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-xl">
          {/* Metade Esquerda/Superior */}
          <img
            src={poster_url ? (poster_url.startsWith('/') ? `http://localhost:5000${poster_url}` : poster_url) : defaultPoster}
            alt="shatter left"
            className="absolute inset-0 w-full h-full object-cover grayscale contrast-[1.35] brightness-[1.6] animate-long-shatter-left"
            style={{
              clipPath: `polygon(0 0, ${Math.max(0, Math.min(100, shatterClickPos.pctX - 15))}% 0, ${Math.max(0, Math.min(100, shatterClickPos.pctX + 15))}% 100%, 0 100%)`
            }}
          />
          {/* Metade Direita/Inferior */}
          <img
            src={poster_url ? (poster_url.startsWith('/') ? `http://localhost:5000${poster_url}` : poster_url) : defaultPoster}
            alt="shatter right"
            className="absolute inset-0 w-full h-full object-cover grayscale contrast-[1.35] brightness-[1.6] animate-long-shatter-right"
            style={{
              clipPath: `polygon(${Math.max(0, Math.min(100, shatterClickPos.pctX - 15))}% 0, 100% 0, 100% 100%, ${Math.max(0, Math.min(100, shatterClickPos.pctX + 15))}% 100%)`
            }}
          />
        </div>
      )}

      {/* Camada Escura Translúcida no Hover */}
      <div className={`absolute inset-0 transition-all duration-300 z-10 overflow-hidden rounded-xl ${
        isBandWMode || isGameActive ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'
      }`}>
        
        {/* Fundo Temático (z-0) */}
        <div className={`absolute inset-0 z-0 ${hoverBgClass}`} />
        
        {/* MODO P: Efeito Vinheta Orgânica pulsante */}
        {cardTheme === 'terror' && isHovered && (
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle,_transparent_40%,_black_100%)] pointer-events-none animate-pulse-fog" />
        )}

        {/* Filtro de Desfoque de Vidro Fosco (z-0) */}
        <div className={`absolute inset-0 z-0 pointer-events-none ${
          cardTheme === 'arquetipo-enigma' || cardTheme === 'arquetipo-pop' ? 'backdrop-blur-none' : 'backdrop-blur-md'
        }`} />

        {/* Scanlines (z-0) */}
        <div className="absolute inset-0 z-0 opacity-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none" />

        {/* Efeitos Especiais Flutuantes (z-10) */}
        {cardTheme === 'oscar-winner' && renderGoldSparks()}
        {cardTheme === 'oscar-nominee' && renderOscarNomineeEffects()}
        {cardTheme === 'terror' && renderVisceralBloodAndIcons()}
        {cardTheme === 'romance' && renderRomanceEffects()}

        {/* EFEITOS ADICIONAIS DE ARQUÉTIPOS (z-10) */}
        {cardTheme === 'arquetipo-realidade' && isHovered && (
          <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_30%,_black_90%)] opacity-30 z-10 pointer-events-none" />
        )}
        {cardTheme === 'arquetipo-pop' && renderPopHoverEffects()}
        
        {/* 🍿 MODO H (Família): Holograma Silhueta do Sofá (z-0, atrás do texto) */}
        {cardTheme === 'arquetipo-pop' && isHovered && (
          <div 
            className={`absolute inset-0 flex items-center justify-center pointer-events-none z-0 transition-transform duration-200 ${
              isCozyPulsing ? 'scale-125 brightness-150' : 'scale-100'
            }`}
            style={{
              animation: 'cozyHoloPulse 4s infinite ease-in-out'
            }}
          >
            <svg viewBox="0 0 100 100" className="w-48 h-48 text-amber-300/40 stroke-current fill-none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Sofa */}
              <path d="M15 65 h70 v12 h-70 z" />
              <path d="M20 65 v-20 c0 -5, 5 -10, 10 -10 h40 c5 0, 10 5, 10 10 v20" />
              <path d="M10 50 h10 v15 h-10 z" />
              <path d="M80 50 h10 v15 h-10 z" />
              <path d="M32 77 v4" />
              <path d="M68 77 v4" />
              {/* Family: Parent 1 */}
              <circle cx="38" cy="35" r="5" />
              <path d="M33 50 v-5 c0 -3, 2 -5, 5 -5 s5 2, 5 5 v5" />
              {/* Family: Parent 2 */}
              <circle cx="52" cy="32" r="5.5" />
              <path d="M46 50 v-6 c0 -3, 3 -6, 6 -6 s6 3, 6 6 v6" />
              {/* Family: Child */}
              <circle cx="65" cy="40" r="4" />
              <path d="M61 50 v-3 c0 -2, 2 -4, 4 -4 s4 2, 4 4 v3" />
            </svg>
          </div>
        )}

        {/* 🍿 MODO H (Família): Camada de Ruído Estático Analógico no Clique */}
        {cardTheme === 'arquetipo-pop' && isCozyStaticActive && (
          <div className="absolute inset-0 bg-white/10 z-40 pointer-events-none mix-blend-overlay opacity-30 animate-cozy-noise" />
        )}
        
        {cardTheme === 'arquetipo-adrenalina' && isHovered && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-25">
            <div className="absolute top-[30%] left-0 w-full h-[1px] bg-cyan-400 animate-kinetic" style={{ animationDuration: '1.2s' }} />
            <div className="absolute top-[50%] left-0 w-full h-[1.5px] bg-cyan-300 animate-kinetic" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
            <div className="absolute top-[70%] left-0 w-full h-[1px] bg-cyan-400 animate-kinetic" style={{ animationDuration: '1.5s', animationDelay: '0.6s' }} />
          </div>
        )}
        
        {/* ⚔️ CONFLITO (Guerra): Tela Térmica FLIR HUD Overlay */}
        {cardTheme === 'arquetipo-conflito' && isHovered && (
          <>
            {/* Varredura Térmica Line */}
            <div className="absolute left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_8px_#34d399] z-20 animate-thermal-scan pointer-events-none" />
            {/* Telemetria Militar HUD */}
            <div className="absolute inset-0 p-3.5 z-20 pointer-events-none font-mono text-[8px] text-emerald-400 tracking-widest uppercase select-none opacity-80">
              <div className="absolute top-2.5 left-2.5">ALT 450m</div>
              <div className="absolute top-2.5 right-2.5">GPS: 45.22.09</div>
              <div className="absolute bottom-24 left-2.5 text-emerald-500 animate-pulse">LOCK ON</div>
              <div className="absolute bottom-24 right-2.5">SYS: OK</div>
            </div>
          </>
        )}
        
        {/* 🔍 ENIGMA: Modo Drama Holofote & Cinematic Dust & Melancolia Tears */}
        {cardTheme === 'arquetipo-enigma' && isHovered && (
          <>
            {/* Vinheta de melancolia azul profunda (reflecting sadness / tears) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_30%,_rgba(30,58,138,0.5)_100%)] pointer-events-none z-10" />
            {/* Holofote de cone de luz */}
            <div 
              className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white/10 to-transparent blur-[6px] pointer-events-none z-10"
              style={{ clipPath: 'polygon(35% 0%, 65% 0%, 85% 100%, 15% 100%)' }}
            />
            {/* Poeira de cinema */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-40">
              <div className="absolute top-[20%] left-[45%] w-1 h-1 rounded-full bg-white/60" style={{ animation: 'cinematicDust 6s infinite ease-in-out' }} />
              <div className="absolute top-[50%] left-[55%] w-1.5 h-1.5 rounded-full bg-white/40" style={{ animation: 'cinematicDust 8s infinite ease-in-out', animationDelay: '2s' }} />
              <div className="absolute top-[35%] left-[50%] w-1 h-1 rounded-full bg-white/50" style={{ animation: 'cinematicDust 5s infinite ease-in-out', animationDelay: '1s' }} />
            </div>
            {/* Gotas de lágrima caindo (se não estiver em modo P&B do clique) */}
            {!isBandWMode && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-15 opacity-60">
                <div className="absolute top-[-10%] left-[25%] w-[1.5px] h-3 bg-blue-400/80 rounded-full animate-tear-fall" style={{ animationDelay: '0s', animationDuration: '2.8s' }} />
                <div className="absolute top-[-10%] left-[48%] w-[1px] h-2.5 bg-blue-350/70 rounded-full animate-tear-fall" style={{ animationDelay: '0.8s', animationDuration: '3.2s' }} />
                <div className="absolute top-[-10%] left-[72%] w-[2px] h-3.5 bg-blue-500/85 rounded-full animate-tear-fall" style={{ animationDelay: '1.5s', animationDuration: '2.4s' }} />
                <div className="absolute top-[-10%] left-[90%] w-[1px] h-3 bg-blue-400/60 rounded-full animate-tear-fall" style={{ animationDelay: '0.4s', animationDuration: '3.0s' }} />
              </div>
            )}
          </>
        )}

        {cardTheme === 'arquetipo-especulativo' && isHovered && (
          <>
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <div 
                className="absolute -inset-10 animate-cosmic" 
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 60%), repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(16,185,129,0.05) 8px, rgba(16,185,129,0.05) 10px)'
                }}
              />
            </div>
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-35">
              <div className="absolute bottom-2 left-[25%] w-1.5 h-1.5 rounded-full bg-emerald-400 animate-floatUp" style={{ animationDelay: '0.1s', animationDuration: '3.2s' }} />
              <div className="absolute bottom-4 left-[50%] w-1 h-1 rounded-full bg-green-300 animate-floatUp" style={{ animationDelay: '0.9s', animationDuration: '4.2s' }} />
              <div className="absolute bottom-2 left-[75%] w-1.5 h-1.5 rounded-full bg-emerald-500 animate-floatUp" style={{ animationDelay: '1.7s', animationDuration: '3.8s' }} />
            </div>
          </>
        )}

        {/* MODO S: Flash de Tela Branca Rápida */}
        {cardTheme === 'terror' && isFlashing && (
          <div className="absolute inset-0 bg-white z-50 animate-signal-switch pointer-events-none" />
        )}

        {/* 🔍 DRAMA: Flash de Câmera Fotográfica no Primeiro Clique */}
        {cardTheme === 'arquetipo-enigma' && isDramaFlashActive && (
          <div className="absolute inset-0 bg-white z-40 animate-camera-flash pointer-events-none" />
        )}

        {/* ⚔️ CONFLITO: Clarão absoluto de disparo no clique (Muzzle Flash) */}
        {isMuzzleActive && (
          <div className="absolute inset-0 bg-white/95 z-40 pointer-events-none mix-blend-overlay animate-muzzle" />
        )}

        {/* Rastro Interativo de Corações do Mouse (Romance Theme, z-25) */}
        {cardTheme === 'romance' && isHovered && mouseHearts.map((heart) => (
          <span
            key={heart.id}
            className={`absolute select-none pointer-events-none z-25 animate-mouse-heart ${heart.color}`}
            style={{
              left: `${heart.x}px`,
              top: `${heart.y}px`,
              '--tw-rotate': `${heart.angle}deg`
            }}
          >
            {heart.isFilled ? (
              <svg className="w-3.5 h-3.5 fill-current drop-shadow-[0_0_3px_currentColor]" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 stroke-current fill-none drop-shadow-[0_0_3px_currentColor]" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            )}
          </span>
        ))}

        {/* /Explosão de Corações no Clique (Romance Theme, z-25) */}
        {cardTheme === 'romance' && clickHearts.map((heart) => (
          <span
            key={heart.id}
            className={`absolute select-none pointer-events-none z-25 animate-click-heart ${heart.color}`}
            style={{
              left: `${heart.x}px`,
              top: `${heart.y}px`,
              '--dx': `${heart.dx}px`,
              '--dy': `${heart.dy}px`,
              '--scale': `${heart.scale}`,
              '--angle': `${heart.angle}deg`
            }}
          >
            {heart.isFilled ? (
              <svg className="w-5 h-5 fill-current drop-shadow-[0_0_4px_currentColor]" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 stroke-current fill-none drop-shadow-[0_0_4px_currentColor]" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            )}
          </span>
        ))}

        {/* 🍿 FAMÍLIA (Cozy Sparks): Partículas aconchegantes no Clique (Estrelas, Balões, Ursos, Lollipops) */}
        {cardTheme === 'arquetipo-pop' && cozySparks.map((spark) => (
          <span
            key={spark.id}
            className="absolute text-amber-400 select-none pointer-events-none z-25 animate-cozy font-sans"
            style={{
              left: `${spark.x}px`,
              top: `${spark.y}px`,
              '--dx': `${spark.dx}px`,
              '--dy': `${spark.dy}px`,
              transform: `translate(-50%, -50%) scale(${spark.scale})`,
              animationDelay: `${spark.delay}ms`,
              textShadow: '0 0 6px #f59e0b'
            }}
          >
            {spark.symbol}
          </span>
        ))}

        {/* ⚡ ADRENALINA: Combat Action Combo text popups no Clique */}
        {cardTheme === 'arquetipo-adrenalina' && popCombos.map((combo) => (
          <div
            key={combo.id}
            className="absolute font-black tracking-widest text-[16px] text-cyan-400 select-none pointer-events-none z-30 animate-pulse"
            style={{
              left: `${combo.x}px`,
              top: `${combo.y}px`,
              transform: 'translate(-50%, -50%)',
              textShadow: '0 0 8px #22d3ee, 0 0 15px #22d3ee',
              fontFamily: "'Courier New', Courier, monospace",
              animation: 'actionComboPop 0.8s forwards ease-out'
            }}
          >
            {combo.text}
          </div>
        ))}

        {/* ⚔️ GUERRA: Laser Target Pointer no Clique (z-30) */}
        {cardTheme === 'arquetipo-conflito' && isLaserActive && (
          <div 
            className="absolute bg-red-500 rounded-full w-2.5 h-2.5 animate-ping z-30 pointer-events-none"
            style={{
              left: `${laserPos.x}px`,
              top: `${laserPos.y}px`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px #ef4444'
            }}
          />
        )}

        {/* ⚔️ GUERRA: Fagulhas e Fuligem de ataque aéreo subindo no Clique */}
        {cardTheme === 'arquetipo-conflito' && warEmbersList.map((ember) => (
          <span
            key={ember.id}
            className="absolute select-none pointer-events-none z-25 animate-embers text-orange-500"
            style={{
              left: `${ember.x}px`,
              top: `${ember.y}px`,
              '--dx': `${ember.dx}px`,
              transform: `translate(-50%, -50%) scale(${ember.scale})`,
              animationDelay: `${ember.delay}ms`,
              filter: 'drop-shadow(0 0 3px #f97316)'
            }}
          >
            🔥
          </span>
        ))}

        {/* 🔍 ENIGMA (Drama): Legenda minimalista na base */}
        {cardTheme === 'arquetipo-enigma' && isEmotionalShatterActive && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/90 border border-zinc-700 px-3 py-1 rounded text-[10px] tracking-wider text-white font-sans z-30 font-semibold shadow-xl animate-fade-in">
            {dramaticSubtitle}
          </div>
        )}

        {/* Queda de Gota de Sangue no Clique */}
        {cardTheme === 'terror' && clickBloodDrops.map((drop) => (
          <img
            key={drop.id}
            src="/Imagens/Gota -sangue-1.png"
            alt="Gota de Sangue"
            className="absolute w-5 object-contain pointer-events-none z-30 animate-click-blood"
            style={{
              left: `${drop.x}px`,
              '--start-y': `${drop.y}px`,
              transform: 'translateX(-50%)'
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ))}

        {/* Conteúdo Principal de Texto (z-20) */}
        <div className="relative w-full h-full p-4 flex flex-col justify-between text-white font-mono z-20">
          
          {/* Topo - Título Branco Puro e Botões de Ação */}
          <div className="flex flex-col gap-1.5 text-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            <div className="flex justify-between items-start gap-2 w-full">
              <div>
                <h3 className={`text-sm font-black text-white uppercase tracking-wide line-clamp-2 pr-1 leading-tight font-sans ${
                  cardTheme === 'terror' && isHovered ? 'animate-violent-shake text-red-500' : ''
                }`}>
                  {title}
                </h3>
                
                {/* Ping, FPS e outros status do jogo abaixo do nome no hover (Ação) */}
                {cardTheme === 'arquetipo-adrenalina' && isHovered && (
                  <div className="flex gap-1.5 mt-1 select-none font-mono text-[8px] tracking-wider text-cyan-400">
                    <span className="bg-cyan-955/80 border border-cyan-500/35 rounded px-1.5 py-0.5 shadow-md">
                      📶 {ping}ms
                    </span>
                    <span className="bg-cyan-955/80 border border-cyan-500/35 rounded px-1.5 py-0.5 shadow-md">
                      🎮 {fps} FPS
                    </span>
                    <span className="bg-cyan-955/80 border border-cyan-500/35 rounded px-1.5 py-0.5 shadow-md animate-pulse">
                      🟢 ONLINE
                    </span>
                  </div>
                )}

                {/* Cronômetro do Curta-metragem abaixo do nome no hover (Fundo Preto com Glow) */}
                {cardTheme === 'curta' && isHovered && (
                  <div className="flex mt-1 select-none font-mono tracking-wider">
                    <span className="bg-black border border-orange-500 rounded px-2.5 py-0.5 shadow-[0_0_8px_rgba(249,115,22,0.65)] text-orange-400 font-bold text-[9px]">
                      ⏱️ {speedrunTime}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Controles de Ação (Sem o DEV Menu) */}
              <div className="flex items-center gap-1.5 shrink-0">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(movie);
                    }}
                    className="p-1.5 rounded bg-black/60 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 hover:text-amber-400 transition-colors"
                    title="Editar Filme"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Tem certeza que deseja excluir permanentemente o filme "${title}"?`)) {
                        onDelete(movie.movie_id || movie.id);
                      }
                    }}
                    className="p-1.5 rounded bg-black/60 hover:bg-red-955/60 border border-zinc-700/50 text-zinc-300 hover:text-red-400 transition-colors"
                    title="Excluir Filme"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Placar de Conquistas do Oscar */}
            {cardTheme === 'oscar-winner' && (
              <div className="bg-amber-955/40 border border-amber-500/40 rounded-lg px-3 py-1 flex items-center gap-3 text-[10px] font-mono tracking-wider text-amber-400 select-none mt-1 shrink-0 w-fit">
                <span>🏆 {oscar_wins} VITÓRIAS / {oscar_nominations} INDICAÇÕES</span>
              </div>
            )}
            {cardTheme === 'oscar-nominee' && (
              <div className="bg-blue-955/40 border border-blue-500/40 rounded-lg px-3 py-1 flex items-center gap-2 text-[10px] font-mono tracking-wider text-blue-300 select-none mt-1 shrink-0 w-fit">
                <span>🎬 {oscar_nominations} INDICAÇÕES AO OSCAR</span>
              </div>
            )}

            {/* Global Reviews Stats */}
            {isHovered && (
              <div className="text-[8px] text-zinc-400 font-bold select-none uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                <span>📈 STATS:</span>
                <span className={getVotesBadgeColor().split(' ')[0]}>{formatVotes(movie.vote_count)}</span>
                <span>GLOBAL REVIEWS</span>
              </div>
            )}
          </div>

          {/* Centro - HUD Medidor Segmentado */}
          <div className="flex flex-col gap-2.5 py-1">
            {/* Minha Nota - ROXO GAMER */}
            <div className="flex flex-col gap-0.5 select-none text-purple-400">
              <div className="flex justify-between items-center text-[10px] font-mono font-black bg-black/80 px-1.5 py-0.5 rounded">
                <span className="tracking-wider">MINHA NOTA</span>
                <span className="tracking-widest text-xs font-bold">{formattedUserRating}</span>
              </div>
              {renderSegmentedBar(user_rating, 10, 'bg-purple-500 shadow-[0_0_10px_#a855f7]')}
            </div>

            {/* IMDb Bar - AMARELO IMDb */}
            <div className="flex flex-col gap-0.5 select-none text-[#F5C518]">
              <div className="flex justify-between items-center text-[9px] font-mono font-bold bg-black/80 px-1.5 py-0.5 rounded">
                <span>IMDb</span>
                <span className="font-bold">{formattedImdbRating}</span>
              </div>
              {renderSegmentedBar(imdb_rating, 10, 'bg-[#F5C518] shadow-[0_0_8px_#F5C518]')}
            </div>

            {/* Metacritic Bar */}
            <div className="flex flex-col gap-0.5 select-none text-emerald-400">
              <div className="flex justify-between items-center text-[9px] font-mono font-bold bg-black/80 px-1.5 py-0.5 rounded">
                <span>Metacritic</span>
                <span className={getMetacriticTextColor(formattedMetacritic)}>{formattedMetacritic}</span>
              </div>
              {renderSegmentedBar(metacritic_score, 100, 'bg-emerald-500 shadow-[0_0_8px_#10b981]')}
            </div>

            {/* Rotten Tomatoes Bar */}
            <div className="flex flex-col gap-0.5 select-none text-red-500">
              <div className="flex justify-between items-center text-[9px] font-mono font-bold bg-black/80 px-1.5 py-0.5 rounded">
                <span>Rotten Tomatoes</span>
                <span className="font-bold">{rotten_tomatoes_score ? `${rotten_tomatoes_score}%` : 'N/A'}</span>
              </div>
              {renderSegmentedBar(rotten_tomatoes_score, 100, 'bg-red-500 shadow-[0_0_8px_#ef4444]')}
            </div>
          </div>

          {/* Rodapé - Metadados e Atributos de Alto Contraste */}
          <div className="w-full flex flex-col gap-2 border-t border-zinc-800/80 pt-2 font-mono text-[9px]">
            
            {/* Linha 1: Badges de Status */}
            <div className="flex items-center gap-1.5 text-[8.5px] font-bold select-none text-zinc-200 uppercase">
              <span className="bg-black/60 border border-zinc-700/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                📅 {release_year || 'N/A'}
              </span>
              <span className="text-zinc-700">|</span>
              <span className="bg-black/60 border border-zinc-700/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                👁️ {year_seen || 'N/A'}
              </span>
              <span className="text-zinc-700">|</span>
              <span className="bg-black/60 border border-zinc-700/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                ⏳ {runtime ? `${runtime} min` : 'N/A'}
              </span>
            </div>

            {/* Linha 2: Gênero | Áudio | Plataforma */}
            <div className={`bg-black/85 px-2 py-1 rounded border border-zinc-800/40 text-zinc-300 font-medium text-[9px] break-words leading-tight ${
              cardTheme === 'arquetipo-enigma' ? 'font-serif italic tracking-wide' : ''
            }`}>
              {genres.length > 0 ? genres.join('/') : 'N/A'} • {audio_type || 'N/A'} • {platform || 'N/A'}
            </div>


            {/* Linha 3: Tags Customizadas e botão Jogar Arcade para Especulativo */}
            <div className="flex flex-col gap-1.5 mt-1">
              {tags.length > 0 && (
                <div className={`bg-black/85 px-2 py-1 rounded border border-zinc-800/40 text-zinc-400 font-semibold text-[8px] tracking-wide break-words leading-normal ${
                  cardTheme === 'arquetipo-enigma' ? 'font-serif italic tracking-wide' : ''
                }`}>
                  Tags: {tags.join(' • ')}
                </div>
              )}

              {cardTheme === 'arquetipo-especulativo' && isHovered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGameActive(true);
                    startSpaceInvaders();
                  }}
                  className="w-full py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 rounded text-emerald-400 text-[10px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                >
                  👾 JOGAR RETRO ARCADE
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 🌌 ESPECULATIVO: Tela de Mini-Game Retro de Space Invaders no Hover e Modo Jogo Ativo */}
      {cardTheme === 'arquetipo-especulativo' && isHovered && isGameActive && (
        <div className="absolute inset-0 bg-black/95 z-30 flex flex-col justify-between p-3.5 font-mono border-2 border-emerald-500/80 rounded-xl overflow-hidden select-none">
          {/* Header */}
          <div className="flex justify-between items-center text-[10px] text-emerald-400 border-b border-emerald-950 pb-1.5 font-bold">
            <span>SCORE: {score}</span>
            <div className="flex items-center gap-2">
              <span className="animate-pulse">👾 ARCADE</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGameActive(false);
                  setGameState('idle');
                }}
                className="p-1 text-emerald-400 hover:text-white hover:bg-emerald-950 rounded transition-colors text-[9px] font-bold"
                title="Sair do Jogo"
              >
                ❌
              </button>
            </div>
          </div>

          {/* Game Area */}
          <div className="relative flex-1 w-full overflow-hidden cursor-crosshair" onMouseMove={handleMouseMove}>
            
            {/* Start Screen */}
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2.5">
                <span className="text-emerald-400 text-xs font-black tracking-widest animate-bounce">SPACE INVADERS</span>
                <span className="text-[7.5px] text-zinc-400 leading-relaxed">
                  CLIQUE NO CARD PARA INICIAR<br />
                  E ATIRAR
                </span>
                <div className="text-[16px] animate-pulse">👾</div>
              </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2 bg-black/80">
                <span className="text-red-500 text-xs font-black tracking-widest">GAME OVER</span>
                <span className="text-[8px] text-zinc-400">SCORE FINAL: {score}</span>
                <span className="text-[8px] text-emerald-400 border border-emerald-500 rounded px-2 py-0.5 bg-emerald-950/40 hover:bg-emerald-950/80 cursor-pointer transition-colors font-bold mt-1">
                  JOGAR NOVAMENTE
                </span>
              </div>
            )}

            {/* Victory Screen */}
            {gameState === 'victory' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2 bg-black/80">
                <span className="text-yellow-400 text-xs font-black tracking-widest animate-pulse">VITÓRIA!</span>
                <span className="text-[8px] text-zinc-400">SCORE FINAL: {score}</span>
                <span className="text-[8px] text-emerald-400 border border-emerald-500 rounded px-2 py-0.5 bg-emerald-950/40 hover:bg-emerald-950/80 cursor-pointer transition-colors font-bold mt-1">
                  JOGAR NOVAMENTE
                </span>
              </div>
            )}

            {/* Elementos Ativos de Jogo */}
            {gameState === 'playing' && (
              <>
                {/* Invaders */}
                {invaders.map(inv => inv.alive && (
                  <div 
                    key={inv.id} 
                    className="absolute text-[11px] transition-all duration-100 ease-out"
                    style={{ left: `${inv.x}%`, top: `${inv.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    👾
                  </div>
                ))}

                {/* Lasers */}
                {lasers.map(l => (
                  <div 
                    key={l.id} 
                    className="absolute w-[2px] h-2.5 bg-emerald-400 shadow-[0_0_6px_#34d399]"
                    style={{ left: `${l.x}%`, top: `${l.y}%`, transform: 'translateX(-50%)' }}
                  />
                ))}

                {/* Invader Projectiles */}
                {invaderProjectiles.map(p => (
                  <div 
                    key={p.id} 
                    className="absolute w-[2px] h-2.5 bg-red-500 shadow-[0_0_6px_#ef4444]"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translateX(-50%)' }}
                  />
                ))}

                {/* Player Ship rotated -45deg so it points straight up */}
                <div 
                  className="absolute text-sm select-none"
                  style={{ left: `${playerX}%`, top: '90%', transform: 'translate(-50%, -50%) rotate(-45deg)' }}
                >
                  🚀
                </div>
              </>
            )}

          </div>

          {/* Footer info */}
          <div className="text-[7px] text-zinc-500 border-t border-emerald-950 pt-1 text-center select-none font-bold">
            Nave segue o mouse • Clique atira
          </div>
        </div>
      )}

    </div>
  );
}
