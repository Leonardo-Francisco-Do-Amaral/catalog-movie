/**
 * Canonical normalization for movie watch platforms and audio types.
 * Prevents duplicate platform variants (e.g. "Disney +" vs "Disney+", "HBO MAX" vs "Max")
 * from inflating distinct platform counts or failing platform trophies.
 */

/**
 * Returns the canonical platform name for trophy evaluation and import sanitization,
 * or `""` when the input is empty or "Não Informado".
 */
export function normalizeCanonicalPlatform(rawPlatform: unknown): string {
  const raw = String(rawPlatform ?? '').trim();
  if (!raw) return '';

  const compact = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  if (!compact || compact === 'naoinformado' || compact === 'na' || compact === 'null' || compact === 'undefined') {
    return '';
  }

  if (compact === 'cinema' || compact.includes('cinema')) return 'Cinema';
  if (compact === 'bluray' || compact === 'bd') return 'Blu-ray';
  if (compact === 'dvd') return 'DVD';
  if (compact === 'netflix') return 'Netflix';
  if (compact === 'primevideo' || compact === 'amazonprime' || compact === 'amazonprimevideo' || compact === 'prime') {
    return 'Prime Video';
  }
  if (compact === 'hbomax' || compact === 'max' || compact === 'hbo') return 'Max (HBO Max)';
  if (compact === 'disney' || compact === 'disneyplus') return 'Disney+';
  if (compact === 'star' || compact === 'starplus') return 'Star+';
  if (compact === 'appletv' || compact === 'appletvplus' || compact === 'appletv' || compact === 'aplletv' || compact === 'apple') {
    return 'Apple TV+';
  }
  if (compact === 'youtube' || compact === 'yt') return 'YouTube';
  if (compact === 'myfamilycine' || compact === 'mfc') return 'My Family Cine';
  if (compact === 'internet') return 'Internet';
  if (compact === 'globoplay') return 'Globoplay';
  if (compact === 'paramount' || compact === 'paramountplus') return 'Paramount+';
  if (compact === 'telecine') return 'Telecine';
  if (compact === 'mubi') return 'MUBI';
  if (compact === 'looke') return 'Looke';
  if (compact === 'tv' || compact === 'televisao') return 'TV';

  return raw;
}

export function isPhysicalMedia(canonicalOrRawPlat: string): boolean {
  const c = normalizeCanonicalPlatform(canonicalOrRawPlat);
  return c === 'Blu-ray' || c === 'DVD';
}

export function isCinema(canonicalOrRawPlat: string): boolean {
  return normalizeCanonicalPlatform(canonicalOrRawPlat) === 'Cinema';
}

export function isYouTube(canonicalOrRawPlat: string): boolean {
  return normalizeCanonicalPlatform(canonicalOrRawPlat) === 'YouTube';
}

export function isHboMax(canonicalOrRawPlat: string): boolean {
  return normalizeCanonicalPlatform(canonicalOrRawPlat) === 'Max (HBO Max)';
}

export function isNetflix(canonicalOrRawPlat: string): boolean {
  return normalizeCanonicalPlatform(canonicalOrRawPlat) === 'Netflix';
}

export function isInternet(canonicalOrRawPlat: string): boolean {
  return normalizeCanonicalPlatform(canonicalOrRawPlat) === 'Internet';
}

export function isPrimeVideo(canonicalOrRawPlat: string): boolean {
  return normalizeCanonicalPlatform(canonicalOrRawPlat) === 'Prime Video';
}

export function isMyFamilyCine(canonicalOrRawPlat: string): boolean {
  return normalizeCanonicalPlatform(canonicalOrRawPlat) === 'My Family Cine';
}

export function isOfficialStreaming(canonicalOrRawPlat: string): boolean {
  const c = normalizeCanonicalPlatform(canonicalOrRawPlat);
  return (
    c === 'Netflix' ||
    c === 'Prime Video' ||
    c === 'Max (HBO Max)' ||
    c === 'Disney+' ||
    c === 'Star+' ||
    c === 'Apple TV+'
  );
}

export function isFreeStreaming(canonicalOrRawPlat: string): boolean {
  const c = normalizeCanonicalPlatform(canonicalOrRawPlat);
  return c === 'Internet' || c === 'My Family Cine' || c === 'YouTube';
}

export function isInternetOrMfc(canonicalOrRawPlat: string): boolean {
  const c = normalizeCanonicalPlatform(canonicalOrRawPlat);
  return c === 'Internet' || c === 'My Family Cine';
}

export function normalizeAudioType(rawAudio: unknown): string {
  return String(rawAudio ?? '').trim().toLowerCase();
}

export function isDubbed(audio: string): boolean {
  return audio.toLowerCase().includes('dublado');
}

export function isSubtitled(audio: string): boolean {
  return audio.toLowerCase().includes('legendado');
}

export function isOriginalAudio(audio: string): boolean {
  const a = audio.toLowerCase().trim();
  return a === 'original' || a.includes('idioma original');
}

export function isYouTubeSubtitled(canonicalOrRawPlat: string, audio: string): boolean {
  const a = audio.toLowerCase();
  return a.includes('legendado pelo youtube') || (isYouTube(canonicalOrRawPlat) && a.includes('legendado'));
}
