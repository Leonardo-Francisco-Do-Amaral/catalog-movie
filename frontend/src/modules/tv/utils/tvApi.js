import axios from 'axios';
import { BACKEND_ORIGIN as SHARED_BACKEND_ORIGIN, API_BASE_URL, resolveBackendAssetUrl } from '../../../utils/apiConfig';

export const BACKEND_ORIGIN = SHARED_BACKEND_ORIGIN;
export const TV_API_BASE = `${API_BASE_URL}/tv`;

export const resolveTvPosterUrl = resolveBackendAssetUrl;

export const TV_KIND_META = {
  anime: {
    key: 'anime',
    label: 'Anime',
    icon: '⛩️',
    badgeClass: 'bg-pink-500/20 border-pink-500/45 text-pink-200',
    scoreLabel: 'MAL',
  },
  series: {
    key: 'series',
    label: 'Série',
    icon: '📺',
    badgeClass: 'bg-purple-500/20 border-purple-500/45 text-purple-200',
    scoreLabel: 'IMDb',
  },
  dorama: {
    key: 'dorama',
    label: 'Dorama',
    icon: '🌸',
    badgeClass: 'bg-rose-500/20 border-rose-500/45 text-rose-200',
    scoreLabel: 'IMDb',
  },
};

export const TV_STATUS_META = {
  watching: {
    key: 'watching',
    label: 'Assistindo',
    icon: '▶️',
    badgeClass: 'bg-sky-500/20 border-sky-400/50 text-sky-200',
  },
  completed: {
    key: 'completed',
    label: 'Concluída',
    icon: '✅',
    badgeClass: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200',
  },
  on_hold: {
    key: 'on_hold',
    label: 'Hiato (Pausei)',
    icon: '⏸️',
    badgeClass: 'bg-amber-500/20 border-amber-400/50 text-amber-200',
  },
  dropped: {
    key: 'dropped',
    label: 'Dropada',
    icon: '✖️',
    badgeClass: 'bg-rose-500/20 border-rose-500/50 text-rose-300',
  },
};

export const TV_SEASON_TYPE_META = {
  tv: { label: 'TV', badge: 'bg-zinc-800 text-zinc-200 border-zinc-700' },
  ova: { label: 'OVA', badge: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40' },
  ona: { label: 'ONA', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/40' },
  special: { label: 'Especial', badge: 'bg-pink-500/15 text-pink-300 border-pink-500/40' },
};

export const MONTH_OPTIONS_PT = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Fev' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Abr' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Ago' },
  { value: 9, label: 'Set' },
  { value: 10, label: 'Out' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dez' },
];

export const STUDIO_TIER_META = {
  none: {
    key: 'none',
    label: 'Bloqueado',
    icon: '🔒',
    tcgRank: 'N',
    neonClass: '',
    auraLabel: 'Estúdio Silencioso',
    difficultyHint: 'Nenhum anime concluído',
    badgeClass: 'bg-zinc-900 border-zinc-800 text-zinc-500',
    cardClass: 'bg-zinc-900/45 border-zinc-800/80',
    barClass: 'bg-zinc-700',
  },
  bronze: {
    key: 'bronze',
    label: 'Bronze',
    icon: '🥉',
    tcgRank: 'R',
    neonClass: 'studio-neon-bronze border-amber-600/80',
    auraLabel: 'Forja de Bronze',
    difficultyHint: 'Dificuldade: Inicial (1 obra)',
    badgeClass: 'bg-amber-700/25 border-amber-600/60 text-amber-300',
    cardClass: 'bg-gradient-to-br from-amber-900/20 via-zinc-900/85 to-zinc-950 border-amber-700/55',
    barClass: 'bg-gradient-to-r from-amber-700 to-orange-400',
  },
  silver: {
    key: 'silver',
    label: 'Prata',
    icon: '🥈',
    tcgRank: 'SR',
    neonClass: 'studio-neon-silver border-slate-300/85',
    auraLabel: 'Platina Gélida',
    difficultyHint: 'Dificuldade: Regular (3 obras)',
    badgeClass: 'bg-slate-400/20 border-slate-300/60 text-slate-200',
    cardClass: 'bg-gradient-to-br from-slate-400/15 via-zinc-900/85 to-zinc-950 border-slate-400/55',
    barClass: 'bg-gradient-to-r from-slate-400 to-zinc-200',
  },
  epic: {
    key: 'epic',
    label: 'Épico',
    icon: '🔮',
    tcgRank: 'SSR',
    neonClass: 'studio-neon-epic border-purple-400',
    auraLabel: 'Ki Arcano Roxo',
    difficultyHint: 'Dificuldade: Veterano (5 obras)',
    badgeClass: 'bg-purple-500/25 border-purple-400/75 text-purple-200',
    cardClass: 'bg-gradient-to-br from-purple-600/20 via-fuchsia-950/25 to-zinc-950 border-purple-500/65 shadow-lg shadow-purple-500/15',
    barClass: 'bg-gradient-to-r from-purple-500 to-fuchsia-400',
  },
  gold: {
    key: 'gold',
    label: 'Ouro',
    icon: '🥇',
    tcgRank: 'UR',
    neonClass: 'studio-neon-gold border-yellow-300',
    auraLabel: 'Super Saiyajin 24K',
    difficultyHint: 'Dificuldade: Mestre (10 obras)',
    badgeClass: 'bg-yellow-500/25 border-yellow-400/75 text-yellow-200',
    cardClass: 'bg-gradient-to-br from-yellow-500/18 via-amber-950/20 to-zinc-950 border-yellow-400/70 shadow-lg shadow-yellow-500/15',
    barClass: 'bg-gradient-to-r from-yellow-500 to-amber-300',
  },
  mythic: {
    key: 'mythic',
    label: 'Mítico',
    icon: '🩸',
    tcgRank: 'MYTHIC',
    neonClass: 'studio-neon-mythic border-red-500',
    auraLabel: 'Bankai Carmesim Lendária',
    difficultyHint: 'Dificuldade: Suprema (17 obras)',
    badgeClass: 'bg-red-500/25 border-red-400/80 text-red-100',
    cardClass: 'bg-gradient-to-br from-red-600/20 via-rose-950/30 to-zinc-950 border-red-500/75 shadow-xl shadow-red-500/20',
    barClass: 'bg-gradient-to-r from-red-600 via-rose-500 to-orange-400',
  },
};

export async function fetchTvVoiceAlbum() {
  const res = await axios.get(`${TV_API_BASE}/voice-album`);
  return res.data;
}

export async function syncTvVoiceAlbum() {
  const res = await axios.post(`${TV_API_BASE}/voice-album/sync`);
  return res.data;
}

export async function stickTvVoiceSticker(voiceId) {
  const res = await axios.post(`${TV_API_BASE}/voice-album/${encodeURIComponent(voiceId)}/stick`);
  return res.data;
}

export async function unstickTvVoiceSticker(voiceId) {
  const res = await axios.post(`${TV_API_BASE}/voice-album/${encodeURIComponent(voiceId)}/unstick`);
  return res.data;
}

export async function stickAllTvVoiceStickers() {
  const res = await axios.post(`${TV_API_BASE}/voice-album/stick-all`);
  return res.data;
}

export async function openTvVoicePack(packId) {
  const res = await axios.post(`${TV_API_BASE}/voice-album/packs/${packId}/open`);
  return res.data;
}

export async function updateTvVoicePreferences(voiceId, prefs) {
  const res = await axios.patch(
    `${TV_API_BASE}/voice-album/${encodeURIComponent(voiceId)}/preferences`,
    prefs
  );
  return res.data;
}

export async function uploadTvVoiceCustomSkin(voiceId, { file, url, label }) {
  if (file) {
    const fd = new FormData();
    fd.append('skin_file', file);
    if (label) fd.append('skin_label', label);
    const res = await axios.post(
      `${TV_API_BASE}/voice-album/${encodeURIComponent(voiceId)}/custom-skin`,
      fd
    );
    return res.data;
  }
  const res = await axios.post(
    `${TV_API_BASE}/voice-album/${encodeURIComponent(voiceId)}/custom-skin`,
    { skinUrl: url, skinLabel: label }
  );
  return res.data;
}

export function formatMonthYearPt(month, year) {
  if (!month && !year) return null;
  const mObj = MONTH_OPTIONS_PT.find((m) => m.value === Number(month));
  if (mObj && year) return `${mObj.label}/${year}`;
  if (year) return String(year);
  return mObj ? mObj.label : null;
}

export async function fetchTvCatalog() {
  const res = await axios.get(`${TV_API_BASE}/shows`);
  return res.data;
}

export async function fetchTvStats() {
  const res = await axios.get(`${TV_API_BASE}/stats`);
  return res.data?.data;
}

export async function fetchTvStudiosLeague() {
  const res = await axios.get(`${TV_API_BASE}/studios-league`);
  return res.data;
}

export async function searchTvExternal(source, q, year) {
  const res = await axios.get(`${TV_API_BASE}/search`, {
    params: { source, q, ...(year ? { year } : {}) },
  });
  return res.data?.data || [];
}

export async function fetchTvExternalDetails(source, id) {
  const res = await axios.get(`${TV_API_BASE}/details`, {
    params: { source, id },
  });
  return res.data?.data;
}

export async function fetchJikanSeasonDetails(malId, seasonNumber) {
  const res = await axios.get(`${TV_API_BASE}/jikan/season/${malId}`, {
    params: { seasonNumber },
  });
  return res.data?.data;
}

export async function saveTvShow(showId, formPayload, posterFile) {
  const fd = new FormData();
  const jsonKeys = new Set(['seasons', 'studios', 'genres', 'demographics', 'themes', 'creators', 'directors', 'raw_api_data']);

  Object.entries(formPayload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) {
      fd.append(key, '');
      return;
    }
    if (jsonKeys.has(key)) {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, String(value));
    }
  });

  if (posterFile) {
    fd.append('poster_file', posterFile);
  }

  if (showId) {
    const res = await axios.put(`${TV_API_BASE}/shows/${showId}`, fd);
    return res.data;
  }
  const res = await axios.post(`${TV_API_BASE}/shows`, fd);
  return res.data;
}

export async function patchSeasonProgress(seasonId, payload) {
  const res = await axios.patch(`${TV_API_BASE}/seasons/${seasonId}/progress`, payload);
  return res.data;
}

export async function appendSeasonToTvShow(showId, season, studios = []) {
  const res = await axios.post(`${TV_API_BASE}/shows/${showId}/seasons`, { season, studios });
  return res.data;
}

export async function deleteTvShowById(showId) {
  const res = await axios.delete(`${TV_API_BASE}/shows/${showId}`);
  return res.data;
}
