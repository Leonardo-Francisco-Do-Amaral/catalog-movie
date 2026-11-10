import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { UN_COUNTRIES_195 } from '../data/unCountries195';
import { getRarityMeta } from '../data/countryRarityTiers';

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

const resolvePosterUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return url;
};

// Presets de câmera tática por continente (calibrados para altura 640)
const CONTINENT_CAMERAS = {
  Todos: { cx: 600, cy: 305, zoom: 1.0 },
  Américas: { cx: 335, cy: 340, zoom: 1.65 },
  Europa: { cx: 645, cy: 165, zoom: 3.2 },
  Ásia: { cx: 885, cy: 245, zoom: 1.9 },
  África: { cx: 660, cy: 345, zoom: 2.0 },
  Oceania: { cx: 1055, cy: 425, zoom: 2.3 }
};

// Microestados, ilhas e nações de foco rápido (como Uruguai) que ganham beacon tático dedicado
const MICROSTATE_CODES = new Set([
  'uy', // Uruguai (destaque garantido com beacon de clique fácil)
  'va', 'mc', 'sm', 'li', 'ad', 'mt', 'lu',
  'sg', 'bh', 'mv', 'qa',
  'sc', 'mu', 'km', 'cv', 'st',
  'ag', 'kn', 'dm', 'lc', 'vc', 'gd', 'bb', 'tt', 'bs',
  'pw', 'nr', 'tv', 'mh', 'fm', 'ki', 'to', 'ws', 'fj', 'vu', 'sb'
]);

export default function TacticalWorldMap({
  countries = [],
  selectedContinent = 'Todos',
  visibleCodesSet = null,
  onSelectCountry
}) {
  const [geoFeatures, setGeoFeatures] = useState([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [camera, setCamera] = useState(CONTINENT_CAMERAS.Todos);
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const [cursorCoords, setCursorCoords] = useState(null);

  const containerRef = useRef(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    startCx: 600,
    startCy: 305
  });

  // Mapa rápido por código do país
  const countryByCode = useMemo(() => {
    const m = new Map();
    countries.forEach((c) => m.set(c.code, c));
    return m;
  }, [countries]);

  // Índice universal para casar cada polígono do Natural Earth com 1 dos 195 países da ONU
  const geoLookup = useMemo(() => {
    const byIso3 = new Map();
    const byIso2 = new Map();
    const byName = new Map();

    UN_COUNTRIES_195.forEach((c) => {
      byIso3.set(c.iso3.toUpperCase(), c.code);
      byIso2.set(c.code.toUpperCase(), c.code);
      byName.set(removeAccents(c.name), c.code);
      if (c.aliases) {
        c.aliases.forEach((al) => byName.set(removeAccents(al), c.code));
      }
    });

    return (props) => {
      if (!props) return null;
      const iso3Candidates = [
        props.ISO_A3,
        props.iso_a3,
        props.ADM0_A3,
        props.adm0_a3,
        props.SOV_A3,
        props.sov_a3,
        props.GU_A3,
        props.gu_a3
      ];
      for (const raw of iso3Candidates) {
        if (raw && raw !== '-99') {
          const hit = byIso3.get(String(raw).toUpperCase());
          if (hit) return hit;
        }
      }

      const iso2Candidates = [props.ISO_A2, props.iso_a2, props.WB_A2, props.wb_a2];
      for (const raw of iso2Candidates) {
        if (raw && raw !== '-99') {
          const hit = byIso2.get(String(raw).toUpperCase());
          if (hit) return hit;
        }
      }

      const nameCandidates = [
        props.NAME,
        props.name,
        props.NAME_LONG,
        props.name_long,
        props.ADMIN,
        props.admin,
        props.FORMAL_EN,
        props.formal_en,
        props.SOVEREIGNT,
        props.sovereignt
      ];
      for (const raw of nameCandidates) {
        if (raw) {
          const hit = byName.get(removeAccents(raw));
          if (hit) return hit;
        }
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

  // Pré-calcula os paths SVG e quais países possuem polígono mapeado
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

  // Beacons táticos para microestados ou países insulares sem polígono grande na escala atual
  const tacticalBeacons = useMemo(() => {
    return countries.filter(
      (c) => MICROSTATE_CODES.has(c.code) || !polygonCodes.has(c.code)
    );
  }, [countries, polygonCodes]);

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

  const getCountryVisualStyle = (country, isHovered) => {
    if (!country) {
      return {
        fill: '#0b0f17',
        stroke: '#182030',
        strokeWidth: 0.45 / Math.sqrt(camera.zoom),
        opacity: 0.45
      };
    }

    const isFilteredIn = !visibleCodesSet || visibleCodesSet.has(country.code);
    const baseOpacity = isFilteredIn ? 1 : 0.16;
    const rarityMeta = getRarityMeta(country.rarityTier || country.code);

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

    // Fog of War (Névoa de Guerra) — destaque sutil carmesim ao passar o mouse em países Míticos
    const isMythic = rarityMeta.key === 'mythic';
    return {
      fill: isHovered
        ? isMythic
          ? 'rgba(136, 19, 55, 0.55)'
          : 'rgba(51, 65, 85, 0.65)'
        : 'url(#fogOfWarHatch)',
      stroke: isHovered ? (isMythic ? '#fb7185' : '#94a3b8') : '#1e293b',
      strokeWidth: (isHovered ? 1.25 : 0.55) / Math.sqrt(camera.zoom),
      opacity: baseOpacity
    };
  };

  const hoveredCountry = hoveredInfo ? countryByCode.get(hoveredInfo) : null;
  const hoveredRarity = hoveredCountry
    ? getRarityMeta(hoveredCountry.rarityTier || hoveredCountry.code)
    : null;

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

      {/* Malha SVG Tática Principal */}
      <svg
        viewBox={`${minX} ${minY} ${viewW} ${viewH}`}
        className="w-full h-full block"
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

          {/* Gradiente Oceânico Tático */}
          <radialGradient id="warRoomOcean" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#0a1628" />
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

        {/* Polígonos dos Países */}
        <g>
          {renderedPaths.map((item) => {
            const country = item.code ? countryByCode.get(item.code) : null;
            const isHovered = Boolean(item.code && hoveredInfo === item.code);
            const style = getCountryVisualStyle(country, isHovered);

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
                  if (item.code) setHoveredInfo(item.code);
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

        {/* Beacons Táticos para Ilhas & Microestados (Garante que todos os 195 países sejam clicáveis) */}
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
            const r = (isHovered ? 4.4 : isMythic ? 2.9 : 2.5) / Math.sqrt(camera.zoom);

            let fill = isMythic ? '#3f1122' : '#1e293b';
            let stroke = isMythic ? '#9f1239' : '#475569';
            if (country.status === 'conquered') {
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
                opacity={isFilteredIn ? 0.96 : 0.18}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredInfo(country.code)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (dragRef.current.moved) return;
                  if (onSelectCountry) onSelectCountry(country);
                }}
              >
                <circle
                  r={r * 1.7}
                  fill="transparent"
                  stroke={
                    isHovered
                      ? isMythic
                        ? '#fb7185'
                        : '#fbbf24'
                      : country.status === 'conquered' && isMythic
                        ? 'rgba(244, 63, 94, 0.55)'
                        : 'transparent'
                  }
                  strokeWidth={0.85 / Math.sqrt(camera.zoom)}
                />
                <polygon
                  points={`0,${-r} ${r},0 0,${r} ${-r},0`}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={0.68 / Math.sqrt(camera.zoom)}
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

      {/* Legenda Inferior Estilo War Room (5 Tiers de Raridade do País + Névoa + Alvo) */}
      <div className="pointer-events-none absolute bottom-3.5 left-5 right-5 z-20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5 bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-md px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider">
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
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80 border border-rose-200 inline-block animate-pulse" />
            Mítico (18)
          </span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 bg-zinc-950/85 border border-zinc-800/80 px-3 py-1.5 rounded-xl text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          <span>➕➖ Zoom nos Botões • Arraste p/ Mover • Clique no País p/ Inspecionar</span>
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
          {/* Cabeçalho da Província + Selo de Raridade do País */}
          <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={`https://flagcdn.com/w40/${hoveredCountry.code}.png`}
                alt={hoveredCountry.name}
                className="w-6 h-4 object-cover rounded border border-zinc-700 shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xs font-black text-zinc-100 uppercase tracking-wide truncate">
                {hoveredCountry.name}
              </span>
            </div>

            <span
              className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0 ${hoveredRarity.softBadge}`}
            >
              {hoveredRarity.key === 'mythic' ? `🔥 ${hoveredRarity.label}` : hoveredRarity.label}
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
