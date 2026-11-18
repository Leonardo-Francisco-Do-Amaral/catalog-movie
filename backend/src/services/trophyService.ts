import pool, { query } from '../config/database';
import {
  TROPHY_DEFINITIONS,
  TrophyDefinition,
  TrophyTier,
} from '../data/trophyDefinitions';
import { buildWorldChallengePayload, WorldChallengePayload } from './worldChallengeService';
import { getQuickXpSnapshot, TROPHY_XP_BY_TIER, UserXpStatus } from './xpService';
import {
  buildCatalogIndex,
  matchCuratedCandidate,
  parseGlobalReviews,
  parseStrictScore,
  TrophyChecklistItem,
  TrophyRankState,
} from './trophies/catalogIndex';
import {
  computeAchievementSummary,
  evaluateCatalogDefinitions,
  EvaluatedTrophyCard,
  evaluatePlatinumDefinition,
  evaluateSingleNonPlatinumDefinition,
  NewlyUnlockedAchievement,
  PreviousCardState,
  ProgressedTrophy,
  TierStatsMap,
} from './trophies/trophyEvaluator';

export { matchCuratedCandidate, parseGlobalReviews, parseStrictScore };
export type {
  EvaluatedTrophyCard as EvaluatedTrophy,
  NewlyUnlockedAchievement,
  ProgressedTrophy,
  TrophyChecklistItem,
  TrophyRankState,
};

export interface TrophyLastActivityEntry {
  trophyId: string;
  unlockedNow: boolean;
  increasedBy: number;
  previousCount: number;
  currentCount: number;
}

export interface TrophyLastActivity {
  movieId?: number | null;
  movieTitle?: string | null;
  action?: string | null;
  updatedAt?: string | null;
  entries: TrophyLastActivityEntry[];
}

export interface TrophiesSummaryResponse {
  totalTrophies: number;
  totalAchievements: number;
  unlockedCount: number;
  unlockedAchievementsCount: number;
  overallPercentage: number;
  earnedPoints: number;
  totalPoints: number;
  tierStats: TierStatsMap;
  trophies: EvaluatedTrophyCard[];
  newlyUnlocked: NewlyUnlockedAchievement[];
  progressedTrophies: ProgressedTrophy[];
  xpStatus?: UserXpStatus | null;
  lastActivity?: TrophyLastActivity | null;
}

function computePointsFromTierStats(tierStats: TierStatsMap): { earnedPoints: number; totalPoints: number } {
  let earnedPoints = 0;
  let totalPoints = 0;
  for (const tier of Object.keys(tierStats) as TrophyTier[]) {
    const xp = TROPHY_XP_BY_TIER[tier] || 0;
    const b = tierStats[tier];
    earnedPoints += (b?.unlocked || 0) * xp;
    totalPoints += (b?.total || 0) * xp;
  }
  return { earnedPoints, totalPoints };
}

const TROPHY_DEF_MAP = new Map<string, TrophyDefinition>(TROPHY_DEFINITIONS.map((d) => [d.id, d]));

function normalizeRanksStateArray(rawRanksState: unknown, def?: TrophyDefinition): TrophyRankState[] {
  const arr = Array.isArray(rawRanksState)
    ? rawRanksState
    : rawRanksState && typeof rawRanksState === 'object'
      ? Object.values(rawRanksState as Record<string, any>)
      : [];

  if (!def || !Array.isArray(def.ranks)) return arr as TrophyRankState[];

  const byId = new Map<string, any>(arr.filter((x) => x?.id).map((x) => [String(x.id), x]));
  return def.ranks.map((step) => {
    const saved = byId.get(step.id) || {};
    const stepTarget = saved.progress_target ?? (def.target_type === 'all_12_months_coverage' ? 12 : step.target_value);
    const stepCurrent = saved.progress_current ?? 0;
    return {
      id: step.id,
      tier: step.tier,
      target_value: step.target_value,
      title: step.title || `${def.title} • Rank ${step.tier}`,
      description: step.description || def.description,
      legacy_id: step.legacy_id,
      is_unlocked: Boolean(saved.is_unlocked),
      unlocked_at: saved.unlocked_at || null,
      test_override: saved.test_override ?? null,
      is_new: Boolean(saved.is_new),
      progress_current: Number(stepCurrent) || 0,
      progress_target: Number(stepTarget) || step.target_value,
      progress_percentage: Number(saved.progress_percentage) || 0,
    };
  });
}

export function getTrophyLadderKey(t: ProgressedTrophy): string {
  return t.id;
}

export function filterProgressedTrophies(progressedList: ProgressedTrophy[]): ProgressedTrophy[] {
  if (!Array.isArray(progressedList) || progressedList.length <= 1) return progressedList || [];
  return [...progressedList]
    .sort((a, b) => {
      if (b.delta !== a.delta) return b.delta - a.delta;
      return b.progress_percentage - a.progress_percentage;
    })
    .slice(0, 6);
}

/**
 * Ensures PostgreSQL tables and columns for the Trophy & Rank system exist.
 */
export async function ensureTrophyTables(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS trophies (
      id VARCHAR(120) PRIMARY KEY,
      kind VARCHAR(20) NOT NULL DEFAULT 'unique',
      category VARCHAR(60) NOT NULL,
      categories JSONB NOT NULL DEFAULT '[]'::jsonb,
      tier VARCHAR(20) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      icon VARCHAR(20) NOT NULL,
      target_type VARCHAR(80) NOT NULL,
      target_value INT NOT NULL DEFAULT 1,
      target_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      ranks_config JSONB NOT NULL DEFAULT '[]'::jsonb,
      search_keywords TEXT NOT NULL DEFAULT '',
      sort_order INT NOT NULL DEFAULT 0
    );
  `);

  await query(`ALTER TABLE trophies ADD COLUMN IF NOT EXISTS kind VARCHAR(20) NOT NULL DEFAULT 'unique';`);
  await query(`ALTER TABLE trophies ADD COLUMN IF NOT EXISTS categories JSONB NOT NULL DEFAULT '[]'::jsonb;`);
  await query(`ALTER TABLE trophies ADD COLUMN IF NOT EXISTS ranks_config JSONB NOT NULL DEFAULT '[]'::jsonb;`);
  await query(`ALTER TABLE trophies ADD COLUMN IF NOT EXISTS search_keywords TEXT NOT NULL DEFAULT '';`);

  await query(`
    CREATE TABLE IF NOT EXISTS user_trophies (
      trophy_id VARCHAR(120) PRIMARY KEY REFERENCES trophies(id) ON DELETE CASCADE,
      is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
      unlocked_at TIMESTAMP WITH TIME ZONE,
      test_override BOOLEAN DEFAULT NULL,
      is_new BOOLEAN NOT NULL DEFAULT FALSE,
      progress_current INT NOT NULL DEFAULT 0,
      progress_target INT NOT NULL DEFAULT 1,
      progress_percentage INT NOT NULL DEFAULT 0,
      checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
      ranks_state JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`ALTER TABLE user_trophies ADD COLUMN IF NOT EXISTS ranks_state JSONB NOT NULL DEFAULT '[]'::jsonb;`);

  await query(`
    CREATE TABLE IF NOT EXISTS trophy_last_activity (
      id INT PRIMARY KEY DEFAULT 1,
      movie_id INT,
      movie_title VARCHAR(255),
      action VARCHAR(40),
      entries JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`ALTER TABLE trophy_last_activity ADD COLUMN IF NOT EXISTS movie_id INT;`);
  await query(`ALTER TABLE trophy_last_activity ADD COLUMN IF NOT EXISTS movie_title VARCHAR(255);`);
  await query(`ALTER TABLE trophy_last_activity ADD COLUMN IF NOT EXISTS action VARCHAR(40);`);
  await query(`ALTER TABLE trophy_last_activity ADD COLUMN IF NOT EXISTS entries JSONB NOT NULL DEFAULT '[]'::jsonb;`);
  await query(`ALTER TABLE trophy_last_activity ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`);
}

/**
 * Seeds or migrates the static trophy catalog into PostgreSQL in a single batched transaction,
 * preserving existing `unlocked_at` timestamps via `legacy_ids` mapping.
 */
export async function seedTrophies(force = false): Promise<void> {
  await ensureTrophyTables();

  if (!force) {
    const checkRes = await query(`
      SELECT
        COUNT(*)::int AS total_cnt,
        COUNT(*) FILTER (WHERE kind = 'rank')::int AS rank_cnt,
        BOOL_OR(id = 'vm_historical_relics_extinct') AS has_new_id
      FROM trophies
    `);
    const row = checkRes.rows[0];
    const expectedRanks = TROPHY_DEFINITIONS.filter((d) => d.kind === 'rank').length;
    if (
      row &&
      Number(row.total_cnt) === TROPHY_DEFINITIONS.length &&
      Number(row.rank_cnt) === expectedRanks &&
      Boolean(row.has_new_id)
    ) {
      return;
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lê estados antigos antes de limpar troféus removidos para migrar unlocked_at e test_override
    const oldRes = await client.query(`
      SELECT trophy_id, is_unlocked, unlocked_at, test_override, is_new,
             progress_current, progress_target, progress_percentage, ranks_state
      FROM user_trophies
    `);
    const oldStateMap = new Map<string, any>();
    for (const r of oldRes.rows) {
      oldStateMap.set(r.trophy_id, r);
    }

    const ids: string[] = [];
    const kinds: string[] = [];
    const categoriesArr: string[] = [];
    const categoriesJson: string[] = [];
    const tiers: string[] = [];
    const titles: string[] = [];
    const descriptions: string[] = [];
    const icons: string[] = [];
    const targetTypes: string[] = [];
    const targetValues: number[] = [];
    const targetMetadataJson: string[] = [];
    const ranksConfigJson: string[] = [];
    const searchKeywordsArr: string[] = [];
    const sortOrders: number[] = [];

    const utIds: string[] = [];
    const utUnlocked: boolean[] = [];
    const utUnlockedAt: Array<string | null> = [];
    const utOverrides: Array<boolean | null> = [];
    const utIsNew: boolean[] = [];
    const utProgCurr: number[] = [];
    const utProgTarg: number[] = [];
    const utProgPct: number[] = [];
    const utRanksStateJson: string[] = [];

    for (const def of TROPHY_DEFINITIONS) {
      const keywords = [
        def.title,
        def.description,
        ...(def.ranks || []).flatMap((r) => [r.title || '', r.description || '']),
      ]
        .join(' ')
        .trim();

      ids.push(def.id);
      kinds.push(def.kind || 'unique');
      categoriesArr.push(def.category);
      categoriesJson.push(JSON.stringify(def.categories || [def.category]));
      tiers.push(def.tier);
      titles.push(def.title);
      descriptions.push(def.description);
      icons.push(def.icon);
      targetTypes.push(def.target_type);
      targetValues.push(def.target_value || 1);
      targetMetadataJson.push(JSON.stringify(def.target_metadata || {}));
      ranksConfigJson.push(JSON.stringify(def.ranks || []));
      searchKeywordsArr.push(keywords);
      sortOrders.push(def.sort_order || 0);

      // Prepara migração de estado do usuário (preservando unlocked_at via legacy_ids)
      const directOld = oldStateMap.get(def.id);
      const legacyMatches = (def.legacy_ids || []).map((lid) => oldStateMap.get(lid)).filter(Boolean);

      if (def.kind === 'rank' && Array.isArray(def.ranks)) {
        const existingRanks = normalizeRanksStateArray(directOld?.ranks_state, def);
        const existingByStepId = new Map<string, TrophyRankState>(existingRanks.map((r) => [r.id, r]));

        const migratedSteps: TrophyRankState[] = def.ranks.map((step) => {
          const prevStep = existingByStepId.get(step.id);
          const legacyStepOld = step.legacy_id ? oldStateMap.get(step.legacy_id) : null;
          const stepUnlocked = prevStep?.is_unlocked || Boolean(legacyStepOld?.is_unlocked);
          const stepUnlockedAt = prevStep?.unlocked_at || legacyStepOld?.unlocked_at || null;
          return {
            id: step.id,
            tier: step.tier,
            target_value: step.target_value,
            title: step.title || `${def.title} • Rank ${step.tier}`,
            description: step.description || def.description,
            legacy_id: step.legacy_id,
            is_unlocked: stepUnlocked,
            unlocked_at: stepUnlocked ? stepUnlockedAt : null,
            test_override: prevStep?.test_override ?? legacyStepOld?.test_override ?? null,
            is_new: prevStep?.is_new ?? false,
            progress_current: prevStep?.progress_current ?? 0,
            progress_target:
              prevStep?.progress_target ?? (def.target_type === 'all_12_months_coverage' ? 12 : step.target_value),
            progress_percentage: prevStep?.progress_percentage ?? 0,
          };
        });

        const earliestUnlocked =
          directOld?.unlocked_at ||
          migratedSteps.find((s) => s.unlocked_at)?.unlocked_at ||
          legacyMatches.find((m) => m.unlocked_at)?.unlocked_at ||
          null;

        utIds.push(def.id);
        utUnlocked.push(Boolean(directOld?.is_unlocked) || migratedSteps.every((s) => s.is_unlocked));
        utUnlockedAt.push(earliestUnlocked ? new Date(earliestUnlocked).toISOString() : null);
        utOverrides.push(directOld?.test_override ?? null);
        utIsNew.push(Boolean(directOld?.is_new));
        utProgCurr.push(Number(directOld?.progress_current) || 0);
        utProgTarg.push(Number(directOld?.progress_target) || def.ranks[0]?.target_value || def.target_value);
        utProgPct.push(Number(directOld?.progress_percentage) || 0);
        utRanksStateJson.push(JSON.stringify(migratedSteps));
      } else {
        const legacyUnlocked = legacyMatches.find((m) => m.is_unlocked);
        const source = directOld || legacyUnlocked || legacyMatches[0] || null;

        utIds.push(def.id);
        utUnlocked.push(Boolean(source?.is_unlocked));
        utUnlockedAt.push(source?.unlocked_at ? new Date(source.unlocked_at).toISOString() : null);
        utOverrides.push(directOld?.test_override ?? null);
        utIsNew.push(Boolean(directOld?.is_new));
        utProgCurr.push(Number(source?.progress_current) || 0);
        utProgTarg.push(Number(source?.progress_target) || def.target_value || 1);
        utProgPct.push(Number(source?.progress_percentage) || 0);
        utRanksStateJson.push('[]');
      }
    }

    // Remove troféus obsoletos que saíram do catálogo (cascade apaga user_trophies antigos após já termos migrado em memória)
    await client.query(`DELETE FROM trophies WHERE id <> ALL($1::text[])`, [ids]);

    // Upsert em lote na tabela trophies (1 query!)
    await client.query(
      `
      INSERT INTO trophies (
        id, kind, category, categories, tier, title, description, icon,
        target_type, target_value, target_metadata, ranks_config, search_keywords, sort_order
      )
      SELECT * FROM UNNEST(
        $1::text[], $2::text[], $3::text[], $4::jsonb[], $5::text[],
        $6::text[], $7::text[], $8::text[], $9::text[], $10::int[],
        $11::jsonb[], $12::jsonb[], $13::text[], $14::int[]
      )
      ON CONFLICT (id) DO UPDATE SET
        kind = EXCLUDED.kind,
        category = EXCLUDED.category,
        categories = EXCLUDED.categories,
        tier = EXCLUDED.tier,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        target_type = EXCLUDED.target_type,
        target_value = EXCLUDED.target_value,
        target_metadata = EXCLUDED.target_metadata,
        ranks_config = EXCLUDED.ranks_config,
        search_keywords = EXCLUDED.search_keywords,
        sort_order = EXCLUDED.sort_order
      `,
      [
        ids,
        kinds,
        categoriesArr,
        categoriesJson,
        tiers,
        titles,
        descriptions,
        icons,
        targetTypes,
        targetValues,
        targetMetadataJson,
        ranksConfigJson,
        searchKeywordsArr,
        sortOrders,
      ]
    );

    // Garante todas as linhas em user_trophies preservando estado já migrado (1 query!)
    await client.query(
      `
      INSERT INTO user_trophies (
        trophy_id, is_unlocked, unlocked_at, test_override, is_new,
        progress_current, progress_target, progress_percentage, ranks_state
      )
      SELECT * FROM UNNEST(
        $1::text[], $2::boolean[], $3::timestamptz[], $4::boolean[], $5::boolean[],
        $6::int[], $7::int[], $8::int[], $9::jsonb[]
      )
      ON CONFLICT (trophy_id) DO NOTHING
      `,
      [utIds, utUnlocked, utUnlockedAt, utOverrides, utIsNew, utProgCurr, utProgTarg, utProgPct, utRanksStateJson]
    );

    // Se algum rank existente entrou sem ranks_state populado, preenche a estrutura base
    await client.query(
      `
      UPDATE user_trophies AS ut
      SET ranks_state = v.ranks_state,
          unlocked_at = COALESCE(ut.unlocked_at, v.unlocked_at)
      FROM (
        SELECT * FROM UNNEST($1::text[], $2::timestamptz[], $3::jsonb[])
          AS t(trophy_id, unlocked_at, ranks_state)
      ) AS v
      WHERE ut.trophy_id = v.trophy_id
        AND (ut.ranks_state IS NULL OR jsonb_array_length(ut.ranks_state) = 0)
        AND jsonb_array_length(v.ranks_state) > 0
      `,
      [utIds, utUnlockedAt, utRanksStateJson]
    );

    await client.query('COMMIT');
    console.log(`[Trophies] Catálogo sincronizado em lote (${ids.length} cards).`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function fetchLastActivity(): Promise<TrophyLastActivity | null> {
  const res = await query(`SELECT movie_id, movie_title, action, entries, updated_at FROM trophy_last_activity WHERE id = 1`);
  const row = res.rows[0];
  if (!row) return null;
  return {
    movieId: row.movie_id ?? null,
    movieTitle: row.movie_title ?? null,
    action: row.action ?? null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    entries: Array.isArray(row.entries) ? row.entries : [],
  };
}

/**
 * Pure in-memory evaluation entry point (used by tests/offline simulation without touching PostgreSQL).
 */
export function evaluateDefinitionsFromWorldData(
  worldData: WorldChallengePayload | any,
  prevStatesMap: Map<string, PreviousCardState> = new Map(),
  options: { includeChecklists?: boolean; isBaseline?: boolean } = {}
): {
  cards: EvaluatedTrophyCard[];
  summary: ReturnType<typeof computeAchievementSummary>;
  newlyUnlocked: NewlyUnlockedAchievement[];
  progressedTrophies: ProgressedTrophy[];
} {
  const index = buildCatalogIndex(worldData);
  const evalRes = evaluateCatalogDefinitions(TROPHY_DEFINITIONS, index, prevStatesMap, {
    includeChecklists: options.includeChecklists ?? false,
    isBaseline: options.isBaseline ?? true,
  });
  const summary = computeAchievementSummary(evalRes.cards);
  return {
    cards: evalRes.cards,
    summary,
    newlyUnlocked: evalRes.newlyUnlocked,
    progressedTrophies: filterProgressedTrophies(evalRes.progressedTrophies),
  };
}

/**
 * Fast DB-cached read used by `GET /api/trophies` and initial page loads.
 * Only triggers a full evaluation if the DB has not been evaluated yet.
 */
export async function getCachedTrophiesSummary(): Promise<TrophiesSummaryResponse> {
  await seedTrophies(false);

  const [rowsRes, lastActivity] = await Promise.all([
    query(`
      SELECT
        t.id, t.kind, t.category, t.categories, t.tier, t.title, t.description, t.icon,
        t.target_type, t.target_value, t.target_metadata, t.ranks_config, t.search_keywords, t.sort_order,
        ut.is_unlocked, ut.unlocked_at, ut.test_override, ut.is_new,
        ut.progress_current, ut.progress_target, ut.progress_percentage, ut.ranks_state, ut.updated_at
      FROM trophies t
      LEFT JOIN user_trophies ut ON ut.trophy_id = t.id
      ORDER BY t.sort_order ASC
    `),
    fetchLastActivity(),
  ]);

  // Se houver muitos cards desatualizados (ex: nunca avaliados ainda e há filmes no catálogo), roda 1 avaliação inicial
  const anyMissingState = rowsRes.rows.some((r: any) => r.progress_target === null || r.progress_target === undefined);
  const needsInitialEval =
    rowsRes.rows.length !== TROPHY_DEFINITIONS.length ||
    anyMissingState ||
    (rowsRes.rows.every((r: any) => !r.is_unlocked && Number(r.progress_current) === 0) &&
      (await query(`SELECT EXISTS(SELECT 1 FROM movies LIMIT 1) AS has_movies`)).rows[0]?.has_movies);

  if (needsInitialEval) {
    return evaluateTrophies({ markNew: false });
  }

  const cards: EvaluatedTrophyCard[] = [];
  const newlyUnlocked: NewlyUnlockedAchievement[] = [];

  for (const r of rowsRes.rows) {
    const def = TROPHY_DEF_MAP.get(r.id);
    const kind = (r.kind || def?.kind || 'unique') as 'unique' | 'rank' | 'platinum';
    const categories = Array.isArray(r.categories) && r.categories.length > 0 ? r.categories : [r.category];

    if (kind === 'rank') {
      const ranks = normalizeRanksStateArray(r.ranks_state, def);
      let unlockedRanks = 0;
      let highestTier: TrophyTier | null = null;
      let hasAnyNew = Boolean(r.is_new);

      for (const st of ranks) {
        if (st.is_unlocked) {
          unlockedRanks++;
          highestTier = st.tier;
        }
        if (st.is_new && st.is_unlocked) {
          hasAnyNew = true;
          newlyUnlocked.push({
            id: st.id,
            card_id: r.id,
            title: st.title,
            description: st.description,
            tier: st.tier,
            category: r.category,
            categories,
            icon: r.icon,
            unlocked_at: st.unlocked_at || new Date().toISOString(),
            is_rank_step: true,
            rank_step_target: st.target_value,
          });
        }
      }

      cards.push({
        id: r.id,
        kind: 'rank',
        category: r.category,
        categories,
        tier: r.tier,
        title: r.title,
        description: r.description,
        icon: r.icon,
        target_type: r.target_type,
        target_value: Number(r.target_value) || 1,
        target_metadata: r.target_metadata || {},
        sort_order: Number(r.sort_order) || 0,
        search_keywords: r.search_keywords || '',
        is_unlocked: Boolean(r.is_unlocked),
        unlocked_at: r.unlocked_at ? new Date(r.unlocked_at).toISOString() : null,
        test_override: r.test_override ?? null,
        is_new: hasAnyNew,
        progress_current: Number(r.progress_current) || 0,
        progress_target: Number(r.progress_target) || 1,
        progress_percentage: Number(r.progress_percentage) || 0,
        ranks,
        unlocked_ranks_count: unlockedRanks,
        highest_unlocked_tier: highestTier,
        checklist: [],
      });
    } else {
      const isNew = Boolean(r.is_new) && Boolean(r.is_unlocked);
      const unlockedAtIso = r.unlocked_at ? new Date(r.unlocked_at).toISOString() : null;
      if (isNew) {
        newlyUnlocked.push({
          id: r.id,
          card_id: r.id,
          title: r.title,
          description: r.description,
          tier: r.tier,
          category: r.category,
          categories,
          icon: r.icon,
          unlocked_at: unlockedAtIso || new Date().toISOString(),
        });
      }

      cards.push({
        id: r.id,
        kind,
        category: r.category,
        categories,
        tier: r.tier,
        title: r.title,
        description: r.description,
        icon: r.icon,
        target_type: r.target_type,
        target_value: Number(r.target_value) || 1,
        target_metadata: r.target_metadata || {},
        sort_order: Number(r.sort_order) || 0,
        search_keywords: r.search_keywords || '',
        is_unlocked: Boolean(r.is_unlocked),
        unlocked_at: unlockedAtIso,
        test_override: r.test_override ?? null,
        is_new: isNew,
        progress_current: Number(r.progress_current) || 0,
        progress_target: Number(r.progress_target) || 1,
        progress_percentage: Number(r.progress_percentage) || 0,
        checklist: [],
      });
    }
  }

  const summary = computeAchievementSummary(cards);
  const { earnedPoints, totalPoints } = computePointsFromTierStats(summary.tierStats);
  const xpStatus = await getQuickXpSnapshot({ trophiesOverride: cards }).catch(() => null);

  return {
    totalTrophies: summary.totalCards,
    totalAchievements: summary.totalAchievements,
    unlockedCount: summary.unlockedCardsCount,
    unlockedAchievementsCount: summary.unlockedAchievementsCount,
    overallPercentage: summary.overallPercentage,
    earnedPoints,
    totalPoints,
    tierStats: summary.tierStats,
    trophies: cards,
    newlyUnlocked,
    progressedTrophies: [],
    xpStatus,
    lastActivity,
  };
}

/**
 * Re-evaluates all trophies against catalog movies & Desafio 195 / Relíquias,
 * persists only changed rows in batch, and returns compact trophy summaries.
 */
export async function evaluateTrophies(
  options: {
    markNew?: boolean;
    dryRun?: boolean;
    skipUnlocked?: boolean;
    forceSeed?: boolean;
    includeChecklists?: boolean;
    recordLastMovie?: { id?: number | null; movieId?: number | null; title?: string | null; action?: string } | null;
    existingWorldData?: WorldChallengePayload;
  } = {}
): Promise<TrophiesSummaryResponse> {
  await seedTrophies(Boolean(options.forceSeed));

  const [prevRes, worldData] = await Promise.all([
    query(`
      SELECT trophy_id, is_unlocked, unlocked_at, test_override, is_new,
             progress_current, progress_target, progress_percentage, ranks_state
      FROM user_trophies
    `),
    options.existingWorldData ? Promise.resolve(options.existingWorldData) : buildWorldChallengePayload(),
  ]);

  const prevStates = new Map<string, PreviousCardState>();
  const prevRanksSerialized = new Map<string, string>();
  for (const r of prevRes.rows) {
    prevStates.set(r.trophy_id, {
      is_unlocked: Boolean(r.is_unlocked),
      unlocked_at: r.unlocked_at ? new Date(r.unlocked_at).toISOString() : null,
      test_override: r.test_override ?? null,
      is_new: Boolean(r.is_new),
      progress_current: Number(r.progress_current) || 0,
      progress_target: Number(r.progress_target) || 1,
      progress_percentage: Number(r.progress_percentage) || 0,
      ranks_state: r.ranks_state,
    });
    prevRanksSerialized.set(r.trophy_id, JSON.stringify(r.ranks_state || []));
  }

  const index = buildCatalogIndex(worldData);
  const nowIso = new Date().toISOString();
  const markNew = options.markNew !== false;

  const evalRes = evaluateCatalogDefinitions(TROPHY_DEFINITIONS, index, prevStates, {
    includeChecklists: Boolean(options.includeChecklists),
    nowIso,
    isBaseline: !markNew,
  });

  if (!options.dryRun) {
    const chIds: string[] = [];
    const chUnlocked: boolean[] = [];
    const chUnlockedAt: Array<string | null> = [];
    const chIsNew: boolean[] = [];
    const chProgCurr: number[] = [];
    const chProgTarg: number[] = [];
    const chProgPct: number[] = [];
    const chRanksStateJson: string[] = [];

    for (const card of evalRes.cards) {
      const prev = prevStates.get(card.id);
      const nextRanksJson = JSON.stringify(card.ranks || []);
      const prevRanksJson = prevRanksSerialized.get(card.id) || '[]';

      const changed =
        !prev ||
        prev.is_unlocked !== card.is_unlocked ||
        prev.unlocked_at !== card.unlocked_at ||
        prev.is_new !== card.is_new ||
        prev.progress_current !== card.progress_current ||
        prev.progress_target !== card.progress_target ||
        prev.progress_percentage !== card.progress_percentage ||
        prevRanksJson !== nextRanksJson;

      if (changed) {
        chIds.push(card.id);
        chUnlocked.push(card.is_unlocked);
        chUnlockedAt.push(card.unlocked_at);
        chIsNew.push(card.is_new);
        chProgCurr.push(card.progress_current);
        chProgTarg.push(card.progress_target);
        chProgPct.push(card.progress_percentage);
        chRanksStateJson.push(nextRanksJson);
      }
    }

    if (chIds.length > 0) {
      await query(
        `
        UPDATE user_trophies AS ut
        SET
          is_unlocked = v.is_unlocked,
          unlocked_at = v.unlocked_at,
          is_new = v.is_new,
          progress_current = v.progress_current,
          progress_target = v.progress_target,
          progress_percentage = v.progress_percentage,
          ranks_state = v.ranks_state,
          updated_at = CURRENT_TIMESTAMP
        FROM (
          SELECT * FROM UNNEST(
            $1::text[], $2::boolean[], $3::timestamptz[], $4::boolean[],
            $5::int[], $6::int[], $7::int[], $8::jsonb[]
          ) AS t(
            trophy_id, is_unlocked, unlocked_at, is_new,
            progress_current, progress_target, progress_percentage, ranks_state
          )
        ) AS v
        WHERE ut.trophy_id = v.trophy_id
        `,
        [chIds, chUnlocked, chUnlockedAt, chIsNew, chProgCurr, chProgTarg, chProgPct, chRanksStateJson]
      );
    }

    if (options.recordLastMovie) {
      const entryByCardId = new Map<string, TrophyLastActivityEntry>();
      const cardById = new Map(evalRes.cards.map((c) => [c.id, c]));

      for (const u of evalRes.newlyUnlocked) {
        const cId = u.card_id || u.id;
        const card = cardById.get(cId);
        const prev = prevStates.get(cId);
        const cur = card?.progress_current ?? 1;
        const prevCur = prev?.progress_current ?? 0;
        entryByCardId.set(cId, {
          trophyId: cId,
          unlockedNow: true,
          increasedBy: Math.max(1, cur - prevCur),
          previousCount: prevCur,
          currentCount: cur,
        });
      }
      for (const p of evalRes.progressedTrophies) {
        if (!entryByCardId.has(p.id)) {
          entryByCardId.set(p.id, {
            trophyId: p.id,
            unlockedNow: false,
            increasedBy: Math.max(1, p.delta),
            previousCount: p.previous_current,
            currentCount: p.progress_current,
          });
        }
      }

      await query(
        `
        INSERT INTO trophy_last_activity (id, movie_id, movie_title, action, entries, updated_at)
        VALUES (1, $1, $2, $3, $4::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          movie_id = EXCLUDED.movie_id,
          movie_title = EXCLUDED.movie_title,
          action = EXCLUDED.action,
          entries = EXCLUDED.entries,
          updated_at = CURRENT_TIMESTAMP
        `,
        [
          options.recordLastMovie.id ?? options.recordLastMovie.movieId ?? null,
          options.recordLastMovie.title ?? null,
          options.recordLastMovie.action ?? 'updated',
          JSON.stringify(Array.from(entryByCardId.values())),
        ]
      );
    }
  }

  const summary = computeAchievementSummary(evalRes.cards);
  const { earnedPoints, totalPoints } = computePointsFromTierStats(summary.tierStats);
  const [xpStatus, lastActivity] = await Promise.all([
    getQuickXpSnapshot({ worldData, trophiesOverride: evalRes.cards }).catch(() => null),
    fetchLastActivity().catch(() => null),
  ]);

  const finalNewlyUnlocked = markNew ? evalRes.newlyUnlocked : [];
  const finalProgressed = markNew ? filterProgressedTrophies(evalRes.progressedTrophies) : [];

  return {
    totalTrophies: summary.totalCards,
    totalAchievements: summary.totalAchievements,
    unlockedCount: summary.unlockedCardsCount,
    unlockedAchievementsCount: summary.unlockedAchievementsCount,
    overallPercentage: summary.overallPercentage,
    earnedPoints,
    totalPoints,
    tierStats: summary.tierStats,
    trophies: evalRes.cards,
    newlyUnlocked: finalNewlyUnlocked,
    progressedTrophies: finalProgressed,
    xpStatus,
    lastActivity,
  };
}

/**
 * Generates and returns the detailed on-demand checklist for a single trophy card.
 */
export async function getTrophyChecklistById(trophyId: string): Promise<EvaluatedTrophyCard | null> {
  const def = TROPHY_DEF_MAP.get(trophyId);
  if (!def) return null;

  await ensureTrophyTables();
  const [worldData, utRes] = await Promise.all([
    buildWorldChallengePayload(),
    query(
      `SELECT trophy_id, is_unlocked, unlocked_at, test_override, is_new,
              progress_current, progress_target, progress_percentage, ranks_state
       FROM user_trophies`
    ),
  ]);

  const prevStates = new Map<string, PreviousCardState>();
  for (const r of utRes.rows) {
    prevStates.set(r.trophy_id, {
      is_unlocked: Boolean(r.is_unlocked),
      unlocked_at: r.unlocked_at ? new Date(r.unlocked_at).toISOString() : null,
      test_override: r.test_override ?? null,
      is_new: Boolean(r.is_new),
      progress_current: Number(r.progress_current) || 0,
      progress_target: Number(r.progress_target) || 1,
      progress_percentage: Number(r.progress_percentage) || 0,
      ranks_state: r.ranks_state,
    });
  }

  const index = buildCatalogIndex(worldData);
  if (def.kind === 'platinum' || def.target_type === 'platinum_dynamic') {
    const scopeCat = String(def.target_metadata?.categoryScope || def.target_metadata?.category || def.category);
    const scopedDefs = TROPHY_DEFINITIONS.filter(
      (d) =>
        d.kind !== 'platinum' &&
        d.target_type !== 'platinum_dynamic' &&
        (d.category === scopeCat || (Array.isArray(d.categories) && d.categories.includes(scopeCat)))
    );
    const scopedCards = scopedDefs.map(
      (d) => evaluateSingleNonPlatinumDefinition(d, index, prevStates.get(d.id), { isBaseline: true }).card
    );
    return evaluatePlatinumDefinition(def, scopedCards, prevStates.get(def.id), {
      includeChecklist: true,
      isBaseline: true,
    }).card;
  }

  return evaluateSingleNonPlatinumDefinition(def, index, prevStates.get(def.id), {
    includeChecklist: true,
    isBaseline: true,
  }).card;
}

/**
 * Clears `is_new` flags after PS5 toasts are shown (supports both card IDs and `cardId__tier` step IDs).
 */
export async function acknowledgeNewTrophies(trophyIds?: string[]): Promise<void> {
  await ensureTrophyTables();

  if (!Array.isArray(trophyIds) || trophyIds.length === 0) {
    await query(`
      UPDATE user_trophies
      SET is_new = FALSE,
          ranks_state = COALESCE(
            (SELECT jsonb_agg(elem || '{"is_new": false}'::jsonb)
             FROM jsonb_array_elements(COALESCE(ranks_state, '[]'::jsonb)) AS elem),
            '[]'::jsonb
          )
      WHERE is_new = TRUE OR ranks_state @> '[{"is_new": true}]'::jsonb
    `);
    return;
  }

  const parentIds = new Set<string>();
  const stepIds = new Set<string>(trophyIds.map(String));
  for (const tid of trophyIds) {
    const str = String(tid);
    parentIds.add(str);
    if (str.includes('__')) {
      parentIds.add(str.split('__')[0]);
    }
  }

  const res = await query(
    `SELECT trophy_id, ranks_state FROM user_trophies WHERE trophy_id = ANY($1::text[])`,
    [Array.from(parentIds)]
  );

  for (const row of res.rows) {
    const ranks = Array.isArray(row.ranks_state) ? row.ranks_state : [];
    const nextRanks = ranks.map((r: any) =>
      stepIds.has(r.id) || parentIds.has(row.trophy_id) ? { ...r, is_new: false } : r
    );
    const stillHasNew = nextRanks.some((r: any) => Boolean(r.is_new));
    await query(
      `UPDATE user_trophies SET is_new = $2, ranks_state = $3::jsonb WHERE trophy_id = $1`,
      [row.trophy_id, stillHasNew, JSON.stringify(nextRanks)]
    );
  }
}

/**
 * Applies or clears a manual QA override (`true` / `false` / `null`) on either a trophy card
 * or a specific rank step (`cardId__tier`).
 */
export async function setTrophyTestOverride(trophyId: string, overrideState: boolean | null): Promise<void> {
  await seedTrophies(false);
  const rawId = String(trophyId);

  // Suporte a step de Rank (`cardId__tier`)
  const defByStep = TROPHY_DEFINITIONS.find((d) => d.kind === 'rank' && d.ranks?.some((r) => r.id === rawId));
  if (defByStep) {
    const res = await query(`SELECT ranks_state FROM user_trophies WHERE trophy_id = $1`, [defByStep.id]);
    const currentRanks = normalizeRanksStateArray(res.rows[0]?.ranks_state, defByStep);
    const nextRanks = currentRanks.map((r) =>
      r.id === rawId
        ? {
            ...r,
            test_override: overrideState,
            is_unlocked: overrideState === null ? r.is_unlocked : overrideState,
            unlocked_at:
              overrideState === true ? r.unlocked_at || new Date().toISOString() : overrideState === false ? null : r.unlocked_at,
          }
        : r
    );
    await query(
      `UPDATE user_trophies SET ranks_state = $2::jsonb, updated_at = CURRENT_TIMESTAMP WHERE trophy_id = $1`,
      [defByStep.id, JSON.stringify(nextRanks)]
    );
    return;
  }

  // Card completo (único, platina ou card rank inteiro)
  const def = TROPHY_DEF_MAP.get(rawId);
  if (def?.kind === 'rank') {
    const res = await query(`SELECT ranks_state FROM user_trophies WHERE trophy_id = $1`, [rawId]);
    const currentRanks = normalizeRanksStateArray(res.rows[0]?.ranks_state, def);
    const nextRanks = currentRanks.map((r) => ({
      ...r,
      test_override: overrideState,
      is_unlocked: overrideState === null ? r.is_unlocked : overrideState,
      unlocked_at:
        overrideState === true ? r.unlocked_at || new Date().toISOString() : overrideState === false ? null : r.unlocked_at,
    }));
    await query(
      `UPDATE user_trophies
       SET test_override = $2, ranks_state = $3::jsonb, updated_at = CURRENT_TIMESTAMP
       WHERE trophy_id = $1`,
      [rawId, overrideState, JSON.stringify(nextRanks)]
    );
    return;
  }

  await query(
    `UPDATE user_trophies SET test_override = $2, updated_at = CURRENT_TIMESTAMP WHERE trophy_id = $1`,
    [rawId, overrideState]
  );
}

/**
 * Resets all manual QA overrides across cards and Rank steps.
 */
export async function resetAllTrophyOverrides(): Promise<void> {
  await ensureTrophyTables();
  await query(`
    UPDATE user_trophies
    SET test_override = NULL,
        ranks_state = COALESCE(
          (SELECT jsonb_agg(elem || '{"test_override": null}'::jsonb)
           FROM jsonb_array_elements(COALESCE(ranks_state, '[]'::jsonb)) AS elem),
          '[]'::jsonb
        ),
        updated_at = CURRENT_TIMESTAMP
  `);
}
