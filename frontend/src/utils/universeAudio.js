/**
 * Motor de Trilha Sonora & Reprodução Persistente do Códice dos Universos.
 * Gerencia o mapeamento das faixas de conquista (Genérica, por Mega-Saga Mítica e suas Subcategorias)
 * e comunica com o componente global <UniverseMusicPlayer />.
 */

export const UNIVERSE_MUSIC_PLAY_EVENT = 'cine-universe-music-play';
export const UNIVERSE_MUSIC_STOP_EVENT = 'cine-universe-music-stop';

export const UNIVERSE_DEFAULT_VICTORY_TRACK = {
  url: '/sounds/universos/20th_century_fox-cut.mp3',
  title: 'Fanfarra Clássica 20th Century Fox',
  isGeneric: true,
};

/**
 * Faixas específicas por Mega-Saga Mítica:
 * - mythic: tocada ao concluir 100% da Mega-Saga Mítica
 * - child: tocada ao concluir qualquer bloco/subcategoria pertencente a esta Mega-Saga
 * - null em qualquer campo significa usar a faixa genérica padrão (`20th_century_fox-cut.mp3`).
 */
export const UNIVERSE_MEGA_TRACK_MAP = {
  // Mítico 1: MCU
  mega_mcu: {
    child: {
      url: '/sounds/universos/theme-song-2.mp3',
      title: 'Avengers — Theme Song',
    },
    mythic: {
      url: '/sounds/universos/avengers-reassemble-chicken.mp3',
      title: 'Avengers Reassemble',
    },
  },
  // Mítico 2: DC Live-Action (genérico para mítico e subcategorias)
  mega_dc_live: {
    child: null,
    mythic: null,
  },
  // Mítico 3: Universo Animado da DC
  mega_dc_anim: {
    child: {
      url: '/sounds/universos/Abertura Liga da Justiça Sem Limites.mp3',
      title: 'Abertura Liga da Justiça Sem Limites',
    },
    mythic: {
      url: '/sounds/universos/Abertura Liga da Justiça Sem Limites.mp3',
      title: 'Abertura Liga da Justiça Sem Limites',
    },
  },
  // Mítico 4: X-Men / Mutantes
  mega_xmen: {
    child: {
      url: '/sounds/universos/x-men-theme-song-no-fx-mp3cut.mp3',
      title: 'X-Men — Theme Song',
    },
    mythic: {
      url: '/sounds/universos/X-Men Evolution 1º Abertura.mp3',
      title: 'X-Men Evolution — 1ª Abertura',
    },
  },
  // Mítico 5: Aranhaverso
  mega_spider: {
    child: {
      url: '/sounds/universos/spiderman-meme-song.mp3',
      title: 'Spider-Man — Classic Theme',
    },
    mythic: {
      url: '/sounds/universos/the-amazing-spider-man-ringtone.mp3',
      title: 'The Amazing Spider-Man — Theme',
    },
  },
  // Mítico 6: Star Wars
  mega_star_wars: {
    child: {
      url: '/sounds/universos/imperial_march.mp3',
      title: 'Star Wars — The Imperial March',
    },
    mythic: {
      url: '/sounds/universos/imperial_march.mp3',
      title: 'Star Wars — The Imperial March',
    },
  },
  // Mítico 7: Videogames
  mega_games: {
    child: {
      url: '/sounds/universos/double-boost-2.mp3',
      title: 'Sonic Forces — Double Boost',
    },
    mythic: {
      url: '/sounds/universos/APOCALYPSIS NOCTIS.mp3',
      title: 'Final Fantasy XV — Apocalypsis Noctis',
    },
  },
  // Mítico 8: Serial Killers
  mega_serial_killers: {
    child: {
      url: '/sounds/universos/Saw Theme Song- Hello Zepp.mp3',
      title: 'Jogos Mortais — Hello Zepp',
    },
    mythic: {
      url: '/sounds/universos/friday-the-13th-stn.mp3',
      title: 'Sexta-Feira 13 — Tema Clássico',
    },
  },
  // Mítico 9: Stephen King (genérico para mítico e subcategorias)
  mega_stephen_king: {
    child: null,
    mythic: null,
  },
  // Mítico 10: Warren & James Wan
  mega_warren_wan: {
    child: {
      url: '/sounds/universos/Welcome to Blumhouse - Blumhouse.mp3',
      title: 'Welcome to Blumhouse',
    },
    mythic: {
      url: '/sounds/universos/Welcome to Blumhouse - Blumhouse.mp3',
      title: 'Welcome to Blumhouse',
    },
  },
  // Mítico 11: Animações DreamWorks & Pixar
  mega_animation: {
    child: {
      url: "/sounds/universos/You've Got a Friend in Me (Instrumental Version).mp3",
      title: "You've Got a Friend in Me (Instrumental)",
    },
    mythic: {
      url: "/sounds/universos/You've Got a Friend in Me (Instrumental Version).mp3",
      title: "You've Got a Friend in Me (Instrumental)",
    },
  },
  // Mítico 12: Pátria Amada, Brasil! (sem faixa específica definida -> genérico)
  mega_brasil: {
    child: null,
    mythic: null,
  },
  // Mítico 13: This is Japan! (Ou Quase...) — inclui o bloco de Digimon
  mega_japan: {
    child: {
      url: '/sounds/universos/Digimon OST - Butterfly - Animania Soundtrack.mp3',
      title: 'Digimon OST — Butter-Fly',
    },
    mythic: {
      url: '/sounds/universos/Tanimoto Takayoshi - One Vision - OSTDigimon.mp3',
      title: 'Digimon Tamers — One Vision',
    },
  },
  // Mítico 14: Clube da Insônia (genérico para mítico e subcategorias)
  mega_insomnia: {
    child: null,
    mythic: null,
  },
};

/**
 * Índice auxiliar (fallback caso o evento venha sem `megaSagaId`) ligando cada saga filha à sua Mega-Saga.
 */
const MEGA_CHILD_GROUPS = {
  mega_mcu: [
    'saga_01_mcu_f1',
    'saga_02_mcu_f2',
    'saga_03_mcu_f3',
    'saga_04_mcu_f4',
    'saga_05_mcu_f5',
    'saga_06_mcu_f6',
  ],
  mega_dc_live: [
    'saga_07_batman_classic',
    'saga_08_batman_modern',
    'saga_09_dceu_snyderverse',
    'saga_10_dcu_reboot',
  ],
  mega_dc_anim: [
    'saga_11_dc_showcase',
    'saga_12_dcamu',
    'saga_13_tomorrowverse',
    'saga_14_dc_elseworlds',
  ],
  mega_xmen: ['saga_15_xmen_main', 'saga_16_wolverine', 'saga_17_deadpool'],
  mega_spider: [
    'saga_18_spider_tobey',
    'saga_19_spider_garfield',
    'saga_20_spider_holland',
    'saga_21_venom',
    'saga_89_sony_villains',
    'saga_90_spider_verse',
  ],
  mega_star_wars: [
    'saga_22_sw_classic',
    'saga_23_sw_prequel',
    'saga_24_sw_sequel',
    'saga_25_sw_stories',
  ],
  mega_games: [
    'saga_27_resident_evil',
    'saga_33_sonic',
    'saga_37_doom',
    'saga_38_mortal_kombat',
    'saga_67_super_mario',
    'saga_68_street_fighter',
    'saga_39_console_fever',
  ],
  mega_serial_killers: [
    'saga_26_saw',
    'saga_40_the_purge',
    'saga_41_scream',
    'saga_42_friday_13th',
    'saga_43_halloween',
  ],
  mega_stephen_king: [
    'saga_44_shining',
    'saga_45_children_of_the_corn',
    'saga_46_it_pennywise',
    'saga_47_king_paranormal',
    'saga_69_pet_sematary',
    'saga_48_king_mist_relics',
  ],
  mega_warren_wan: [
    'saga_49_conjuring',
    'saga_50_annabelle',
    'saga_51_nun_llorona',
    'saga_52_insidious',
  ],
  mega_animation: [
    'saga_31_toy_story',
    'saga_32_kung_fu_panda',
    'saga_53_shrek_puss',
    'saga_54_httyd',
    'saga_55_pixar_incredibles_monsters',
  ],
  mega_brasil: [
    'saga_70_br_oscar',
    'saga_71_br_trash',
    'saga_72_br_tropa',
    'saga_73_br_laranja_lima',
    'saga_74_br_compadecida',
    'saga_75_br_minha_mae',
    'saga_76_br_terror',
    'saga_77_br_anos_de_chumbo',
    'saga_78_br_perolas',
  ],
  mega_japan: [
    'saga_79_jp_fullmetal',
    'saga_80_jp_given',
    'saga_81_jp_digimon',
    'saga_82_jp_ghibli',
    'saga_83_jp_koreeda',
    'saga_84_jp_death_note',
    'saga_85_jp_samurai_x',
  ],
  mega_insomnia: [
    'saga_29_black_phone',
    'saga_30_speak_no_evil',
    'saga_58_sinister',
    'saga_59_let_the_right_one_in',
    'saga_57_the_omen',
    'saga_86_m3gan',
    'saga_87_evil_dead',
    'saga_88_quiet_place',
  ],
};

export const CHILD_SAGA_TO_MEGA_ID = Object.entries(MEGA_CHILD_GROUPS).reduce((acc, [megaId, childIds]) => {
  for (const childId of childIds) {
    acc[childId] = megaId;
  }
  return acc;
}, {});

function normalizeUniverseEntityId(rawId, entityType) {
  if (!rawId) return null;
  let clean = String(rawId).trim();
  if (clean.startsWith('replay_saga_')) clean = clean.slice('replay_saga_'.length);
  else if (clean.startsWith('replay_mega_')) clean = clean.slice('replay_mega_'.length);

  if (entityType === 'saga' && clean.startsWith('saga_saga_')) {
    clean = clean.slice('saga_'.length);
  }
  if (entityType === 'mega_saga' && clean.startsWith('mega_mega_')) {
    clean = clean.slice('mega_'.length);
  }
  return clean;
}

export function encodeAudioUrl(rawUrl) {
  if (!rawUrl) return '';
  try {
    return encodeURI(decodeURI(rawUrl));
  } catch {
    return encodeURI(rawUrl);
  }
}

function formatCustomAudioTitle(rawUrl) {
  const filename = String(rawUrl).split('/').pop() || 'Tema do Universo';
  return filename.replace(/\.[^/.]+$/, '');
}

/**
 * Resolve qual música/efeito sonoro deve tocar na consagração de uma Saga ou Mega-Saga Mítica.
 * Prioridade:
 *  1) `customAudio` explícito salvo no evento/banco
 *  2) Mapa da Mega-Saga (`mythic` para Mega-Saga Mítica, `child` para subcategorias)
 *  3) Faixa genérica padrão (`/sounds/20th_century_fox-cut.mp3`)
 */
export function resolveUniverseVictoryTrack(victoryEvent) {
  const custom = victoryEvent?.customAudio ? String(victoryEvent.customAudio).trim() : '';
  if (custom) {
    const resolvedUrl =
      custom.startsWith('http') || custom.startsWith('/')
        ? custom
        : `/sounds/${custom.replace(/^sounds\//i, '')}`;
    return {
      url: resolvedUrl,
      encodedUrl: encodeAudioUrl(resolvedUrl),
      title: formatCustomAudioTitle(resolvedUrl),
      isGeneric: false,
    };
  }

  const isMega = victoryEvent?.entityType === 'mega_saga';
  const rawEntityId = victoryEvent?.universeId || victoryEvent?.id || null;
  const normalizedEntityId = normalizeUniverseEntityId(rawEntityId, victoryEvent?.entityType);

  let selectedTrack = null;

  if (isMega) {
    const megaId = victoryEvent?.megaSagaId || normalizedEntityId;
    selectedTrack = megaId ? UNIVERSE_MEGA_TRACK_MAP[megaId]?.mythic || null : null;
  } else {
    const parentMegaId =
      victoryEvent?.megaSagaId ||
      (normalizedEntityId ? CHILD_SAGA_TO_MEGA_ID[normalizedEntityId] : null) ||
      null;
    selectedTrack = parentMegaId ? UNIVERSE_MEGA_TRACK_MAP[parentMegaId]?.child || null : null;
  }

  const finalTrack = selectedTrack
    ? { ...selectedTrack, isGeneric: false }
    : UNIVERSE_DEFAULT_VICTORY_TRACK;

  return {
    ...finalTrack,
    encodedUrl: encodeAudioUrl(finalTrack.url),
  };
}

/**
 * Dispara a faixa no player persistente global (<UniverseMusicPlayer />).
 */
export function playUniverseMusicTrack(trackPayload) {
  if (typeof window === 'undefined' || !trackPayload?.url) return;
  window.dispatchEvent(new CustomEvent(UNIVERSE_MUSIC_PLAY_EVENT, { detail: trackPayload }));
}

/**
 * Para a música atual e fecha automaticamente o player persistente global.
 */
export function stopUniverseMusicPlayer() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(UNIVERSE_MUSIC_STOP_EVENT));
}
