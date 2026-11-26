import {
  HARLEQUIN_BUBBLE_STYLES,
  buildMagnetoSecretReaction,
  buildMagnetoWorldReaction,
  getHarlequinSkinById,
  pickSkinDialogue,
} from '../data/harlequinSkins';

function normText(v) {
  return String(v || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizeList(raw) {
  if (Array.isArray(raw)) return raw.map((x) => normText(x)).filter(Boolean);
  if (typeof raw === 'string') {
    return raw
      .split(/[,;|]+/)
      .map((x) => normText(x))
      .filter(Boolean);
  }
  return [];
}

function parseUserRating(raw) {
  return Number(String(raw ?? '').replace(',', '.')) || 0;
}

export function dispatchHarlequinProfileSync(profile) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cine-harlequin-profile-sync', { detail: profile }));
}

export function dispatchHarlequinWorldEvent(type, payload = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('cine-harlequin-world-event', {
      detail: { type, payload, at: Date.now() },
    })
  );
}

function applyEquippedVisualOverrides(reaction, profile) {
  const bubbleId = profile?.equippedBubble || profile?.equippedSkin || 'magneto';
  const equippedBubbleStyle =
    HARLEQUIN_BUBBLE_STYLES[bubbleId] || HARLEQUIN_BUBBLE_STYLES.classic;

  // Em homenagens póstumas silenciosas, mantém a borda memorial específica do tributo
  const finalBubble = reaction.silentSound
    ? reaction.bubbleTheme
    : {
        ...equippedBubbleStyle,
        border: equippedBubbleStyle.border,
        accent: equippedBubbleStyle.accent,
      };

  return {
    ...reaction,
    skinId: profile?.equippedSkin || reaction.skinId || 'magneto',
    backdropId: profile?.equippedBackdrop,
    frameId: profile?.equippedFrame,
    bubbleTheme: finalBubble,
  };
}

function resolveMagnetoReaction({ type, payload = {}, profile, seed = 0 }) {
  if (type === 'walk_of_fame_pack') {
    const starId = String(payload?.starId || '');
    const starSecretMap = {
      cf_elizabeth_olsen: 'mag_secret_wanda',
      cf_stewart_mckellen: 'mag_secret_xavier',
      cf_isaac_bardavid: 'mag_secret_wolverine',
      cf_chadwick_boseman: 'mag_secret_chadwick',
      cf_benedict_cumberbatch: 'mag_secret_strange',
      cf_robert_downey_jr: 'mag_secret_stark',
    };
    const secretId = starSecretMap[starId];
    if (!secretId) return null;
    const base = buildMagnetoSecretReaction({ secretId, seed });
    return {
      ...applyEquippedVisualOverrides(base, profile),
      mode: 'magneto_secret',
    };
  }

  if (type === 'secret_draw' || type === 'secret_boomerang') {
    const base = buildMagnetoWorldReaction({ triggerId: 'mag_secret_draw_cards', seed });
    return {
      ...applyEquippedVisualOverrides(base, profile),
      mode: 'magneto_world',
    };
  }

  if (type === 'bingo_claimed') {
    const base = buildMagnetoWorldReaction({ triggerId: 'mag_bingo_line', seed });
    return {
      ...applyEquippedVisualOverrides(base, profile),
      mode: 'magneto_world',
    };
  }

  if (type === 'chimera_forged') {
    const d20 = Number(payload?.chimera?.recipe?.d20Roll || 0);
    const yr = Number(payload?.chimera?.recipe?.targetYear || 0);
    let triggerId = null;
    if (d20 === 1) triggerId = 'mag_chimera_d20_1';
    else if (d20 === 20) triggerId = 'mag_chimera_d20_20';
    else if (yr >= 2016) triggerId = 'mag_chimera_modern';

    if (triggerId) {
      const base = buildMagnetoWorldReaction({ triggerId, seed });
      return {
        ...applyEquippedVisualOverrides(base, profile),
        mode: 'magneto_world',
      };
    }

    const magnetoSkin = getHarlequinSkinById('magneto');
    return applyEquippedVisualOverrides(
      {
        eventId: 'chimera_generic',
        contextBadge: 'QUIMERA CINÉFILA',
        skinId: 'magneto',
        poseId: 'neutral',
        dialogue: pickSkinDialogue(magnetoSkin, 'neutral', seed),
        moodChip: '+1 Desafio ⚡',
        moodPolarity: 'happy',
        motion: 'jump',
        soundMood: 'neutral',
        silentSound: false,
        emotional: false,
      },
      profile
    );
  }

  if (type === 'movie_saved') {
    const movie = payload?.movie || {};
    const newlyUnlocked = Array.isArray(payload?.newlyUnlocked) ? payload.newlyUnlocked : [];
    const worldUnlocks = Array.isArray(payload?.worldChallengeUnlocks)
      ? payload.worldChallengeUnlocks
      : [];
    const tmUnlocks = Array.isArray(payload?.timeMachineUnlocks)
      ? payload.timeMachineUnlocks
      : [];

    const hasDuelWin =
      worldUnlocks.some((u) => u.kind === 'country_dethrone') ||
      tmUnlocks.some((u) => u.kind === 'year_dethrone');
    if (hasDuelWin) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_duel_win', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }

    if (newlyUnlocked.some((t) => String(t.tier).toLowerCase() === 'mythic')) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_trophy_mythic', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (newlyUnlocked.some((t) => String(t.tier).toLowerCase() === 'silver')) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_trophy_silver', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }

    const tags = normalizeList(movie.tags);
    const genres = normalizeList(movie.genres);
    const countries = normalizeList(movie.countries);
    const rating = parseUserRating(movie.user_rating);
    const year = Number(movie.release_year || 0);
    const titleNorm = normText(movie.title);

    const hasTag = (term) => tags.some((t) => t.includes(term));
    const hasXmen = hasTag('x-men') || hasTag('xmen') || hasTag('mutante') || titleNorm.includes('x-men');
    const hasPrejudice = hasTag('preconceito');
    const hasTragicOrHorror =
      hasTag('tragico') || genres.some((g) => g.includes('terror') || g.includes('horror'));
    const hasSuperPower = hasTag('super poder') || hasTag('superpoder');
    const hasMarvel = hasTag('marvel');
    const hasVillainOrDystopia =
      hasTag('vilao') || hasTag('dystopia') || hasTag('distopia') || hasTag('viagem no tempo');
    const hasGermanyOrPoland = countries.some(
      (c) => c.includes('alemanha') || c.includes('germany') || c.includes('polonia') || c.includes('poland')
    );
    const hasUk = countries.some(
      (c) => c.includes('reino unido') || c.includes('united kingdom') || c.includes('inglaterra')
    );

    if (hasXmen && rating > 0 && rating < 6) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_xmen_low_score', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (hasPrejudice && hasTragicOrHorror) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_tag_prejudice_tragic', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (hasPrejudice) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_tag_prejudice', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (hasXmen) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoSecretReaction({ secretId: 'mag_secret_xmen_movie', seed }),
          profile
        ),
        mode: 'magneto_secret',
      };
    }
    if (hasSuperPower) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_tag_superpower', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (hasMarvel) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_tag_marvel', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (hasVillainOrDystopia) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_tag_villain_dystopia', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (hasGermanyOrPoland) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_country_germany_poland', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (hasUk) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_country_uk', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (rating >= 9.0) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_movie_great', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (rating > 0 && rating <= 4.5) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_movie_trash', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (genres.some((g) => g.includes('ficcao') || g.includes('acao'))) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_movie_scifi_action', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (genres.some((g) => g.includes('romance') || g.includes('comedia'))) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_movie_romcom', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (year > 0 && year < 1980) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_movie_classic', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }
    if (year >= 2016) {
      return {
        ...applyEquippedVisualOverrides(
          buildMagnetoWorldReaction({ triggerId: 'mag_movie_modern', seed }),
          profile
        ),
        mode: 'magneto_world',
      };
    }

    const magnetoSkin = getHarlequinSkinById('magneto');
    return applyEquippedVisualOverrides(
      {
        eventId: 'movie_default',
        contextBadge: payload?.isEditMode ? 'CATÁLOGO ATUALIZADO' : 'NOVO REGISTRO',
        skinId: 'magneto',
        poseId: 'neutral',
        dialogue: pickSkinDialogue(magnetoSkin, rating >= 7.5 ? 'happy' : 'neutral', seed),
        moodChip: rating >= 7.5 ? '+1 Aprovação ⚡' : '🧲 Soberano 35mm',
        moodPolarity: rating >= 7.5 ? 'happy' : 'neutral',
        motion: 'jump',
        soundMood: rating >= 7.5 ? 'happy' : 'neutral',
        silentSound: false,
        emotional: false,
      },
      profile
    );
  }

  return null;
}

export function resolveHarlequinWorldEvent({ type, payload = {}, profile, seed = 0 }) {
  if (!profile || profile.avatarEnabled === false) return null;
  if (
    (type === 'secret_draw' || type === 'secret_boomerang' || type === 'chimera_forged') &&
    Math.random() >= 0.6
  ) {
    return null;
  }
  const equippedSkin = profile.equippedSkin || 'magneto';

  if (equippedSkin === 'magneto') {
    return resolveMagnetoReaction({ type, payload, profile, seed });
  }

  const skin = getHarlequinSkinById(equippedSkin);
  const d20 = Number(payload?.chimera?.recipe?.d20Roll || 0);
  const rating = parseUserRating(payload?.movie?.user_rating);

  let dialogueKey = 'neutral';
  let polarity = 'neutral';
  if (type === 'chimera_forged' && d20 === 1) {
    dialogueKey = 'dice_1';
    polarity = 'sad';
  } else if (type === 'chimera_forged' && d20 === 20) {
    dialogueKey = 'jackpot_20';
    polarity = 'happy';
  } else if (rating >= 8.5 || type === 'bingo_claimed') {
    dialogueKey = 'happy';
    polarity = 'happy';
  } else if (rating > 0 && rating <= 4.5) {
    dialogueKey = 'sad';
    polarity = 'sad';
  }

  // Ignora pacotes de estrelas específicos quando não é o Magneto e mantém reação limpa nos eventos principais
  if (type === 'walk_of_fame_pack') return null;

  return applyEquippedVisualOverrides(
    {
      eventId: type,
      contextBadge: skin.title.toUpperCase(),
      skinId: skin.id,
      poseId: 'neutral',
      dialogue: pickSkinDialogue(skin, dialogueKey, seed),
      moodChip: polarity === 'happy' ? '+1 Aprovação ✨' : polarity === 'sad' ? '-1 Desgosto 💧' : skin.name,
      moodPolarity: polarity,
      motion: polarity === 'sad' ? 'shake' : 'jump',
      soundMood: dialogueKey,
      silentSound: false,
      emotional: false,
    },
    profile
  );
}
