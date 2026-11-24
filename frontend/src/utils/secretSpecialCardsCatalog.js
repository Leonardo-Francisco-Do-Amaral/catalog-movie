export const SECRET_DECK_BACK_IMAGE = '/secret-draw/deck-back.jpg';
export const SECRET_SPECIAL_SUSPENSE_BACK = '/secret-draw/special-mystery-back.jpg';

export const SECRET_SUIT_BACK_IMAGES = {
  common: '/secret-draw/suit-common.jpg',
  medium: '/secret-draw/suit-medium.jpg',
  hard: '/secret-draw/suit-hard.jpg',
  very_hard: '/secret-draw/suit-very_hard.jpg',
  exotic: '/secret-draw/suit-exotic.jpg',
};

export function getSecretSuitBackImage(difficulty) {
  return SECRET_SUIT_BACK_IMAGES[difficulty] || SECRET_SUIT_BACK_IMAGES.common;
}

export function getSecretCardUrl(rawPath) {
  if (!rawPath) return '';
  return encodeURI(String(rawPath));
}

const DECK_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const SUIT_LABEL_PT = {
  common: { symbol: '♣', name: 'Paus', accentText: 'text-emerald-300' },
  medium: { symbol: '♦', name: 'Ouros', accentText: 'text-sky-300' },
  hard: { symbol: '♠', name: 'Espadas', accentText: 'text-purple-300' },
  very_hard: { symbol: '♥', name: 'Copas', accentText: 'text-amber-300' },
  exotic: { symbol: '★', name: 'Coringa', accentText: 'text-rose-300' },
};

const RANK_WORD_PT = {
  A: 'Ás',
  J: 'Valete',
  Q: 'Dama',
  K: 'Rei',
};

export function getSecretPlayingCardMeta(card, roundId = 1) {
  const titleStr = String(card?.resolved?.title || card?.planilha?.rawTitle || '');
  let hash =
    Number(card?.resolved?.tmdbId || 0) * 17 +
    Number(card?.poolId || 0) * 13 +
    Number(roundId || 1) * 31 +
    Number(card?.seat || 1) * 7;
  for (let i = 0; i < titleStr.length; i += 1) {
    hash = (hash * 33 + titleStr.charCodeAt(i)) % 1000003;
  }
  const rank = DECK_RANKS[Math.abs(hash) % DECK_RANKS.length];
  const diff = card?.difficulty || 'common';
  const suitInfo = SUIT_LABEL_PT[diff] || SUIT_LABEL_PT.common;
  const rankWord = RANK_WORD_PT[rank] || rank;
  const fullName = diff === 'exotic' ? `${rankWord} ★ Coringa` : `${rankWord} de ${suitInfo.name}`;
  return {
    rank,
    symbol: suitInfo.symbol,
    suitName: suitInfo.name,
    accentText: suitInfo.accentText,
    fullName,
  };
}

export const SPECIAL_RARITY_META = {
  common: {
    key: 'common',
    label: 'COMUM • EVENTO',
    icon: '♣',
    badgeClass: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200',
    glowClass: 'shadow-[0_0_45px_rgba(16,185,129,0.45)]',
    ringGradient: 'conic-gradient(from 0deg, #10b981, #34d399, transparent 45%, #10b981)',
    soundKey: 'common',
    auraColor: 'rgba(16, 185, 129, 0.5)',
    panelAccent: 'border-emerald-400/35 bg-emerald-950/35',
  },
  rare: {
    key: 'rare',
    label: 'RARA • ARCANO',
    icon: '💎',
    badgeClass: 'bg-sky-500/20 border-sky-400/55 text-sky-200',
    glowClass: 'shadow-[0_0_55px_rgba(56,189,248,0.52)]',
    ringGradient: 'conic-gradient(from 0deg, #38bdf8, #818cf8, transparent 45%, #38bdf8)',
    soundKey: 'rare',
    auraColor: 'rgba(56, 189, 248, 0.55)',
    panelAccent: 'border-sky-400/35 bg-sky-950/35',
  },
  legendary: {
    key: 'legendary',
    label: 'LENDÁRIA • ÉPICA',
    icon: '👑',
    badgeClass: 'bg-amber-500/25 border-amber-300/65 text-amber-200',
    glowClass: 'shadow-[0_0_70px_rgba(251,191,36,0.68)]',
    ringGradient: 'conic-gradient(from 0deg, #fbbf24, #fde047, #f59e0b, transparent 40%, #fbbf24)',
    soundKey: 'legendary',
    auraColor: 'rgba(251, 191, 36, 0.65)',
    panelAccent: 'border-amber-400/45 bg-amber-950/35',
  },
  bet: {
    key: 'bet',
    label: 'APOSTA • CARA OU COROA',
    icon: '🪙',
    badgeClass: 'bg-fuchsia-500/25 border-amber-300/60 text-amber-200',
    glowClass: 'shadow-[0_0_65px_rgba(245,158,11,0.58)]',
    ringGradient: 'conic-gradient(from 0deg, #fbbf24, #ef4444, #a855f7, transparent 45%, #fbbf24)',
    soundKey: 'rare',
    auraColor: 'rgba(245, 158, 11, 0.6)',
    panelAccent: 'border-amber-400/40 bg-fuchsia-950/30',
  },
  cursed: {
    key: 'cursed',
    label: 'MALDIÇÃO • ABISMO',
    icon: '🩸',
    badgeClass: 'bg-rose-600/25 border-rose-400/65 text-rose-200',
    glowClass: 'shadow-[0_0_70px_rgba(244,63,94,0.68)]',
    ringGradient: 'conic-gradient(from 0deg, #f43f5e, #e11d48, #991b1b, transparent 45%, #f43f5e)',
    soundKey: 'cursed',
    auraColor: 'rgba(244, 63, 94, 0.65)',
    panelAccent: 'border-rose-500/45 bg-rose-950/40',
  },
};

const MILESTONE_SYSTEM_GROUPS = [
  { system: 'trophy', icon: '🏆', label: 'Troféu' },
  { system: 'world_challenge', icon: '🌍', label: 'País 195' },
  { system: 'time_machine', icon: '⏳', label: 'Década' },
  { system: 'universe', icon: '🌌', label: 'Universo' },
  { system: 'walk_of_fame', icon: '🌟', label: 'Fama' },
];

export function groupSimpleMilestones(milestones) {
  if (!Array.isArray(milestones) || milestones.length === 0) return [];
  const counts = {};
  for (const m of milestones) {
    const sys = m?.system;
    if (!sys) continue;
    counts[sys] = (counts[sys] || 0) + 1;
  }
  return MILESTONE_SYSTEM_GROUPS.filter((g) => counts[g.system] > 0).map((g) => ({
    ...g,
    count: counts[g.system],
  }));
}

export const HARLEQUIN_CROUPIER_AVATAR = '/secret-draw/especiais/arlequim/CROUPIER.png';
export const HARLEQUIN_DUAL_AVATAR = '/secret-draw/especiais/arlequim/rei-duas-caras.png';
export const HARLEQUIN_CURSED_AVATAR = '/secret-draw/especiais/arlequim/corrente-destino.png';

export const HARLEQUIN_BACKGROUND_LORE = {
  title: 'O Croupier da Sala de Projeção Secreta',
  subtitle: 'Entre películas 35mm esquecidas e um baralho marcado',
  summary:
    'Ninguém sabe ao certo quando o Arlequim assumiu a mesa da Sessão Secreta. Nascido entre rolos de filmes raros e cartas viradas no escuro, ele observa cada aposta sem escolher lado: às vezes entrega favores raros (Bênçãos) para testar até onde vai a sua coragem; em outras, cobra o preço do espetáculo (Maldições) para lembrar que a sorte nunca é gratuita.',
  tagline: 'O Arlequim te deu uma carta especial — agora é só saber se é bênção ou maldição.',
};

export const FALLBACK_SPECIAL_CARDS_CATALOG = [
  {
    id: 'duas_caras',
    title: 'Rei Duas-Caras',
    harlequinTitle: 'Arlequim Duas-Caras',
    icon: '🪙',
    rarity: 'bet',
    shortTag: 'Moeda 50/50 na Fila',
    description:
      'Gira a moeda do destino para 1 filme pendente da sua fila! CARA: dobra (2×) o XP do filme. COROA: corta o XP pela metade (0.5×) e trava sem Passe Bumerangue!',
    harlequinQuote: 'O Arlequim lançou a moeda: resta saber se o lado que caiu traz bênção ou maldição.',
    lore: 'Trono dividido entre ouro e cinzas. O Arlequim gira a moeda apenas pelo prazer de assistir à sua aposta.',
    images: ['/secret-draw/especiais/arlequim/rei-duas-caras.png'],
    classicImages: ['/secret-draw/especiais/classicas/rei-duas-caras.png'],
  },
  {
    id: 'apresentador_vem_ca',
    title: 'Apresentador "Vem pra cá!"',
    harlequinTitle: 'O Chamado do Arlequim',
    icon: '🃏',
    rarity: 'common',
    shortTag: 'Puxa 1 Carta Aleatória da Mesa',
    description:
      'O Arlequim deu sua bênção, mas ele vai escolher o filme para você ver — puxando 1 outra carta fechada da mesa direto para a sua fila! Se esconder uma Carta Especial, ativa em cadeia.',
    harlequinQuote: 'O Arlequim deu sua bênção, mas hoje é ele quem escolhe o filme para você assistir.',
    lore: 'Com um laço de película 35mm, o croupier fisga direto do feltro a carta que você não teve coragem de virar.',
    images: ['/secret-draw/especiais/arlequim/chamado-arlequim.png'],
    classicImages: ['/secret-draw/especiais/classicas/apresentador.png'],
  },
  {
    id: 'ocarina_floresta',
    title: 'Ocarina da Floresta',
    harlequinTitle: 'Harpa do Tempo Reverso',
    icon: '⏳',
    rarity: 'rare',
    shortTag: 'Reembaralha a Mesa',
    description:
      'O Arlequim dedilha sua harpa sobre o relógio antigo para reembaralhar e sortear novos filmes em todas as cartas ainda fechadas da mão atual, sem gastar Ficha de Sorteio!',
    harlequinQuote: 'As notas voltam os ponteiros: o Arlequim reembaralhou o destino da mesa.',
    lore: 'Sentado sobre engrenagens antigas, ele toca a melodia reversa até rebobinar o baralho inteiro.',
    images: ['/secret-draw/especiais/arlequim/melodia-do-tempo.png'],
    classicImages: ['/secret-draw/especiais/classicas/ocarina-da-floresta.png'],
  },
  {
    id: 'recarga_classe',
    title: 'Recarga do Poder da Classe',
    harlequinTitle: 'Take 2 — Recarga Arcana',
    icon: '🎬',
    rarity: 'rare',
    shortTag: '+1 Carga da Classe',
    description:
      'O Arlequim estala a claquete do Take 2 e reativa imediatamente +1 uso do Poder Especial da sua Classe RPG exclusivamente para a Sessão Secreta!',
    harlequinQuote: 'Take 2. O Arlequim deu sinal verde para você usar o seu poder mais uma vez.',
    lore: 'Na cadeira de diretor da Sala Secreta, basta uma batida da claquete para reabrir a cena do seu poder.',
    images: ['/secret-draw/especiais/arlequim/recarga-classe.png'],
    classicImages: [
      '/secret-draw/especiais/classicas/recarga-classe-1.png',
      '/secret-draw/especiais/classicas/recarga-classe-2.png',
      '/secret-draw/especiais/classicas/recarga-classe-3.png',
    ],
  },
  {
    id: 'visao_marcos',
    title: 'Visão dos Marcos',
    harlequinTitle: 'Lentes da Sessão Oculta',
    icon: '🕶️',
    rarity: 'rare',
    shortTag: 'Resumo dos Marcos na Mesa',
    description:
      'Através das lentes verde e rosa do Arlequim, o verso das cartas restantes da mesa revela quantos marcos simples cada filme escondido destrava sem entregar os títulos!',
    harlequinQuote: 'Por trás das lentes 3D, até o verso fechado denuncia o que cada filme esconde.',
    lore: 'Os óculos anaglíficos do Arlequim atravessam o papel do baralho para revelar troféus, países e eras ocultas.',
    images: ['/secret-draw/especiais/arlequim/visao-marcos.png'],
    classicImages: [
      '/secret-draw/especiais/classicas/visao-marcos-1.png',
      '/secret-draw/especiais/classicas/visao-marcos-2.png',
    ],
  },
  {
    id: 'arlequim_revela_3',
    title: 'Mini Arlequim — 3 Cartas',
    harlequinTitle: 'Olhar do Arlequim — 3 Cartas',
    icon: '🃏',
    rarity: 'rare',
    shortTag: 'Revela 3 Filmes Fechados',
    description:
      'O Arlequim levita sobre o baralho e revela o pôster e o título de até 3 outros filmes ainda fechados nesta mesa antes de você escolher!',
    harlequinQuote: 'Três cartas reveladas por cortesia da casa — agora escolha sem desculpas.',
    lore: 'Um favor discreto do croupier da Sessão Secreta para testar o olhar de quem aposta alto.',
    images: ['/secret-draw/especiais/arlequim/revela-3.png'],
    altImages: ['/secret-draw/especiais/arlequim/revela-3-alt.png'],
  },
  {
    id: 'arlequim_revela_5',
    title: 'Mini Arlequim Ascendido — 5 Cartas',
    harlequinTitle: 'Espetáculo do Arlequim — 5 Cartas',
    icon: '🌟',
    rarity: 'legendary',
    shortTag: 'Revela 5 Filmes Fechados',
    description:
      'LENDÁRIA: O Arlequim abre toda a mão e revela até 5 outros filmes escondidos nesta mesa com pôster, ano e raridade visíveis!',
    harlequinQuote: 'Cinco cartas iluminadas sobre o feltro. Hoje o Arlequim abriu os arquivos secretos.',
    lore: 'Quando o espetáculo chega ao auge, nem mesmo as cartas viradas conseguem esconder o que guardam.',
    images: ['/secret-draw/especiais/arlequim/revela-5.png'],
    altImages: ['/secret-draw/especiais/arlequim/revela-5-alt.png'],
  },
  {
    id: 'portal_dimensional',
    title: 'Portal Dimensional',
    harlequinTitle: 'Atalho do Portal',
    icon: '🌀',
    rarity: 'legendary',
    shortTag: 'Colhe XP + Volta ao Baralho',
    description:
      'LENDÁRIA: O Arlequim adora o filme sorteado da sua fila — abre um portal, entrega todo o XP dele na hora sem precisar assistir e devolve o filme intacto ao baralho!',
    harlequinQuote: 'O Arlequim adora esse filme — ele ainda vai te dar todo o XP sem precisar assistir.',
    lore: 'Por certas obras ele guarda um apreço especial: abre a fenda de película, paga a recompensa e guarda o rolo de volta.',
    images: ['/secret-draw/especiais/arlequim/portal-dimensional.png'],
    classicImages: [
      '/secret-draw/especiais/classicas/portal-dimensional-1.png',
      '/secret-draw/especiais/classicas/portal-dimensional-2.png',
      '/secret-draw/especiais/classicas/portal-dimensional-3.png',
      '/secret-draw/especiais/classicas/portal-dimensional-4.png',
    ],
  },
  {
    id: 'pedra_filosofal',
    title: 'Pedra Filosofal — Ascensão',
    harlequinTitle: 'Alquimia da Película',
    icon: '⚗️',
    rarity: 'legendary',
    shortTag: '+1 Raridade na Fila',
    description:
      'LENDÁRIA: Transmuta 1 filme aleatório da sua fila pendente (que ainda não seja Exótico) subindo 1 nível completo de raridade e aumentando seu XP!',
    harlequinQuote: 'Uma gota da pedra rubi basta para transformar uma sessão comum em ouro.',
    lore: 'Entre grimórios antigos e um alambique dourado, o Arlequim refina uma carta comum até ela brilhar mais alto.',
    images: ['/secret-draw/especiais/arlequim/pedra-filosofal.png'],
    classicImages: [
      '/secret-draw/especiais/classicas/ascensao-1.png',
      '/secret-draw/especiais/classicas/ascensao-2.png',
    ],
  },
  {
    id: 'armadilha_mecanica',
    title: 'A Armadilha Mecânica',
    harlequinTitle: 'Armadilha de Engrenagens',
    icon: '⚙️',
    rarity: 'cursed',
    shortTag: '-1 Raridade na Fila',
    description:
      'MALDIÇÃO: As engrenagens se fecham sobre 1 filme aleatório da sua fila (acima de Comum), rebaixando sua raridade em 1 nível e reduzindo seu XP!',
    harlequinQuote: 'Nem todo truque é favor. Quando as mandíbulas se fecham, até ouro vira ferro.',
    lore: 'Nos bastidores enferrujados da projeção, o sorriso do Arlequim fica mais afiado e cobra seu preço.',
    images: ['/secret-draw/especiais/arlequim/armadilha-mecanica.png'],
    classicImages: ['/secret-draw/especiais/classicas/armadilha-mecanica.png'],
  },
  {
    id: 'corrente_destino',
    title: 'Corrente do Destino',
    harlequinTitle: 'Correntes do Abismo',
    icon: '⛓️',
    rarity: 'cursed',
    shortTag: 'Trava Bumerangue na Fila',
    description:
      'MALDIÇÃO: Correntes pesadas prendem 1 filme aleatório da sua fila ativa, partindo o Bumerangue e proibindo devolver aquela carta para o baralho!',
    harlequinQuote: 'Sem fuga nem bumerangue: o Arlequim trancou essa escolha até o último crédito.',
    lore: 'Sob a máscara rachada e olhos carmesins, ele parte a rota de saída e acorrenta o filme à sua fila.',
    images: ['/secret-draw/especiais/arlequim/corrente-destino.png'],
    classicImages: ['/secret-draw/especiais/classicas/corrente-destino.png'],
  },
  {
    id: 'lamina_eclipse',
    title: 'Lâmina do Eclipse',
    harlequinTitle: 'Corte do Eclipse',
    icon: '💔',
    rarity: 'cursed',
    shortTag: 'Corta XP pela Metade (0.5×)',
    description:
      'MALDIÇÃO: Um golpe no escuro corta ao meio o prêmio de 1 filme aleatório da sua fila pendente, reduzindo o XP dele pela metade (0.5×)!',
    harlequinQuote: 'Um corte rápido no escuro: o filme continua na tela, mas o prêmio sangrou pela metade.',
    lore: 'Quando o eclipse escurece o baralho, o Arlequim estala as garras e rasga a recompensa ao meio.',
    images: ['/secret-draw/especiais/arlequim/lamina-eclipse.png'],
    altImages: ['/secret-draw/especiais/arlequim/lamina-eclipse-clara.jpg'],
  },
];

export function findSpecialCatalogDef(specialId, catalog = null) {
  const list = Array.isArray(catalog) && catalog.length > 0 ? catalog : FALLBACK_SPECIAL_CARDS_CATALOG;
  return (
    list.find((item) => item?.id === specialId) ||
    FALLBACK_SPECIAL_CARDS_CATALOG.find((item) => item.id === specialId) ||
    null
  );
}

export function getSpecialCardArtGallery(specialEvent, catalog = null) {
  if (!specialEvent) return [];
  const def = findSpecialCatalogDef(specialEvent.id, catalog);
  const fallbackDef = FALLBACK_SPECIAL_CARDS_CATALOG.find((item) => item.id === specialEvent.id) || null;
  const primaryList =
    (Array.isArray(def?.images) && def.images.length > 0 ? def.images : null) ||
    (Array.isArray(fallbackDef?.images) ? fallbackDef.images : []);
  const altList =
    (Array.isArray(specialEvent.altImages) && specialEvent.altImages.length > 0
      ? specialEvent.altImages
      : null) ||
    (Array.isArray(def?.altImages) && def.altImages.length > 0 ? def.altImages : null) ||
    fallbackDef?.altImages ||
    [];
  const classicList =
    (Array.isArray(specialEvent.classicImages) && specialEvent.classicImages.length > 0
      ? specialEvent.classicImages
      : null) ||
    (Array.isArray(def?.classicImages) && def.classicImages.length > 0 ? def.classicImages : null) ||
    fallbackDef?.classicImages ||
    [];

  const seen = new Set();
  const arts = [];
  const pushArt = (url, label, kind) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    arts.push({ url, label, kind });
  };

  primaryList.forEach((url, idx) =>
    pushArt(url, idx === 0 ? 'Arlequim' : `Arlequim ${idx + 1}`, 'arlequim')
  );
  altList.forEach((url, idx) =>
    pushArt(url, altList.length === 1 ? 'Alt. Arlequim' : `Alt. ${idx + 1}`, 'alt')
  );
  classicList.forEach((url, idx) =>
    pushArt(url, classicList.length === 1 ? 'Clássica' : `Clássica ${idx + 1}`, 'classic')
  );

  // Se a URL salva no evento for válida e não estiver na lista (ex: versão legada), mantém no final apenas se não for caminho obsoleto substituído
  if (
    specialEvent.imageUrl &&
    !seen.has(specialEvent.imageUrl) &&
    specialEvent.imageUrl.includes('/arlequim/')
  ) {
    arts.unshift({ url: specialEvent.imageUrl, label: 'Arlequim', kind: 'arlequim' });
  }

  return arts;
}

export function resolveSpecialCardPrimaryUrl(specialEvent, catalog = null) {
  const gallery = getSpecialCardArtGallery(specialEvent, catalog);
  if (specialEvent?.imageUrl && gallery.some((g) => g.url === specialEvent.imageUrl)) {
    return specialEvent.imageUrl;
  }
  return gallery[0]?.url || specialEvent?.imageUrl || '';
}

export function getSpecialCardDisplayMeta(specialEvent, catalogOrUiMode = null, maybeCatalog = null) {
  const catalog = Array.isArray(catalogOrUiMode) ? catalogOrUiMode : maybeCatalog;
  const def = findSpecialCatalogDef(specialEvent?.id, catalog);
  const fallbackDef = FALLBACK_SPECIAL_CARDS_CATALOG.find((item) => item.id === specialEvent?.id) || null;
  const harlequinTitle =
    specialEvent?.harlequinTitle || def?.harlequinTitle || fallbackDef?.harlequinTitle || specialEvent?.title || '';
  return {
    title: harlequinTitle,
    classicTitle: specialEvent?.title || def?.title || fallbackDef?.title || '',
    harlequinTitle,
    quote:
      specialEvent?.harlequinQuote || def?.harlequinQuote || fallbackDef?.harlequinQuote || '',
    lore: specialEvent?.lore || def?.lore || fallbackDef?.lore || '',
    description: specialEvent?.description || def?.description || fallbackDef?.description || '',
  };
}
