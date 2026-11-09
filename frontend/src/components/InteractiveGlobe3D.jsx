import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Minus, RotateCcw, Play, Pause } from 'lucide-react';

export const COUNTRY_MAP_ENTRIES = [
  { db: 'Brasil', iso: 'br', keys: ['brazil', 'brasil', 'br', 'bra'] },
  { db: 'Estados Unidos', iso: 'us', keys: ['united states of america', 'united states', 'usa', 'us', 'puerto rico', 'pr'] },
  { db: 'Reino Unido', iso: 'gb', keys: ['united kingdom', 'uk', 'gbr', 'england', 'great britain', 'falkland is.', 'fk'] },
  { db: 'Japão', iso: 'jp', keys: ['japan', 'japao', 'jpn', 'jp'] },
  { db: 'França', iso: 'fr', keys: ['france', 'franca', 'fra', 'fr', 'new caledonia', 'french polynesia'] },
  { db: 'Alemanha', iso: 'de', keys: ['germany', 'alemanha', 'deu', 'de'] },
  { db: 'Itália', iso: 'it', keys: ['italy', 'italia', 'ita', 'it'] },
  { db: 'Espanha', iso: 'es', keys: ['spain', 'espanha', 'esp', 'es'] },
  { db: 'Coreia do Sul', iso: 'kr', keys: ['korea', 'south korea', 'republic of korea', 'kor', 'kr'] },
  { db: 'Canadá', iso: 'ca', keys: ['canada', 'can', 'ca'] },
  { db: 'Austrália', iso: 'au', keys: ['australia', 'aus', 'au'] },
  { db: 'Catar', iso: 'qa', keys: ['qatar', 'catar', 'qat', 'qa'] },
  { db: 'África do Sul', iso: 'za', keys: ['south africa', 'africa do sul', 'zaf', 'za'] },
  { db: 'Irlanda', iso: 'ie', keys: ['ireland', 'irlanda', 'irl', 'ie'] },
  { db: 'Argentina', iso: 'ar', keys: ['argentina', 'arg', 'ar'] },
  { db: 'México', iso: 'mx', keys: ['mexico', 'mex', 'mx'] },
  { db: 'Índia', iso: 'in', keys: ['india', 'ind', 'in'] },
  { db: 'Suécia', iso: 'se', keys: ['sweden', 'suecia', 'swe', 'se'] },
  { db: 'Dinamarca', iso: 'dk', keys: ['denmark', 'dinamarca', 'dnk', 'dk', 'greenland'] },
  { db: 'Bélgica', iso: 'be', keys: ['belgium', 'belgica', 'bel', 'be'] },
  { db: 'Países Baixos', iso: 'nl', keys: ['netherlands', 'paises baixos', 'holanda', 'nld', 'nl'] },
  { db: 'Nova Zelândia', iso: 'nz', keys: ['new zealand', 'nova zelandia', 'nzl', 'nz'] },
  { db: 'Noruega', iso: 'no', keys: ['norway', 'noruega', 'nor', 'no'] },
  { db: 'Portugal', iso: 'pt', keys: ['portugal', 'prt', 'pt'] },
  { db: 'Irã', iso: 'ir', keys: ['iran', 'ira', 'irn', 'ir'] },
  { db: 'Polônia', iso: 'pl', keys: ['poland', 'polonia', 'pol', 'pl'] },
  { db: 'Rússia', iso: 'ru', keys: ['russia', 'rus', 'ru'] },
  { db: 'China', iso: 'cn', keys: ['china', 'chn', 'cn'] },
  { db: 'Áustria', iso: 'at', keys: ['austria', 'aut', 'at'] },
  { db: 'Suíça', iso: 'ch', keys: ['switzerland', 'suica', 'che', 'ch'] },
  { db: 'Colômbia', iso: 'co', keys: ['colombia', 'col', 'co'] },
  { db: 'Chile', iso: 'cl', keys: ['chile', 'chl', 'cl'] },
  { db: 'Peru', iso: 'pe', keys: ['peru', 'per', 'pe'] },
  { db: 'Venezuela', iso: 've', keys: ['venezuela', 'ven', 've'] },
  { db: 'Uruguai', iso: 'uy', keys: ['uruguay', 'uruguai', 'ury', 'uy'] },
  { db: 'Paraguai', iso: 'py', keys: ['paraguay', 'paraguai', 'pry', 'py'] },
  { db: 'Equador', iso: 'ec', keys: ['ecuador', 'equador', 'ecu', 'ec'] },
  { db: 'Finlândia', iso: 'fi', keys: ['finland', 'finlandia', 'fin', 'fi'] },
  { db: 'Grécia', iso: 'gr', keys: ['greece', 'grecia', 'grc', 'gr'] },
  { db: 'Turquia', iso: 'tr', keys: ['turkey', 'turquia', 'tur', 'tr'] },
  { db: 'Líbano', iso: 'lb', keys: ['lebanon', 'libano', 'lbn', 'lb'] },
  { db: 'Marrocos', iso: 'ma', keys: ['morocco', 'marrocos', 'mar', 'ma'] },
  { db: 'Argélia', iso: 'dz', keys: ['algeria', 'argelia', 'dza', 'dz'] },
  { db: 'Egito', iso: 'eg', keys: ['egypt', 'egito', 'egy', 'eg'] },
  { db: 'Tunísia', iso: 'tn', keys: ['tunisia', 'tun', 'tn'] },
  { db: 'República Checa', iso: 'cz', keys: ['czech rep.', 'czech republic', 'republica checa', 'republica tcheca', 'czechia', 'cze', 'cz'] },
  { db: 'Romênia', iso: 'ro', keys: ['romania', 'romenia', 'rou', 'ro'] },
  { db: 'Hungria', iso: 'hu', keys: ['hungary', 'hungria', 'hun', 'hu'] },
  { db: 'Ucrânia', iso: 'ua', keys: ['ukraine', 'ucrania', 'ukr', 'ua'] },
  { db: 'Arábia Saudita', iso: 'sa', keys: ['saudi arabia', 'arabia saudita', 'sau', 'sa'] },
  { db: 'Emirados Árabes Unidos', iso: 'ae', keys: ['united arab emirates', 'emirados arabes unidos', 'are', 'ae'] },
  { db: 'Hong Kong', iso: 'hk', keys: ['hong kong', 'hkg', 'hk'] },
  { db: 'Taiwan', iso: 'tw', keys: ['taiwan', 'twn', 'tw'] },
  { db: 'Tailândia', iso: 'th', keys: ['thailand', 'tailandia', 'tha', 'th'] },
  { db: 'Vietnã', iso: 'vn', keys: ['vietnam', 'vietna', 'vnm', 'vn'] },
  { db: 'Filipinas', iso: 'ph', keys: ['philippines', 'filipinas', 'phl', 'ph'] },
  { db: 'Indonésia', iso: 'id', keys: ['indonesia', 'idn', 'id'] },
  { db: 'Singapura', iso: 'sg', keys: ['singapore', 'singapura', 'sgp', 'sg'] },
  { db: 'Nigéria', iso: 'ng', keys: ['nigeria', 'nga', 'ng'] },
  { db: 'Quênia', iso: 'ke', keys: ['kenya', 'quenia', 'ken', 'ke'] },
  { db: 'Senegal', iso: 'sn', keys: ['senegal', 'sen', 'sn'] },
  { db: 'Cuba', iso: 'cu', keys: ['cuba', 'cub', 'cu'] },
  { db: 'Islândia', iso: 'is', keys: ['iceland', 'islandia', 'isl', 'is'] },
  { db: 'Bulgária', iso: 'bg', keys: ['bulgaria', 'bgr', 'bg'] },
  { db: 'Chipre', iso: 'cy', keys: ['cyprus', 'chipre', 'n. cyprus', 'cyp', 'cy'] },
  { db: 'Malta', iso: 'mt', keys: ['malta', 'mlt', 'mt'] },
  { db: 'Sérvia', iso: 'rs', keys: ['serbia', 'servia', 'srb', 'rs'] },
];

const MICRO_STATES = [
  { name: 'Hong Kong', iso: 'hk', db: 'Hong Kong', lon: 114.16, lat: 22.31 },
  { name: 'Singapore', iso: 'sg', db: 'Singapura', lon: 103.81, lat: 1.35 },
  { name: 'Malta', iso: 'mt', db: 'Malta', lon: 14.37, lat: 35.93 },
];

const removeAccents = (str) =>
  str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : '';

export const getCountryIsoFromName = (dbName) => {
  if (!dbName) return null;
  const clean = removeAccents(dbName);
  if (clean === 'uniao sovietica' || clean === 'alemanha ocidental') return null;
  const found = COUNTRY_MAP_ENTRIES.find(
    (c) => removeAccents(c.db) === clean || c.keys.includes(clean)
  );
  return found ? found.iso : null;
};

const isPointInPolygon = (x, y, poly) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

export default function InteractiveGlobe3D({ countryCounts = {} }) {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [worldData, setWorldData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1.0);
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(autoRotate);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const rotationRef = useRef({ x: 0.35, y: 0.8 });
  const isDraggingRef = useRef(false);
  const startMouseRef = useRef({ x: 0, y: 0 });
  const lastHoveredNameRef = useRef(null);

  useEffect(() => {
    fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao carregar mapa.');
        return res.json();
      })
      .then((data) => {
        const features = data.features || [];
        MICRO_STATES.forEach((ms) => {
          const d = 0.9;
          features.push({
            type: 'Feature',
            properties: { name: ms.name, admin: ms.name, iso_a2: ms.iso.toUpperCase() },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [ms.lon - d, ms.lat - d],
                [ms.lon + d, ms.lat - d],
                [ms.lon + d, ms.lat + d],
                [ms.lon - d, ms.lat + d],
                [ms.lon - d, ms.lat - d],
              ]],
            },
          });
        });
        setWorldData({ ...data, features });
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const getCountryMatch = useMemo(() => {
    return (properties) => {
      if (!properties) return null;
      const values = [
        properties.name, properties.name_long, properties.admin,
        properties.sovereignt, properties.formal_en, properties.iso_a2, properties.iso_a3,
      ]
        .filter(Boolean)
        .map((v) => removeAccents(v));

      if (
        values.some(
          (v) =>
            v.includes('soviet') ||
            v.includes('ussr') ||
            v.includes('west germany') ||
            v === 'uniao sovietica' ||
            v === 'alemanha ocidental'
        )
      ) {
        return null;
      }

      for (const entry of COUNTRY_MAP_ENTRIES) {
        const isMatch = entry.keys.some((k) => values.includes(removeAccents(k)));
        if (isMatch) {
          const countKeys = Object.keys(countryCounts);
          const matchedDb = countKeys.find((ck) => {
            const ckClean = removeAccents(ck);
            return (
              ckClean === removeAccents(entry.db) ||
              entry.keys.includes(ckClean) ||
              (ckClean === 'holanda' && entry.db === 'Países Baixos') ||
              (ckClean === 'republica tcheca' && entry.db === 'República Checa')
            );
          });
          if (matchedDb && countryCounts[matchedDb] > 0) {
            return { dbName: matchedDb, iso: entry.iso };
          }
        }
      }

      for (const key of Object.keys(countryCounts)) {
        if (key === 'União Soviética' || key === 'Alemanha Ocidental') continue;
        const cleanKey = removeAccents(key);
        if (values.includes(cleanKey) && countryCounts[key] > 0) {
          return { dbName: key, iso: cleanKey.slice(0, 2) };
        }
      }
      return null;
    };
  }, [countryCounts]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const baseRadius = 135;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const render = () => {
      if (!isDraggingRef.current && autoRotateRef.current) {
        rotationRef.current.y += 0.0022;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rotY = rotationRef.current.y;
      const rotX = rotationRef.current.x;
      const mx = startMouseRef.current.localX;
      const my = startMouseRef.current.localY;
      const radius = baseRadius * zoom;

      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 22;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 2, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const sphereGrad = ctx.createRadialGradient(cx - 40, cy - 40, 20, cx, cy, radius);
      sphereGrad.addColorStop(0, '#0c4a6e');
      sphereGrad.addColorStop(0.75, '#020617');
      sphereGrad.addColorStop(1, '#000000');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fill();

      let currentHover = null;

      if (worldData && worldData.features) {
        worldData.features.forEach((feature) => {
          const match = getCountryMatch(feature.properties);
          const hasMovies = match !== null;
          const movieCount = hasMovies ? countryCounts[match.dbName] || 0 : 0;

          const geom = feature.geometry;
          if (!geom) return;
          const coords = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
          let isMouseOver = false;

          coords.forEach((polygon) => {
            polygon.forEach((ring) => {
              const screenPoly = [];
              let allVisible = true;
              ring.forEach((pt) => {
                const rLat = (pt[1] * Math.PI) / 180;
                const rLon = (pt[0] * Math.PI) / 180;
                const x = Math.cos(rLat) * Math.cos(rLon);
                const y = Math.sin(rLat);
                const z = Math.cos(rLat) * Math.sin(rLon);

                const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
                const x1 = x * cosY - z * sinY;
                const z1 = x * sinY + z * cosY;

                const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
                const y2 = y * cosX - z1 * sinX;
                const z2 = y * sinX + z1 * cosX;

                if (z2 > 0) {
                  screenPoly.push([cx + x1 * radius, cy - y2 * radius]);
                } else {
                  allVisible = false;
                }
              });

              if (screenPoly.length > 2 && mx !== undefined && my !== undefined && allVisible) {
                if (isPointInPolygon(mx, my, screenPoly)) {
                  isMouseOver = true;
                }
              }
            });
          });

          let fillStyle = 'rgba(255, 255, 255, 0.04)';
          let strokeStyle = 'rgba(255, 255, 255, 0.12)';
          let lineWidth = 0.5;

          if (hasMovies) {
            fillStyle = 'rgba(6, 182, 212, 0.32)';
            strokeStyle = 'rgba(34, 211, 238, 0.7)';
            lineWidth = 0.85;
          }

          if (isMouseOver && hasMovies) {
            fillStyle = 'rgba(245, 158, 11, 0.75)';
            strokeStyle = '#fbbf24';
            lineWidth = 1.4;
            currentHover = { name: match.dbName, count: movieCount, iso: match.iso, x: mx, y: my };
          }

          coords.forEach((polygon) => {
            polygon.forEach((ring) => {
              ctx.beginPath();
              let first = true;
              ring.forEach((pt) => {
                const rLat = (pt[1] * Math.PI) / 180;
                const rLon = (pt[0] * Math.PI) / 180;
                const x = Math.cos(rLat) * Math.cos(rLon);
                const y = Math.sin(rLat);
                const z = Math.cos(rLat) * Math.sin(rLon);

                const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
                const x1 = x * cosY - z * sinY;
                const z1 = x * sinY + z * cosY;

                const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
                const y2 = y * cosX - z1 * sinX;
                const z2 = y * sinX + z1 * cosX;

                if (z2 > 0) {
                  const px = cx + x1 * radius;
                  const py = cy - y2 * radius;
                  if (first) { ctx.moveTo(px, py); first = false; }
                  else { ctx.lineTo(px, py); }
                } else {
                  first = true;
                }
              });

              if (!first) {
                ctx.fillStyle = fillStyle;
                ctx.strokeStyle = strokeStyle;
                ctx.lineWidth = lineWidth;
                ctx.fill();
                ctx.stroke();
              }
            });
          });
        });
      }

      const nextHoverName = currentHover ? currentHover.name : null;
      if (lastHoveredNameRef.current !== nextHoverName) {
        lastHoveredNameRef.current = nextHoverName;
        setHovered(currentHover);
      }

      if (isLoading) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Calibrando projeção orbital...', cx, cy + radius - 20);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [worldData, countryCounts, zoom, isLoading, getCountryMatch]);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startMouseRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotationRef.current.x,
      rotY: rotationRef.current.y,
    };
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvasRef.current.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvasRef.current.height / rect.height : 1;
    startMouseRef.current.localX = (e.clientX - rect.left) * scaleX;
    startMouseRef.current.localY = (e.clientY - rect.top) * scaleY;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - startMouseRef.current.x;
      const deltaY = e.clientY - startMouseRef.current.y;
      rotationRef.current.y = startMouseRef.current.rotY + deltaX * 0.0065;
      rotationRef.current.x = Math.max(
        -Math.PI / 2.1,
        Math.min(Math.PI / 2.1, startMouseRef.current.rotX - deltaY * 0.0065)
      );
    }
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative flex flex-col items-center justify-center bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-5 min-h-[360px] w-full overflow-hidden">
      <div className="absolute top-3.5 right-3.5 flex gap-1.5 z-20">
        <button
          type="button"
          onClick={() => setAutoRotate((prev) => !prev)}
          title={autoRotate ? 'Pausar Rotação' : 'Iniciar Rotação'}
          className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white p-2 rounded-lg border border-zinc-800 cursor-pointer"
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => setZoom((p) => Math.min(2.3, p + 0.15))}
          title="Ampliar Globo"
          className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white p-2 rounded-lg border border-zinc-800 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((p) => Math.max(0.6, p - 0.15))}
          title="Reduzir Globo"
          className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white p-2 rounded-lg border border-zinc-800 cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => { setZoom(1.0); rotationRef.current = { x: 0.35, y: 0.8 }; }}
          title="Resetar Orientação"
          className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white p-2 rounded-lg border border-zinc-800 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={330}
        height={330}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={() => {
          handleMouseUpOrLeave();
          startMouseRef.current.localX = undefined;
          startMouseRef.current.localY = undefined;
        }}
        className="cursor-grab active:cursor-grabbing max-w-full"
      />
      <div className="text-[10px] uppercase font-bold text-zinc-500 mt-2 select-none text-center">
        🌐 Arraste para girar • Territórios iluminados possuem filmes assistidos
      </div>

      {hovered && (
        <div
          className="absolute bg-zinc-950/95 border border-amber-400/50 rounded-xl px-3.5 py-2.5 shadow-2xl flex flex-col gap-1 backdrop-blur-md pointer-events-none select-none z-20"
          style={{ left: `${Math.min(210, Math.max(12, hovered.x + 12))}px`, top: `${Math.max(12, hovered.y - 48)}px` }}
        >
          <div className="flex items-center gap-2">
            {hovered.iso ? (
              <img
                src={`https://flagcdn.com/w40/${hovered.iso}.png`}
                alt={hovered.name}
                className="w-5 h-3.5 object-cover rounded border border-zinc-700"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <span>🏳️</span>
            )}
            <span className="text-xs font-black text-white uppercase">{hovered.name}</span>
          </div>
          <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
            {hovered.count} {hovered.count === 1 ? 'filme conquistado' : 'filmes conquistados'}
          </span>
        </div>
      )}
    </div>
  );
}
