import { TrophyDefinition, TrophyRankStep, TrophyTier } from '../../data/trophyDefinitions';
import {
  ALL_21_GENRES,
  buildMovieSlotsChecklist,
  CatalogIndex,
  cleanStr,
  cleanTag,
  IndexedMovie,
  matchFranchiseMovie,
  MONTH_NAMES,
  movieHasAnyPattern,
  TrophyChecklistItem,
  TrophyRankState,
} from './catalogIndex';
import {
  isCinema,
  isDubbed,
  isFreeStreaming,
  isHboMax,
  isInternet,
  isInternetOrMfc,
  isMyFamilyCine,
  isNetflix,
  isOfficialStreaming,
  isOriginalAudio,
  isPhysicalMedia,
  isPrimeVideo,
  isSubtitled,
  isYouTube,
  isYouTubeSubtitled,
} from './platformNormalizer';

export interface MovieMatchResult {
  matched: boolean;
  extraInfo: string;
  sortScore: number;
}

export interface EvaluatedTrophyCard {
  id: string;
  kind: 'unique' | 'rank' | 'platinum';
  category: string;
  categories: string[];
  tier: TrophyTier;
  title: string;
  description: string;
  icon: string;
  target_type: string;
  target_value: number;
  target_metadata: Record<string, any>;
  sort_order: number;
  search_keywords: string;
  is_unlocked: boolean;
  unlocked_at: string | null;
  test_override: boolean | null;
  is_new: boolean;
  progress_current: number;
  progress_target: number;
  progress_percentage: number;
  ranks?: TrophyRankState[];
  unlocked_ranks_count?: number;
  highest_unlocked_tier?: TrophyTier | null;
  checklist: TrophyChecklistItem[];
}

export interface PreviousCardState {
  is_unlocked: boolean;
  unlocked_at: string | null;
  test_override: boolean | null;
  is_new: boolean;
  progress_current: number;
  progress_target: number;
  progress_percentage: number;
  ranks_state?: Record<string, Partial<TrophyRankState>> | TrophyRankState[] | null;
}

export interface NewlyUnlockedAchievement {
  id: string;
  card_id: string;
  title: string;
  description: string;
  tier: TrophyTier;
  category: string;
  categories: string[];
  icon: string;
  unlocked_at: string;
  is_rank_step?: boolean;
  rank_step_target?: number;
}

export interface ProgressedTrophy {
  id: string;
  title: string;
  tier: TrophyTier;
  category: string;
  categories: string[];
  icon: string;
  progress_current: number;
  progress_target: number;
  progress_percentage: number;
  previous_current: number;
  delta: number;
  target_type: string;
  target_metadata: Record<string, any>;
}

interface RawRuleResult {
  rawCount: number;
  progressCurrent: number;
  progressTarget: number;
  isMet: boolean;
  checklist: TrophyChecklistItem[];
  quotaRawCounts?: number[];
  monthCounts?: number[];
}

const fmtUr = (v: number) => v.toFixed(3);
const fmtImdb = (v: number) => v.toFixed(1);
const fmtGr = (v: number) => v.toLocaleString('pt-BR');

function movieHasCountryAll(m: IndexedMovie, code: string): boolean {
  return m.allCountryCodes.has(code.toLowerCase());
}

function movieHasGenre(m: IndexedMovie, genre: string): boolean {
  return m.genresSet.has(cleanTag(genre));
}

function movieHasTag(m: IndexedMovie, tag: string): boolean {
  return m.tagsSet.has(cleanTag(tag));
}

function movieInMonth(m: IndexedMovie, month: number | number[]): boolean {
  if (m.monthSeen === null) return false;
  return Array.isArray(month) ? month.includes(m.monthSeen) : m.monthSeen === month;
}

function movieInContinent(m: IndexedMovie, continent: string): boolean {
  return m.continentsSet.has(cleanStr(continent));
}

/**
 * Evaluates a single movie against a `critic_tribunal_rule` ruleKey.
 */
function evaluateCriticTribunalMovie(m: IndexedMovie, ruleKey: string): MovieMatchResult {
  const { ur, urMillis, imdb, imdbMillis, mc, rt, gr } = m;

  switch (ruleKey) {
    case 'ur_gte_9000':
      return ur !== null && urMillis! >= 9000
        ? { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_lte_3000':
      return ur !== null && urMillis! <= 3000
        ? { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: -urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'rt_gte_90':
      return rt !== null && rt >= 90
        ? { matched: true, extraInfo: `Tomatometer: ${rt}%`, sortScore: rt }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'imdb_gte_80':
      return imdb !== null && imdbMillis! >= 8000
        ? { matched: true, extraInfo: `IMDb: ${fmtImdb(imdb)}`, sortScore: imdbMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_gte_1m':
      return gr !== null && gr >= 1_000_000
        ? { matched: true, extraInfo: `Reviews Globais: ${fmtGr(gr)}`, sortScore: gr }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_lt_5k':
      return gr !== null && gr < 5_000
        ? { matched: true, extraInfo: `Reviews Globais: ${fmtGr(gr)}`, sortScore: -gr }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'only_rt_na':
      return rt === null && mc !== null
        ? { matched: true, extraInfo: `RT: N/A | Metacritic: ${mc}`, sortScore: mc }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'only_mc_na':
      return mc === null && rt !== null
        ? { matched: true, extraInfo: `Metacritic: N/A | RT: ${rt}%`, sortScore: rt }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_gt_1m_imdb_lt_70':
      return gr !== null && gr > 1_000_000 && imdb !== null && imdbMillis! < 7000
        ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)} | IMDb: ${fmtImdb(imdb)}`, sortScore: gr }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_lt_1k':
      return gr !== null && gr < 1_000
        ? { matched: true, extraInfo: `Reviews Globais: ${fmtGr(gr)}`, sortScore: -gr }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_lt_10k_ur_gte_8000':
      return gr !== null && gr < 10_000 && ur !== null && urMillis! >= 8000
        ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'rt_lt_40_ur_gte_7500':
      return rt !== null && rt < 40 && ur !== null && urMillis! >= 7500
        ? { matched: true, extraInfo: `RT: ${rt}% | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! - rt * 50 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'mc_gte_80_ur_lte_6000':
      return mc !== null && mc >= 80 && ur !== null && urMillis! <= 6000
        ? { matched: true, extraInfo: `Metacritic: ${mc} | Minha Nota: ${fmtUr(ur)}`, sortScore: mc * 100 - urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_pharmacist_decimals': {
      if (ur !== null && urMillis! % 1000 !== 0) {
        return { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)} (precisão decimal)`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };
    }

    case 'both_mc_rt_na':
      return mc === null && rt === null
        ? {
            matched: true,
            extraInfo: `Metacritic: N/A | RT: N/A${ur !== null ? ` | Nota: ${fmtUr(ur)}` : ''}`,
            sortScore: ur !== null ? urMillis! : 0,
          }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'rt_80_to_89':
      return rt !== null && rt >= 80 && rt <= 89
        ? { matched: true, extraInfo: `Tomatometer: ${rt}%`, sortScore: rt }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_6000_to_7000':
      return ur !== null && urMillis! >= 6000 && urMillis! <= 7000
        ? { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_500k_to_1m':
      return gr !== null && gr >= 500_000 && gr <= 1_000_000
        ? { matched: true, extraInfo: `Reviews Globais: ${fmtGr(gr)}`, sortScore: gr }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'imdb_lt_65_mc_gt_70':
      return imdb !== null && imdbMillis! < 6500 && mc !== null && mc > 70
        ? { matched: true, extraInfo: `IMDb: ${fmtImdb(imdb)} | Metacritic: ${mc}`, sortScore: mc * 100 - imdbMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_gte_9500':
      return ur !== null && urMillis! >= 9500
        ? { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_lt_100':
      return gr !== null && gr < 100
        ? { matched: true, extraInfo: `Reviews Globais: ${fmtGr(gr)}`, sortScore: -gr }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_gte_9000_imdb_lt_60':
      return ur !== null && urMillis! >= 9000 && imdb !== null && imdbMillis! < 6000
        ? { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)}`, sortScore: urMillis! - imdbMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'four_scores_spread_40': {
      if (ur !== null && imdb !== null && mc !== null && rt !== null) {
        const scores = [ur * 10, imdb * 10, mc, rt];
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const diff = max - min;
        if (diff >= 40) {
          return {
            matched: true,
            extraInfo: `Amplitude: ${diff.toFixed(1)} pts (${min.toFixed(0)} → ${max.toFixed(0)})`,
            sortScore: diff,
          };
        }
      }
      return { matched: false, extraInfo: '', sortScore: 0 };
    }

    case 'ur_gt_8000_imdb_lt_60_mc_lt_50_rt_lt_50':
      return ur !== null &&
        urMillis! > 8000 &&
        imdb !== null &&
        imdbMillis! < 6000 &&
        mc !== null &&
        mc < 50 &&
        rt !== null &&
        rt < 50
        ? {
            matched: true,
            extraInfo: `Nota: ${fmtUr(ur)} vs IMDb ${fmtImdb(imdb)} / RT ${rt}% / MC ${mc}`,
            sortScore: urMillis!,
          }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'rt_eq_100':
      return rt !== null && rt === 100
        ? { matched: true, extraInfo: `Tomatometer: 100%`, sortScore: urMillis || 100 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'mc_gte_90':
      return mc !== null && mc >= 90
        ? { matched: true, extraInfo: `Metacritic: ${mc}`, sortScore: mc }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_lte_2000_imdb_lt_50':
      return ur !== null && urMillis! <= 2000 && imdb !== null && imdbMillis! < 5000
        ? { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)}`, sortScore: -(urMillis! + imdbMillis!) }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_100_to_500':
      return gr !== null && gr >= 100 && gr <= 500
        ? { matched: true, extraInfo: `Reviews Globais: ${fmtGr(gr)}`, sortScore: gr }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_gte_9700':
      return ur !== null && urMillis! >= 9700
        ? { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_90_imdb_80_rt_90_mc_90':
      return ur !== null &&
        urMillis! >= 9000 &&
        imdb !== null &&
        imdbMillis! >= 8000 &&
        rt !== null &&
        rt >= 90 &&
        mc !== null &&
        mc >= 90
        ? {
            matched: true,
            extraInfo: `Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)} | RT: ${rt}% | MC: ${mc}`,
            sortScore: urMillis! + mc * 10 + rt * 10,
          }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_gte_8500':
      return ur !== null && urMillis! >= 8500
        ? { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'red_critic_lt_45_ur_gte_8500':
      return rt !== null &&
        rt < 45 &&
        mc !== null &&
        mc < 45 &&
        imdb !== null &&
        imdbMillis! < 6000 &&
        ur !== null &&
        urMillis! >= 8500
        ? {
            matched: true,
            extraInfo: `RT: ${rt}% | MC: ${mc} | IMDb: ${fmtImdb(imdb)} vs Minha Nota: ${fmtUr(ur)}`,
            sortScore: urMillis!,
          }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'imdb_gte_80_rt_gte_85':
      return imdb !== null && imdbMillis! >= 8000 && rt !== null && rt >= 85
        ? { matched: true, extraInfo: `IMDb: ${fmtImdb(imdb)} | RT: ${rt}%`, sortScore: imdbMillis! + rt * 10 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_lt_5k_ur_gte_8500':
      return gr !== null && gr < 5_000 && ur !== null && urMillis! >= 8500
        ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'imdb_lt_50_ur_gte_7500':
      return imdb !== null && imdbMillis! < 5000 && ur !== null && urMillis! >= 7500
        ? { matched: true, extraInfo: `IMDb: ${fmtImdb(imdb)} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! - imdbMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'checkpoint_777':
      // Novo requisito oficial: 4 notas no intervalo 7 (Minha Nota 7.000-7.999, IMDb 7.0-7.9, RT 70-79%, MC 70-79) sem trava de Global Reviews.
      return ur !== null &&
        urMillis! >= 7000 &&
        urMillis! <= 7999 &&
        imdb !== null &&
        imdbMillis! >= 7000 &&
        imdbMillis! <= 7999 &&
        rt !== null &&
        rt >= 70 &&
        rt <= 79 &&
        mc !== null &&
        mc >= 70 &&
        mc <= 79
        ? {
            matched: true,
            extraInfo: `Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)} | RT: ${rt}% | MC: ${mc}`,
            sortScore: urMillis!,
          }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_gte_9750':
      return ur !== null && urMillis! >= 9750
        ? { matched: true, extraInfo: `Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'ur_90_imdb_80_rt_88_mc_85':
      return ur !== null &&
        urMillis! >= 9000 &&
        imdb !== null &&
        imdbMillis! >= 8000 &&
        rt !== null &&
        rt >= 88 &&
        mc !== null &&
        mc >= 85
        ? {
            matched: true,
            extraInfo: `Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)} | RT: ${rt}% | MC: ${mc}`,
            sortScore: urMillis! + mc * 10 + rt * 10,
          }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'gr_lt_100k_ur_gte_8000':
      return gr !== null && gr < 100_000 && ur !== null && urMillis! >= 8000
        ? { matched: true, extraInfo: `Reviews: ${fmtGr(gr)} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'fr_ur_lt_5000':
      return movieHasCountryAll(m, 'fr') && ur !== null && urMillis! < 5000
        ? { matched: true, extraInfo: `França | Minha Nota: ${fmtUr(ur)}`, sortScore: -urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'xmen_ur_lt_7000':
      return movieHasTag(m, 'X-Men') && ur !== null && urMillis! < 7000
        ? { matched: true, extraInfo: `Tag X-Men | Minha Nota: ${fmtUr(ur)}`, sortScore: -urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'natal_ur_gt_7000':
      return movieHasTag(m, 'Natal') && ur !== null && urMillis! > 7000
        ? { matched: true, extraInfo: `Tag Natal | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'game_rt_lt_50_ur_gte_7000':
      return movieHasTag(m, 'Baseado em jogo') && rt !== null && rt < 50 && ur !== null && urMillis! >= 7000
        ? {
            matched: true,
            extraInfo: `Tag Baseado em jogo | RT: ${rt}% | Minha Nota: ${fmtUr(ur)}`,
            sortScore: urMillis! + (100 - rt),
          }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'comedia_ur_gte_8500':
      return movieHasGenre(m, 'Comédia') && ur !== null && urMillis! >= 8500
        ? { matched: true, extraInfo: `Comédia | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'terror_imdb_lt_55_outubro':
      return movieHasGenre(m, 'Terror') && imdb !== null && imdbMillis! < 5500 && movieInMonth(m, 10)
        ? { matched: true, extraInfo: `Terror em Outubro | IMDb: ${fmtImdb(imdb)}`, sortScore: -imdbMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'non_us_gr_gt_1m':
      return !movieHasCountryAll(m, 'us') && gr !== null && gr > 1_000_000
        ? { matched: true, extraInfo: `${m.primaryCountryName || 'Fora dos EUA'} | Reviews: ${fmtGr(gr)}`, sortScore: gr }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'br_gr_gt_100k':
      return movieHasCountryAll(m, 'br') && gr !== null && gr > 100_000
        ? { matched: true, extraInfo: `Brasil | Reviews: ${fmtGr(gr)}`, sortScore: gr }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'br_gr_lt_1k':
      return movieHasCountryAll(m, 'br') && gr !== null && gr < 1_000
        ? { matched: true, extraInfo: `Brasil | Reviews: ${fmtGr(gr)}`, sortScore: -gr }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'a24_ur_gt_8000':
      return movieHasAnyPattern(m.companies, ['a24']) && ur !== null && urMillis! > 8000
        ? { matched: true, extraInfo: `A24 | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'oscar_winner_gr_lt_300k':
      return m.oscarWins >= 1 && gr !== null && gr < 300_000
        ? { matched: true, extraInfo: `${m.oscarWins} Oscar(s) | Reviews: ${fmtGr(gr)}`, sortScore: -gr }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'agosto_ur_gt_7000':
      return movieInMonth(m, 8) && ur !== null && urMillis! > 7000
        ? { matched: true, extraInfo: `Visto em Agosto | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'gore_rt_gt_90':
      return movieHasTag(m, 'Gore') && rt !== null && rt > 90
        ? {
            matched: true,
            extraInfo: `Tag Gore | RT: ${rt}%${ur !== null ? ` | Minha Nota: ${fmtUr(ur)}` : ''}`,
            sortScore: rt,
          }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'musica_ur_gt_9000':
      return movieHasGenre(m, 'Música') && ur !== null && urMillis! > 9000
        ? { matched: true, extraInfo: `Música | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'marvel_dc_ur_gt_8500':
      if ((movieHasTag(m, 'Marvel') || movieHasTag(m, 'DC')) && ur !== null && urMillis! > 8500) {
        const heroTag = movieHasTag(m, 'Marvel') ? 'Marvel' : 'DC';
        return { matched: true, extraInfo: `Tag ${heroTag} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'sk_ur_gte_8000':
      return movieHasTag(m, 'SK') && ur !== null && urMillis! >= 8000
        ? { matched: true, extraInfo: `Tag SK (Stephen King) | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'oscar_acclaimed_ur_lte_6000':
      if (
        (m.oscarNoms >= 1 || m.oscarWins >= 1) &&
        ((rt !== null && rt >= 80) || (imdb !== null && imdbMillis! >= 7500)) &&
        ur !== null &&
        urMillis! <= 6000
      ) {
        const juryInfo = [rt !== null ? `RT: ${rt}%` : '', imdb !== null ? `IMDb: ${fmtImdb(imdb)}` : '']
          .filter(Boolean)
          .join(' | ');
        return {
          matched: true,
          extraInfo: `Oscar Aclamado (${juryInfo}) | Minha Nota: ${fmtUr(ur)}`,
          sortScore: -urMillis!,
        };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'terror_ur_gt_8000':
      return movieHasGenre(m, 'Terror') && ur !== null && urMillis! > 8000
        ? { matched: true, extraInfo: `Terror | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'emocionante_abuso_familiar_ur_gt_8000':
      return movieHasTag(m, 'Emocionante') && movieHasTag(m, 'Abuso Familiar') && ur !== null && urMillis! > 8000
        ? { matched: true, extraInfo: `Emocionante + Abuso Familiar | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'br_drama_ur_gt_9000':
      return movieHasCountryAll(m, 'br') && movieHasGenre(m, 'Drama') && ur !== null && urMillis! > 9000
        ? { matched: true, extraInfo: `Brasil • Drama | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'oscar_winner_gr_lt_500k':
      return m.oscarWins >= 1 && gr !== null && gr < 500_000
        ? { matched: true, extraInfo: `${m.oscarWins} Oscar(s) | Reviews: ${fmtGr(gr)}`, sortScore: -gr }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'final_epico_ur_gt_9000':
      return movieHasTag(m, 'Final Epico') && ur !== null && urMillis! > 9000
        ? { matched: true, extraInfo: `Final Épico | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'animacao_ur_gt_8500_rt_gt_90':
      return movieHasGenre(m, 'Animação') && ur !== null && urMillis! > 8500 && rt !== null && rt > 90
        ? { matched: true, extraInfo: `Animação | RT: ${rt}% | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! + rt * 10 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'non_us_non_br_gr_lt_50k_ur_gt_8000':
      return !movieHasCountryAll(m, 'us') &&
        !movieHasCountryAll(m, 'br') &&
        gr !== null &&
        gr < 50_000 &&
        ur !== null &&
        urMillis! > 8000
        ? {
            matched: true,
            extraInfo: `${m.primaryCountryName || 'Internacional'} | Reviews: ${fmtGr(gr)} | Minha Nota: ${fmtUr(ur)}`,
            sortScore: urMillis!,
          }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'blumhouse_terror_suspense_ur_gt_8000':
      if (
        movieHasAnyPattern(m.companies, ['blumhouse']) &&
        (movieHasGenre(m, 'Terror') || movieHasGenre(m, 'Suspense')) &&
        ur !== null &&
        urMillis! > 8000
      ) {
        const matchedGenre = movieHasGenre(m, 'Terror') ? 'Terror' : 'Suspense';
        return { matched: true, extraInfo: `Blumhouse • ${matchedGenre} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'dezembro_ur_gte_8500':
      return movieInMonth(m, 12) && ur !== null && urMillis! >= 8500
        ? { matched: true, extraInfo: `Visto em Dezembro | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'top250_ur_lt_7500':
      return movieHasTag(m, 'TOP250') && ur !== null && urMillis! < 7500
        ? { matched: true, extraInfo: `Tag TOP250 | Minha Nota: ${fmtUr(ur)}`, sortScore: -urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'terror_imdb_lt_65_ur_gt_8000':
      return movieHasGenre(m, 'Terror') && imdb !== null && imdbMillis! < 6500 && ur !== null && urMillis! > 8000
        ? { matched: true, extraInfo: `Terror | IMDb: ${fmtImdb(imdb)} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! - imdbMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'lgbt_drama_romance_ur_gt_8500_rt_gt_80':
      // Atualizado conforme decisão do catálogo: removida a trava de RT > 80%.
      if (
        (movieHasGenre(m, 'Drama') || movieHasGenre(m, 'Romance')) &&
        movieHasTag(m, 'Personagem LGBT') &&
        ur !== null &&
        urMillis! > 8500
      ) {
        const matchedGenre = movieHasGenre(m, 'Drama') ? 'Drama' : 'Romance';
        return { matched: true, extraInfo: `Personagem LGBT • ${matchedGenre} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! };
      }
      return { matched: false, extraInfo: '', sortScore: 0 };

    case 'oscar_winner_ur_gte_9000':
      return m.oscarWins >= 1 && ur !== null && urMillis! >= 9000
        ? { matched: true, extraInfo: `${m.oscarWins} Oscar(s) | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    default:
      return { matched: false, extraInfo: '', sortScore: 0 };
  }
}

/**
 * Evaluates a single movie against a `ritual_cinefilo_rule` ruleKey.
 */
function evaluateRitualCinefiloMovie(m: IndexedMovie, ruleKey: string): MovieMatchResult {
  const { runtime, releaseYear: relYear, yearSeen, canonicalPlatform: plat, audioLower: audio } = m;

  switch (ruleKey) {
    case 'cinema_count':
      return isCinema(plat)
        ? { matched: true, extraInfo: `Assistido no Cinema (${yearSeen || relYear || 'Ano N/I'})`, sortScore: yearSeen || relYear || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'audio_original_count':
      return isOriginalAudio(audio)
        ? { matched: true, extraInfo: `Áudio Original (${plat || 'Plataforma N/I'})`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'runtime_lte_15':
      return runtime > 0 && runtime <= 15
        ? { matched: true, extraInfo: `Duração: ${runtime} min`, sortScore: -runtime }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'runtime_eq_120':
      return runtime === 120
        ? { matched: true, extraInfo: `Duração exata: 120 min`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'physical_media_count':
      return isPhysicalMedia(plat)
        ? { matched: true, extraInfo: `Mídia Física: ${plat}`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'youtube_subtitled_count':
      return isYouTubeSubtitled(plat, audio)
        ? { matched: true, extraInfo: 'YouTube Legendado', sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'youtube_count':
      return isYouTube(plat)
        ? { matched: true, extraInfo: `YouTube (${audio || 'Áudio N/I'})`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'cinema_legendado_count':
      return isCinema(plat) && isSubtitled(audio)
        ? { matched: true, extraInfo: 'Cinema Legendado', sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'audio_dublado_count':
      return isDubbed(audio)
        ? { matched: true, extraInfo: `Áudio: ${m.raw.audio_type || audio}`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'audio_legendado_count':
      return isSubtitled(audio)
        ? { matched: true, extraInfo: `Áudio: ${m.raw.audio_type || audio}`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_eq_1994':
      return relYear === 1994
        ? { matched: true, extraInfo: 'Lançado em 1994', sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_eq_2012':
      return relYear === 2012
        ? { matched: true, extraInfo: 'Lançado em 2012', sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'same_year_seen_release':
      return relYear !== null && yearSeen !== null && relYear === yearSeen
        ? { matched: true, extraInfo: `Lançado e visto em ${relYear}`, sortScore: relYear }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_between_1920_1940':
      return relYear !== null && relYear >= 1920 && relYear <= 1940
        ? { matched: true, extraInfo: `Lançado em ${relYear}`, sortScore: relYear }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'prime_video_same_year':
      return isPrimeVideo(plat) && relYear !== null && yearSeen !== null && relYear === yearSeen
        ? { matched: true, extraInfo: `Prime Video no lançamento (${relYear})`, sortScore: relYear }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'runtime_lte_60':
      return runtime > 0 && runtime <= 60
        ? { matched: true, extraInfo: `Duração: ${runtime} min`, sortScore: -runtime }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'runtime_gt_150':
      return runtime > 150
        ? { matched: true, extraInfo: `Duração: ${runtime} min`, sortScore: runtime }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'runtime_gt_180':
      return runtime > 180
        ? { matched: true, extraInfo: `Duração épica: ${runtime} min`, sortScore: runtime }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'cinema_gt_150min':
      return isCinema(plat) && runtime > 150
        ? { matched: true, extraInfo: `Cinema (${runtime} min)`, sortScore: runtime }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'hbo_max_count':
      return isHboMax(plat)
        ? { matched: true, extraInfo: `Max (HBO Max) (${audio || 'Áudio N/I'})`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'netflix_count':
      return isNetflix(plat)
        ? { matched: true, extraInfo: `Netflix (${audio || 'Áudio N/I'})`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'internet_count':
      return isInternet(plat)
        ? { matched: true, extraInfo: `Internet (${audio || 'Áudio N/I'})`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'free_streaming_same_year':
      return isFreeStreaming(plat) && relYear !== null && yearSeen !== null && relYear === yearSeen
        ? { matched: true, extraInfo: `${plat} no lançamento (${relYear})`, sortScore: relYear }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'seen_after_release_year':
      return relYear !== null && yearSeen !== null && yearSeen > relYear
        ? {
            matched: true,
            extraInfo: `Lançado em ${relYear}, visto em ${yearSeen} (+${yearSeen - relYear} anos)`,
            sortScore: yearSeen - relYear,
          }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_lt_1994':
      return relYear !== null && relYear < 1994
        ? { matched: true, extraInfo: `Lançado em ${relYear} (antes de 1994)`, sortScore: -relYear }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_lt_1958':
      return relYear !== null && relYear < 1958
        ? { matched: true, extraInfo: `Lançado em ${relYear} (antes de 1958)`, sortScore: -relYear }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_1999_or_2000':
      return relYear === 1999 || relYear === 2000
        ? { matched: true, extraInfo: `Lançado em ${relYear} (Bug do Milênio)`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_between_2010_2020':
      return relYear !== null && relYear >= 2010 && relYear <= 2020
        ? { matched: true, extraInfo: `Lançado em ${relYear}`, sortScore: relYear }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'internet_or_mfc_count':
      return isInternetOrMfc(plat)
        ? { matched: true, extraInfo: plat, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'official_streaming_count':
      return isOfficialStreaming(plat)
        ? { matched: true, extraInfo: `Streaming Oficial: ${plat}`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'time_capsule_30_years':
      return relYear !== null && yearSeen !== null && yearSeen - relYear >= 30
        ? {
            matched: true,
            extraInfo: `Lançado em ${relYear}, visto em ${yearSeen} (${yearSeen - relYear} anos depois)`,
            sortScore: yearSeen - relYear,
          }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_eq_2001':
      return relYear === 2001
        ? { matched: true, extraInfo: 'Lançado em 2001', sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_between_1939_1945':
      return relYear !== null && relYear >= 1939 && relYear <= 1945
        ? { matched: true, extraInfo: `Segunda Guerra (${relYear})`, sortScore: relYear }
        : { matched: false, extraInfo: '', sortScore: 0 };

    default:
      return { matched: false, extraInfo: '', sortScore: 0 };
  }
}

/**
 * Evaluates a single movie against a `multi_ritual_rule` ruleKey.
 */
function evaluateMultiRitualMovie(m: IndexedMovie, ruleKey: string): MovieMatchResult {
  const {
    runtime,
    releaseYear: relYear,
    yearSeen,
    canonicalPlatform: plat,
    audioLower: audio,
    ur,
    urMillis,
    imdb,
    imdbMillis,
    gr,
  } = m;

  switch (ruleKey) {
    case 'cinema_ur_lt_7000':
      return isCinema(plat) && ur !== null && urMillis! < 7000 && urMillis! > 0
        ? { matched: true, extraInfo: `Cinema | Minha Nota: ${fmtUr(ur)} (< 7.000)`, sortScore: -urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'a24_ur_lt_6000':
      return movieHasAnyPattern(m.companies, ['a24']) && ur !== null && urMillis! < 6000 && urMillis! > 0
        ? { matched: true, extraInfo: `A24 | Minha Nota: ${fmtUr(ur)} (< 6.000)`, sortScore: -urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'year_1994_seen_august':
      return relYear === 1994 && movieInMonth(m, 8)
        ? { matched: true, extraInfo: 'Lançado em 1994 | Visto em Agosto', sortScore: 1994 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'brazil_year_1994':
      return relYear === 1994 && movieHasCountryAll(m, 'br')
        ? { matched: true, extraInfo: 'Brasil | Lançado em 1994', sortScore: 1994 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'animacao_dublada_15':
      return movieHasGenre(m, 'Animação') && isDubbed(audio)
        ? { matched: true, extraInfo: `Animação Dublada (${plat || 'Plataforma N/I'})`, sortScore: yearSeen || relYear || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'curta_youtube_5':
      return movieHasGenre(m, 'Curta') && isYouTube(plat)
        ? { matched: true, extraInfo: 'Curta no YouTube', sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'brasil_cinema_5':
      return movieHasCountryAll(m, 'br') && isCinema(plat)
        ? { matched: true, extraInfo: 'Filme Brasileiro no Cinema', sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'cinema_ur_gt_8000_10':
      return isCinema(plat) && ur !== null && urMillis! > 8000
        ? { matched: true, extraInfo: `Cinema | Minha Nota: ${fmtUr(ur)} (> 8.000)`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'cinema_ferias_julho_dez_10':
      return isCinema(plat) && (movieInMonth(m, 7) || movieInMonth(m, 12))
        ? { matched: true, extraInfo: `Cinema nas Férias (${movieInMonth(m, 7) ? 'Julho' : 'Dezembro'})`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'biografia_non_us_non_br_5':
      return movieHasGenre(m, 'Biografia') && !movieHasCountryAll(m, 'us') && !movieHasCountryAll(m, 'br')
        ? { matched: true, extraInfo: `Biografia (${m.primaryCountryName || m.rawPrimaryCountryCode || 'Internacional'})`, sortScore: yearSeen || relYear || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'japao_sem_animes_games_terror_5':
      return movieHasCountryAll(m, 'jp') &&
        !movieHasTag(m, 'Baseado em Anime') &&
        !movieHasTag(m, 'Baseado em jogo') &&
        !movieHasGenre(m, 'Terror') &&
        !movieHasGenre(m, 'Animação')
        ? { matched: true, extraInfo: 'Japão (Sem Anime/Terror/Game)', sortScore: yearSeen || relYear || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'pirata_tag_lgbt_15':
      return movieHasTag(m, 'Personagem LGBT') && (isMyFamilyCine(plat) || isYouTube(plat) || isInternet(plat))
        ? { matched: true, extraInfo: `Tag Personagem LGBT (${plat})`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'pirata_tag_crime_real_15':
      return movieHasTag(m, 'Crime real') && (isMyFamilyCine(plat) || isYouTube(plat) || isInternet(plat))
        ? { matched: true, extraInfo: `Tag Crime real (${plat})`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'midia_fisica_ur_gt_8000_15':
      return isPhysicalMedia(plat) && ur !== null && urMillis! > 8000
        ? { matched: true, extraInfo: `Mídia Física (${plat}) | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'pre_1960_pb_mudo_3':
      return relYear !== null && relYear < 1960 && (movieHasTag(m, 'Preto e branco') || movieHasTag(m, 'Mudo'))
        ? { matched: true, extraInfo: `Ano ${relYear} | Preto e branco / Mudo`, sortScore: -relYear }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'terror_anos_80_10':
      return movieHasGenre(m, 'Terror') && relYear !== null && relYear >= 1980 && relYear <= 1989
        ? { matched: true, extraInfo: `Terror de ${relYear}`, sortScore: relYear }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'pirata_romance_30':
      return movieHasGenre(m, 'Romance') && (isMyFamilyCine(plat) || isYouTube(plat) || isInternet(plat))
        ? { matched: true, extraInfo: `Romance (${plat})`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'terror_sem_gore_30':
      return movieHasGenre(m, 'Terror') && !movieHasTag(m, 'Gore')
        ? { matched: true, extraInfo: 'Terror sem Gore', sortScore: yearSeen || relYear || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'netflix_gore_30':
      return movieHasTag(m, 'Gore') && isNetflix(plat)
        ? { matched: true, extraInfo: 'Tag Gore na Netflix', sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'minecraft_stack_64': {
      const hasMcTag =
        movieHasTag(m, 'Baseado em jogo') ||
        movieHasTag(m, 'Zumbi') ||
        movieHasTag(m, 'Bruxo') ||
        movieHasTag(m, 'Animais antropomorficos');
      const hasMcGenre = movieHasGenre(m, 'Aventura') || movieHasGenre(m, 'Fantasia');
      return hasMcTag && hasMcGenre
        ? { matched: true, extraInfo: 'Minecraft: Tag + Aventura/Fantasia', sortScore: yearSeen || relYear || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };
    }

    case 'marvel_dc_cinema_20':
      return (movieHasTag(m, 'Marvel') || movieHasTag(m, 'DC')) && isCinema(plat)
        ? { matched: true, extraInfo: 'Marvel/DC no Cinema', sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'pirata_hidden_gem_10':
      return (isInternet(plat) || isYouTube(plat) || isMyFamilyCine(plat)) &&
        gr !== null &&
        gr > 0 &&
        gr < 50_000 &&
        ur !== null &&
        urMillis! > 8000
        ? { matched: true, extraInfo: `${plat} | Reviews: ${fmtGr(gr)} | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'oscar_winner_streaming_oficial_20':
      return m.oscarWins >= 1 && isOfficialStreaming(plat)
        ? { matched: true, extraInfo: `${m.oscarWins} Oscar(s) | Plataforma: ${plat}`, sortScore: m.oscarWins || 1 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'gt_180_min_ur_gt_9000_5':
      return runtime > 180 && ur !== null && urMillis! > 9000
        ? { matched: true, extraInfo: `Duração: ${runtime} min | Minha Nota: ${fmtUr(ur)}`, sortScore: urMillis! }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'sony_midia_fisica_10':
      return movieHasAnyPattern(m.companies, ['sony', 'columbia', 'tri-star', 'tristar', 'sony pictures']) &&
        isPhysicalMedia(plat)
        ? { matched: true, extraInfo: `Sony Pictures em Mídia Física (${plat})`, sortScore: yearSeen || 0 }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'pre_1980_ur_gt_8000_imdb_gte_80_15':
      return relYear !== null &&
        relYear < 1980 &&
        ur !== null &&
        urMillis! > 8000 &&
        imdb !== null &&
        imdbMillis! >= 8000
        ? {
            matched: true,
            extraInfo: `Ano ${relYear} | Minha Nota: ${fmtUr(ur)} | IMDb: ${fmtImdb(imdb)}`,
            sortScore: urMillis! + imdbMillis!,
          }
        : { matched: false, extraInfo: '', sortScore: 0 };

    case 'celso_russomanno_streaming_ur_lt_6000_30':
      return isOfficialStreaming(plat) && ur !== null && urMillis! < 6000 && urMillis! > 0
        ? {
            matched: true,
            extraInfo: `Streaming Oficial (${plat}) | Minha Nota: ${fmtUr(ur)} (< 6.000)`,
            sortScore: -urMillis!,
          }
        : { matched: false, extraInfo: '', sortScore: 0 };

    default:
      return { matched: false, extraInfo: '', sortScore: 0 };
  }
}

/**
 * Selects up to `targetCount` rare jewels (<50k reviews, UR>=8.500), assigning ONE distinct cleaned tag per movie,
 * while prioritizing unique country diversity so >= minCountries distinct primary countries are covered.
 */
function pickCuratorRareJewels(
  candidates: IndexedMovie[],
  targetCount: number,
  minCountries: number
): {
  selected: Array<{ movie: IndexedMovie; assignedTag: { raw: string; clean: string } }>;
  uniqueCountriesCount: number;
} {
  // Prefer candidates with fewer total tags first (more constrained) then higher rating
  const ordered = [...candidates].sort((a, b) => {
    if (a.tagEntries.length !== b.tagEntries.length) {
      return a.tagEntries.length - b.tagEntries.length;
    }
    return (b.urMillis || 0) - (a.urMillis || 0);
  });

  const usedMovieIds = new Set<string | number>();
  const usedTags = new Set<string>();
  const usedCountries = new Set<string>();
  const selected: Array<{ movie: IndexedMovie; assignedTag: { raw: string; clean: string } }> = [];

  // Pass 1: maximize unique primary countries (UN 195) with an available unused tag
  for (const m of ordered) {
    if (selected.length >= targetCount) break;
    const cCode = m.primaryCountryCode195;
    if (!cCode || usedCountries.has(cCode)) continue;
    const availableTag = m.tagEntries.find((t) => !usedTags.has(t.clean));
    if (!availableTag) continue;
    usedCountries.add(cCode);
    usedTags.add(availableTag.clean);
    usedMovieIds.add(m.movieId);
    selected.push({ movie: m, assignedTag: availableTag });
  }

  // Pass 2: fill remaining slots up to targetCount preferring highest rating with an unused tag
  const byRatingDesc = [...candidates].sort((a, b) => (b.urMillis || 0) - (a.urMillis || 0));
  for (const m of byRatingDesc) {
    if (selected.length >= targetCount) break;
    if (usedMovieIds.has(m.movieId)) continue;
    const availableTag = m.tagEntries.find((t) => !usedTags.has(t.clean));
    if (!availableTag) continue;
    usedTags.add(availableTag.clean);
    usedMovieIds.add(m.movieId);
    if (m.primaryCountryCode195) usedCountries.add(m.primaryCountryCode195);
    selected.push({ movie: m, assignedTag: availableTag });
  }

  return {
    selected,
    uniqueCountriesCount: usedCountries.size >= minCountries ? usedCountries.size : usedCountries.size,
  };
}

/**
 * Evaluates the underlying rule metrics for a single non-platinum TrophyDefinition.
 */
function computeRuleEvaluation(
  def: TrophyDefinition,
  index: CatalogIndex,
  includeChecklist: boolean
): RawRuleResult {
  const meta = def.target_metadata || {};
  let progressTarget = def.target_value || 1;
  let progressCurrent = 0;
  let rawCount = 0;
  let isMet = false;
  const checklist: TrophyChecklistItem[] = [];

  const finalizeMovieSlots = (
    matches: IndexedMovie[],
    extraInfoFn: (m: IndexedMovie) => string,
    pendingPlaceholder: string,
    fixedFlag?: string | null
  ): RawRuleResult => {
    rawCount = matches.length;
    if (includeChecklist) {
      const res = buildMovieSlotsChecklist(matches, progressTarget, extraInfoFn, pendingPlaceholder, fixedFlag);
      return {
        rawCount,
        progressCurrent: res.progressCurrent,
        progressTarget,
        isMet: rawCount >= progressTarget,
        checklist: res.checklist,
      };
    }
    const capped = Math.min(rawCount, progressTarget);
    return {
      rawCount,
      progressCurrent: capped,
      progressTarget,
      isMet: rawCount >= progressTarget,
      checklist: [],
    };
  };

  switch (def.target_type) {
    // =====================================================
    // 🌍 VOLTA AO MUNDO
    // =====================================================
    case 'conquered_countries_count': {
      const excludeCode = meta.excludeCode ? String(meta.excludeCode).toLowerCase() : null;
      const valid = excludeCode
        ? index.conqueredCountries.filter((c) => c.code !== excludeCode)
        : index.conqueredCountries;
      rawCount = valid.length;
      progressCurrent = Math.min(rawCount, progressTarget);
      isMet = rawCount >= progressTarget;

      if (includeChecklist) {
        for (const entry of valid.slice(0, 40)) {
          checklist.push({
            code: entry.code,
            name: entry.name,
            flag: entry.code,
            required: 1,
            current: 1,
            conquered: true,
            movie_title: entry.champion?.title || null,
            movie_year: entry.champion?.release_year || null,
            poster_url: entry.champion?.poster_url || null,
          });
        }
        if (rawCount < progressTarget) {
          checklist.unshift({
            name: `Progresso Geral: ${rawCount} de ${progressTarget} países conquistados`,
            required: progressTarget,
            current: rawCount,
            conquered: false,
          });
        }
      }
      return { rawCount, progressCurrent, progressTarget, isMet, checklist };
    }

    case 'country_movie_count': {
      const countryCode = String(meta.countryCode || '').toLowerCase();
      const countryName = String(meta.countryName || countryCode.toUpperCase());
      const matches = meta.strictPrimary
        ? index.moviesByCountryPrimary.get(countryCode) || []
        : index.moviesByCountryAll.get(countryCode) || [];
      return finalizeMovieSlots(
        matches,
        (m) => `País: ${countryName}${m.releaseYear ? ` (${m.releaseYear})` : ''}`,
        `Filme de ${countryName}`,
        countryCode
      );
    }

    case 'continent_movie_count': {
      const continent = String(meta.continent || 'Europa');
      const matches = meta.strictPrimary
        ? index.movies.filter(
            (m) =>
              m.primaryCountryCode195 &&
              cleanStr(index.unCountryDefMap.get(m.primaryCountryCode195)?.continent) === cleanStr(continent)
          )
        : index.moviesByContinent.get(cleanStr(continent)) || [];
      return finalizeMovieSlots(
        matches,
        (m) => `${m.primaryCountryName || continent}${m.releaseYear ? ` (${m.releaseYear})` : ''}`,
        `Filme de ${continent}`
      );
    }

    case 'country_list': {
      let codes: string[] = Array.isArray(meta.countryCodes) ? meta.countryCodes.map((c: string) => c.toLowerCase()) : [];
      if (codes.length === 0 && meta.continent) {
        const contClean = cleanStr(meta.continent);
        codes = Array.from(index.unCountryDefMap.values())
          .filter((c) => cleanStr(c.continent) === contClean)
          .map((c) => c.code);
      }
      progressTarget = codes.length || progressTarget;
      let conqueredCount = 0;

      for (const code of codes) {
        const entry = index.unCountriesMap.get(code);
        const cDef = index.unCountryDefMap.get(code);
        const isConq = entry?.status === 'conquered';
        if (isConq) conqueredCount++;

        if (includeChecklist) {
          checklist.push({
            code,
            name: entry?.name || cDef?.name || code.toUpperCase(),
            flag: code,
            required: 1,
            current: isConq ? 1 : 0,
            conquered: isConq,
            movie_title: entry?.champion?.title || null,
            movie_year: entry?.champion?.release_year || null,
            poster_url: entry?.champion?.poster_url || null,
            extra_info: isConq ? 'Conquistado (país único)' : 'Pendente no Desafio 195',
          });
        }
      }
      return {
        rawCount: conqueredCount,
        progressCurrent: conqueredCount,
        progressTarget,
        isMet: conqueredCount >= progressTarget,
        checklist,
      };
    }

    case 'world_countries_checklist': {
      const items: Array<{ code: string; name?: string }> = Array.isArray(meta.countries) ? meta.countries : [];
      progressTarget = items.length || progressTarget;
      let conqueredCount = 0;

      for (const item of items) {
        const code = String(item.code || '').toLowerCase();
        const entry = index.unCountriesMap.get(code);
        const isConq = entry?.status === 'conquered';
        if (isConq) conqueredCount++;
        if (includeChecklist) {
          checklist.push({
            code,
            name: item.name || entry?.name || code.toUpperCase(),
            flag: code,
            required: 1,
            current: isConq ? 1 : 0,
            conquered: isConq,
            movie_title: entry?.champion?.title || null,
            movie_year: entry?.champion?.release_year || null,
            poster_url: entry?.champion?.poster_url || null,
            extra_info: isConq ? 'Conquistado (país único)' : 'Pendente no Desafio 195',
          });
        }
      }
      return {
        rawCount: conqueredCount,
        progressCurrent: conqueredCount,
        progressTarget,
        isMet: conqueredCount >= progressTarget,
        checklist,
      };
    }

    case 'country_movie_counts': {
      const reqs: Array<{ code: string; name: string; min: number }> = Array.isArray(meta.requirements)
        ? meta.requirements
        : [];
      let totalProgress = 0;
      let totalReq = 0;
      let allMet = true;

      for (const r of reqs) {
        const code = String(r.code || '').toLowerCase();
        const min = Number(r.min) || 1;
        totalReq += min;
        const matchedMovies = index.moviesByCountryAll.get(code) || [];
        const cur = Math.min(matchedMovies.length, min);
        totalProgress += cur;
        if (matchedMovies.length < min) allMet = false;

        if (includeChecklist) {
          checklist.push({
            code,
            name: `${r.name} (${matchedMovies.length}/${min})`,
            flag: code,
            required: min,
            current: cur,
            conquered: matchedMovies.length >= min,
            movie_title: matchedMovies[0]?.title || null,
            movie_year: matchedMovies[0]?.releaseYear || null,
            poster_url: matchedMovies[0]?.posterUrl || null,
            extra_info: matchedMovies.length >= min ? 'Meta alcançada' : `Faltam ${min - matchedMovies.length} filme(s)`,
          });
        }
      }
      progressTarget = totalReq || progressTarget;
      return {
        rawCount: totalProgress,
        progressCurrent: totalProgress,
        progressTarget,
        isMet: allMet && totalProgress >= progressTarget,
        checklist,
      };
    }

    case 'historical_territories_list': {
      const codes: string[] = Array.isArray(meta.territoryCodes) ? meta.territoryCodes : [];
      const minCount = Number(meta.minCount) || def.target_value || 4;
      progressTarget = minCount;
      let conqueredCount = 0;

      for (const code of codes) {
        const hEntry = index.historicalCountriesMap.get(String(code).toLowerCase());
        const isConq = hEntry?.status === 'conquered';
        if (isConq) conqueredCount++;

        if (includeChecklist) {
          checklist.push({
            code,
            name: hEntry?.name || code.toUpperCase(),
            flag: hEntry?.flagCode || null,
            required: 1,
            current: isConq ? 1 : 0,
            conquered: isConq,
            movie_title: hEntry?.champion?.title || null,
            movie_year: hEntry?.champion?.release_year || null,
            poster_url: hEntry?.champion?.poster_url || null,
            extra_info: isConq ? `Conquistado (${hEntry?.era || 'Relíquia'})` : 'Pendente no mapa de Relíquias',
          });
        }
      }
      return {
        rawCount: conqueredCount,
        progressCurrent: Math.min(conqueredCount, progressTarget),
        progressTarget,
        isMet: conqueredCount >= progressTarget,
        checklist,
      };
    }

    case 'allies_vs_axis_checklist': {
      const slots: Array<{ id: string; name: string; flag?: string; codes: string[] }> = Array.isArray(meta.slots)
        ? meta.slots
        : [];
      progressTarget = slots.length || def.target_value || 7;
      let conqueredCount = 0;

      for (const slot of slots) {
        let matchedEntry: any = null;
        for (const rawCode of slot.codes || []) {
          const entry = index.allCountriesAndHistoricalMap.get(String(rawCode).toLowerCase());
          if (entry?.status === 'conquered') {
            matchedEntry = entry;
            break;
          }
        }
        const isConq = Boolean(matchedEntry);
        if (isConq) conqueredCount++;

        if (includeChecklist) {
          checklist.push({
            id: slot.id,
            code: matchedEntry?.code || slot.flag || slot.id,
            name: slot.name,
            flag: matchedEntry?.flagCode || matchedEntry?.code || slot.flag || null,
            required: 1,
            current: isConq ? 1 : 0,
            conquered: isConq,
            movie_title: matchedEntry?.champion?.title || null,
            movie_year: matchedEntry?.champion?.release_year || null,
            poster_url: matchedEntry?.champion?.poster_url || null,
            extra_info: isConq ? `Conquistado via ${matchedEntry.name}` : 'Pendente no Desafio 195 / Relíquias',
          });
        }
      }

      return {
        rawCount: conqueredCount,
        progressCurrent: conqueredCount,
        progressTarget,
        isMet: conqueredCount >= progressTarget,
        checklist,
      };
    }

    // =====================================================
    // 🧬 O DNA CINÉFILO & CRUZAMENTOS TAG/PAÍS
    // =====================================================
    case 'tag_movie_count': {
      const targetTag = String((Array.isArray(meta.tags) && meta.tags[0]) || meta.tag || '');
      const matches = index.moviesByTag.get(cleanTag(targetTag)) || [];
      return finalizeMovieSlots(matches, () => `Tag: ${targetTag}`, `Filme com tag ${targetTag}`);
    }

    case 'movie_zero_tags_count': {
      const matches = index.movies.filter((m) => m.tagEntries.length === 0);
      return finalizeMovieSlots(matches, () => '0 tags cadastradas', 'Filme sem nenhuma tag');
    }

    case 'movies_min_tags_count': {
      const minTags = Number(meta.minTags) || 7;
      const matches = index.movies.filter((m) => m.tagEntries.length >= minTags);
      return finalizeMovieSlots(
        matches,
        (m) => `${m.tagEntries.length} tags cadastradas`,
        `Filme com ${minTags}+ tags`
      );
    }

    case 'tag_double_and': {
      const tags: string[] = Array.isArray(meta.tags) ? meta.tags : [];
      const matches = index.movies.filter((m) => tags.length > 0 && tags.every((t) => movieHasTag(m, t)));
      return finalizeMovieSlots(matches, () => tags.join(' + '), `Filme com ${tags.join(' + ')}`);
    }

    case 'tag_pool_sum': {
      const tags: string[] = Array.isArray(meta.tags) ? meta.tags : [];
      const matches = index.movies.filter((m) => tags.some((t) => movieHasTag(m, t)));
      return finalizeMovieSlots(matches, () => tags.join(' / '), `Filme com ${tags.join(' ou ')}`);
    }

    case 'tag_multi_or_and': {
      const mainTag = String(meta.mainTag || '');
      const anyOfTags: string[] = Array.isArray(meta.anyOfTags) ? meta.anyOfTags : [];
      const candidates = index.moviesByTag.get(cleanTag(mainTag)) || [];
      const matches = candidates.filter((m) => anyOfTags.some((t) => movieHasTag(m, t)));
      return finalizeMovieSlots(
        matches,
        () => `${mainTag} + (${anyOfTags.join('/')})`,
        `${mainTag} + ${anyOfTags.join('/')}`
      );
    }

    case 'tag_checklist_quota': {
      const quotas: Array<{ tag: string; count: number }> = Array.isArray(meta.quotas) ? meta.quotas : [];
      const counts = quotas.map((q) => (index.moviesByTag.get(cleanTag(q.tag)) || []).length);

      let sumCapped = 0;
      let totalReq = 0;
      let allMet = true;
      quotas.forEach((q, idx) => {
        const req = Number(q.count) || 1;
        totalReq += req;
        const c = counts[idx];
        sumCapped += Math.min(c, req);
        if (c < req) allMet = false;
        if (includeChecklist) {
          checklist.push({
            id: `tag_quota_${idx}`,
            name: `Tag "${q.tag}"`,
            required: req,
            current: Math.min(c, req),
            conquered: c >= req,
            extra_info: `${c} de ${req} filmes`,
          });
        }
      });

      progressTarget = def.target_value || totalReq;
      return {
        rawCount: sumCapped,
        progressCurrent: sumCapped,
        progressTarget,
        isMet: allMet && sumCapped >= progressTarget,
        checklist,
        quotaRawCounts: counts,
      };
    }

    case 'tag_hybrid_country': {
      const tags: string[] = Array.isArray(meta.tags) ? meta.tags : meta.tag ? [meta.tag] : [];
      const countryCode = String(meta.countryCode || '').toLowerCase();
      const countryName = String(meta.countryName || countryCode.toUpperCase());
      const matches = (index.moviesByCountryAll.get(countryCode) || []).filter((m) =>
        tags.every((t) => movieHasTag(m, t))
      );
      return finalizeMovieSlots(
        matches,
        () => `${countryName} + ${tags.join(' + ')}`,
        `${countryName} com ${tags.join(' + ')}`,
        countryCode
      );
    }

    case 'tag_hybrid_continent': {
      const tags: string[] = Array.isArray(meta.tags) ? meta.tags : meta.tag ? [meta.tag] : [];
      const continent = String(meta.continent || '');
      const matches = (index.moviesByContinent.get(cleanStr(continent)) || []).filter((m) =>
        tags.every((t) => movieHasTag(m, t))
      );
      return finalizeMovieSlots(
        matches,
        () => `${continent} + ${tags.join(' + ')}`,
        `${continent} com ${tags.join(' + ')}`
      );
    }

    case 'tag_hybrid_exclude_country': {
      const tags: string[] = Array.isArray(meta.tags) ? meta.tags : meta.tag ? [meta.tag] : [];
      const excludeCode = String(meta.excludeCountryCode || 'us').toLowerCase();
      const matches = index.movies.filter(
        (m) => !movieHasCountryAll(m, excludeCode) && tags.every((t) => movieHasTag(m, t))
      );
      return finalizeMovieSlots(
        matches,
        (m) => `${m.primaryCountryName || 'Fora dos EUA'} + ${tags.join(' + ')}`,
        `Fora de ${excludeCode.toUpperCase()} com ${tags.join(' + ')}`
      );
    }

    case 'tag_hybrid_asian_horror': {
      const countryCodes: string[] = Array.isArray(meta.countryCodes) ? meta.countryCodes : ['jp', 'kr', 'th', 'id'];
      const horrorTags: string[] = Array.isArray(meta.horrorTags)
        ? meta.horrorTags
        : ['Fantasma', 'Demônio', 'Gore', 'Zumbi'];
      const matches = index.movies.filter(
        (m) =>
          countryCodes.some((cc) => movieHasCountryAll(m, cc)) &&
          horrorTags.some((t) => movieHasTag(m, t))
      );
      return finalizeMovieSlots(
        matches,
        (m) => `${m.primaryCountryName || 'Ásia'} + Terror Sobrenatural`,
        'Terror Asiático (JP/KR/TH/ID)'
      );
    }

    case 'tag_non_br_us_count': {
      const tag = String(meta.tag || 'Em Família');
      const candidates = index.moviesByTag.get(cleanTag(tag)) || [];
      const matches = candidates.filter((m) => !movieHasCountryAll(m, 'us') && !movieHasCountryAll(m, 'br'));
      return finalizeMovieSlots(
        matches,
        (m) => `${m.primaryCountryName || 'Internacional'} + Tag ${tag}`,
        `Filme fora BR/EUA com tag ${tag}`
      );
    }

    case 'tag_platform_count': {
      const tag = String(meta.tag || '');
      const platform = String(meta.platform || '');
      const matches = (index.moviesByTag.get(cleanTag(tag)) || []).filter(
        (m) => cleanStr(m.canonicalPlatform) === cleanStr(platform) || (isCinema(platform) && isCinema(m.canonicalPlatform))
      );
      return finalizeMovieSlots(matches, () => `${tag} em ${platform}`, `${tag} assistido em ${platform}`);
    }

    case 'tag_min_rating_count': {
      const tag = String(meta.tag || '');
      const minMillis = Number(meta.minRating) || 8000;
      const matches = (index.moviesByTag.get(cleanTag(tag)) || []).filter(
        (m) => m.urMillis !== null && m.urMillis >= minMillis
      );
      return finalizeMovieSlots(
        matches,
        (m) => `Nota: ${fmtUr(m.ur!)} | Tag: ${tag}`,
        `${tag} com nota >= ${(minMillis / 1000).toFixed(3)}`
      );
    }

    case 'tag_max_rating_count': {
      const tag = String(meta.tag || '');
      const maxMillis = Number(meta.maxRating) || 6000;
      const matches = (index.moviesByTag.get(cleanTag(tag)) || []).filter(
        (m) => m.urMillis !== null && m.urMillis < maxMillis
      );
      return finalizeMovieSlots(
        matches,
        (m) => `Nota: ${fmtUr(m.ur!)} | Tag: ${tag}`,
        `${tag} com nota < ${(maxMillis / 1000).toFixed(3)}`
      );
    }

    // =====================================================
    // 🎭 ANATOMIA DO CINEMA (Gêneros & Cruzamentos)
    // =====================================================
    case 'genre_count': {
      const genre = String(meta.genre || '');
      const matches = index.moviesByGenre.get(cleanTag(genre)) || [];
      return finalizeMovieSlots(matches, () => `Gênero: ${genre}`, `Filme do gênero ${genre}`);
    }

    case 'genre_all_and': {
      const genres: string[] = Array.isArray(meta.genres) ? meta.genres : [];
      const matches = index.movies.filter((m) => genres.length > 0 && genres.every((g) => movieHasGenre(m, g)));
      return finalizeMovieSlots(matches, () => genres.join(' + '), genres.join(' + '));
    }

    case 'genre_and_or': {
      const mainGenre = String(meta.mainGenre || '');
      const anyOfGenres: string[] = Array.isArray(meta.anyOfGenres) ? meta.anyOfGenres : [];
      const candidates = index.moviesByGenre.get(cleanTag(mainGenre)) || [];
      const matches = candidates.filter((m) => anyOfGenres.some((g) => movieHasGenre(m, g)));
      return finalizeMovieSlots(
        matches,
        () => `${mainGenre} + (${anyOfGenres.join('/')})`,
        `${mainGenre} + ${anyOfGenres.join('/')}`
      );
    }

    case 'genre_quotas': {
      const quotas: Array<{ genre: string; count: number }> = Array.isArray(meta.quotas) ? meta.quotas : [];
      const counts = quotas.map((q) => (index.moviesByGenre.get(cleanTag(q.genre)) || []).length);

      let sumCapped = 0;
      let totalReq = 0;
      let allMet = true;
      quotas.forEach((q, idx) => {
        const req = Number(q.count) || 1;
        totalReq += req;
        const c = counts[idx];
        sumCapped += Math.min(c, req);
        if (c < req) allMet = false;
        if (includeChecklist) {
          checklist.push({
            id: `genre_quota_${idx}`,
            name: `Gênero ${q.genre}`,
            required: req,
            current: Math.min(c, req),
            conquered: c >= req,
            extra_info: `${c} de ${req} filmes`,
          });
        }
      });

      progressTarget = def.target_value || totalReq;
      return {
        rawCount: sumCapped,
        progressCurrent: sumCapped,
        progressTarget,
        isMet: allMet && sumCapped >= progressTarget,
        checklist,
        quotaRawCounts: counts,
      };
    }

    case 'genre_distinct_threshold': {
      const minPerGenre = Number(meta.minPerGenre) || 25;
      const reqDistinct = Number(meta.requiredDistinctGenres) || progressTarget || 15;
      progressTarget = reqDistinct;
      let qualifiedGenres = 0;

      for (const genre of ALL_21_GENRES) {
        const c = (index.moviesByGenre.get(cleanTag(genre)) || []).length;
        const met = c >= minPerGenre;
        if (met) qualifiedGenres++;
        if (includeChecklist) {
          checklist.push({
            id: `dist_genre_${cleanTag(genre)}`,
            name: genre,
            required: minPerGenre,
            current: Math.min(c, minPerGenre),
            conquered: met,
            extra_info: `${c}/${minPerGenre} filmes`,
          });
        }
      }
      return {
        rawCount: qualifiedGenres,
        progressCurrent: Math.min(qualifiedGenres, progressTarget),
        progressTarget,
        isMet: qualifiedGenres >= progressTarget,
        checklist,
      };
    }

    case 'movie_min_genre_count': {
      const minG = Number(meta.minGenresPerMovie) || 4;
      const matches = index.movies.filter((m) => m.all21GenresCount >= minG);
      return finalizeMovieSlots(
        matches,
        (m) => `${m.all21GenresCount} gêneros (${m.genresRaw.slice(0, 4).join(', ')})`,
        `Filme com ${minG}+ gêneros`
      );
    }

    case 'country_genre': {
      const countryCode = String(meta.countryCode || '').toLowerCase();
      const countryName = String(meta.countryName || countryCode.toUpperCase());
      const genre = String(meta.genre || '');
      const matches = (index.moviesByCountryAll.get(countryCode) || []).filter((m) => movieHasGenre(m, genre));
      return finalizeMovieSlots(
        matches,
        () => `${countryName} • ${genre}`,
        `${countryName} no gênero ${genre}`,
        countryCode
      );
    }

    case 'genre_tag_and': {
      const genre = String(meta.genre || '');
      const tag = String(meta.tag || '');
      const matches = (index.moviesByGenre.get(cleanTag(genre)) || []).filter((m) => movieHasTag(m, tag));
      return finalizeMovieSlots(matches, () => `${genre} + Tag ${tag}`, `${genre} com tag ${tag}`);
    }

    case 'genre_and_tag_and_any_tag': {
      const genre = String(meta.genre || '');
      const requiredTag = String(meta.requiredTag || '');
      const orTags: string[] = Array.isArray(meta.orTags) ? meta.orTags : [];
      const matches = (index.moviesByGenre.get(cleanTag(genre)) || []).filter(
        (m) => movieHasTag(m, requiredTag) && orTags.some((t) => movieHasTag(m, t))
      );
      return finalizeMovieSlots(
        matches,
        () => `${genre} + ${requiredTag} + (${orTags.join('/')})`,
        `${genre} + ${requiredTag}`
      );
    }

    case 'genre_and_tags_or_max_rating': {
      const genre = String(meta.genre || '');
      const orTags: string[] = Array.isArray(meta.orTags) ? meta.orTags : [];
      const maxMillis = Number(meta.maxRating) || 5000;
      const matches = (index.moviesByGenre.get(cleanTag(genre)) || []).filter(
        (m) => m.urMillis !== null && m.urMillis < maxMillis && orTags.some((t) => movieHasTag(m, t))
      );
      return finalizeMovieSlots(
        matches,
        (m) => `Nota: ${fmtUr(m.ur!)} | ${genre}`,
        `${genre} + ${orTags.join('/')} (< ${(maxMillis / 1000).toFixed(3)})`
      );
    }

    case 'genre_max_runtime_count': {
      const genre = String(meta.genre || '');
      const maxRuntime = Number(meta.maxRuntime) || 90;
      const matches = (index.moviesByGenre.get(cleanTag(genre)) || []).filter(
        (m) => m.runtime > 0 && m.runtime <= maxRuntime
      );
      return finalizeMovieSlots(
        matches,
        (m) => `${genre} • ${m.runtime} min`,
        `${genre} até ${maxRuntime} min`
      );
    }

    case 'terror_tragico_min_rating': {
      const genre = String(meta.genre || 'Terror');
      const tag = String(meta.tag || 'Trágico');
      const minMillis = Number(meta.minRating) || 8500;
      const matches = (index.moviesByGenre.get(cleanTag(genre)) || []).filter(
        (m) => movieHasTag(m, tag) && m.urMillis !== null && m.urMillis > minMillis
      );
      return finalizeMovieSlots(
        matches,
        (m) => `${genre} + ${tag} | Nota: ${fmtUr(m.ur!)}`,
        `${genre} + ${tag} (> ${(minMillis / 1000).toFixed(3)})`
      );
    }

    // =====================================================
    // 📅 A DATA LIMITE (Calendário & Meses)
    // =====================================================
    case 'month_movie_count': {
      const month = Number(meta.month) || 1;
      const matches = index.moviesByMonth.get(month) || [];
      return finalizeMovieSlots(
        matches,
        () => `Assistido em ${MONTH_NAMES[month] || month}`,
        `Filme visto em ${MONTH_NAMES[month] || month}`
      );
    }

    case 'genre_month': {
      const genre = String(meta.genre || '');
      const month = Number(meta.month) || 10;
      const matches = (index.moviesByMonth.get(month) || []).filter((m) => movieHasGenre(m, genre));
      return finalizeMovieSlots(
        matches,
        () => `${genre} em ${MONTH_NAMES[month] || month}`,
        `${genre} visto em ${MONTH_NAMES[month] || month}`
      );
    }

    case 'genre_or_month': {
      const genres: string[] = Array.isArray(meta.genres) ? meta.genres : [];
      const month = Number(meta.month) || 7;
      const matches = (index.moviesByMonth.get(month) || []).filter((m) =>
        genres.some((g) => movieHasGenre(m, g))
      );
      return finalizeMovieSlots(
        matches,
        () => `${genres.join('/')} em ${MONTH_NAMES[month] || month}`,
        `${genres.join('/')} em ${MONTH_NAMES[month] || month}`
      );
    }

    case 'tag_month': {
      const tag = String(meta.tag || '');
      const month = Number(meta.month) || 1;
      const matches = (index.moviesByMonth.get(month) || []).filter((m) => movieHasTag(m, tag));
      return finalizeMovieSlots(
        matches,
        () => `Tag ${tag} em ${MONTH_NAMES[month] || month}`,
        `Tag ${tag} em ${MONTH_NAMES[month] || month}`
      );
    }

    case 'tag_month_range':
    case 'tag_months': {
      const tag = String(meta.tag || '');
      const months: number[] = Array.isArray(meta.months) ? meta.months.map(Number) : [];
      const matches = (index.moviesByTag.get(cleanTag(tag)) || []).filter((m) => movieInMonth(m, months));
      return finalizeMovieSlots(
        matches,
        (m) => `Tag ${tag} (${MONTH_NAMES[m.monthSeen || 0] || 'Mês'})`,
        `Tag ${tag} nos meses alvo`
      );
    }

    case 'tag_or_month': {
      const tags: string[] = Array.isArray(meta.tags) ? meta.tags : [];
      const month = Number(meta.month) || 1;
      const matches = (index.moviesByMonth.get(month) || []).filter((m) => tags.some((t) => movieHasTag(m, t)));
      return finalizeMovieSlots(
        matches,
        () => `(${tags.join('/')}) em ${MONTH_NAMES[month] || month}`,
        `(${tags.join('/')}) em ${MONTH_NAMES[month] || month}`
      );
    }

    case 'tag_and_tag_or_month': {
      const tag = String(meta.tag || '');
      const orTag = String(meta.orTag || '');
      const orMonth = Number(meta.orMonth) || 12;
      const matches = (index.moviesByTag.get(cleanTag(tag)) || []).filter(
        (m) => movieHasTag(m, orTag) || movieInMonth(m, orMonth)
      );
      return finalizeMovieSlots(
        matches,
        () => `${tag} + (${orTag} ou ${MONTH_NAMES[orMonth] || orMonth})`,
        `${tag} natalino`
      );
    }

    case 'all_12_months_coverage': {
      const minPerMonth = Number(meta.minPerMonth) || 1;
      const monthCounts: number[] = [];
      let covered = 0;
      for (let month = 1; month <= 12; month++) {
        const list = index.moviesByMonth.get(month) || [];
        monthCounts.push(list.length);
        if (list.length >= minPerMonth) covered++;
        if (includeChecklist) {
          checklist.push({
            id: `month_${month}`,
            name: MONTH_NAMES[month],
            required: minPerMonth,
            current: Math.min(list.length, minPerMonth),
            conquered: list.length >= minPerMonth,
            movie_title: list[0]?.title || null,
            movie_year: list[0]?.releaseYear || null,
            poster_url: list[0]?.posterUrl || null,
            extra_info: `${list.length} filme(s) neste mês`,
          });
        }
      }
      return {
        rawCount: monthCounts.length ? Math.min(...monthCounts) : 0,
        progressCurrent: covered,
        progressTarget: 12,
        isMet: covered >= 12,
        checklist,
        monthCounts,
      };
    }

    case 'tag_decades_checklist': {
      const tag = String(meta.tag || 'Bruxo');
      const decades: number[] = Array.isArray(meta.decades)
        ? meta.decades
        : [1960, 1970, 1980, 1990, 2000, 2010, 2020, 2030];
      const candidates = index.moviesByTag.get(cleanTag(tag)) || [];
      progressTarget = decades.length;
      let covered = 0;

      for (const dec of decades) {
        const match = candidates.find(
          (m) => m.releaseYear !== null && m.releaseYear >= dec && m.releaseYear <= dec + 9
        );
        if (match) covered++;
        if (includeChecklist) {
          checklist.push({
            id: `dec_${dec}`,
            name: `Década de ${dec} (${dec}-${dec + 9})`,
            required: 1,
            current: match ? 1 : 0,
            conquered: Boolean(match),
            movie_title: match?.title || null,
            movie_year: match?.releaseYear || null,
            poster_url: match?.posterUrl || null,
            extra_info: match ? `${match.title} (${match.releaseYear})` : `Pendente: ${tag} nos anos ${dec}`,
          });
        }
      }
      return {
        rawCount: covered,
        progressCurrent: covered,
        progressTarget,
        isMet: covered >= progressTarget,
        checklist,
      };
    }

    // =====================================================
    // QUADS & TRIPLES TEMÁTICOS
    // =====================================================
    case 'quad_natal_classico': {
      const cCodes: string[] = Array.isArray(meta.countryCodes) ? meta.countryCodes : ['us', 'ca', 'gb'];
      const anyOfGenres: string[] = Array.isArray(meta.anyOfGenres) ? meta.anyOfGenres : ['Comédia', 'Família'];
      const tag = String(meta.tag || 'Natal');
      const month = Number(meta.month) || 12;
      const matches = (index.moviesByMonth.get(month) || []).filter(
        (m) =>
          cCodes.some((cc) => movieHasCountryAll(m, cc)) &&
          anyOfGenres.some((g) => movieHasGenre(m, g)) &&
          movieHasTag(m, tag)
      );
      return finalizeMovieSlots(matches, () => 'EUA/CA/UK + Comédia/Família + Natal (Dez)', 'Natal Clássico');
    }

    case 'quad_natal_macabro': {
      const anyOfGenres: string[] = Array.isArray(meta.anyOfGenres) ? meta.anyOfGenres : ['Terror', 'Suspense'];
      const tag = String(meta.tag || 'Natal');
      const month = Number(meta.month) || 12;
      const matches = (index.moviesByMonth.get(month) || []).filter(
        (m) => anyOfGenres.some((g) => movieHasGenre(m, g)) && movieHasTag(m, tag)
      );
      return finalizeMovieSlots(matches, () => 'Terror/Suspense + Tag Natal (Dezembro)', 'Natal Macabro');
    }

    case 'quad_outubro_macabro_mundo': {
      const excludeCode = String(meta.excludeCountryCode || 'us').toLowerCase();
      const anyOfGenres: string[] = Array.isArray(meta.anyOfGenres) ? meta.anyOfGenres : ['Terror', 'Suspense'];
      const anyOfTags: string[] = Array.isArray(meta.anyOfTags)
        ? meta.anyOfTags
        : ['Criança Malvada', 'Demônio', 'Fantasma', 'Gore', 'Vampiro', 'Zumbi'];
      const month = Number(meta.month) || 10;
      const matches = (index.moviesByMonth.get(month) || []).filter(
        (m) =>
          !movieHasCountryAll(m, excludeCode) &&
          anyOfGenres.some((g) => movieHasGenre(m, g)) &&
          anyOfTags.some((t) => movieHasTag(m, t))
      );
      return finalizeMovieSlots(
        matches,
        () => 'Fora dos EUA + Terror/Suspense + Tag Macabra (Outubro)',
        'Outubro Macabro Mundial'
      );
    }

    case 'quad_pride_sem_fronteiras': {
      // Atualizado: exclui EUA e Brasil!
      const excludeCodes: string[] = Array.isArray(meta.excludeCountryCodes) ? meta.excludeCountryCodes : ['us', 'br'];
      const matches = (index.moviesByMonth.get(6) || []).filter(
        (m) =>
          excludeCodes.every((cc) => !movieHasCountryAll(m, cc)) &&
          (movieHasGenre(m, 'Drama') || movieHasGenre(m, 'Romance')) &&
          movieHasTag(m, 'Personagem LGBT')
      );
      return finalizeMovieSlots(
        matches,
        (m) => `${m.primaryCountryName || 'Internacional'} • Drama/Romance • LGBT (Junho)`,
        'Orgulho Sem Fronteiras (Fora BR/EUA, Junho)'
      );
    }

    case 'triple_combo_brasil': {
      const anyGenres: string[] = Array.isArray(meta.anyOfGenres) ? meta.anyOfGenres : ['Crime', 'Policial'];
      const anyTags: string[] = Array.isArray(meta.anyOfTags) ? meta.anyOfTags : ['Crime real', 'Fatos Reais'];
      const matches = (index.moviesByCountryAll.get('br') || []).filter(
        (m) => anyGenres.some((g) => movieHasGenre(m, g)) && anyTags.some((t) => movieHasTag(m, t))
      );
      return finalizeMovieSlots(matches, () => 'Brasil + Crime/Policial + Crime real/Fatos Reais', 'Crime Nacional', 'br');
    }

    case 'triple_combo_europa': {
      const matches = (index.moviesByContinent.get('europa') || []).filter(
        (m) => movieHasGenre(m, 'Terror') && (movieHasTag(m, 'Demônio') || movieHasTag(m, 'Religião'))
      );
      return finalizeMovieSlots(matches, () => 'Europa + Terror + Demônio/Religião', 'Terror Profano Europeu');
    }

    // =====================================================
    // 🎬 A MÁFIA DE HOLLYWOOD (Oscar, Estúdios, Diretores)
    // =====================================================
    case 'hollywood_oscar_winner_count': {
      const minWins = Number(meta.minWins) || 1;
      const matches = index.movies.filter((m) => m.oscarWins >= minWins);
      return finalizeMovieSlots(matches, (m) => `${m.oscarWins} vitória(s) no Oscar`, `Vencedor de ${minWins}+ Oscar`);
    }

    case 'hollywood_oscar_exact_ratio': {
      const noms = Number(meta.nominations) || 3;
      const wins = Number(meta.wins) || 3;
      const matches = index.movies.filter((m) => m.oscarNoms === noms && m.oscarWins === wins);
      return finalizeMovieSlots(matches, () => `Oscar perfeito ${wins}/${noms}`, `Placar exato ${wins}/${noms} no Oscar`);
    }

    case 'hollywood_oscar_nominations_min': {
      const minNoms = Number(meta.minNominations) || 10;
      const matches = index.movies.filter((m) => m.oscarNoms >= minNoms);
      return finalizeMovieSlots(matches, (m) => `${m.oscarNoms} indicações ao Oscar`, `Filme com ${minNoms}+ indicações`);
    }

    case 'hollywood_oscar_wins_min': {
      const minWins = Number(meta.minWins) || 8;
      const matches = index.movies.filter((m) => m.oscarWins >= minWins);
      return finalizeMovieSlots(matches, (m) => `${m.oscarWins} estatuetas do Oscar`, `Filme com ${minWins}+ Oscars`);
    }

    case 'hollywood_oscar_nominated_unwon_count': {
      const matches = index.movies.filter((m) => m.oscarNoms >= 1 && m.oscarWins === 0);
      return finalizeMovieSlots(matches, (m) => `${m.oscarNoms} indicações e 0 vitórias`, 'Azarão do Oscar (indicado s/ vitória)');
    }

    case 'hollywood_oscar_5_noms_unwon_count': {
      const matches = index.movies.filter((m) => m.oscarNoms >= 5 && m.oscarWins === 0);
      return finalizeMovieSlots(matches, (m) => `${m.oscarNoms} indicações e 0 vitórias`, '5+ indicações ao Oscar sem vitória');
    }

    case 'hollywood_oscar_5_noms_5_wins_count': {
      const matches = index.movies.filter((m) => m.oscarNoms >= 5 && m.oscarWins >= 5);
      return finalizeMovieSlots(matches, (m) => `${m.oscarWins} vitórias / ${m.oscarNoms} indicações`, '5+ vitórias e 5+ indicações');
    }

    case 'hollywood_oscar_dual_quota': {
      const reqWin = Number(meta.requiredWinners) || 30;
      const reqNom = Number(meta.requiredNominees) || 60;
      const winnersCount = index.movies.filter((m) => m.oscarWins >= 1).length;
      const nomineesCount = index.movies.filter((m) => m.oscarNoms >= 1 || m.oscarWins >= 1).length;
      const cWin = Math.min(winnersCount, reqWin);
      const cNom = Math.min(nomineesCount, reqNom);
      progressTarget = reqWin + reqNom;
      progressCurrent = cWin + cNom;
      isMet = winnersCount >= reqWin && nomineesCount >= reqNom;
      if (includeChecklist) {
        checklist.push(
          {
            id: 'oscar_winners_quota',
            name: `Filmes Vencedores do Oscar (${winnersCount}/${reqWin})`,
            required: reqWin,
            current: cWin,
            conquered: winnersCount >= reqWin,
            extra_info: `${winnersCount} de ${reqWin}`,
          },
          {
            id: 'oscar_nominees_quota',
            name: `Filmes Indicados ao Oscar (${nomineesCount}/${reqNom})`,
            required: reqNom,
            current: cNom,
            conquered: nomineesCount >= reqNom,
            extra_info: `${nomineesCount} de ${reqNom}`,
          }
        );
      }
      return { rawCount: progressCurrent, progressCurrent, progressTarget, isMet, checklist };
    }

    case 'hollywood_oscar_or_quota': {
      const targetWins = Number(meta.targetWins) || 50;
      const targetNoms = Number(meta.targetNominations) || 120;
      const winnersCount = index.movies.filter((m) => m.oscarWins >= 1).length;
      const nomineesCount = index.movies.filter((m) => m.oscarNoms >= 1 || m.oscarWins >= 1).length;
      const ratioWins = Math.min(1, winnersCount / targetWins);
      const ratioNoms = Math.min(1, nomineesCount / targetNoms);
      progressTarget = 100;
      progressCurrent = Math.round(Math.max(ratioWins, ratioNoms) * 100);
      isMet = winnersCount >= targetWins || nomineesCount >= targetNoms;
      if (includeChecklist) {
        checklist.push(
          {
            id: 'oscar_or_winners',
            name: `Caminho 1: ${targetWins} Filmes Vencedores do Oscar (${winnersCount}/${targetWins})`,
            required: targetWins,
            current: Math.min(winnersCount, targetWins),
            conquered: winnersCount >= targetWins,
            extra_info: winnersCount >= targetWins ? 'Meta alcançada!' : `Faltam ${targetWins - winnersCount}`,
          },
          {
            id: 'oscar_or_nominees',
            name: `Caminho 2: ${targetNoms} Filmes Indicados ao Oscar (${nomineesCount}/${targetNoms})`,
            required: targetNoms,
            current: Math.min(nomineesCount, targetNoms),
            conquered: nomineesCount >= targetNoms,
            extra_info: nomineesCount >= targetNoms ? 'Meta alcançada!' : `Faltam ${targetNoms - nomineesCount}`,
          }
        );
      }
      return { rawCount: progressCurrent, progressCurrent, progressTarget, isMet, checklist };
    }

    case 'hollywood_distributor_studio_count': {
      const patterns: string[] = Array.isArray(meta.patterns) ? meta.patterns : [];
      const company = String(meta.company || patterns[0] || 'Estúdio');
      const matches = index.movies.filter((m) => movieHasAnyPattern(m.companies, patterns));
      return finalizeMovieSlots(matches, () => `Estúdio/Distribuidora: ${company}`, `Filme de ${company}`);
    }

    case 'hollywood_studio_count': {
      const patterns: string[] = Array.isArray(meta.patterns) ? meta.patterns : [];
      const studio = String(meta.studio || patterns[0] || 'Estúdio');
      const matches = index.movies.filter(
        (m) => movieHasAnyPattern(m.studios, patterns) || movieHasAnyPattern(m.distributors, patterns)
      );
      return finalizeMovieSlots(matches, () => `Estúdio: ${studio}`, `Filme de ${studio}`);
    }

    case 'hollywood_studio_or_tag_count': {
      const patterns: string[] = Array.isArray(meta.patterns) ? meta.patterns : [];
      const tag = String(meta.tag || '');
      const matches = index.movies.filter(
        (m) => movieHasAnyPattern(m.companies, patterns) || (tag ? movieHasTag(m, tag) : false)
      );
      return finalizeMovieSlots(matches, () => `Estúdio ou Tag ${tag}`, `Estúdio ou Tag ${tag}`);
    }

    case 'hollywood_conglomerates_count': {
      const patterns: string[] = Array.isArray(meta.patterns) ? meta.patterns : [];
      const matches = index.movies.filter((m) => movieHasAnyPattern(m.companies, patterns));
      return finalizeMovieSlots(matches, () => 'Grande Conglomerado de Hollywood', 'Filme de Grande Conglomerado');
    }

    case 'hollywood_director_or_writer_count': {
      const patterns: string[] = Array.isArray(meta.patterns) ? meta.patterns : [];
      const checkProducers = Boolean(meta.checkProducers);
      const person = String(meta.person || 'Cineasta');
      const matches = index.movies.filter(
        (m) =>
          movieHasAnyPattern(m.directors, patterns) ||
          movieHasAnyPattern(m.writers, patterns) ||
          (checkProducers && movieHasAnyPattern(m.producers, patterns))
      );
      return finalizeMovieSlots(matches, () => `Créditos: ${person}`, `Filme de ${person}`);
    }

    case 'hollywood_same_director_writer_count': {
      const matches = index.movies.filter((m) => {
        for (const d of m.directors) {
          if (m.writers.has(d)) return true;
        }
        return false;
      });
      return finalizeMovieSlots(matches, () => 'Diretor & Roteirista simultâneo', 'Filme dirigido e roteirizado pela mesma pessoa');
    }

    case 'hollywood_unique_directors_quota': {
      const minFilms = Number(meta.minFilmsPerDirector) || 3;
      const qualified = Array.from(index.directorToMovies.values())
        .filter((d) => d.movies.length >= minFilms)
        .sort((a, b) => b.movies.length - a.movies.length);
      rawCount = qualified.length;
      progressCurrent = Math.min(rawCount, progressTarget);
      isMet = rawCount >= progressTarget;
      if (includeChecklist) {
        for (let i = 0; i < Math.max(progressTarget, Math.min(qualified.length, 30)); i++) {
          const item = qualified[i];
          if (item) {
            checklist.push({
              id: `dir_${i + 1}`,
              name: `${item.displayName} (${item.movies.length} filmes)`,
              required: minFilms,
              current: Math.min(item.movies.length, minFilms),
              conquered: true,
              movie_title: item.movies[0]?.title || null,
              poster_url: item.movies[0]?.posterUrl || null,
              extra_info: `${item.movies.length} filmes dirigidos`,
            });
          } else if (i < progressTarget) {
            checklist.push({
              id: `dir_${i + 1}`,
              name: `Diretor #${i + 1} (${minFilms}+ filmes)`,
              required: minFilms,
              current: 0,
              conquered: false,
              extra_info: 'Pendente',
            });
          }
        }
      }
      return { rawCount, progressCurrent, progressTarget, isMet, checklist };
    }

    case 'hollywood_unique_writers_quota': {
      const minFilms = Number(meta.minFilmsPerWriter) || 3;
      const qualified = Array.from(index.writerToMovies.values())
        .filter((w) => w.movies.length >= minFilms)
        .sort((a, b) => b.movies.length - a.movies.length);
      rawCount = qualified.length;
      progressCurrent = Math.min(rawCount, progressTarget);
      isMet = rawCount >= progressTarget;
      if (includeChecklist) {
        for (let i = 0; i < progressTarget; i++) {
          const item = qualified[i];
          if (item) {
            checklist.push({
              id: `writer_${i + 1}`,
              name: `${item.displayName} (${item.movies.length} roteiros)`,
              required: minFilms,
              current: minFilms,
              conquered: true,
              movie_title: item.movies[0]?.title || null,
              poster_url: item.movies[0]?.posterUrl || null,
              extra_info: `${item.movies.length} filmes roteirizados`,
            });
          } else {
            checklist.push({
              id: `writer_${i + 1}`,
              name: `Roteirista #${i + 1} (${minFilms}+ filmes)`,
              required: minFilms,
              current: 0,
              conquered: false,
              extra_info: 'Pendente',
            });
          }
        }
      }
      return { rawCount, progressCurrent, progressTarget, isMet, checklist };
    }

    // =====================================================
    // ⚖️ O TRIBUNAL DA CRÍTICA & CRUZAMENTOS
    // =====================================================
    case 'critic_tribunal_rule': {
      const ruleKey = String(meta.ruleKey || '');
      const scored: Array<{ movie: IndexedMovie; extraInfo: string; sortScore: number }> = [];
      for (const m of index.movies) {
        const res = evaluateCriticTribunalMovie(m, ruleKey);
        if (res.matched) scored.push({ movie: m, extraInfo: res.extraInfo, sortScore: res.sortScore });
      }
      scored.sort((a, b) => b.sortScore - a.sortScore);
      const extraMap = new Map<IndexedMovie, string>(scored.map((s) => [s.movie, s.extraInfo]));
      return finalizeMovieSlots(
        scored.map((s) => s.movie),
        (m) => extraMap.get(m) || 'Veredicto aprovado',
        'Filme que cumpra o veredicto da crítica'
      );
    }

    case 'rt_lt_ur_gte_count': {
      const maxRt = Number(meta.maxRt) || 40;
      const minMillis = Number(meta.minRating) || 8000;
      const matches = index.movies.filter(
        (m) => m.rt !== null && m.rt < maxRt && m.urMillis !== null && m.urMillis >= minMillis
      );
      return finalizeMovieSlots(
        matches,
        (m) => `RT: ${m.rt}% | Minha Nota: ${fmtUr(m.ur!)}`,
        `RT < ${maxRt}% e Nota >= ${(minMillis / 1000).toFixed(3)}`
      );
    }

    case 'multi_critic_range_count': {
      const digit = Number(meta.digit) || 6;
      const minDistinct = Number(meta.minDistinctMetrics) || 3;
      const min100 = digit * 10;
      const max100 = min100 + 9;
      const min1000 = digit * 1000;
      const max1000 = min1000 + 999;

      const matches = index.movies.filter((m) => {
        let hitCount = 0;
        if (m.rt !== null && m.rt >= min100 && m.rt <= max100) hitCount++;
        if (m.mc !== null && m.mc >= min100 && m.mc <= max100) hitCount++;
        if (m.imdbMillis !== null && m.imdbMillis >= min1000 && m.imdbMillis <= max1000) hitCount++;
        if (m.urMillis !== null && m.urMillis >= min1000 && m.urMillis <= max1000) hitCount++;
        return hitCount >= minDistinct;
      });
      return finalizeMovieSlots(
        matches,
        (m) => `Faixa do ${digit} em ${minDistinct}+ métricas`,
        `Filme com ${minDistinct}+ notas na faixa do ${digit}`
      );
    }

    case 'bomba_ray_tracing_count': {
      const genres: string[] = Array.isArray(meta.genres) ? meta.genres : ['Ficção Científica', 'Ação'];
      const minYear = Number(meta.minYear) || 2021;
      const minGr = Number(meta.minGlobalReviews) || 500_000;
      const maxMillis = Number(meta.maxRating) || 5000;
      const matches = index.movies.filter(
        (m) =>
          m.releaseYear !== null &&
          m.releaseYear >= minYear &&
          m.gr !== null &&
          m.gr > minGr &&
          m.urMillis !== null &&
          m.urMillis < maxMillis &&
          genres.some((g) => movieHasGenre(m, g))
      );
      return finalizeMovieSlots(
        matches,
        (m) => `${m.releaseYear} | Reviews: ${fmtGr(m.gr!)} | Nota: ${fmtUr(m.ur!)}`,
        `Blockbuster ${minYear}+ mal avaliado`
      );
    }

    case 'genres_or_decade_range_count': {
      const genres: string[] = Array.isArray(meta.genres) ? meta.genres : ['Ação', 'Aventura'];
      const minYear = Number(meta.minYear) || 1980;
      const maxYear = Number(meta.maxYear) || 1989;
      const matches = index.movies.filter(
        (m) =>
          m.releaseYear !== null &&
          m.releaseYear >= minYear &&
          m.releaseYear <= maxYear &&
          genres.some((g) => movieHasGenre(m, g))
      );
      return finalizeMovieSlots(
        matches,
        (m) => `${minYear}-${maxYear} • ${m.genresRaw.slice(0, 2).join('/')}`,
        `${genres.join('/')} (${minYear}-${maxYear})`
      );
    }

    case 'tag_and_any_of_tags': {
      const reqTag = String(meta.tag || '');
      const orTags: string[] = Array.isArray(meta.orTags) ? meta.orTags : [];
      const matches = (index.moviesByTag.get(cleanTag(reqTag)) || []).filter((m) =>
        orTags.some((t) => movieHasTag(m, t))
      );
      return finalizeMovieSlots(matches, () => `${reqTag} + (${orTags.join('/')})`, `${reqTag} + ${orTags.join('/')}`);
    }

    case 'tag_and_genres_or_year_range': {
      const tag = String(meta.tag || '');
      const orGenres: string[] = Array.isArray(meta.orGenres) ? meta.orGenres : [];
      const minYear = Number(meta.minYear) || 1990;
      const maxYear = Number(meta.maxYear) || 2004;
      const matches = (index.moviesByTag.get(cleanTag(tag)) || []).filter(
        (m) =>
          m.releaseYear !== null &&
          m.releaseYear >= minYear &&
          m.releaseYear <= maxYear &&
          orGenres.some((g) => movieHasGenre(m, g))
      );
      return finalizeMovieSlots(
        matches,
        (m) => `${tag} • ${m.releaseYear}`,
        `${tag} (${orGenres.join('/')}, ${minYear}-${maxYear})`
      );
    }

    case 'tags_or_physical_media_count': {
      const orTags: string[] = Array.isArray(meta.orTags) ? meta.orTags : ['Trágico', 'Emocionante'];
      const matches = index.movies.filter(
        (m) => isPhysicalMedia(m.canonicalPlatform) && orTags.some((t) => movieHasTag(m, t))
      );
      return finalizeMovieSlots(
        matches,
        (m) => `${m.canonicalPlatform} • ${orTags.join('/')}`,
        `Mídia física com ${orTags.join('/')}`
      );
    }

    case 'cinema_specific_months_count': {
      const months: number[] = Array.isArray(meta.months) ? meta.months.map(Number) : [2, 3, 9];
      const matches = (index.moviesByPlatform.get('Cinema') || []).filter((m) => movieInMonth(m, months));
      return finalizeMovieSlots(
        matches,
        (m) => `Cinema (${MONTH_NAMES[m.monthSeen || 0]})`,
        `Cinema nos meses (${months.join('/')})`
      );
    }

    case 'hybrid_15_countries_masterpieces': {
      const bestByCountry = new Map<string, IndexedMovie>();
      for (const m of index.movies) {
        if (m.urMillis === null || m.urMillis < 8500) continue;
        const cc = m.primaryCountryCode195;
        if (!cc || cc === 'us') continue;
        const prev = bestByCountry.get(cc);
        if (!prev || m.urMillis > (prev.urMillis || 0)) {
          bestByCountry.set(cc, m);
        }
      }
      const entries = Array.from(bestByCountry.entries()).sort(
        (a, b) => (b[1].urMillis || 0) - (a[1].urMillis || 0)
      );
      progressTarget = def.target_value || 15;
      rawCount = entries.length;
      progressCurrent = Math.min(rawCount, progressTarget);
      isMet = rawCount >= progressTarget;

      if (includeChecklist) {
        for (let i = 0; i < progressTarget; i++) {
          const entry = entries[i];
          if (entry) {
            const [cCode, m] = entry;
            const cDef = index.unCountryDefMap.get(cCode);
            checklist.push({
              id: `masterpiece_${cCode}`,
              code: cCode,
              name: cDef ? cDef.name : cCode.toUpperCase(),
              flag: cCode,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: m.title,
              movie_year: m.releaseYear,
              poster_url: m.posterUrl,
              extra_info: `Minha Nota: ${fmtUr(m.ur!)}`,
            });
          } else {
            checklist.push({
              id: `masterpiece_slot_${i + 1}`,
              name: `País Estrangeiro #${i + 1} (Minha Nota >= 8.500)`,
              required: 1,
              current: 0,
              conquered: false,
              extra_info: 'Pendente: Obra-prima internacional (>= 8.500)',
            });
          }
        }
      }
      return { rawCount, progressCurrent, progressTarget, isMet, checklist };
    }

    case 'hybrid_curador_joias_raras': {
      const maxReviews = Number(meta.maxReviews) || 50_000;
      const minMillis = Math.round((Number(meta.minRating) || 8.5) * 1000);
      const minCountries = Number(meta.minCountries) || 8;
      progressTarget = def.target_value || 15;

      const qualifying = index.movies.filter(
        (m) =>
          m.urMillis !== null &&
          m.urMillis >= minMillis &&
          m.gr !== null &&
          m.gr < maxReviews &&
          m.tagEntries.length > 0
      );

      const { selected, uniqueCountriesCount } = pickCuratorRareJewels(qualifying, progressTarget, minCountries);
      rawCount = selected.length;
      progressCurrent = Math.min(progressTarget, selected.length);
      isMet = selected.length >= progressTarget && uniqueCountriesCount >= minCountries;

      if (includeChecklist) {
        for (let i = 0; i < progressTarget; i++) {
          const item = selected[i];
          if (item) {
            const m = item.movie;
            checklist.push({
              id: `slot_${i + 1}`,
              name: `Filme #${i + 1}: ${m.title}${m.releaseYear ? ` (${m.releaseYear})` : ''}`,
              flag: m.primaryCountryCode195 || null,
              required: 1,
              current: 1,
              conquered: true,
              movie_title: m.title,
              movie_year: m.releaseYear,
              poster_url: m.posterUrl,
              extra_info: `Tag única: ${item.assignedTag.raw} | Reviews: ${fmtGr(m.gr!)} | Nota: ${fmtUr(m.ur!)} | ${m.primaryCountryName || 'Mundo'}`,
            });
          } else {
            checklist.push({
              id: `slot_${i + 1}`,
              name: `Filme #${i + 1} (Joia rara com tag distinta | ${uniqueCountriesCount}/${minCountries} países únicos)`,
              flag: null,
              required: 1,
              current: 0,
              conquered: false,
              extra_info: 'Pendente (< 50k Reviews, Nota >= 8.500, tag inédita)',
            });
          }
        }
      }
      return { rawCount, progressCurrent, progressTarget, isMet, checklist };
    }

    case 'hybrid_shyamalan_paradox': {
      const patterns = ['m. night shyamalan', 'm night shyamalan', 'shyamalan'];
      const shyamalanMovies = index.movies.filter((m) => movieHasAnyPattern(m.directors, patterns));
      const hitCandidates = shyamalanMovies.filter((m) => m.urMillis !== null && m.urMillis >= 8000);
      const missCandidates = shyamalanMovies.filter((m) => m.urMillis !== null && m.urMillis < 6000);
      const curHit = hitCandidates.length > 0 ? 1 : 0;
      const curMiss = missCandidates.length > 0 ? 1 : 0;
      progressTarget = 2;
      progressCurrent = curHit + curMiss;
      isMet = curHit === 1 && curMiss === 1;

      if (includeChecklist) {
        const b1 = hitCandidates[0];
        const b2 = missCandidates[0];
        checklist.push(
          {
            id: 'shyamalan_hit',
            name: 'Filme de M. Night Shyamalan com Minha Nota >= 8.000',
            required: 1,
            current: curHit,
            conquered: curHit === 1,
            movie_title: b1?.title || null,
            movie_year: b1?.releaseYear || null,
            poster_url: b1?.posterUrl || null,
            extra_info: b1 ? `Minha Nota: ${fmtUr(b1.ur!)}` : 'Pendente: Obra-prima (>= 8.000)',
          },
          {
            id: 'shyamalan_miss',
            name: 'Filme de M. Night Shyamalan com Minha Nota < 6.000',
            required: 1,
            current: curMiss,
            conquered: curMiss === 1,
            movie_title: b2?.title || null,
            movie_year: b2?.releaseYear || null,
            poster_url: b2?.posterUrl || null,
            extra_info: b2 ? `Minha Nota: ${fmtUr(b2.ur!)}` : 'Pendente: Tropeço (< 6.000)',
          }
        );
      }
      return { rawCount: progressCurrent, progressCurrent, progressTarget, isMet, checklist };
    }

    // =====================================================
    // 🕯️ O RITUAL DO CINÉFILO & CRUZAMENTOS MULTICATEGORIA
    // =====================================================
    case 'ritual_cinefilo_rule': {
      const ruleKey = String(meta.ruleKey || '');
      const scored: Array<{ movie: IndexedMovie; extraInfo: string; sortScore: number }> = [];
      for (const m of index.movies) {
        const res = evaluateRitualCinefiloMovie(m, ruleKey);
        if (res.matched) scored.push({ movie: m, extraInfo: res.extraInfo, sortScore: res.sortScore });
      }
      scored.sort((a, b) => b.sortScore - a.sortScore);
      const extraMap = new Map<IndexedMovie, string>(scored.map((s) => [s.movie, s.extraInfo]));
      return finalizeMovieSlots(
        scored.map((s) => s.movie),
        (m) => extraMap.get(m) || 'Critério do ritual atendido',
        'Filme que cumpra o ritual'
      );
    }

    case 'ritual_nomade_telas': {
      const minMoviesPerPlat = Number(meta.minMoviesPerPlatform) || 3;
      const platforms = Array.from(index.moviesByPlatform.entries())
        .map(([plat, list]) => ({ plat, count: list.length, sample: list[0] }))
        .sort((a, b) => b.count - a.count);

      const qualified = platforms.filter((p) => p.count >= minMoviesPerPlat);
      rawCount = qualified.length;
      progressCurrent = Math.min(rawCount, progressTarget);
      isMet = rawCount >= progressTarget;

      if (includeChecklist) {
        for (const p of platforms) {
          const met = p.count >= minMoviesPerPlat;
          checklist.push({
            id: `plat_${cleanStr(p.plat)}`,
            name: `${p.plat} (${p.count} filmes)`,
            required: minMoviesPerPlat,
            current: Math.min(p.count, minMoviesPerPlat),
            conquered: met,
            movie_title: p.sample?.title || null,
            poster_url: p.sample?.posterUrl || null,
            extra_info: met ? `${p.count}/${minMoviesPerPlat} (Conquistada)` : `Faltam ${minMoviesPerPlat - p.count}`,
          });
        }
      }
      return { rawCount, progressCurrent, progressTarget, isMet, checklist };
    }

    case 'ritual_total_minutos': {
      rawCount = index.totalRuntimeMinutes;
      progressCurrent = Math.min(rawCount, progressTarget);
      isMet = rawCount >= progressTarget;
      if (includeChecklist) {
        const hours = Math.round(rawCount / 60);
        checklist.push({
          id: `minutos_${progressTarget}`,
          name: `${progressTarget.toLocaleString('pt-BR')} minutos (${Math.round(progressTarget / 60)} horas) assistidos`,
          required: progressTarget,
          current: progressCurrent,
          conquered: isMet,
          extra_info: `${rawCount.toLocaleString('pt-BR')} minutos acumulados (${hours} horas líquidas)`,
        });
      }
      return { rawCount, progressCurrent, progressTarget, isMet, checklist };
    }

    case 'ritual_anos_checklist': {
      const startYear = Number(meta.startYear) || 1994;
      const endYear = Number(meta.endYear) || 2027;
      progressTarget = endYear - startYear + 1;
      let conqueredCount = 0;

      for (let y = startYear; y <= endYear; y++) {
        const list = index.moviesByRelYear.get(y) || [];
        const match = list[0];
        if (match) conqueredCount++;
        if (includeChecklist) {
          checklist.push({
            id: `ano_${y}`,
            name: `Ano de ${y}`,
            required: 1,
            current: match ? 1 : 0,
            conquered: Boolean(match),
            movie_title: match?.title || null,
            movie_year: y,
            poster_url: match?.posterUrl || null,
            extra_info: match ? `Conquistado (${match.title})` : `Pendente: Filme lançado em ${y}`,
          });
        }
      }
      return {
        rawCount: conqueredCount,
        progressCurrent: conqueredCount,
        progressTarget,
        isMet: conqueredCount >= progressTarget,
        checklist,
      };
    }

    case 'ritual_petista': {
      const baseYears: number[] = Array.isArray(meta.baseYears)
        ? meta.baseYears
        : [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016];
      const recentStart = Number(meta.recentStartYear) || 2023;
      const years = [...baseYears];
      for (let y = recentStart; y <= index.maxCatalogYear; y++) {
        years.push(y);
      }
      progressTarget = years.length;
      let conqueredCount = 0;

      for (const yr of years) {
        const match = (index.moviesByRelYear.get(yr) || [])[0];
        if (match) conqueredCount++;
        if (includeChecklist) {
          checklist.push({
            id: `petista_${yr}`,
            name: `Ano de ${yr}`,
            required: 1,
            current: match ? 1 : 0,
            conquered: Boolean(match),
            movie_title: match?.title || null,
            movie_year: yr,
            poster_url: match?.posterUrl || null,
            extra_info: match ? `Filme de ${yr}` : `Pendente: Filme lançado em ${yr}`,
          });
        }
      }
      return {
        rawCount: conqueredCount,
        progressCurrent: conqueredCount,
        progressTarget,
        isMet: conqueredCount >= progressTarget,
        checklist,
      };
    }

    case 'multi_ritual_rule': {
      const ruleKey = String(meta.ruleKey || '');
      if (ruleKey === 'brazil_copa_1950_2014') {
        progressTarget = 2;
        const brMovies = index.moviesByCountryAll.get('br') || [];
        const m1950 = brMovies.find((m) => m.releaseYear === 1950);
        const m2014 = brMovies.find((m) => m.releaseYear === 2014);
        const cur = (m1950 ? 1 : 0) + (m2014 ? 1 : 0);
        if (includeChecklist) {
          checklist.push(
            {
              id: 'copa_1950',
              name: 'Brasil na Copa de 1950 (Maracanazo)',
              required: 1,
              current: m1950 ? 1 : 0,
              conquered: Boolean(m1950),
              movie_title: m1950?.title || null,
              movie_year: 1950,
              poster_url: m1950?.posterUrl || null,
              extra_info: m1950 ? `Conquistado (${m1950.title})` : 'Pendente: Filme brasileiro de 1950',
            },
            {
              id: 'copa_2014',
              name: 'Brasil na Copa de 2014 (Mineiraço 7x1)',
              required: 1,
              current: m2014 ? 1 : 0,
              conquered: Boolean(m2014),
              movie_title: m2014?.title || null,
              movie_year: 2014,
              poster_url: m2014?.posterUrl || null,
              extra_info: m2014 ? `Conquistado (${m2014.title})` : 'Pendente: Filme brasileiro de 2014',
            }
          );
        }
        return { rawCount: cur, progressCurrent: cur, progressTarget, isMet: cur >= 2, checklist };
      }

      if (ruleKey === 'viajante_9_decadas_18') {
        const decades = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map((d) => ({
          label: `Anos ${d} (${d}-${d + 9})`,
          start: d,
          end: d + 9,
        }));
        const usedIds = new Set<string | number>();
        const conqueredCountries = new Set<string>();
        let totalConquered = 0;

        for (const dec of decades) {
          const candidates = index.movies
            .filter(
              (mv) =>
                mv.releaseYear !== null &&
                mv.releaseYear >= dec.start &&
                mv.releaseYear <= dec.end &&
                mv.urMillis !== null &&
                mv.urMillis >= 8000
            )
            .sort((a, b) => (b.urMillis || 0) - (a.urMillis || 0));

          for (let slot = 1; slot <= 2; slot++) {
            const m = candidates.find((mv) => !usedIds.has(mv.movieId));
            if (m) {
              usedIds.add(m.movieId);
              totalConquered++;
              if (
                m.primaryCountryCode195 &&
                index.unCountriesMap.get(m.primaryCountryCode195)?.status === 'conquered'
              ) {
                conqueredCountries.add(m.primaryCountryCode195);
              }
              if (includeChecklist) {
                checklist.push({
                  id: `viajante_${dec.start}_${slot}`,
                  name: `${dec.label} - Filme #${slot}`,
                  required: 1,
                  current: 1,
                  conquered: true,
                  movie_title: m.title,
                  movie_year: m.releaseYear,
                  poster_url: m.posterUrl,
                  flag: m.primaryCountryCode195 || null,
                  extra_info: `Conquistado (Nota ${fmtUr(m.ur!)} | ${m.primaryCountryName || 'País N/I'})`,
                });
              }
            } else if (includeChecklist) {
              checklist.push({
                id: `viajante_${dec.start}_${slot}`,
                name: `${dec.label} - Filme #${slot}`,
                required: 1,
                current: 0,
                conquered: false,
                extra_info: `Pendente: Filme de ${dec.start}-${dec.end} com Minha Nota >= 8.000`,
              });
            }
          }
        }
        return {
          rawCount: totalConquered,
          progressCurrent: totalConquered,
          progressTarget: def.target_value || 18,
          isMet: totalConquered >= (def.target_value || 18) && conqueredCountries.size >= 10,
          checklist,
        };
      }

      const scored: Array<{ movie: IndexedMovie; extraInfo: string; sortScore: number }> = [];
      for (const m of index.movies) {
        const res = evaluateMultiRitualMovie(m, ruleKey);
        if (res.matched) scored.push({ movie: m, extraInfo: res.extraInfo, sortScore: res.sortScore });
      }
      scored.sort((a, b) => b.sortScore - a.sortScore);
      const extraMap = new Map<IndexedMovie, string>(scored.map((s) => [s.movie, s.extraInfo]));
      return finalizeMovieSlots(
        scored.map((s) => s.movie),
        (m) => extraMap.get(m) || 'Critério atendido',
        'Filme que cumpra os critérios'
      );
    }

    // =====================================================
    // CROSSOVERS ESPECIAIS & SAGAS HÍBRIDAS
    // =====================================================
    case 'alphabet_az_coverage': {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      progressTarget = 26;
      let conquered = 0;

      for (const letter of alphabet) {
        const match = index.movies.find((m) => m.titleLetters.has(letter));
        if (match) conquered++;
        if (includeChecklist) {
          checklist.push({
            id: `letter_${letter}`,
            name: `Letra ${letter}`,
            required: 1,
            current: match ? 1 : 0,
            conquered: Boolean(match),
            movie_title: match?.title || null,
            movie_year: match?.releaseYear || null,
            poster_url: match?.posterUrl || null,
            extra_info: match ? `Conquistado (${match.title})` : `Pendente: Letra ${letter}`,
          });
        }
      }
      return {
        rawCount: conquered,
        progressCurrent: Math.min(conquered, 26),
        progressTarget: 26,
        isMet: conquered >= 26,
        checklist,
      };
    }

    case 'hybrid_country_oscar_winner': {
      const countryCode = String(meta.countryCode || 'br').toLowerCase();
      const minWins = Number(meta.minWins) || 1;
      const matches = (index.moviesByCountryAll.get(countryCode) || []).filter((m) => m.oscarWins >= minWins);
      return finalizeMovieSlots(
        matches,
        (m) => `${countryCode.toUpperCase()} • ${m.oscarWins} Oscar(s)`,
        `Filme de ${countryCode.toUpperCase()} ganhador do Oscar`,
        countryCode
      );
    }

    case 'hybrid_non_us_oscar_winner': {
      const excludeCode = String(meta.excludeCountryCode || 'us').toLowerCase();
      const minWins = Number(meta.minWins) || 1;
      const matches = index.movies.filter((m) => !movieHasCountryAll(m, excludeCode) && m.oscarWins >= minWins);
      return finalizeMovieSlots(
        matches,
        (m) => `${m.primaryCountryName || 'Internacional'} • ${m.oscarWins} Oscar(s)`,
        'Vencedor do Oscar fora dos EUA'
      );
    }

    case 'hybrid_genre_oscar_winner': {
      const genre = String(meta.genre || 'Curta');
      const minWins = Number(meta.minWins) || 1;
      const matches = (index.moviesByGenre.get(cleanTag(genre)) || []).filter((m) => m.oscarWins >= minWins);
      return finalizeMovieSlots(
        matches,
        (m) => `${genre} • ${m.oscarWins} Oscar(s)`,
        `${genre} vencedor do Oscar`
      );
    }

    case 'hybrid_genre_studio_month': {
      const genre = String(meta.genre || 'Terror');
      const studioPatterns: string[] = Array.isArray(meta.studioPatterns) ? meta.studioPatterns : ['blumhouse'];
      const month = Number(meta.month) || 10;
      const matches = (index.moviesByMonth.get(month) || []).filter(
        (m) => movieHasGenre(m, genre) && movieHasAnyPattern(m.companies, studioPatterns)
      );
      return finalizeMovieSlots(matches, () => `${genre} • ${studioPatterns[0]} (Outubro)`, `${genre} em ${MONTH_NAMES[month]}`);
    }

    case 'hybrid_genre_tag': {
      const genre = String(meta.genre || 'Romance');
      const tag = String(meta.tag || 'Colegio/Escola');
      const matches = (index.moviesByGenre.get(cleanTag(genre)) || []).filter((m) => movieHasTag(m, tag));
      return finalizeMovieSlots(matches, () => `${genre} + ${tag}`, `${genre} com tag ${tag}`);
    }

    case 'hybrid_disney_fox_horror': {
      const genre = String(meta.genre || 'Terror');
      const patterns: string[] = Array.isArray(meta.companyPatterns)
        ? meta.companyPatterns
        : ['disney', 'pixar', 'walt disney', 'buena vista', '20th century fox', '20th century studios', 'twentieth century'];
      const matches = (index.moviesByGenre.get(cleanTag(genre)) || []).filter((m) =>
        movieHasAnyPattern(m.companies, patterns)
      );
      return finalizeMovieSlots(matches, () => 'Terror Disney / Buena Vista / Fox', 'Terror Disney ou Fox');
    }

    case 'hybrid_disney_vacation_july_dec': {
      const genres: string[] = Array.isArray(meta.anyOfGenres) ? meta.anyOfGenres : ['Animação', 'Família'];
      const patterns: string[] = Array.isArray(meta.companyPatterns)
        ? meta.companyPatterns
        : ['disney', 'pixar', 'walt disney', 'buena vista'];
      const months: number[] = Array.isArray(meta.months) ? meta.months.map(Number) : [7, 12];
      const matches = index.movies.filter(
        (m) =>
          movieInMonth(m, months) &&
          genres.some((g) => movieHasGenre(m, g)) &&
          movieHasAnyPattern(m.companies, patterns)
      );
      return finalizeMovieSlots(matches, () => 'Disney/Pixar nas Férias (Jul/Dez)', 'Disney/Pixar em Julho ou Dezembro');
    }

    case 'hybrid_gore_twisted_lionsgate': {
      const patterns: string[] = Array.isArray(meta.companyPatterns)
        ? meta.companyPatterns
        : ['twisted pictures', 'lionsgate'];
      const matches = (index.moviesByGenre.get(cleanTag('Terror')) || []).filter(
        (m) => movieHasTag(m, 'Gore') && movieHasAnyPattern(m.companies, patterns)
      );
      return finalizeMovieSlots(matches, () => 'Terror + Gore + Twisted/Lionsgate', 'Terror Gore Twisted/Lionsgate');
    }

    case 'hybrid_pixar_emotional_animals': {
      const patterns: string[] = Array.isArray(meta.companyPatterns)
        ? meta.companyPatterns
        : ['disney', 'pixar', 'walt disney', 'buena vista'];
      const anyTags: string[] = Array.isArray(meta.anyOfTags)
        ? meta.anyOfTags
        : ['Emocionante', 'Animais antropomorficos'];
      const matches = (index.moviesByGenre.get(cleanTag('Animação')) || []).filter(
        (m) => movieHasAnyPattern(m.companies, patterns) && anyTags.some((t) => movieHasTag(m, t))
      );
      return finalizeMovieSlots(matches, () => 'Disney/Pixar Animação Emocionante', 'Animação Disney/Pixar');
    }

    case 'hybrid_sk_oscar': {
      const matches = (index.moviesByTag.get(cleanTag('SK')) || []).filter(
        (m) => m.oscarNoms >= 1 || m.oscarWins >= 1
      );
      return finalizeMovieSlots(
        matches,
        (m) => `Stephen King • ${m.oscarNoms} noms / ${m.oscarWins} vitórias`,
        'Adaptação de Stephen King no Oscar'
      );
    }

    case 'hybrid_top250_oscar_winner': {
      const minWins = Number(meta.minWins) || 1;
      const matches = (index.moviesByTag.get(cleanTag('TOP250')) || []).filter((m) => m.oscarWins >= minWins);
      return finalizeMovieSlots(matches, (m) => `TOP250 • ${m.oscarWins} Oscar(s)`, 'TOP250 vencedor do Oscar');
    }

    case 'hybrid_warner_dc_vs_disney_marvel': {
      const matchingA = index.movies.filter(
        (m) =>
          (movieHasGenre(m, 'Ação') || movieHasGenre(m, 'Aventura')) &&
          movieHasTag(m, 'DC') &&
          movieHasAnyPattern(m.companies, ['warner'])
      );
      const matchingB = index.movies.filter(
        (m) =>
          (movieHasGenre(m, 'Ação') || movieHasGenre(m, 'Aventura')) &&
          movieHasTag(m, 'Marvel') &&
          movieHasAnyPattern(m.companies, ['disney', 'buena vista', 'sony', 'columbia'])
      );
      const curA = Math.min(15, matchingA.length);
      const curB = Math.min(15, matchingB.length);
      progressTarget = 30;
      progressCurrent = curA + curB;
      isMet = matchingA.length >= 15 && matchingB.length >= 15;
      if (includeChecklist) {
        checklist.push(
          {
            id: 'dc_warner_quota',
            name: 'DC Comics na Warner Bros. (Ação/Aventura)',
            required: 15,
            current: curA,
            conquered: matchingA.length >= 15,
            extra_info: `${matchingA.length} de 15 filmes`,
          },
          {
            id: 'marvel_disney_sony_quota',
            name: 'Marvel Studios na Disney / Sony (Ação/Aventura)',
            required: 15,
            current: curB,
            conquered: matchingB.length >= 15,
            extra_info: `${matchingB.length} de 15 filmes`,
          }
        );
      }
      return { rawCount: progressCurrent, progressCurrent, progressTarget, isMet, checklist };
    }

    case 'hybrid_seven_deadly_sins': {
      const sins: Array<{ id: string; name: string; desc: string; matching: IndexedMovie[] }> = [
        {
          id: 'sin_luxuria',
          name: '1. Luxúria (Paul W.S. Anderson)',
          desc: 'Direção ou Roteiro de Paul W.S. Anderson',
          matching: index.movies.filter(
            (m) =>
              movieHasAnyPattern(m.directors, ['paul w.s. anderson', 'paul w. s. anderson', 'paul ws anderson', 'paul w s anderson']) ||
              movieHasAnyPattern(m.writers, ['paul w.s. anderson', 'paul w. s. anderson', 'paul ws anderson', 'paul w s anderson'])
          ),
        },
        {
          id: 'sin_orgulho',
          name: '2. Orgulho (Estados Unidos)',
          desc: 'Filmes produzidos nos EUA',
          matching: index.moviesByCountryAll.get('us') || [],
        },
        {
          id: 'sin_inveja',
          name: '3. Inveja (Roteiro de Bob Kane)',
          desc: 'Filmes creditados a Bob Kane',
          matching: index.movies.filter((m) => movieHasAnyPattern(m.writers, ['bob kane'])),
        },
        {
          id: 'sin_ira',
          name: '4. Ira (Tag Criança Malvada)',
          desc: 'Filmes com a tag Criança Malvada',
          matching: index.moviesByTag.get(cleanTag('Criança Malvada')) || [],
        },
        {
          id: 'sin_preguica',
          name: '5. Preguiça (Gênero Curta)',
          desc: 'Filmes do gênero Curta',
          matching: index.moviesByGenre.get(cleanTag('Curta')) || [],
        },
        {
          id: 'sin_avareza',
          name: '6. Avareza (Blumhouse ou Disney/Pixar)',
          desc: 'Filmes da Blumhouse ou Disney/Pixar',
          matching: index.movies.filter((m) =>
            movieHasAnyPattern(m.companies, ['blumhouse', 'disney', 'pixar', 'walt disney', 'buena vista'])
          ),
        },
        {
          id: 'sin_gula',
          name: '7. Gula (Tag Natal)',
          desc: 'Filmes com a tag Natal',
          matching: index.moviesByTag.get(cleanTag('Natal')) || [],
        },
      ];

      let totalSum = 0;
      let allMet = true;
      for (const s of sins) {
        const cur = Math.min(7, s.matching.length);
        totalSum += cur;
        if (s.matching.length < 7) allMet = false;
        if (includeChecklist) {
          checklist.push({
            id: s.id,
            name: s.name,
            required: 7,
            current: cur,
            conquered: cur >= 7,
            extra_info: `${cur} de 7 filmes (${s.matching.length} no catálogo)`,
          });
        }
      }
      return {
        rawCount: totalSum,
        progressCurrent: totalSum,
        progressTarget: 49,
        isMet: allMet,
        checklist,
      };
    }

    case 'michael_jackson_anthology': {
      progressTarget = 16;
      const musicMovies = index.moviesByGenre.get(cleanTag('Música')) || [];
      const musicMet = musicMovies.length >= 15;
      let countMet = musicMet ? 1 : 0;

      if (includeChecklist) {
        checklist.push({
          id: 'track_00_music_genre',
          name: 'Meta Global: Conquistar 15 Filmes com o Gênero Música',
          required: 15,
          current: Math.min(15, musicMovies.length),
          conquered: musicMet,
          movie_title: musicMovies[0]?.title || null,
          movie_year: musicMovies[0]?.releaseYear || null,
          poster_url: musicMovies[0]?.posterUrl || null,
          extra_info: `${musicMovies.length}/15 filmes com gênero Música`,
        });
      }

      const tracks: Array<{ id: string; name: string; ruleDesc: string; match: (m: IndexedMovie) => boolean }> = [
        {
          id: 'track_01_abc',
          name: 'Faixa 01: [ABC] (1970) — The Jackson 5',
          ruleDesc: '1970 + tag "Colegio/Escola" ou "Em Família"',
          match: (m) => m.releaseYear === 1970 && (movieHasTag(m, 'Colegio/Escola') || movieHasTag(m, 'Em Família')),
        },
        {
          id: 'track_02_beat_it',
          name: 'Faixa 02: [Beat It] (1983)',
          ruleDesc: '1983 + gênero "Ação"',
          match: (m) => m.releaseYear === 1983 && movieHasGenre(m, 'Ação'),
        },
        {
          id: 'track_03_billie_jean',
          name: 'Faixa 03: [Billie Jean] (1983)',
          ruleDesc: '1983 + tag "Trágico" ou gênero "Suspense"',
          match: (m) => m.releaseYear === 1983 && (movieHasTag(m, 'Trágico') || movieHasGenre(m, 'Suspense')),
        },
        {
          id: 'track_04_thriller',
          name: 'Faixa 04: [Thriller] (1984)',
          ruleDesc: '1984 + tag "Lobisomem" ou "Zumbi"',
          match: (m) => m.releaseYear === 1984 && (movieHasTag(m, 'Lobisomem') || movieHasTag(m, 'Zumbi')),
        },
        {
          id: 'track_05_bad',
          name: 'Faixa 05: [Bad] (1987)',
          ruleDesc: '1987 + tag "Criança Malvada"',
          match: (m) => m.releaseYear === 1987 && movieHasTag(m, 'Criança Malvada'),
        },
        {
          id: 'track_06_smooth_criminal',
          name: 'Faixa 06: [Smooth Criminal] (1988)',
          ruleDesc: '1988 + tag "Crime real" ou gênero "Policial"/"Crime"',
          match: (m) =>
            m.releaseYear === 1988 &&
            (movieHasTag(m, 'Crime real') || movieHasGenre(m, 'Policial') || movieHasGenre(m, 'Crime')),
        },
        {
          id: 'track_07_black_or_white',
          name: 'Faixa 07: [Black or White] (1991)',
          ruleDesc: '1991 + tag "Preto e branco" ou "Em Família"',
          match: (m) => m.releaseYear === 1991 && (movieHasTag(m, 'Preto e branco') || movieHasTag(m, 'Em Família')),
        },
        {
          id: 'track_08_heal_the_world',
          name: 'Faixa 08: [Heal the World] (1991)',
          ruleDesc: '1991 + tag "Emocionante" ou "Fatos Reais"',
          match: (m) => m.releaseYear === 1991 && (movieHasTag(m, 'Emocionante') || movieHasTag(m, 'Fatos Reais')),
        },
        {
          id: 'track_09_remember_the_time',
          name: 'Faixa 09: [Remember the Time] (1992)',
          ruleDesc: '1992 + tag "Viagem no Tempo"',
          match: (m) => m.releaseYear === 1992 && movieHasTag(m, 'Viagem no Tempo'),
        },
        {
          id: 'track_10_you_are_not_alone',
          name: 'Faixa 10: [You Are Not Alone] (1995)',
          ruleDesc: '1995 + tag "Em Família" ou gênero "Romance"',
          match: (m) => m.releaseYear === 1995 && (movieHasTag(m, 'Em Família') || movieHasGenre(m, 'Romance')),
        },
        {
          id: 'track_11_earth_song',
          name: 'Faixa 11: [Earth Song] (1995)',
          ruleDesc: '1995 + tag "Trágico" ou gênero "Documentário"',
          match: (m) => m.releaseYear === 1995 && (movieHasTag(m, 'Trágico') || movieHasGenre(m, 'Documentário')),
        },
        {
          id: 'track_12_they_dont_care_about_us',
          name: "Faixa 12: [They Don't Care About Us] (1996)",
          ruleDesc: '1996 + produzido no Brasil',
          match: (m) => m.releaseYear === 1996 && movieHasCountryAll(m, 'br'),
        },
        {
          id: 'track_13_ghosts',
          name: 'Faixa 13: [Ghosts] (1996)',
          ruleDesc: '1996 + tag "Fantasma"',
          match: (m) => m.releaseYear === 1996 && movieHasTag(m, 'Fantasma'),
        },
        {
          id: 'track_14_blood_on_the_dance_floor',
          name: 'Faixa 14: [Blood on the Dance Floor] (1997)',
          ruleDesc: '1997 + tag "Gore"',
          match: (m) => m.releaseYear === 1997 && movieHasTag(m, 'Gore'),
        },
        {
          id: 'track_15_love_never_felt_so_good',
          name: 'Faixa 15: [Love Never Felt So Good] (2014)',
          ruleDesc: '2014 + tag "Em Família" ou "Emocionante"',
          match: (m) => m.releaseYear === 2014 && (movieHasTag(m, 'Em Família') || movieHasTag(m, 'Emocionante')),
        },
      ];

      for (const trk of tracks) {
        const matched = index.movies.find(trk.match);
        if (matched) countMet++;
        if (includeChecklist) {
          checklist.push({
            id: trk.id,
            name: trk.name,
            required: 1,
            current: matched ? 1 : 0,
            conquered: Boolean(matched),
            movie_title: matched?.title || null,
            movie_year: matched?.releaseYear || null,
            poster_url: matched?.posterUrl || null,
            flag: matched?.primaryCountryCode195 || null,
            rule_desc: trk.ruleDesc,
            extra_info: matched ? `Cumprida (${matched.title})` : `Pendente • ${trk.ruleDesc}`,
          });
        }
      }

      return {
        rawCount: countMet,
        progressCurrent: countMet,
        progressTarget: 16,
        isMet: countMet >= 16,
        checklist,
      };
    }

    default: {
      // Suporta qualquer franchise_movie_list ou futuro checklist por padrões se existir
      if (Array.isArray(meta.movies)) {
        const reqMovies = meta.movies;
        progressTarget = reqMovies.length || progressTarget;
        let conquered = 0;
        const usedIds = new Set<string | number>();
        for (let i = 0; i < reqMovies.length; i++) {
          const req = reqMovies[i];
          const match = index.movies.find((m) => !usedIds.has(m.movieId) && matchFranchiseMovie(m, req));
          if (match) {
            usedIds.add(match.movieId);
            conquered++;
          }
          if (includeChecklist) {
            checklist.push({
              id: `req_${i + 1}`,
              name: req.name,
              flag: match?.primaryCountryCode195 || null,
              required: 1,
              current: match ? 1 : 0,
              conquered: Boolean(match),
              movie_title: match?.title || null,
              movie_year: match?.releaseYear || null,
              poster_url: match?.posterUrl || null,
              extra_info: match ? 'Conquistado' : 'Pendente',
            });
          }
        }
        return {
          rawCount: conquered,
          progressCurrent: conquered,
          progressTarget,
          isMet: conquered >= progressTarget,
          checklist,
        };
      }

      return {
        rawCount: 0,
        progressCurrent: 0,
        progressTarget,
        isMet: false,
        checklist: [],
      };
    }
  }
}

/**
 * Normalizes `ranks_state` stored in PostgreSQL into an ID-indexed dictionary.
 */
function parsePrevRanksMap(rawRanksState: unknown): Record<string, Partial<TrophyRankState>> {
  if (!rawRanksState) return {};
  if (Array.isArray(rawRanksState)) {
    const out: Record<string, Partial<TrophyRankState>> = {};
    for (const item of rawRanksState) {
      if (item?.id) out[item.id] = item;
    }
    return out;
  }
  if (typeof rawRanksState === 'object') {
    return rawRanksState as Record<string, Partial<TrophyRankState>>;
  }
  return {};
}

function buildSearchKeywords(def: TrophyDefinition): string {
  const parts = [def.title, def.description];
  if (Array.isArray(def.ranks)) {
    for (const r of def.ranks) {
      if (r.title) parts.push(r.title);
      if (r.description) parts.push(r.description);
    }
  }
  return parts.join(' ').trim();
}

/**
 * Computes progress and unlock state for every Rank step in a Rank Trophy card.
 */
function evaluateRankSteps(
  def: TrophyDefinition,
  raw: RawRuleResult,
  prevRanksMap: Record<string, Partial<TrophyRankState>>,
  nowIso: string,
  isBaseline: boolean
): {
  ranks: TrophyRankState[];
  unlockedRanksCount: number;
  highestUnlockedTier: TrophyTier | null;
  parentProgressCurrent: number;
  parentProgressTarget: number;
  parentProgressPercentage: number;
  isFullyUnlocked: boolean;
  unlockedAt: string | null;
  hasAnyNew: boolean;
  newlyUnlockedSteps: NewlyUnlockedAchievement[];
  prevHighestCurrent: number;
} {
  const steps: TrophyRankStep[] = Array.isArray(def.ranks) ? def.ranks : [];
  const evaluatedSteps: TrophyRankState[] = [];
  const newlyUnlockedSteps: NewlyUnlockedAchievement[] = [];
  let unlockedRanksCount = 0;
  let highestUnlockedTier: TrophyTier | null = null;
  let hasAnyNew = false;
  let firstUnlockedAt: string | null = null;

  for (const step of steps) {
    const prevStep = prevRanksMap[step.id] || {};
    const testOverride = prevStep.test_override !== undefined ? prevStep.test_override : null;

    let stepTarget = step.target_value;
    let stepCurrent = Math.min(raw.rawCount, stepTarget);
    let stepMet = raw.rawCount >= stepTarget;

    if (def.target_type === 'all_12_months_coverage' && Array.isArray(raw.monthCounts)) {
      stepTarget = 12;
      const covered = raw.monthCounts.filter((c) => c >= step.target_value).length;
      stepCurrent = covered;
      stepMet = covered >= 12;
    } else if (
      (def.target_type === 'genre_quotas' || def.target_type === 'tag_checklist_quota') &&
      Array.isArray(raw.quotaRawCounts) &&
      raw.quotaRawCounts.length > 0
    ) {
      const nQuotas = raw.quotaRawCounts.length;
      const perQuota = Math.max(1, Math.floor(step.target_value / nQuotas));
      stepTarget = perQuota * nQuotas;
      let sum = 0;
      let allMet = true;
      for (const qc of raw.quotaRawCounts) {
        sum += Math.min(qc, perQuota);
        if (qc < perQuota) allMet = false;
      }
      stepCurrent = sum;
      stepMet = allMet && sum >= stepTarget;
    }

    const isUnlocked = testOverride === true ? true : testOverride === false ? false : stepMet;
    const prevUnlocked = Boolean(prevStep.is_unlocked);
    const unlockedAt = isUnlocked ? prevStep.unlocked_at || nowIso : null;
    if (isUnlocked && unlockedAt && (!firstUnlockedAt || unlockedAt < firstUnlockedAt)) {
      firstUnlockedAt = unlockedAt;
    }

    const becameUnlocked = isUnlocked && !prevUnlocked;
    const isNew = isUnlocked ? Boolean(prevStep.is_new) || (!isBaseline && becameUnlocked) : false;
    if (isNew) hasAnyNew = true;

    const pct = stepTarget > 0 ? Math.min(100, Math.round((stepCurrent / stepTarget) * 100)) : 0;

    if (isUnlocked) {
      unlockedRanksCount++;
      highestUnlockedTier = step.tier;
    }

    const rankTitle = step.title || `${def.title} • Rank ${step.tier}`;
    const rankDesc = step.description || def.description;

    evaluatedSteps.push({
      id: step.id,
      tier: step.tier,
      target_value: step.target_value,
      title: rankTitle,
      description: rankDesc,
      legacy_id: step.legacy_id,
      is_unlocked: isUnlocked,
      unlocked_at: unlockedAt,
      test_override: testOverride ?? null,
      is_new: isNew,
      progress_current: stepCurrent,
      progress_target: stepTarget,
      progress_percentage: pct,
    });

    if (becameUnlocked && !isBaseline && testOverride !== true) {
      newlyUnlockedSteps.push({
        id: step.id,
        card_id: def.id,
        title: rankTitle,
        description: rankDesc,
        tier: step.tier,
        category: def.category,
        categories: def.categories || [def.category],
        icon: def.icon,
        unlocked_at: unlockedAt!,
        is_rank_step: true,
        rank_step_target: step.target_value,
      });
    }
  }

  // O progresso do card espelha o próximo Rank pendente (ou o último Rank se já platinou o card)
  const nextLocked = evaluatedSteps.find((s) => !s.is_unlocked);
  const activeStep = nextLocked || evaluatedSteps[evaluatedSteps.length - 1];
  const parentProgressCurrent = activeStep ? activeStep.progress_current : raw.progressCurrent;
  const parentProgressTarget = activeStep ? activeStep.progress_target : raw.progressTarget;
  const parentProgressPercentage = activeStep
    ? activeStep.progress_percentage
    : parentProgressTarget > 0
      ? Math.min(100, Math.round((parentProgressCurrent / parentProgressTarget) * 100))
      : 0;

  // Para calcular delta de progresso no toast, usa progresso do step anterior correspondente ou prevRanksMap[activeStep.id]
  const prevStepForProgress = activeStep ? prevRanksMap[activeStep.id] : undefined;
  const prevHighestCurrent = prevStepForProgress?.progress_current ?? 0;

  return {
    ranks: evaluatedSteps,
    unlockedRanksCount,
    highestUnlockedTier,
    parentProgressCurrent,
    parentProgressTarget,
    parentProgressPercentage,
    isFullyUnlocked: steps.length > 0 && unlockedRanksCount >= steps.length,
    unlockedAt: firstUnlockedAt,
    hasAnyNew,
    newlyUnlockedSteps,
    prevHighestCurrent,
  };
}

/**
 * Evaluates a single non-platinum TrophyDefinition against a `CatalogIndex`.
 */
export function evaluateSingleNonPlatinumDefinition(
  def: TrophyDefinition,
  index: CatalogIndex,
  prevState: PreviousCardState | undefined,
  options: { includeChecklist?: boolean; nowIso?: string; isBaseline?: boolean } = {}
): {
  card: EvaluatedTrophyCard;
  newlyUnlocked: NewlyUnlockedAchievement[];
  progressed: ProgressedTrophy | null;
} {
  const nowIso = options.nowIso || new Date().toISOString();
  const isBaseline = Boolean(options.isBaseline);
  const includeChecklist = Boolean(options.includeChecklist);

  const raw = computeRuleEvaluation(def, index, includeChecklist);
  const categories = Array.isArray(def.categories) && def.categories.length > 0 ? def.categories : [def.category];
  const searchKeywords = buildSearchKeywords(def);

  if (def.kind === 'rank' && Array.isArray(def.ranks) && def.ranks.length > 0) {
    const prevRanksMap = parsePrevRanksMap(prevState?.ranks_state);
    const rankRes = evaluateRankSteps(def, raw, prevRanksMap, nowIso, isBaseline);

    // Override manual no card inteiro ainda funciona se aplicado ao card ID
    const cardOverride = prevState?.test_override ?? null;
    let finalRanks = rankRes.ranks;
    let unlockedCount = rankRes.unlockedRanksCount;
    let highestTier = rankRes.highestUnlockedTier;
    let isFullyUnlocked = rankRes.isFullyUnlocked;

    if (cardOverride === true || cardOverride === false) {
      finalRanks = finalRanks.map((r) => ({
        ...r,
        is_unlocked: cardOverride,
        unlocked_at: cardOverride ? r.unlocked_at || nowIso : null,
      }));
      unlockedCount = cardOverride ? finalRanks.length : 0;
      highestTier = cardOverride ? finalRanks[finalRanks.length - 1]?.tier || def.tier : null;
      isFullyUnlocked = cardOverride;
    }

    const card: EvaluatedTrophyCard = {
      id: def.id,
      kind: 'rank',
      category: def.category,
      categories,
      tier: def.tier,
      title: def.title,
      description: def.description,
      icon: def.icon,
      target_type: def.target_type,
      target_value: def.target_value,
      target_metadata: def.target_metadata || {},
      sort_order: def.sort_order,
      search_keywords: searchKeywords,
      is_unlocked: isFullyUnlocked,
      unlocked_at: rankRes.unlockedAt,
      test_override: cardOverride,
      is_new: rankRes.hasAnyNew,
      progress_current: rankRes.parentProgressCurrent,
      progress_target: rankRes.parentProgressTarget,
      progress_percentage: rankRes.parentProgressPercentage,
      ranks: finalRanks,
      unlocked_ranks_count: unlockedCount,
      highest_unlocked_tier: highestTier,
      checklist: raw.checklist,
    };

    let progressed: ProgressedTrophy | null = null;
    const prevProg = prevState ? prevState.progress_current : rankRes.prevHighestCurrent;
    if (
      !isBaseline &&
      rankRes.newlyUnlockedSteps.length === 0 &&
      !isFullyUnlocked &&
      card.progress_current > (prevState ? prevState.progress_current : 0) &&
      prevState
    ) {
      progressed = {
        id: def.id,
        title: def.title,
        tier: finalRanks.find((r) => !r.is_unlocked)?.tier || def.tier,
        category: def.category,
        categories,
        icon: def.icon,
        progress_current: card.progress_current,
        progress_target: card.progress_target,
        progress_percentage: card.progress_percentage,
        previous_current: prevProg,
        delta: card.progress_current - prevProg,
        target_type: def.target_type,
        target_metadata: def.target_metadata || {},
      };
    }

    return {
      card,
      newlyUnlocked: rankRes.newlyUnlockedSteps,
      progressed,
    };
  }

  // Troféu Único (`kind === 'unique'`)
  const testOverride = prevState?.test_override ?? null;
  const isUnlocked = testOverride === true ? true : testOverride === false ? false : raw.isMet;
  const prevUnlocked = Boolean(prevState?.is_unlocked);
  const unlockedAt = isUnlocked ? prevState?.unlocked_at || nowIso : null;
  const becameUnlocked = isUnlocked && !prevUnlocked;
  const isNew = isUnlocked ? Boolean(prevState?.is_new) || (!isBaseline && becameUnlocked) : false;
  const pct =
    raw.progressTarget > 0
      ? Math.min(100, Math.round((raw.progressCurrent / raw.progressTarget) * 100))
      : 0;

  const card: EvaluatedTrophyCard = {
    id: def.id,
    kind: 'unique',
    category: def.category,
    categories,
    tier: def.tier,
    title: def.title,
    description: def.description,
    icon: def.icon,
    target_type: def.target_type,
    target_value: def.target_value,
    target_metadata: def.target_metadata || {},
    sort_order: def.sort_order,
    search_keywords: searchKeywords,
    is_unlocked: isUnlocked,
    unlocked_at: unlockedAt,
    test_override: testOverride,
    is_new: isNew,
    progress_current: raw.progressCurrent,
    progress_target: raw.progressTarget,
    progress_percentage: pct,
    checklist: raw.checklist,
  };

  const newlyUnlocked: NewlyUnlockedAchievement[] = [];
  if (becameUnlocked && !isBaseline && testOverride !== true) {
    newlyUnlocked.push({
      id: def.id,
      card_id: def.id,
      title: def.title,
      description: def.description,
      tier: def.tier,
      category: def.category,
      categories,
      icon: def.icon,
      unlocked_at: unlockedAt!,
    });
  }

  let progressed: ProgressedTrophy | null = null;
  if (!isBaseline && !becameUnlocked && !isUnlocked && prevState && card.progress_current > prevState.progress_current) {
    progressed = {
      id: def.id,
      title: def.title,
      tier: def.tier,
      category: def.category,
      categories,
      icon: def.icon,
      progress_current: card.progress_current,
      progress_target: card.progress_target,
      progress_percentage: card.progress_percentage,
      previous_current: prevState.progress_current,
      delta: card.progress_current - prevState.progress_current,
      target_type: def.target_type,
      target_metadata: def.target_metadata || {},
    };
  }

  return { card, newlyUnlocked, progressed };
}

/**
 * Evaluates a `platinum_dynamic` trophy across all evaluated non-platinum cards (counting each unique trophy AND each Rank step).
 */
export function evaluatePlatinumDefinition(
  def: TrophyDefinition,
  nonPlatinumCards: EvaluatedTrophyCard[],
  prevState: PreviousCardState | undefined,
  options: { includeChecklist?: boolean; nowIso?: string; isBaseline?: boolean } = {}
): {
  card: EvaluatedTrophyCard;
  newlyUnlocked: NewlyUnlockedAchievement[];
} {
  const nowIso = options.nowIso || new Date().toISOString();
  const isBaseline = Boolean(options.isBaseline);
  const includeChecklist = Boolean(options.includeChecklist);
  const meta = def.target_metadata || {};
  const targetCat = String(meta.categoryScope || meta.category || def.category);
  const categories = Array.isArray(def.categories) && def.categories.length > 0 ? def.categories : [def.category];

  const scopedCards = nonPlatinumCards.filter(
    (c) => c.category === targetCat || (Array.isArray(c.categories) && c.categories.includes(targetCat))
  );

  let totalConquests = 0;
  let unlockedConquests = 0;
  const checklist: TrophyChecklistItem[] = [];

  for (const c of scopedCards) {
    if (c.kind === 'rank' && Array.isArray(c.ranks) && c.ranks.length > 0) {
      const done = c.ranks.filter((r) => r.is_unlocked).length;
      const tot = c.ranks.length;
      totalConquests += tot;
      unlockedConquests += done;
      if (includeChecklist) {
        checklist.push({
          id: c.id,
          name: `${c.title} (${done}/${tot} ranks)`,
          required: tot,
          current: done,
          conquered: done >= tot,
          extra_info: done >= tot ? 'Todos os 5 ranks conquistados' : `${done} de ${tot} ranks concluídos`,
        });
      }
    } else {
      totalConquests += 1;
      if (c.is_unlocked) unlockedConquests += 1;
      if (includeChecklist) {
        checklist.push({
          id: c.id,
          name: c.title,
          required: 1,
          current: c.is_unlocked ? 1 : 0,
          conquered: c.is_unlocked,
          extra_info: c.is_unlocked ? 'Conquistado' : 'Pendente',
        });
      }
    }
  }

  const testOverride = prevState?.test_override ?? null;
  const isMet = totalConquests > 0 && unlockedConquests >= totalConquests;
  const isUnlocked = testOverride === true ? true : testOverride === false ? false : isMet;
  const prevUnlocked = Boolean(prevState?.is_unlocked);
  const unlockedAt = isUnlocked ? prevState?.unlocked_at || nowIso : null;
  const becameUnlocked = isUnlocked && !prevUnlocked;
  const isNew = isUnlocked ? Boolean(prevState?.is_new) || (!isBaseline && becameUnlocked) : false;
  const pct = totalConquests > 0 ? Math.min(100, Math.round((unlockedConquests / totalConquests) * 100)) : 0;

  const card: EvaluatedTrophyCard = {
    id: def.id,
    kind: 'platinum',
    category: def.category,
    categories,
    tier: 'platinum',
    title: def.title,
    description: def.description,
    icon: def.icon,
    target_type: def.target_type,
    target_value: totalConquests,
    target_metadata: meta,
    sort_order: def.sort_order,
    search_keywords: buildSearchKeywords(def),
    is_unlocked: isUnlocked,
    unlocked_at: unlockedAt,
    test_override: testOverride,
    is_new: isNew,
    progress_current: unlockedConquests,
    progress_target: totalConquests,
    progress_percentage: pct,
    checklist,
  };

  const newlyUnlocked: NewlyUnlockedAchievement[] = [];
  if (becameUnlocked && !isBaseline && testOverride !== true) {
    newlyUnlocked.push({
      id: def.id,
      card_id: def.id,
      title: def.title,
      description: def.description,
      tier: 'platinum',
      category: def.category,
      categories,
      icon: def.icon,
      unlocked_at: unlockedAt!,
    });
  }

  return { card, newlyUnlocked };
}

export interface TierSummaryBucket {
  name?: string;
  symbol?: string;
  color?: string;
  total: number;
  unlocked: number;
  percentage: number;
}

export type TierStatsMap = Record<TrophyTier, TierSummaryBucket>;

/**
 * Computes exact conquest statistics across all 6 tiers, expanding Rank cards into their 5 individual Rank steps.
 */
export function computeAchievementSummary(cards: EvaluatedTrophyCard[]): {
  totalCards: number;
  unlockedCardsCount: number;
  totalAchievements: number;
  unlockedAchievementsCount: number;
  overallPercentage: number;
  tierStats: TierStatsMap;
} {
  const tierStats: TierStatsMap = {
    bronze: { name: 'Bronze', symbol: '🥉', color: '#CD7F32', total: 0, unlocked: 0, percentage: 0 },
    silver: { name: 'Prata', symbol: '🥈', color: '#C0C0C0', total: 0, unlocked: 0, percentage: 0 },
    epic: { name: 'Épico', symbol: '💜', color: '#9B59B6', total: 0, unlocked: 0, percentage: 0 },
    gold: { name: 'Ouro', symbol: '🥇', color: '#FFD700', total: 0, unlocked: 0, percentage: 0 },
    mythic: { name: 'Mítico', symbol: '💎', color: '#EF4444', total: 0, unlocked: 0, percentage: 0 },
    platinum: { name: 'Platina', symbol: '🏆', color: '#E5E4E2', total: 0, unlocked: 0, percentage: 0 },
  };

  let unlockedCardsCount = 0;
  let totalAchievements = 0;
  let unlockedAchievementsCount = 0;

  for (const c of cards) {
    if (c.kind === 'rank' && Array.isArray(c.ranks) && c.ranks.length > 0) {
      if ((c.unlocked_ranks_count || 0) > 0) unlockedCardsCount++;
      for (const r of c.ranks) {
        totalAchievements++;
        tierStats[r.tier].total += 1;
        if (r.is_unlocked) {
          unlockedAchievementsCount++;
          tierStats[r.tier].unlocked += 1;
        }
      }
    } else {
      if (c.is_unlocked) unlockedCardsCount++;
      totalAchievements++;
      tierStats[c.tier].total += 1;
      if (c.is_unlocked) {
        unlockedAchievementsCount++;
        tierStats[c.tier].unlocked += 1;
      }
    }
  }

  for (const tier of Object.keys(tierStats) as TrophyTier[]) {
    const bucket = tierStats[tier];
    bucket.percentage = bucket.total > 0 ? Math.round((bucket.unlocked / bucket.total) * 100) : 0;
  }

  const overallPercentage =
    totalAchievements > 0 ? Math.round((unlockedAchievementsCount / totalAchievements) * 100) : 0;

  return {
    totalCards: cards.length,
    unlockedCardsCount,
    totalAchievements,
    unlockedAchievementsCount,
    overallPercentage,
    tierStats,
  };
}

/**
 * Runs a complete evaluation pass across all trophy definitions using a prebuilt `CatalogIndex`.
 */
export function evaluateCatalogDefinitions(
  definitions: TrophyDefinition[],
  index: CatalogIndex,
  prevStates: Map<string, PreviousCardState>,
  options: { includeChecklists?: boolean; nowIso?: string; isBaseline?: boolean } = {}
): {
  cards: EvaluatedTrophyCard[];
  newlyUnlocked: NewlyUnlockedAchievement[];
  progressedTrophies: ProgressedTrophy[];
} {
  const nowIso = options.nowIso || new Date().toISOString();
  const isBaseline = Boolean(options.isBaseline);
  const includeChecklists = Boolean(options.includeChecklists);

  const nonPlatinumDefs = definitions.filter((d) => d.kind !== 'platinum' && d.target_type !== 'platinum_dynamic');
  const platinumDefs = definitions.filter((d) => d.kind === 'platinum' || d.target_type === 'platinum_dynamic');

  const nonPlatinumCards: EvaluatedTrophyCard[] = [];
  const newlyUnlocked: NewlyUnlockedAchievement[] = [];
  const progressedTrophies: ProgressedTrophy[] = [];

  for (const def of nonPlatinumDefs) {
    const res = evaluateSingleNonPlatinumDefinition(def, index, prevStates.get(def.id), {
      includeChecklist: includeChecklists,
      nowIso,
      isBaseline,
    });
    nonPlatinumCards.push(res.card);
    if (res.newlyUnlocked.length > 0) newlyUnlocked.push(...res.newlyUnlocked);
    if (res.progressed) progressedTrophies.push(res.progressed);
  }

  const platinumCards: EvaluatedTrophyCard[] = [];
  for (const pDef of platinumDefs) {
    const res = evaluatePlatinumDefinition(pDef, nonPlatinumCards, prevStates.get(pDef.id), {
      includeChecklist: includeChecklists,
      nowIso,
      isBaseline,
    });
    platinumCards.push(res.card);
    if (res.newlyUnlocked.length > 0) newlyUnlocked.push(...res.newlyUnlocked);
  }

  const cards = [...nonPlatinumCards, ...platinumCards].sort((a, b) => a.sort_order - b.sort_order);
  return { cards, newlyUnlocked, progressedTrophies };
}
