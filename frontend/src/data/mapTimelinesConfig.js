/**
 * Configuração Cartográfica das 5 Linhas do Tempo (Máquina do Tempo no Mapa Tático)
 * Reutiliza os polígonos existentes do Natural Earth sem pesar o bundle.
 */

export const SOVIET_REPUBLIC_CODES = new Set([
  'ru', 'ua', 'by', 'kz', 'uz', 'tm', 'kg', 'tj',
  'ge', 'am', 'az', 'md', 'ee', 'lv', 'lt'
]);

export const CZECHOSLOVAKIA_CODES = new Set(['cz', 'sk']);

export const YUGOSLAVIA_CODES = new Set(['rs', 'hr', 'ba', 'si', 'mk', 'me', 'spec_xk']);

export const SERBIA_MONTENEGRO_CODES = new Set(['rs', 'me']);

// Segunda Guerra Mundial (1939–1945)
export const WW2_ALLIES_CODES = new Set([
  'us', 'gb', 'fr', 'ca', 'au', 'nz', 'in', 'cn', 'br', 'mx', 'pl',
  'be', 'nl', 'no', 'lu', 'gr', 'et', 'za', 'eg', 'ph', 'spec_hk', 'spec_tw',
  'spec_gl', 'hist_su',
  ...SOVIET_REPUBLIC_CODES,
  ...CZECHOSLOVAKIA_CODES,
  ...YUGOSLAVIA_CODES
]);

export const WW2_AXIS_PRINCIPAL_CODES = new Set([
  'de', 'hist_de_w', 'hist_dd', 'it', 'jp'
]);

export const WW2_AXIS_CODES = new Set([
  ...WW2_AXIS_PRINCIPAL_CODES,
  'hu', 'ro', 'bg', 'at', 'fi', 'th'
]);

export const WW2_NEUTRAL_CODES = new Set([
  'ch', 'se', 'es', 'pt', 'ie', 'tr', 'ar', 'cl', 'uy', 'af', 'sa'
]);

export const WW2_MAIN_ALLIES_CHECKLIST = [
  { key: 'us', label: 'EUA', codes: ['us'] },
  { key: 'gb', label: 'Reino Unido', codes: ['gb'] },
  { key: 'su', label: 'URSS / Rússia', codes: ['hist_su', ...SOVIET_REPUBLIC_CODES] },
  { key: 'fr', label: 'França', codes: ['fr'] },
  { key: 'cn', label: 'China', codes: ['cn', 'spec_tw', 'spec_hk'] },
  { key: 'br', label: 'Brasil (FEB)', codes: ['br'] },
  { key: 'ca', label: 'Canadá', codes: ['ca'] }
];

// Guerra Fria (1949–1991)
export const COLD_WAR_WARSAW_OTHER_CODES = new Set(['pl', 'hu', 'ro', 'bg', 'al', 'hist_dd']);

export const COLD_WAR_NATO_WEST_CODES = new Set([
  'us', 'ca', 'gb', 'fr', 'it', 'be', 'nl', 'lu', 'dk', 'no', 'is', 'pt', 'es',
  'gr', 'tr', 'hist_de_w', 'jp', 'kr', 'au', 'nz', 'spec_tw', 'spec_gl'
]);

export const COLD_WAR_5_RELICS = ['hist_su', 'hist_de_w', 'hist_dd', 'hist_cs', 'hist_yu'];

// Era Clássica & Cinema Mudo (1895–1949)
export const PIONEER_CRADLES = [
  { key: 'fr', label: 'França (Lumière/Méliès)', codes: ['fr'] },
  { key: 'us', label: 'EUA (Hollywood Clássica)', codes: ['us'] },
  { key: 'de', label: 'Alemanha (Weimar/Expressionismo)', codes: ['de', 'hist_de_w', 'hist_dd'] },
  { key: 'su', label: 'URSS (Montagem Soviética)', codes: ['hist_su', 'ru', 'ua'] },
  { key: 'gb', label: 'Reino Unido (Hitchcock/Powell)', codes: ['gb'] },
  { key: 'it', label: 'Itália (Neorrealismo)', codes: ['it'] },
  { key: 'jp', label: 'Japão (Ozu/Kurosawa)', codes: ['jp'] },
  { key: 'se', label: 'Suécia (Sjöström/Bergman)', codes: ['se'] }
];

export const MAP_TIMELINES = [
  {
    id: 'modern',
    shortLabel: 'Atual (195 + Relíquias)',
    label: 'Atlas Moderno',
    eraTag: 'PRESENTE',
    icon: '🌍',
    soundHint: 'Za Warudo',
    accentColor: 'amber',
    description: 'Divisão atual dos 195 países da ONU + territórios Relíquia clicáveis no mapa.'
  },
  {
    id: 'ww2',
    shortLabel: '2ª Guerra (1939–45)',
    label: 'Segunda Guerra Mundial',
    eraTag: '1939–1945',
    icon: '⚔️',
    soundHint: 'Za Warudo!',
    accentColor: 'rose',
    description: 'Aliados vs. Potências do Eixo — URSS unificada e metas de guerra ao vivo.'
  },
  {
    id: 'cold_war',
    shortLabel: 'Guerra Fria (1949–91)',
    label: 'Guerra Fria & Blocos',
    eraTag: '1949–1991',
    icon: '❄️',
    soundHint: 'Zelda Ocarina',
    accentColor: 'cyan',
    description: 'URSS gigante, Alemanha Dividida (Oeste/Leste), Checoslováquia e Iugoslávia.'
  },
  {
    id: 'pioneers',
    shortLabel: 'Cinema Mudo / Clássico',
    label: 'Era dos Pioneiros (<1950)',
    eraTag: '1895–1949',
    icon: '🕯️',
    soundHint: 'Consequences',
    accentColor: 'yellow',
    description: 'Filtro vintage destacando os países onde você já viu clássicos anteriores a 1950.'
  },
  {
    id: 'relic_radar',
    shortLabel: 'Lente Multiverso',
    label: 'Radar Relíquias & Míticos',
    eraTag: 'CAÇADOR',
    icon: '🌌',
    soundHint: 'Relógio Temporal',
    accentColor: 'teal',
    description: 'Apaga países comuns e ilumina só as 30 Relíquias e os 18 Míticos no globo.'
  }
];

/**
 * Mapeia um polígono moderno do GeoJSON para o território histórico ativo na linha do tempo atual.
 */
export function resolveTimelineTargetTerritory(rawCode, timelineId, territoryByCode) {
  if (!rawCode || !territoryByCode) return null;
  const c = String(rawCode).toLowerCase();

  if (timelineId === 'ww2') {
    if (SOVIET_REPUBLIC_CODES.has(c) && territoryByCode.has('hist_su')) {
      return territoryByCode.get('hist_su');
    }
    return territoryByCode.get(c) || null;
  }

  if (timelineId === 'cold_war') {
    if (SOVIET_REPUBLIC_CODES.has(c) && territoryByCode.has('hist_su')) {
      return territoryByCode.get('hist_su');
    }
    if (CZECHOSLOVAKIA_CODES.has(c) && territoryByCode.has('hist_cs')) {
      return territoryByCode.get('hist_cs');
    }
    if (YUGOSLAVIA_CODES.has(c) && territoryByCode.has('hist_yu')) {
      return territoryByCode.get('hist_yu');
    }
    if (c === 'de') {
      // Ao clicar no polígono geral da Alemanha na Guerra Fria, prioriza RFA (ou RDA se RFA não tiver)
      return territoryByCode.get('hist_de_w') || territoryByCode.get('hist_dd') || territoryByCode.get('de') || null;
    }
    return territoryByCode.get(c) || null;
  }

  return territoryByCode.get(c) || null;
}

/**
 * Calcula estatísticas ao vivo para o Painel de Campanha de cada Linha do Tempo.
 */
export function computeTimelineStats(timelineId, challengeData, catalogMovies = []) {
  const allCountries = [
    ...(challengeData?.countries || []),
    ...(challengeData?.historicalCountries || [])
  ];
  const byCode = new Map(allCountries.map((c) => [c.code, c]));
  const movies = Array.isArray(catalogMovies) && catalogMovies.length > 0
    ? catalogMovies
    : challengeData?.catalogMovies || [];

  const getPrimaryOrFirst = (m) =>
    (m?.primaryCountryCode || m?.coproductionCountries?.[0]?.code || '').toLowerCase();

  if (timelineId === 'ww2') {
    const alliesMovies = movies.filter((m) => WW2_ALLIES_CODES.has(getPrimaryOrFirst(m)));
    const axisMovies = movies.filter((m) => WW2_AXIS_CODES.has(getPrimaryOrFirst(m)));
    const axisPrincipalMovies = movies.filter((m) =>
      WW2_AXIS_PRINCIPAL_CODES.has(getPrimaryOrFirst(m))
    );
    const warEraMovies = movies.filter(
      (m) => Number(m.release_year) >= 1939 && Number(m.release_year) <= 1945
    );

    const alliesChecklist = WW2_MAIN_ALLIES_CHECKLIST.map((item) => {
      const count = movies.filter((m) => item.codes.includes(getPrimaryOrFirst(m))).length;
      return {
        ...item,
        count,
        conquered: count > 0
      };
    });

    return {
      alliesCount: alliesMovies.length,
      axisCount: axisMovies.length,
      axisPrincipalCount: axisPrincipalMovies.length,
      warEraCount: warEraMovies.length,
      alliesChecklist,
      alliesMainConquered: alliesChecklist.filter((a) => a.conquered).length
    };
  }

  if (timelineId === 'cold_war') {
    const relicsStatus = COLD_WAR_5_RELICS.map((code) => {
      const entry = byCode.get(code);
      return {
        code,
        name: entry?.name || code.toUpperCase(),
        era: entry?.era || '1949–1991',
        conquered: entry?.status === 'conquered',
        count: entry?.totalCandidates || 0
      };
    });
    const coldWarEraMovies = movies.filter(
      (m) => Number(m.release_year) >= 1949 && Number(m.release_year) <= 1991
    );
    const natoMoviesCount = movies.filter((m) =>
      COLD_WAR_NATO_WEST_CODES.has(getPrimaryOrFirst(m))
    ).length;
    const warsawMoviesCount = movies.filter(
      (m) =>
        SOVIET_REPUBLIC_CODES.has(getPrimaryOrFirst(m)) ||
        CZECHOSLOVAKIA_CODES.has(getPrimaryOrFirst(m)) ||
        COLD_WAR_WARSAW_OTHER_CODES.has(getPrimaryOrFirst(m)) ||
        getPrimaryOrFirst(m) === 'hist_su' ||
        getPrimaryOrFirst(m) === 'hist_cs'
    ).length;

    return {
      relicsStatus,
      relicsConquered: relicsStatus.filter((r) => r.conquered).length,
      coldWarEraCount: coldWarEraMovies.length,
      natoMoviesCount,
      warsawMoviesCount
    };
  }

  if (timelineId === 'pioneers') {
    const classicMovies = movies
      .filter((m) => Number(m.release_year) > 1880 && Number(m.release_year) < 1950)
      .sort((a, b) => Number(a.release_year) - Number(b.release_year));
    const cradlesStatus = PIONEER_CRADLES.map((cr) => {
      const list = classicMovies.filter((m) => cr.codes.includes(getPrimaryOrFirst(m)));
      return {
        ...cr,
        count: list.length,
        conquered: list.length > 0
      };
    });
    const activeCountryCodes = new Set(classicMovies.map(getPrimaryOrFirst).filter(Boolean));
    return {
      classicCount: classicMovies.length,
      earliestMovie: classicMovies[0] || null,
      activeCountryCodes,
      cradlesStatus,
      cradlesConquered: cradlesStatus.filter((c) => c.conquered).length
    };
  }

  if (timelineId === 'relic_radar') {
    const relics = challengeData?.historicalCountries || [];
    const mythics = (challengeData?.countries || []).filter((c) => c.rarityTier === 'mythic');
    return {
      relicsConquered: relics.filter((r) => r.status === 'conquered').length,
      relicsTotal: relics.length,
      mythicsConquered: mythics.filter((m) => m.status === 'conquered').length,
      mythicsTotal: mythics.length
    };
  }

  return null;
}
