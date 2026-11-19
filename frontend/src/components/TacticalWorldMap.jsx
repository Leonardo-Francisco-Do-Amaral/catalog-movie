import React, { useState, useEffect, useMemo, useRef } from 'react';
import { resolveBackendAssetUrl } from '../utils/apiConfig';
import {
  Plus,
  Minus,
  RotateCcw,
  Crosshair,
  Star,
  Pin,
  Target,
  Lock,
  Compass,
  Flag,
  Film
} from 'lucide-react';
import { UN_COUNTRIES_195, HISTORICAL_TERRITORIES } from '../data/unCountries195';
import { getRarityMeta, resolveValidIsoFlagCode } from '../data/countryRarityTiers';
import {
  SOVIET_REPUBLIC_CODES,
  CZECHOSLOVAKIA_CODES,
  YUGOSLAVIA_CODES,
  WW2_ALLIES_CODES,
  WW2_AXIS_CODES,
  WW2_AXIS_PRINCIPAL_CODES,
  COLD_WAR_NATO_WEST_CODES,
  COLD_WAR_WARSAW_OTHER_CODES,
  COLD_WAR_5_RELICS,
  resolveTimelineTargetTerritory
} from '../data/mapTimelinesConfig';

const MAP_W = 1200;
const MAP_H = 640; // Proporção otimizada para máxima amplitude dos hemisférios Sul e Norte

// Converte Longitude/Latitude para coordenadas do plano tático sem cortar o Cone Sul (Uruguai, Chile, Argentina)
function projectPoint(lon, lat) {
  const x = ((lon + 180) / 360) * MAP_W;
  const clampedLat = Math.max(-58, Math.min(82, lat));
  // Margem superior de 25px e margem inferior de 85px para todo o globo respirar acima da legenda
  const y = 25 + ((82 - clampedLat) / (82 - -58)) * (MAP_H - 110);
  return [x, y];
}

// Converte geometria GeoJSON (Polygon / MultiPolygon) em path SVG evitando linhas cruzando o antimeridiano (±180°)
function geometryToSvgPath(geometry) {
  if (!geometry || !geometry.coordinates) return '';
  const polygons =
    geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

  const parts = [];
  for (const poly of polygons) {
    for (const ring of poly) {
      if (!ring || ring.length < 3) continue;
      let prevLon = null;
      let countInRing = 0;
      for (let i = 0; i < ring.length; i++) {
        const [lon, lat] = ring[i];
        if (lat < -62) continue;
        const [x, y] = projectPoint(lon, lat);
        const cmd =
          countInRing === 0 || Math.abs(lon - prevLon) > 170 ? 'M' : 'L';
        parts.push(`${cmd}${x.toFixed(1)},${y.toFixed(1)}`);
        prevLon = lon;
        countInRing++;
      }
      if (countInRing >= 3) {
        parts.push('Z');
      }
    }
  }
  return parts.join(' ').trim();
}

const removeAccents = (str) =>
  str
    ? String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    : '';

const resolvePosterUrl = resolveBackendAssetUrl;

// Presets de câmera tática por continente (calibrados para altura 640)
const CONTINENT_CAMERAS = {
  Todos: { cx: 600, cy: 305, zoom: 1.0 },
  Américas: { cx: 335, cy: 340, zoom: 1.65 },
  Europa: { cx: 645, cy: 165, zoom: 3.2 },
  Ásia: { cx: 885, cy: 245, zoom: 1.9 },
  África: { cx: 660, cy: 345, zoom: 2.0 },
  Oceania: { cx: 1055, cy: 425, zoom: 2.3 }
};

// Microestados, ilhas e territórios pequenos que ganham beacon tático dedicado
const MICROSTATE_CODES = new Set([
  'uy', // Uruguai (destaque garantido com beacon de clique fácil)
  'va', 'mc', 'sm', 'li', 'ad', 'mt', 'lu',
  'sg', 'bh', 'mv', 'qa',
  'sc', 'mu', 'km', 'cv', 'st',
  'ag', 'kn', 'dm', 'lc', 'vc', 'gd', 'bb', 'tt', 'bs',
  'pw', 'nr', 'tv', 'mh', 'fm', 'ki', 'to', 'ws', 'fj', 'vu', 'sb',
  'spec_hk', 'spec_mo', 'spec_pr', 'spec_fo', 'spec_tb', 'spec_ku',
  'spec_pf', 'spec_mq', 'spec_gp', 'spec_re', 'spec_cw', 'spec_aw',
  'spec_im', 'spec_bm', 'spec_gi', 'spec_ck', 'spec_gu', 'spec_aq'
]);

const TIMELINE_WARP_THEMES = {
  modern: {
    ring: 'border-amber-400/75 shadow-[inset_0_0_95px_rgba(245,158,11,0.38)]',
    bg: 'from-amber-500/20 via-violet-950/35 to-cyan-500/20',
    badge: '⌛ ZA WARUDO! • ERA ATUAL',
    sublabel: 'Ponteiros em reverso • Retornando ao Atlas Moderno',
    durationMs: 2500,
    styleKind: 'za_warudo',
  },
  ww2: {
    ring: 'border-rose-500/85 shadow-[inset_0_0_115px_rgba(244,63,94,0.45)]',
    bg: 'from-amber-500/25 via-rose-950/40 to-black/50',
    badge: '⚔️ ZA WARUDO! • 2ª GUERRA (1939–1945)',
    sublabel: 'Relógios girando para trás • Fronteiras da Grande Guerra',
    durationMs: 2500,
    styleKind: 'za_warudo',
  },
  cold_war: {
    ring: 'border-cyan-400/75 shadow-[inset_0_0_110px_rgba(34,211,238,0.32)]',
    bg: 'from-cyan-500/18 via-emerald-950/28 to-slate-950/45',
    badge: '❄️ OCARINA DO TEMPO • GUERRA FRIA (1949–1991)',
    sublabel: '♫ Melodia dos Ventos • Folhas e notas no compasso da história',
    durationMs: 3600,
    styleKind: 'ocarina',
  },
  pioneers: {
    ring: 'border-yellow-500/75 shadow-[inset_0_0_100px_rgba(234,179,8,0.35)]',
    bg: 'from-amber-900/35 via-stone-900/40 to-black/50',
    badge: '🕯️ ROLO CLÁSSICO 35MM • ERA PIONEIRA (1895–1949)',
    sublabel: 'Projetor aceso • Voltando aos primórdios da Sétima Arte',
    durationMs: 2700,
    styleKind: 'pioneers',
  },
  relic_radar: {
    ring: 'border-teal-400/85 shadow-[inset_0_0_120px_rgba(45,212,191,0.4)]',
    bg: 'from-teal-500/22 via-indigo-950/38 to-rose-500/20',
    badge: '🌌 MULTIVERSO • RADAR RELÍQUIAS & MÍTICOS',
    sublabel: 'Varredura temporal ativa • Rastreando 30 Relíquias + 18 Míticos',
    durationMs: 2600,
    styleKind: 'radar',
  }
};

const ZA_WARUDO_CLOCKS = [
  { id: 'c_center', left: '50%', top: '50%', size: 230, delay: '0s', dur: '1.8s', opacity: 0.28, center: true },
  { id: 'c_tl', left: '16%', top: '24%', size: 88, delay: '0.08s', dur: '1.35s', opacity: 0.72 },
  { id: 'c_tr', left: '84%', top: '22%', size: 96, delay: '0.14s', dur: '1.5s', opacity: 0.68 },
  { id: 'c_ml', left: '11%', top: '66%', size: 68, delay: '0.2s', dur: '1.2s', opacity: 0.58 },
  { id: 'c_mr', left: '88%', top: '68%', size: 74, delay: '0.16s', dur: '1.3s', opacity: 0.62 },
  { id: 'c_bc', left: '34%', top: '80%', size: 62, delay: '0.12s', dur: '1.15s', opacity: 0.55 },
  { id: 'c_br', left: '68%', top: '79%', size: 66, delay: '0.22s', dur: '1.25s', opacity: 0.56 },
];

const OCARINA_LEAVES = [
  { id: 'lf1', startLeft: '6%', startTop: '72%', dur: '3.2s', delay: '0s', size: 22, color: '#34d399' },
  { id: 'lf2', startLeft: '14%', startTop: '45%', dur: '3.4s', delay: '0.2s', size: 18, color: '#67e8f9' },
  { id: 'lf3', startLeft: '24%', startTop: '82%', dur: '3.1s', delay: '0.35s', size: 24, color: '#5eead4' },
  { id: 'lf4', startLeft: '36%', startTop: '60%', dur: '3.5s', delay: '0.1s', size: 16, color: '#a7f3d0' },
  { id: 'lf5', startLeft: '48%', startTop: '84%', dur: '3.3s', delay: '0.45s', size: 20, color: '#6ee7b7' },
  { id: 'lf6', startLeft: '58%', startTop: '34%', dur: '3.1s', delay: '0.15s', size: 19, color: '#38bdf8' },
  { id: 'lf7', startLeft: '68%', startTop: '78%', dur: '3.4s', delay: '0.3s', size: 23, color: '#34d399' },
  { id: 'lf8', startLeft: '78%', startTop: '54%', dur: '3.0s', delay: '0.5s', size: 17, color: '#67e8f9' },
  { id: 'lf9', startLeft: '8%', startTop: '28%', dur: '3.5s', delay: '0.4s', size: 15, color: '#a7f3d0' },
  { id: 'lf10', startLeft: '44%', startTop: '24%', dur: '3.2s', delay: '0.25s', size: 20, color: '#2dd4bf' },
];

const OCARINA_NOTES = [
  { id: 'n1', glyph: '♪', left: '15%', top: '72%', dur: '3.0s', delay: '0.05s', size: 22, color: 'text-cyan-300' },
  { id: 'n2', glyph: '♫', left: '28%', top: '65%', dur: '3.3s', delay: '0.3s', size: 26, color: 'text-emerald-300' },
  { id: 'n3', glyph: '♬', left: '42%', top: '76%', dur: '3.1s', delay: '0.18s', size: 24, color: 'text-sky-300' },
  { id: 'n4', glyph: '♪', left: '57%', top: '74%', dur: '3.4s', delay: '0.42s', size: 21, color: 'text-teal-200' },
  { id: 'n5', glyph: '♫', left: '72%', top: '68%', dur: '3.2s', delay: '0.22s', size: 27, color: 'text-cyan-200' },
  { id: 'n6', glyph: '♬', left: '84%', top: '72%', dur: '3.0s', delay: '0.48s', size: 22, color: 'text-emerald-200' },
  { id: 'n7', glyph: '♪', left: '34%', top: '38%', dur: '2.9s', delay: '0.65s', size: 19, color: 'text-sky-200' },
  { id: 'n8', glyph: '♫', left: '64%', top: '34%', dur: '3.1s', delay: '0.55s', size: 20, color: 'text-emerald-300' },
];

function RetroClockDial({ clock, accentColor = '#fbbf24' }) {
  const { size, opacity, center } = clock;
  const ticks = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: clock.left,
        top: clock.top,
        width: size,
        height: size,
        opacity,
        animation: `${center ? 'warpClockPop' : 'warpClockFloat'} ${clock.dur} ease-out ${clock.delay} both`,
      }}
    >
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_0_16px_rgba(251,191,36,0.45)]">
        {/* Aro externo girando para trás */}
        <g style={{ transformOrigin: '60px 60px', animation: `warpGearRev ${clock.dur} cubic-bezier(0.22,0.85,0.36,1) ${clock.delay} infinite` }}>
          <circle cx="60" cy="60" r="54" fill="rgba(9,9,11,0.48)" stroke={accentColor} strokeWidth="2.5" strokeDasharray="8 5" />
          <circle cx="60" cy="60" r="46" fill="none" stroke={accentColor} strokeOpacity="0.45" strokeWidth="1.2" />
          {ticks.map((deg) => (
            <line
              key={deg}
              x1="60"
              y1="14"
              x2="60"
              y2="20"
              stroke={accentColor}
              strokeWidth={deg % 90 === 0 ? '2.6' : '1.4'}
              strokeLinecap="round"
              transform={`rotate(${deg} 60 60)`}
            />
          ))}
        </g>

        {/* Ponteiro das horas girando para trás */}
        <line
          x1="60"
          y1="60"
          x2="60"
          y2="34"
          stroke="#fda4af"
          strokeWidth="3.6"
          strokeLinecap="round"
          style={{
            transformOrigin: '60px 60px',
            animation: `warpClockHandSlowRev ${clock.dur} cubic-bezier(0.2,0.9,0.3,1) ${clock.delay} infinite`,
          }}
        />
        {/* Ponteiro dos minutos girando rápido para trás */}
        <line
          x1="60"
          y1="62"
          x2="60"
          y2="20"
          stroke="#fef08a"
          strokeWidth="2.4"
          strokeLinecap="round"
          style={{
            transformOrigin: '60px 60px',
            animation: `warpClockHandFastRev ${clock.dur} cubic-bezier(0.18,0.88,0.28,1) ${clock.delay} infinite`,
          }}
        />
        <circle cx="60" cy="60" r="4.5" fill={accentColor} />
      </svg>
    </div>
  );
}

export default function TacticalWorldMap({
  countries = [],
  historicalCountries = [],
  pioneerActiveCodes = null,
  mapTimelineMode = 'modern',
  timelineWarpKey = 0,
  selectedContinent = 'Todos',
  visibleCodesSet = null,
  onSelectCountry
}) {
  const [geoFeatures, setGeoFeatures] = useState([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [camera, setCamera] = useState(CONTINENT_CAMERAS.Todos);
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const [cursorCoords, setCursorCoords] = useState(null);
  const [isWarping, setIsWarping] = useState(false);

  const containerRef = useRef(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    startCx: 600,
    startCy: 305
  });

  // Dispara pulso visual da Fenda Temporal quando troca a linha do tempo (sincronizado com a música!)
  useEffect(() => {
    if (!timelineWarpKey) return undefined;
    setIsWarping(true);
    const themeDur = TIMELINE_WARP_THEMES[mapTimelineMode]?.durationMs || 2400;
    const t = setTimeout(() => setIsWarping(false), themeDur);
    return () => clearTimeout(t);
  }, [timelineWarpKey, mapTimelineMode]);

  // Mapa rápido combinando 195 Países + 30 Territórios Relíquia
  const countryByCode = useMemo(() => {
    const m = new Map();
    countries.forEach((c) => m.set(c.code, c));
    historicalCountries.forEach((h) => m.set(h.code, h));
    return m;
  }, [countries, historicalCountries]);

  // Índice universal para casar cada polígono do Natural Earth com ONU 195 OU Relíquias Especiais
  const geoLookup = useMemo(() => {
    const byExactIso3 = new Map();
    const byExactIso2 = new Map();
    const byExactName = new Map();

    // 1. Indexa primeiro territórios especiais (Hong Kong, Groenlândia, Macau, Faroé, Kosovo...)
    HISTORICAL_TERRITORIES.forEach((h) => {
      if (!h.isSpecialTerritory) return;
      if (h.iso3) byExactIso3.set(h.iso3.toUpperCase(), h.code);
      if (h.flagCode) byExactIso2.set(h.flagCode.toUpperCase(), h.code);
      byExactName.set(removeAccents(h.name), h.code);
      (h.aliases || []).forEach((al) => byExactName.set(removeAccents(al), h.code));
    });

    // 2. Indexa os 195 Países da ONU
    UN_COUNTRIES_195.forEach((c) => {
      byExactIso3.set(c.iso3.toUpperCase(), c.code);
      byExactIso2.set(c.code.toUpperCase(), c.code);
      byExactName.set(removeAccents(c.name), c.code);
      if (c.aliases) {
        c.aliases.forEach((al) => byExactName.set(removeAccents(al), c.code));
      }
    });

    return (props) => {
      if (!props) return null;

      // Prioriza código próprio do polígono (evita Groenlândia cair na Dinamarca via SOV_A3)
      const primaryIso3 = [props.ISO_A3, props.iso_a3, props.ADM0_A3, props.adm0_a3, props.GU_A3, props.gu_a3];
      for (const raw of primaryIso3) {
        if (raw && raw !== '-99') {
          const hit = byExactIso3.get(String(raw).toUpperCase());
          if (hit) return hit;
        }
      }

      const iso2Candidates = [props.ISO_A2, props.iso_a2, props.WB_A2, props.wb_a2];
      for (const raw of iso2Candidates) {
        if (raw && raw !== '-99') {
          const hit = byExactIso2.get(String(raw).toUpperCase());
          if (hit) return hit;
        }
      }

      const primaryNames = [props.NAME, props.name, props.NAME_LONG, props.name_long, props.ADMIN, props.admin, props.FORMAL_EN, props.formal_en];
      for (const raw of primaryNames) {
        if (raw) {
          const hit = byExactName.get(removeAccents(raw));
          if (hit) return hit;
        }
      }

      // Só recorre à soberania como último fallback
      const sovIso3 = [props.SOV_A3, props.sov_a3];
      for (const raw of sovIso3) {
        if (raw && raw !== '-99') {
          const hit = byExactIso3.get(String(raw).toUpperCase());
          if (hit) return hit;
        }
      }
      if (props.SOVEREIGNT || props.sovereignt) {
        const hit = byExactName.get(removeAccents(props.SOVEREIGNT || props.sovereignt));
        if (hit) return hit;
      }

      return null;
    };
  }, []);

  // Carrega malha vetorial 50m (com fallback automático para 110m)
  useEffect(() => {
    let cancelled = false;

    const loadGeoJson = async () => {
      setLoadingMap(true);
      const urls = [
        'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson',
        'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson'
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const json = await res.json();
          if (!cancelled && json?.features) {
            setGeoFeatures(json.features);
            setLoadingMap(false);
            return;
          }
        } catch {
          // Tenta próximo espelho
        }
      }
      if (!cancelled) setLoadingMap(false);
    };

    loadGeoJson();
    return () => {
      cancelled = true;
    };
  }, []);

  // Ajusta câmera automaticamente ao trocar o filtro de Continente no HUD
  useEffect(() => {
    const preset = CONTINENT_CAMERAS[selectedContinent] || CONTINENT_CAMERAS.Todos;
    setCamera(preset);
  }, [selectedContinent]);

  // Pré-calcula os paths SVG e quais territórios possuem polígono mapeado
  const { renderedPaths, polygonCodes } = useMemo(() => {
    const paths = [];
    const matched = new Set();

    geoFeatures.forEach((feat, idx) => {
      const d = geometryToSvgPath(feat.geometry);
      if (!d) return;
      const code = geoLookup(feat.properties);
      if (code) matched.add(code);
      paths.push({
        id: `geo-${idx}-${code || 'neutral'}`,
        d,
        code
      });
    });

    return { renderedPaths: paths, polygonCodes: matched };
  }, [geoFeatures, geoLookup]);

  // Beacons táticos adaptativos conforme a Linha do Tempo ativa
  const tacticalBeacons = useMemo(() => {
    if (mapTimelineMode === 'cold_war') {
      const baseBeacons = countries.filter(
        (c) =>
          (MICROSTATE_CODES.has(c.code) || !polygonCodes.has(c.code)) &&
          !SOVIET_REPUBLIC_CODES.has(c.code) &&
          !YUGOSLAVIA_CODES.has(c.code)
      );
      const coldWarPins = COLD_WAR_5_RELICS.map((code) => countryByCode.get(code)).filter(Boolean);
      return [...baseBeacons, ...coldWarPins];
    }

    if (mapTimelineMode === 'relic_radar') {
      const relicPins = historicalCountries.filter(
        (h) => h.lat != null && h.lon != null && (h.isSpecialTerritory || h.status === 'conquered')
      );
      const mythicPins = countries.filter(
        (c) => c.rarityTier === 'mythic' && (MICROSTATE_CODES.has(c.code) || !polygonCodes.has(c.code))
      );
      return [...relicPins, ...mythicPins];
    }

    const baseUnBeacons = countries.filter(
      (c) => MICROSTATE_CODES.has(c.code) || !polygonCodes.has(c.code)
    );
    const specialRelicBeacons = historicalCountries.filter(
      (h) =>
        h.isSpecialTerritory &&
        h.lat != null &&
        h.lon != null &&
        (MICROSTATE_CODES.has(h.code) || !polygonCodes.has(h.code))
    );
    return [...baseUnBeacons, ...specialRelicBeacons];
  }, [countries, historicalCountries, polygonCodes, mapTimelineMode, countryByCode]);

  // Calcula viewBox atual a partir de camera { cx, cy, zoom }
  const viewW = MAP_W / camera.zoom;
  const viewH = MAP_H / camera.zoom;
  const minX = Math.max(0, Math.min(MAP_W - viewW, camera.cx - viewW / 2));
  const minY = Math.max(0, Math.min(MAP_H - viewH, camera.cy - viewH / 2));

  // Zoom EXCLUSIVO pelos botões de controle (+ / -) — scroll da roda do mouse livre para rolar a página!
  const handleZoom = (factor) => {
    setCamera((prev) => ({
      ...prev,
      zoom: Math.max(1.0, Math.min(8.0, Number((prev.zoom * factor).toFixed(2))))
    }));
  };

  const handleResetCamera = () => {
    setCamera(CONTINENT_CAMERAS[selectedContinent] || CONTINENT_CAMERAS.Todos);
  };

  const startPanDrag = (clientX, clientY) => {
    dragRef.current = {
      active: true,
      moved: false,
      startX: clientX,
      startY: clientY,
      startCx: camera.cx,
      startCy: camera.cy
    };
  };

  const movePanDrag = (clientX, clientY, updateCursor = true) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (updateCursor) {
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const svgX = minX + (localX / rect.width) * viewW;
      const svgY = minY + (localY / rect.height) * viewH;
      const lon = ((svgX / MAP_W) * 360 - 180).toFixed(1);
      const lat = (83 - (svgY / MAP_H) * (83 - -60)).toFixed(1);
      setCursorCoords({ lat, lon, x: localX, y: localY, width: rect.width, height: rect.height });
    }

    if (dragRef.current.active) {
      const dx = clientX - dragRef.current.startX;
      const dy = clientY - dragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragRef.current.moved = true;
      }
      const scaleX = viewW / rect.width;
      const scaleY = viewH / rect.height;
      setCamera((prev) => ({
        ...prev,
        cx: Math.max(viewW / 2, Math.min(MAP_W - viewW / 2, dragRef.current.startCx - dx * scaleX)),
        cy: Math.max(viewH / 2, Math.min(MAP_H - viewH / 2, dragRef.current.startCy - dy * scaleY))
      }));
    }
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    startPanDrag(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    movePanDrag(e.clientX, e.clientY, true);
  };

  const handleMouseUp = () => {
    dragRef.current.active = false;
  };

  // Suporte a pan por toque (arraste em telas touch quando em zoom > 1x sem travar o scroll vertical em 1x)
  const handleTouchStart = (e) => {
    if (camera.zoom <= 1.01 || e.touches.length !== 1) return;
    const t = e.touches[0];
    startPanDrag(t.clientX, t.clientY);
  };

  const handleTouchMove = (e) => {
    if (!dragRef.current.active || e.touches.length !== 1) return;
    const t = e.touches[0];
    movePanDrag(t.clientX, t.clientY, false);
  };

  const handleTouchEnd = () => {
    dragRef.current.active = false;
  };

  const getCountryVisualStyle = (rawCode, country, isHovered) => {
    if (!country) {
      return {
        fill: '#0b0f17',
        stroke: '#182030',
        strokeWidth: 0.45 / Math.sqrt(camera.zoom),
        opacity: 0.45
      };
    }

    const isFilteredIn = !visibleCodesSet || visibleCodesSet.has(country.code) || (rawCode && visibleCodesSet.has(rawCode));
    const baseOpacity = isFilteredIn ? 1 : 0.16;
    const rarityMeta = getRarityMeta(country.rarityTier || country.code);

    // 1. MODO SEGUNDA GUERRA MUNDIAL (1939–1945)
    if (mapTimelineMode === 'ww2') {
      const c = String(rawCode || country.code).toLowerCase();
      const isSoviet = c === 'hist_su' || SOVIET_REPUBLIC_CODES.has(c);
      const isAlly = WW2_ALLIES_CODES.has(c);
      const isAxis = WW2_AXIS_CODES.has(c);
      const isPrincipalAxis = WW2_AXIS_PRINCIPAL_CODES.has(c);
      const isConquered = country.status === 'conquered';

      if (isSoviet) {
        return {
          fill: isConquered
            ? isHovered
              ? 'rgba(220, 38, 38, 0.78)'
              : 'rgba(185, 28, 28, 0.56)'
            : isHovered
              ? 'rgba(127, 29, 29, 0.5)'
              : 'rgba(69, 10, 10, 0.42)',
          stroke: isHovered ? '#fde047' : '#f59e0b',
          strokeWidth: (isHovered ? 1.5 : 0.85) / Math.sqrt(camera.zoom),
          opacity: baseOpacity
        };
      }
      if (isAxis) {
        return {
          fill: isConquered
            ? isHovered
              ? 'rgba(244, 63, 94, 0.85)'
              : isPrincipalAxis
                ? 'rgba(225, 29, 72, 0.62)'
                : 'rgba(190, 18, 60, 0.45)'
            : isHovered
              ? 'rgba(136, 19, 55, 0.55)'
              : 'rgba(63, 12, 28, 0.42)',
          stroke: isHovered ? '#fda4af' : isPrincipalAxis ? '#fb7185' : '#9f1239',
          strokeWidth: (isHovered ? 1.55 : isPrincipalAxis ? 1.05 : 0.65) / Math.sqrt(camera.zoom),
          opacity: baseOpacity
        };
      }
      if (isAlly) {
        return {
          fill: isConquered
            ? isHovered
              ? 'rgba(56, 189, 248, 0.78)'
              : 'rgba(14, 165, 233, 0.50)'
            : isHovered
              ? 'rgba(30, 58, 138, 0.52)'
              : 'rgba(15, 35, 70, 0.45)',
          stroke: isHovered ? '#bae6fd' : isConquered ? '#38bdf8' : '#1e40af',
          strokeWidth: (isHovered ? 1.5 : 0.8) / Math.sqrt(camera.zoom),
          opacity: baseOpacity
        };
      }
      return {
        fill: isConquered
          ? isHovered
            ? 'rgba(148, 163, 184, 0.5)'
            : 'rgba(100, 116, 139, 0.34)'
          : 'url(#fogOfWarHatch)',
        stroke: isHovered ? '#cbd5e1' : '#334155',
        strokeWidth: (isHovered ? 1.2 : 0.5) / Math.sqrt(camera.zoom),
        opacity: baseOpacity * 0.85
      };
    }

    // 2. MODO GUERRA FRIA (1949–1991): URSS + Alemanha Dividida + Iugoslávia + Checoslováquia
    if (mapTimelineMode === 'cold_war') {
      const c = String(rawCode || country.code).toLowerCase();
      if (c === 'de') {
        return {
          fill: 'url(#dividedGermanyGrad)',
          stroke: isHovered ? '#fde047' : '#38bdf8',
          strokeWidth: (isHovered ? 1.7 : 1.05) / Math.sqrt(camera.zoom),
          opacity: baseOpacity
        };
      }
      if (c === 'hist_su' || SOVIET_REPUBLIC_CODES.has(c)) {
        const isConquered = country.status === 'conquered';
        return {
          fill: isConquered
            ? isHovered
              ? 'rgba(220, 38, 38, 0.80)'
              : 'rgba(185, 28, 28, 0.60)'
            : 'rgba(69, 10, 10, 0.45)',
          stroke: isHovered ? '#fef08a' : '#f59e0b',
          strokeWidth: (isHovered ? 1.6 : 0.9) / Math.sqrt(camera.zoom),
          opacity: baseOpacity
        };
      }
      if (CZECHOSLOVAKIA_CODES.has(c) || YUGOSLAVIA_CODES.has(c)) {
        const isConquered = country.status === 'conquered';
        return {
          fill: isConquered
            ? isHovered
              ? 'rgba(45, 212, 191, 0.82)'
              : 'rgba(20, 184, 166, 0.56)'
            : isHovered
              ? 'rgba(17, 94, 89, 0.6)'
              : 'rgba(19, 78, 74, 0.35)',
          stroke: isHovered ? '#fef08a' : '#2dd4bf',
          strokeWidth: (isHovered ? 1.55 : 1.0) / Math.sqrt(camera.zoom),
          opacity: baseOpacity
        };
      }
      if (COLD_WAR_WARSAW_OTHER_CODES.has(c)) {
        const isConquered = country.status === 'conquered';
        return {
          fill: isConquered
            ? isHovered
              ? 'rgba(249, 115, 22, 0.72)'
              : 'rgba(194, 65, 12, 0.48)'
            : isHovered
              ? 'rgba(124, 45, 18, 0.55)'
              : 'rgba(67, 20, 7, 0.40)',
          stroke: isHovered ? '#fdba74' : '#ea580c',
          strokeWidth: (isHovered ? 1.4 : 0.75) / Math.sqrt(camera.zoom),
          opacity: baseOpacity
        };
      }
      if (COLD_WAR_NATO_WEST_CODES.has(c)) {
        const isConquered = country.status === 'conquered';
        return {
          fill: isConquered
            ? isHovered
              ? 'rgba(34, 211, 238, 0.72)'
              : 'rgba(6, 182, 212, 0.44)'
            : isHovered
              ? 'rgba(22, 78, 99, 0.55)'
              : 'rgba(12, 45, 65, 0.38)',
          stroke: isHovered ? '#cffafe' : '#22d3ee',
          strokeWidth: (isHovered ? 1.4 : 0.7) / Math.sqrt(camera.zoom),
          opacity: baseOpacity
        };
      }
      return {
        fill: country.status === 'conquered' ? 'rgba(100, 116, 139, 0.35)' : 'url(#fogOfWarHatch)',
        stroke: isHovered ? '#94a3b8' : '#1e293b',
        strokeWidth: (isHovered ? 1.2 : 0.5) / Math.sqrt(camera.zoom),
        opacity: baseOpacity * 0.85
      };
    }

    // 3. BÔNUS 1 — ERA DOS PIONEIROS / CINEMA MUDO (< 1950)
    if (mapTimelineMode === 'pioneers') {
      const c = String(country.code || '').toLowerCase();
      const hasClassic = Boolean(pioneerActiveCodes?.has(c) || (rawCode && pioneerActiveCodes?.has(rawCode)));
      if (hasClassic) {
        return {
          fill: isHovered ? 'rgba(245, 158, 11, 0.82)' : 'rgba(217, 119, 6, 0.56)',
          stroke: isHovered ? '#fef3c7' : '#fbbf24',
          strokeWidth: (isHovered ? 1.6 : 0.95) / Math.sqrt(camera.zoom),
          opacity: baseOpacity
        };
      }
      return {
        fill: isHovered ? 'rgba(120, 113, 108, 0.42)' : '#141210',
        stroke: isHovered ? '#d6d3d1' : '#292524',
        strokeWidth: (isHovered ? 1.2 : 0.5) / Math.sqrt(camera.zoom),
        opacity: baseOpacity * 0.72
      };
    }

    // 4. BÔNUS 2 — LENTE MULTIVERSO (RADAR DE RELÍQUIAS & MÍTICOS)
    if (mapTimelineMode === 'relic_radar') {
      const isTargetRarity = rarityMeta.key === 'relic' || rarityMeta.key === 'mythic';
      if (!isTargetRarity) {
        return {
          fill: isHovered ? 'rgba(30, 41, 59, 0.45)' : '#070b14',
          stroke: isHovered ? '#475569' : '#111827',
          strokeWidth: (isHovered ? 1.0 : 0.4) / Math.sqrt(camera.zoom),
          opacity: baseOpacity * 0.45
        };
      }
      if (country.status === 'conquered') {
        return {
          fill: isHovered ? rarityMeta.mapHoverFill : rarityMeta.mapFill,
          stroke: isHovered ? rarityMeta.mapHoverStroke : rarityMeta.mapStroke,
          strokeWidth: (isHovered ? 1.8 : 1.15) / Math.sqrt(camera.zoom),
          opacity: 1
        };
      }
      return {
        fill: isHovered
          ? rarityMeta.key === 'relic'
            ? 'rgba(20, 184, 166, 0.52)'
            : 'rgba(244, 63, 94, 0.52)'
          : rarityMeta.key === 'relic'
            ? 'rgba(19, 78, 74, 0.45)'
            : 'rgba(136, 19, 55, 0.45)',
        stroke: rarityMeta.key === 'relic' ? '#2dd4bf' : '#fb7185',
        strokeWidth: (isHovered ? 1.5 : 0.85) / Math.sqrt(camera.zoom),
        strokeDasharray: `${2.5 / Math.sqrt(camera.zoom)},${1.5 / Math.sqrt(camera.zoom)}`,
        opacity: 0.95
      };
    }

    // 5. MODO PADRÃO (ATLAS MODERNO — 6 TIERS DE RARIDADE)
    if (country.status === 'conquered') {
      return {
        fill: isHovered ? rarityMeta.mapHoverFill : rarityMeta.mapFill,
        stroke: isHovered ? rarityMeta.mapHoverStroke : rarityMeta.mapStroke,
        strokeWidth: (isHovered ? 1.55 : 0.9) / Math.sqrt(camera.zoom),
        opacity: baseOpacity
      };
    }

    if (country.status === 'wishlist') {
      return {
        fill: isHovered ? 'rgba(245, 158, 11, 0.36)' : 'rgba(245, 158, 11, 0.14)',
        stroke: isHovered ? '#fbbf24' : '#d97706',
        strokeWidth: (isHovered ? 1.4 : 0.8) / Math.sqrt(camera.zoom),
        strokeDasharray: `${2.5 / Math.sqrt(camera.zoom)},${1.8 / Math.sqrt(camera.zoom)}`,
        opacity: baseOpacity
      };
    }

    // Fog of War (Névoa de Guerra) — destaque sutil para Míticos e Relíquias
    const isMythic = rarityMeta.key === 'mythic';
    const isRelic = rarityMeta.key === 'relic';
    return {
      fill: isHovered
        ? isMythic
          ? 'rgba(136, 19, 55, 0.55)'
          : isRelic
            ? 'rgba(17, 94, 89, 0.58)'
            : 'rgba(51, 65, 85, 0.65)'
        : 'url(#fogOfWarHatch)',
      stroke: isHovered ? (isMythic ? '#fb7185' : isRelic ? '#2dd4bf' : '#94a3b8') : isRelic ? '#134e4a' : '#1e293b',
      strokeWidth: (isHovered ? 1.25 : 0.55) / Math.sqrt(camera.zoom),
      opacity: baseOpacity
    };
  };

  const hoveredCountry = hoveredInfo ? countryByCode.get(hoveredInfo) : null;
  const hoveredRarity = hoveredCountry
    ? getRarityMeta(hoveredCountry.rarityTier || hoveredCountry.code)
    : null;
  const warpTheme = TIMELINE_WARP_THEMES[mapTimelineMode] || TIMELINE_WARP_THEMES.modern;
  const westGermanyConquered = countryByCode.get('hist_de_w')?.status === 'conquered';
  const eastGermanyConquered = countryByCode.get('hist_dd')?.status === 'conquered';

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseLeave={() => {
        dragRef.current.active = false;
        setHoveredInfo(null);
        setCursorCoords(null);
      }}
      style={{ touchAction: camera.zoom > 1.01 ? 'none' : 'pan-y' }}
      className="relative w-full h-[560px] sm:h-[680px] lg:h-[760px] xl:h-[820px] bg-[#050811] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] select-none cursor-grab active:cursor-grabbing"
    >
      {/* Cantoneiras Táticas HUD (War Room Frame) */}
      <div className="pointer-events-none absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-500/60 z-20" />
      <div className="pointer-events-none absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-500/60 z-20" />
      <div className="pointer-events-none absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-500/60 z-20" />
      <div className="pointer-events-none absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-500/60 z-20" />

      {/* Telemetria Superior Esquerda */}
      <div className="pointer-events-none absolute top-4 left-5 z-20 flex items-center gap-2.5 bg-zinc-950/85 border border-zinc-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl">
        <Compass className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
          Setor: <strong className="text-amber-400">{selectedContinent}</strong>
        </span>
        <span className="text-zinc-700">•</span>
        <span className="text-[10px] font-mono text-cyan-400">
          ZOOM {camera.zoom.toFixed(1)}x
        </span>
        {cursorCoords && (
          <>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
              {cursorCoords.lat}°, {cursorCoords.lon}°
            </span>
          </>
        )}
      </div>

      {/* Controles Exclusivos de Zoom (+ / -) e Reset (Topo Direito) */}
      <div className="absolute top-4 right-5 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleZoom(1.35)}
          title="Aproximar Mapa (+)"
          className="bg-zinc-950/90 hover:bg-zinc-800 text-zinc-200 hover:text-amber-400 p-2 rounded-xl border border-zinc-700/90 transition-all cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(1 / 1.35)}
          title="Afastar Mapa (-)"
          className="bg-zinc-950/90 hover:bg-zinc-800 text-zinc-200 hover:text-amber-400 p-2 rounded-xl border border-zinc-700/90 transition-all cursor-pointer shadow-lg"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetCamera}
          title="Centralizar Setor"
          className="bg-zinc-950/90 hover:bg-zinc-800 text-zinc-200 hover:text-amber-400 p-2 rounded-xl border border-zinc-700/90 transition-all cursor-pointer shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Overlay Animado Temático por Era (Za Warudo / Ocarina do Tempo / 35mm / Radar) */}
      {isWarping && (
        <div
          key={`warp-${mapTimelineMode}-${timelineWarpKey}`}
          className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden bg-gradient-to-br ${warpTheme.bg} border-4 ${warpTheme.ring} backdrop-blur-[1.5px]`}
          style={{ animation: `warpFadeEnvelope ${(warpTheme.durationMs || 2500) / 1000}s ease-in-out forwards` }}
        >
          <style>{`
            @keyframes warpFadeEnvelope {
              0% { opacity: 0; }
              12% { opacity: 1; }
              80% { opacity: 1; }
              100% { opacity: 0; }
            }
            @keyframes warpShockRing {
              0% { transform: translate(-50%, -50%) scale(0.18); opacity: 0.95; }
              65% { opacity: 0.55; }
              100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
            }
            @keyframes warpClockHandFastRev {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(-1080deg); }
            }
            @keyframes warpClockHandSlowRev {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(-360deg); }
            }
            @keyframes warpGearRev {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(-180deg); }
            }
            @keyframes warpClockPop {
              0% { transform: translate(-50%, -50%) scale(0.45); opacity: 0; }
              20% { transform: translate(-50%, -50%) scale(1.06); opacity: 0.35; }
              100% { transform: translate(-50%, -50%) scale(0.96); opacity: 0.16; }
            }
            @keyframes warpClockFloat {
              0% { transform: translate(-50%, -50%) scale(0.5) rotate(12deg); opacity: 0; }
              20% { transform: translate(-50%, -50%) scale(1.04) rotate(-4deg); opacity: 0.85; }
              85% { transform: translate(-50%, -50%) scale(1) rotate(-14deg); opacity: 0.7; }
              100% { transform: translate(-50%, -50%) scale(0.85) rotate(-24deg); opacity: 0; }
            }
            @keyframes warpOcarinaLeaf {
              0% { transform: translate3d(-40px, 24px, 0) rotate(-35deg) scale(0.75); opacity: 0; }
              18% { opacity: 0.9; }
              55% { transform: translate3d(130px, -22px, 0) rotate(18deg) scale(1.05); opacity: 0.85; }
              100% { transform: translate3d(290px, -64px, 0) rotate(72deg) scale(0.8); opacity: 0; }
            }
            @keyframes warpOcarinaNoteFloat {
              0% { transform: translate3d(0, 26px, 0) scale(0.7); opacity: 0; }
              22% { transform: translate3d(18px, -10px, 0) scale(1.08); opacity: 0.95; }
              65% { transform: translate3d(-16px, -64px, 0) scale(1.0); opacity: 0.85; }
              100% { transform: translate3d(14px, -118px, 0) scale(0.82); opacity: 0; }
            }
            @keyframes warpOcarinaHaloSpin {
              0% { transform: translate(-50%, -50%) rotate(0deg) scale(0.86); opacity: 0.25; }
              50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.05); opacity: 0.55; }
              100% { transform: translate(-50%, -50%) rotate(360deg) scale(0.95); opacity: 0.2; }
            }
            @keyframes warpPioneerSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes warpRadarSweep {
              0% { transform: translate(-50%, -50%) rotate(0deg); }
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
          `}</style>

          {/* 1. ZA WARUDO: Múltiplos Relógios Girando Para Trás + Onda de Choque Temporal */}
          {warpTheme.styleKind === 'za_warudo' && (
            <>
              <div
                className={`absolute left-1/2 top-1/2 w-56 h-56 rounded-full border-4 ${
                  mapTimelineMode === 'ww2' ? 'border-rose-400/80' : 'border-amber-300/80'
                }`}
                style={{ animation: 'warpShockRing 1.35s cubic-bezier(0.16,1,0.3,1) forwards' }}
              />
              <div
                className="absolute left-1/2 top-1/2 w-56 h-56 rounded-full border-2 border-violet-400/70"
                style={{ animation: 'warpShockRing 1.75s cubic-bezier(0.16,1,0.3,1) 0.14s forwards' }}
              />
              {ZA_WARUDO_CLOCKS.map((clk) => (
                <RetroClockDial
                  key={clk.id}
                  clock={clk}
                  accentColor={mapTimelineMode === 'ww2' ? '#fb7185' : '#fbbf24'}
                />
              ))}
            </>
          )}

          {/* 2. OCARINA DO TEMPO: Ventos Suaves, Folhas Mágicas e Notas Musicais */}
          {warpTheme.styleKind === 'ocarina' && (
            <>
              {/* Halo etéreo suave ao centro */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 w-72 h-72 rounded-full border border-cyan-300/35 bg-radial from-emerald-400/15 via-cyan-400/5 to-transparent"
                style={{ animation: 'warpOcarinaHaloSpin 3.5s ease-in-out infinite' }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
                  <polygon points="50,14 68,46 32,46" fill="none" stroke="#34d399" strokeWidth="1.2" />
                  <polygon points="32,46 50,78 14,78" fill="none" stroke="#67e8f9" strokeWidth="1.2" />
                  <polygon points="68,46 86,78 50,78" fill="none" stroke="#67e8f9" strokeWidth="1.2" />
                </svg>
              </div>

              {/* Folhas sopradas pela brisa */}
              {OCARINA_LEAVES.map((lf) => (
                <svg
                  key={lf.id}
                  viewBox="0 0 32 32"
                  className="pointer-events-none absolute drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]"
                  style={{
                    left: lf.startLeft,
                    top: lf.startTop,
                    width: lf.size,
                    height: lf.size,
                    animation: `warpOcarinaLeaf ${lf.dur} ease-in-out ${lf.delay} both`,
                  }}
                >
                  <path
                    d="M5 24C6 12 15 5 27 5C27 17 20 26 8 27C6.8 27 5.8 25.8 5 24Z"
                    fill={lf.color}
                    fillOpacity="0.82"
                  />
                  <path d="M6 25C13 18 19 12 26 6" stroke="#ecfeff" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                </svg>
              ))}

              {/* Notas musicais subindo em ondas suaves */}
              {OCARINA_NOTES.map((nt) => (
                <span
                  key={nt.id}
                  className={`pointer-events-none absolute font-serif font-black select-none drop-shadow-[0_0_12px_rgba(34,211,238,0.85)] ${nt.color}`}
                  style={{
                    left: nt.left,
                    top: nt.top,
                    fontSize: nt.size,
                    animation: `warpOcarinaNoteFloat ${nt.dur} ease-in-out ${nt.delay} both`,
                  }}
                >
                  {nt.glyph}
                </span>
              ))}
            </>
          )}

          {/* 3. ERA DOS PIONEIROS: Rolos de Cinema 35mm Girando + Frame Clássico */}
          {warpTheme.styleKind === 'pioneers' && (
            <>
              <div className="pointer-events-none absolute inset-4 border-2 border-dashed border-amber-400/35 rounded-xl" />
              {['left-10 top-12', 'right-10 bottom-12'].map((pos, i) => (
                <svg
                  key={pos}
                  viewBox="0 0 100 100"
                  className={`pointer-events-none absolute ${pos} w-20 h-20 opacity-45 text-amber-300`}
                  style={{ animation: `warpPioneerSpin ${2.2 + i * 0.4}s linear infinite` }}
                >
                  <circle cx="50" cy="50" r="44" fill="rgba(24,24,27,0.65)" stroke="currentColor" strokeWidth="3" />
                  <circle cx="50" cy="50" r="10" fill="currentColor" />
                  {[0, 72, 144, 216, 288].map((a) => (
                    <circle
                      key={a}
                      cx="50"
                      cy="24"
                      r="8"
                      fill="#09090b"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      transform={`rotate(${a} 50 50)`}
                    />
                  ))}
                </svg>
              ))}
            </>
          )}

          {/* 4. RADAR RELÍQUIAS & MÍTICOS: Varredura Sonar 360° */}
          {warpTheme.styleKind === 'radar' && (
            <>
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 w-[520px] h-[520px] rounded-full opacity-45"
                style={{
                  background:
                    'conic-gradient(from 0deg, rgba(45,212,191,0.5) 0deg, rgba(45,212,191,0.08) 55deg, transparent 90deg, transparent 360deg)',
                  animation: 'warpRadarSweep 1.8s linear infinite',
                }}
              />
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 w-52 h-52 rounded-full border-2 border-teal-300/70"
                style={{ animation: 'warpShockRing 1.6s ease-out infinite' }}
              />
            </>
          )}

          {/* Badge Central da Linha do Tempo */}
          <div className="relative z-10 px-6 py-3 rounded-2xl bg-zinc-950/90 border border-white/25 shadow-[0_0_50px_rgba(0,0,0,0.95)] text-center flex flex-col items-center gap-1 max-w-[90%]">
            <div className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-white">
              {warpTheme.badge}
            </div>
            {warpTheme.sublabel && (
              <div className="text-[10px] sm:text-[11px] font-mono text-zinc-300/90 tracking-wide">
                {warpTheme.sublabel}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Malha SVG Tática Principal */}
      <svg
        viewBox={`${minX} ${minY} ${viewW} ${viewH}`}
        className={`w-full h-full block transition-all duration-500 ${
          mapTimelineMode === 'pioneers' ? 'sepia-[0.42] contrast-[1.04]' : ''
        }`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Padrão de Névoa de Guerra (Fog of War Diagonal Hatch) */}
          <pattern
            id="fogOfWarHatch"
            width="6"
            height="6"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="6" height="6" fill="#0d131f" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#162033" strokeWidth="1.4" />
          </pattern>

          {/* Gradiente Bipartido da Alemanha Dividida (Guerra Fria: Oeste RFA vs Leste RDA) */}
          <linearGradient id="dividedGermanyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={westGermanyConquered ? '#0ea5e9' : '#1e3a5f'} stopOpacity="0.82" />
            <stop offset="47%" stopColor={westGermanyConquered ? '#0284c7' : '#1e3a5f'} stopOpacity="0.82" />
            <stop offset="50%" stopColor="#fde047" stopOpacity="1" />
            <stop offset="53%" stopColor={eastGermanyConquered ? '#ef4444' : '#450a0a'} stopOpacity="0.82" />
            <stop offset="100%" stopColor={eastGermanyConquered ? '#dc2626' : '#450a0a'} stopOpacity="0.82" />
          </linearGradient>

          {/* Gradiente Oceânico Tático */}
          <radialGradient id="warRoomOcean" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor={mapTimelineMode === 'ww2' ? '#1a1014' : mapTimelineMode === 'cold_war' ? '#091826' : '#0a1628'} />
            <stop offset="65%" stopColor="#060b16" />
            <stop offset="100%" stopColor="#03050a" />
          </radialGradient>
        </defs>

        {/* Fundo do Oceano */}
        <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#warRoomOcean)" />

        {/* Grade Tática de Latitude / Longitude */}
        <g stroke="rgba(56, 189, 248, 0.06)" strokeWidth={0.5 / Math.sqrt(camera.zoom)}>
          {[-120, -60, 0, 60, 120].map((lon) => {
            const [x] = projectPoint(lon, 0);
            return <line key={`lon-${lon}`} x1={x} y1={0} x2={x} y2={MAP_H} />;
          })}
          {[-30, 0, 30, 60].map((lat) => {
            const [, y] = projectPoint(0, lat);
            return (
              <line
                key={`lat-${lat}`}
                x1={0}
                y1={y}
                x2={MAP_W}
                y2={y}
                strokeDasharray={lat === 0 ? '4,3' : undefined}
                stroke={lat === 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(56, 189, 248, 0.06)'}
              />
            );
          })}
        </g>

        {/* Polígonos dos Países & Territórios */}
        <g>
          {renderedPaths.map((item) => {
            const country = item.code
              ? resolveTimelineTargetTerritory(item.code, mapTimelineMode, countryByCode)
              : null;
            const isHovered = Boolean(country && hoveredInfo === country.code);
            const style = getCountryVisualStyle(item.code, country, isHovered);

            return (
              <path
                key={item.id}
                d={item.d}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
                opacity={style.opacity}
                className={country ? 'transition-colors duration-150 cursor-pointer' : ''}
                onMouseEnter={() => {
                  if (country) setHoveredInfo(country.code);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (dragRef.current.moved) return;
                  if (country && onSelectCountry) {
                    onSelectCountry(country);
                  }
                }}
              />
            );
          })}
        </g>

        {/* Beacons Táticos para Ilhas, Microestados, Relíquias e Alemanha Dividida */}
        <g>
          {tacticalBeacons.map((country) => {
            const isFilteredIn = !visibleCodesSet || visibleCodesSet.has(country.code);
            if (!isFilteredIn && selectedContinent !== 'Todos' && country.continent !== selectedContinent) {
              return null;
            }
            const [bx, by] = projectPoint(country.lon, country.lat);
            const isHovered = hoveredInfo === country.code;
            const rMeta = getRarityMeta(country.rarityTier || country.code);
            const isMythic = rMeta.key === 'mythic';
            const isRelic = rMeta.key === 'relic';
            const isColdWarFocus = mapTimelineMode === 'cold_war' && COLD_WAR_5_RELICS.includes(country.code);
            const r = (isHovered ? 4.8 : isColdWarFocus ? 3.8 : isMythic || isRelic ? 3.0 : 2.5) / Math.sqrt(camera.zoom);

            let fill = isMythic ? '#3f1122' : isRelic ? '#134e4a' : '#1e293b';
            let stroke = isMythic ? '#9f1239' : isRelic ? '#0d9488' : '#475569';
            if (isColdWarFocus && country.code === 'hist_dd') {
              fill = country.status === 'conquered' ? '#ef4444' : '#450a0a';
              stroke = '#fca5a5';
            } else if (isColdWarFocus && country.code === 'hist_de_w') {
              fill = country.status === 'conquered' ? '#0ea5e9' : '#082f49';
              stroke = '#7dd3fc';
            } else if (country.status === 'conquered') {
              fill = rMeta.beaconFill;
              stroke = rMeta.beaconStroke;
            } else if (country.status === 'wishlist') {
              fill = '#d97706';
              stroke = '#fde68a';
            }

            return (
              <g
                key={`beacon-${country.code}`}
                transform={`translate(${bx}, ${by})`}
                opacity={isFilteredIn ? 0.98 : 0.18}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredInfo(country.code)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (dragRef.current.moved) return;
                  if (onSelectCountry) onSelectCountry(country);
                }}
              >
                <circle
                  r={r * 1.75}
                  fill="transparent"
                  stroke={
                    isHovered
                      ? isMythic
                        ? '#fb7185'
                        : isRelic
                          ? '#2dd4bf'
                          : '#fbbf24'
                      : country.status === 'conquered' && (isMythic || isRelic)
                        ? isRelic
                          ? 'rgba(45, 212, 191, 0.55)'
                          : 'rgba(244, 63, 94, 0.55)'
                        : 'transparent'
                  }
                  strokeWidth={0.9 / Math.sqrt(camera.zoom)}
                />
                <polygon
                  points={`0,${-r} ${r},0 0,${r} ${-r},0`}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={0.72 / Math.sqrt(camera.zoom)}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Loader Inicial da Malha */}
      {loadingMap && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/75 backdrop-blur-sm z-30 gap-2">
          <Crosshair className="w-7 h-7 text-amber-400 animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-300">
            Carregando Cartografia Estratégica Global...
          </span>
        </div>
      )}

      {/* Legenda Inferior Adaptativa por Linha do Tempo */}
      <div className="pointer-events-none absolute bottom-3.5 left-5 right-5 z-20 flex flex-wrap items-center justify-between gap-2">
        {mapTimelineMode === 'ww2' ? (
          <div className="flex flex-wrap items-center gap-3 bg-zinc-950/90 border border-rose-500/35 backdrop-blur-md px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/70 border border-sky-300 inline-block" />
              Aliados Ocidentais
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-600/80 border border-amber-400 inline-block" />
              URSS (Aliados Leste)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-600/80 border border-rose-300 inline-block" />
              Potências do Eixo
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-600/50 border border-slate-400 inline-block" />
              Neutros
            </span>
          </div>
        ) : mapTimelineMode === 'cold_war' ? (
          <div className="flex flex-wrap items-center gap-3 bg-zinc-950/90 border border-cyan-500/35 backdrop-blur-md px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-600/80 border border-amber-400 inline-block" />
              URSS (15 Repúblicas)
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/60 border border-cyan-300 inline-block" />
              OTAN / Oeste
            </span>
            <span className="flex items-center gap-1.5 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-600/70 border border-orange-400 inline-block" />
              Pacto de Varsóvia
            </span>
            <span className="flex items-center gap-1.5 text-teal-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-500/70 border border-teal-300 inline-block" />
              Checoslováquia / Iugoslávia
            </span>
            <span className="text-yellow-300">🧱 RFA vs RDA</span>
          </div>
        ) : mapTimelineMode === 'pioneers' ? (
          <div className="flex flex-wrap items-center gap-3 bg-zinc-950/90 border border-amber-500/35 backdrop-blur-md px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80 border border-yellow-200 inline-block" />
              Com Filme Clássico (&lt; 1950)
            </span>
            <span className="flex items-center gap-1.5 text-stone-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-stone-800 border border-stone-600 inline-block" />
              Sem Clássico Pré-1950
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5 bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-md px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider">
            {mapTimelineMode !== 'relic_radar' && (
              <>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-600 inline-block" />
                  Névoa
                </span>
                <span className="flex items-center gap-1.5 text-amber-400/90">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/20 border border-dashed border-amber-400 inline-block" />
                  Alvo
                </span>
                <span className="text-zinc-700">|</span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60 border border-emerald-300 inline-block" />
                  Comum
                </span>
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/60 border border-sky-300 inline-block" />
                  Raro
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500/60 border border-purple-300 inline-block" />
                  Épico
                </span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400/70 border border-yellow-200 inline-block" />
                  Lendário
                </span>
              </>
            )}
            <span className="flex items-center gap-1.5 text-teal-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-500/80 border border-teal-200 inline-block animate-pulse" />
              Relíquia (30)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80 border border-rose-200 inline-block animate-pulse" />
              Mítico (18)
            </span>
          </div>
        )}

        <div className="hidden xl:flex items-center gap-1.5 bg-zinc-950/85 border border-zinc-800/80 px-3 py-1.5 rounded-xl text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          <span>➕➖ Zoom nos Botões • Arraste p/ Mover • Clique p/ Inspecionar</span>
        </div>
      </div>

      {/* Tooltip Flutuante de Reconhecimento Tático */}
      {hoveredCountry && hoveredRarity && cursorCoords && (
        <div
          style={{
            left: `${Math.min(cursorCoords.width - 280, Math.max(12, cursorCoords.x + 16))}px`,
            top: `${Math.min(cursorCoords.height - 165, Math.max(12, cursorCoords.y - 24))}px`
          }}
          className="pointer-events-none absolute z-30 w-68 bg-zinc-950/95 border border-zinc-700/90 rounded-2xl p-3 shadow-[0_15px_40px_rgba(0,0,0,0.9)] backdrop-blur-xl flex flex-col gap-2.5"
        >
          {/* Cabeçalho da Província + Selo de Raridade */}
          <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              {(() => {
                const rawFlag = resolveValidIsoFlagCode(hoveredCountry.flagCode, hoveredCountry.code);
                if (rawFlag) {
                  return (
                    <img
                      src={`https://flagcdn.com/w40/${rawFlag}.png`}
                      alt={hoveredCountry.name}
                      className="w-6 h-4 object-cover rounded border border-zinc-700 shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  );
                }
                return (
                  <span className="w-6 h-4 rounded bg-teal-950 border border-teal-500/40 flex items-center justify-center text-[11px] shrink-0">
                    {hoveredCountry.badgeIcon || (hoveredCountry.code === 'hist_su' ? '☭' : '⏳')}
                  </span>
                );
              })()}
              <span className="text-xs font-black text-zinc-100 uppercase tracking-wide truncate">
                {hoveredCountry.name}
              </span>
            </div>

            <span
              className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0 ${hoveredRarity.softBadge}`}
            >
              {hoveredRarity.key === 'mythic' ? `🔥 ${hoveredRarity.label}` : hoveredRarity.key === 'relic' ? `⏳ ${hoveredRarity.label}` : hoveredRarity.label}
            </span>
          </div>

          {/* Conteúdo: Filme Campeão vs Alvo vs Terra Incógnita */}
          {hoveredCountry.status === 'conquered' && hoveredCountry.champion ? (
            <div className="flex items-center gap-2.5">
              {resolvePosterUrl(hoveredCountry.champion.poster_url) ? (
                <img
                  src={resolvePosterUrl(hoveredCountry.champion.poster_url)}
                  alt={hoveredCountry.champion.title}
                  className="w-11 h-16 object-cover rounded-lg border border-zinc-700 shrink-0 shadow-md"
                />
              ) : (
                <div className="w-11 h-16 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[9px] font-black text-zinc-600 shrink-0">
                  S/CAPA
                </div>
              )}

              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Conquistado
                  </span>
                  {(() => {
                    const mCount = hoveredCountry.totalCandidates ?? hoveredCountry.candidates?.length ?? 0;
                    if (mCount <= 0) return null;
                    return (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/35">
                        <Film className="w-2.5 h-2.5 text-cyan-300" />
                        {mCount} {mCount === 1 ? 'filme' : 'filmes'}
                      </span>
                    );
                  })()}
                  {hoveredCountry.champion.originMode === 'manual' && (
                    <span className="text-[9px] font-black uppercase text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Flag className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" /> Validado
                    </span>
                  )}
                  {hoveredCountry.selectionMode === 'manual' && (
                    <span className="text-[9px] font-black uppercase text-amber-400 flex items-center gap-0.5">
                      <Pin className="w-2.5 h-2.5" /> Fixado
                    </span>
                  )}
                </div>

                <span className="text-xs font-black text-zinc-100 leading-tight line-clamp-2">
                  {hoveredCountry.champion.title}
                </span>

                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                  <span>{hoveredCountry.champion.release_year || 'S/Ano'}</span>
                  <span className="text-amber-400 font-black flex items-center gap-0.5 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {Number(hoveredCountry.champion.user_rating || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : hoveredCountry.status === 'wishlist' && hoveredCountry.wishlist ? (
            <div className="flex items-center gap-2.5">
              {hoveredCountry.wishlist.poster_url && (
                <img
                  src={resolvePosterUrl(hoveredCountry.wishlist.poster_url)}
                  alt={hoveredCountry.wishlist.title}
                  className="w-10 h-14 object-cover rounded-lg border border-amber-500/40 shrink-0"
                />
              )}
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Alvo Marcado
                </span>
                <span className="text-xs font-bold text-zinc-200 truncate">
                  {hoveredCountry.wishlist.title}
                </span>
                {hoveredCountry.wishlist.year && (
                  <span className="text-[10px] text-zinc-500">
                    Lançamento: {hoveredCountry.wishlist.year}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 py-0.5">
              <div className="flex items-center gap-2 text-zinc-500">
                <Lock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Névoa de Guerra • Missão Pendente
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
