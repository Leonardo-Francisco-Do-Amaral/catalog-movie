import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, Tooltip, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { Film, Clock, Star, Tv, Calendar, Shield, Trophy, Flame, Target, Award, Sparkles, TrendingUp, Globe, Plus, Minus, RotateCcw, Play, Pause } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CanisterBar = (props) => {
  const { fill, x, y, width, height } = props;
  if (!height || !width) return null;
  return (
    <g>
      {/* Canister main background */}
      <rect x={x} y={y} width={width} height={height} rx={4} fill={fill} opacity={0.15} />
      {/* Canister outline glow */}
      <rect x={x} y={y} width={width} height={height} rx={4} fill="none" stroke={fill} strokeWidth={1.5} />
      {/* Canister energy level block */}
      <rect x={x + 2} y={y + 2} width={width - 4} height={height - 4} rx={2} fill={fill} opacity={0.8} />
      {/* Canister glass highlight line */}
      <line x1={x + 4} y1={y + 4} x2={x + 4} y2={y + height - 4} stroke="rgba(255, 255, 255, 0.45)" strokeWidth={1} />
    </g>
  );
};

// Mapeamento abrangente de países com ISOs e nomes alternativos em PT/EN/GeoJSON
const COUNTRY_MAP_ENTRIES = [
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
  { db: 'Sérvia', iso: 'rs', keys: ['serbia', 'servia', 'srb', 'rs'] }
];

// Coordenadas de microestados para polígonos sintéticos no mapa 110m
const MICRO_STATES = [
  { name: 'Hong Kong', iso: 'hk', db: 'Hong Kong', lon: 114.16, lat: 22.31 },
  { name: 'Singapore', iso: 'sg', db: 'Singapura', lon: 103.81, lat: 1.35 },
  { name: 'Malta', iso: 'mt', db: 'Malta', lon: 14.37, lat: 35.93 }
];

// Remove acentos de uma string para comparação fuzzy
const removeAccents = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

// Encontra ISO a partir do nome do banco
const getCountryIso = (dbName) => {
  if (!dbName) return null;
  const clean = removeAccents(dbName);
  if (clean === 'uniao sovietica' || clean === 'alemanha ocidental') return null;
  
  const found = COUNTRY_MAP_ENTRIES.find(c => removeAccents(c.db) === clean || c.keys.includes(clean));
  return found ? found.iso : null;
};

// Helpers de normalização locais
const normalizeName = (text) => {
  if (!text) return "";
  const name = text.toLowerCase().trim();
  if (name === "dc" || name === "dc entertainment") return "DC Entertainment";
  return text.trim();
};

const getDistributorsList = (text) => {
  if (!text) return [];
  const parts = text.split(/[-/]/);
  return parts.map(p => {
    const clean = p.trim();
    if (clean.toLowerCase() === 'liongate') return 'Lionsgate';
    if (clean.toLowerCase() === 'paris filmes') return 'Paris Filmes';
    return clean;
  }).filter(Boolean);
};

// Algoritmo Ray-Casting para detectar se o mouse está dentro de um polígono projetado
const isPointInPolygon = (x, y, poly) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Componente do Globo Interativo 3D em Canvas (com países reais de GeoJSON)
function InteractiveGlobe({ countryCounts = {} }) {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [worldData, setWorldData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1.0); // Controle de ampliação/zoom
  const [autoRotate, setAutoRotate] = useState(true); // Controle de rotação automática
  const autoRotateRef = useRef(autoRotate);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);
  
  const rotationRef = useRef({ x: 0.35, y: 0.8 });
  const isDraggingRef = useRef(false);
  const startMouseRef = useRef({ x: 0, y: 0 });
  const lastHoveredNameRef = useRef(null);

  // Carrega contornos de países reais de forma assíncrona (Natural Earth 110m + Microestados)
  useEffect(() => {
    fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar mapa.');
        return res.json();
      })
      .then(data => {
        const features = data.features || [];
        MICRO_STATES.forEach(ms => {
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
                [ms.lon - d, ms.lat - d]
              ]]
            }
          });
        });

        setWorldData({ ...data, features });
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Falha ao baixar contornos dos países: ', err);
        setIsLoading(false);
      });
  }, []);

  // Procura correspondência inteligente entre o país do GeoJSON e o banco do usuário
  const getCountryMatch = useMemo(() => {
    return (properties) => {
      if (!properties) return null;

      const values = [
        properties.name, properties.name_long, properties.admin, properties.sovereignt,
        properties.formal_en, properties.iso_a2, properties.iso_a3
      ].filter(Boolean).map(v => removeAccents(v));

      // Ignora países históricos do passado
      if (values.some(v => v.includes('soviet') || v.includes('ussr') || v.includes('west germany') || v === 'uniao sovietica' || v === 'alemanha ocidental')) {
        return null;
      }

      // 1. Tenta correspondência direta no dicionário universal
      for (let entry of COUNTRY_MAP_ENTRIES) {
        const isMatch = entry.keys.some(k => values.includes(removeAccents(k)));
        if (isMatch) {
          const countKeys = Object.keys(countryCounts);
          const matchedDb = countKeys.find(ck => {
            const ckClean = removeAccents(ck);
            return ckClean === removeAccents(entry.db) || 
                   entry.keys.includes(ckClean) || 
                   (ckClean === 'holanda' && entry.db === 'Países Baixos') ||
                   (ckClean === 'república tcheca' && entry.db === 'República Checa');
          });

          if (matchedDb && countryCounts[matchedDb] > 0) {
            return { dbName: matchedDb, iso: entry.iso };
          }
        }
      }

      // 2. Fallback dinâmico comparando todas as chaves do banco sem acentos
      const dbKeys = Object.keys(countryCounts);
      for (let key of dbKeys) {
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
        rotationRef.current.y += 0.002; // Rotação suave contínua
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rotY = rotationRef.current.y;
      const rotX = rotationRef.current.x;

      const mx = startMouseRef.current.localX;
      const my = startMouseRef.current.localY;

      // Escala o raio de acordo com o zoom
      const radius = baseRadius * zoom;

      // 1. Atmosfera e Brilho Neon Externo
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 2, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.shadowBlur = 0; // Reseta sombra

      // 2. Fundo Esférico 3D (Gradiente)
      const sphereGrad = ctx.createRadialGradient(cx - 40, cy - 40, 20, cx, cy, radius);
      sphereGrad.addColorStop(0, '#0c4a6e');
      sphereGrad.addColorStop(0.75, '#020617');
      sphereGrad.addColorStop(1, '#000000');
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fill();

      let currentHover = null;

      // 3. Renderização dos Países Reais (GeoJSON)
      if (worldData && worldData.features) {
        worldData.features.forEach(feature => {
          const match = getCountryMatch(feature.properties);

          // Verifica se o país existe no catálogo
          const hasMovies = match !== null;
          const movieCount = hasMovies ? (countryCounts[match.dbName] || 0) : 0;

          const geom = feature.geometry;
          if (!geom) return;
          
          const coords = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
          let isMouseOverThisCountry = false;

          // Desenha polígonos e faz colisão com mouse
          coords.forEach(polygon => {
            polygon.forEach(ring => {
              const screenPoly = [];
              let allVisible = true;
              
              ring.forEach(pt => {
                const lon = pt[0];
                const lat = pt[1];

                const rLat = lat * Math.PI / 180;
                const rLon = lon * Math.PI / 180;
                const x = Math.cos(rLat) * Math.cos(rLon);
                const y = Math.sin(rLat);
                const z = Math.cos(rLat) * Math.sin(rLon);

                // Rotaciona Y
                const cosY = Math.cos(rotY);
                const sinY = Math.sin(rotY);
                const x1 = x * cosY - z * sinY;
                const z1 = x * sinY + z * cosY;

                // Rotaciona X
                const cosX = Math.cos(rotX);
                const sinX = Math.sin(rotX);
                const y2 = y * cosX - z1 * sinX;
                const z2 = y * sinX + z1 * cosX;

                if (z2 > 0) {
                  const px = cx + x1 * radius;
                  const py = cy - y2 * radius;
                  screenPoly.push([px, py]);
                } else {
                  allVisible = false;
                }
              });

              // Raycast de colisão
              if (screenPoly.length > 2 && mx !== undefined && my !== undefined && allVisible) {
                if (isPointInPolygon(mx, my, screenPoly)) {
                  isMouseOverThisCountry = true;
                }
              }
            });
          });

          // Cores baseadas no estado
          let fillStyle = 'rgba(255, 255, 255, 0.04)';
          let strokeStyle = 'rgba(255, 255, 255, 0.12)';
          let lineWidth = 0.5;

          if (hasMovies) {
            fillStyle = 'rgba(6, 182, 212, 0.28)'; // Aceso (cyan)
            strokeStyle = 'rgba(6, 182, 212, 0.6)';
            lineWidth = 0.8;
          }

          if (isMouseOverThisCountry && hasMovies) {
            fillStyle = 'rgba(244, 63, 94, 0.65)'; // Rosa neon no hover
            strokeStyle = '#f43f5e';
            lineWidth = 1.25;

            // Define o hovered para a tooltip
            currentHover = {
              name: match.dbName,
              count: movieCount,
              iso: match.iso,
              x: mx,
              y: my
            };
          }

          // Desenha as linhas de fronteira do país no canvas
          coords.forEach(polygon => {
            polygon.forEach(ring => {
              ctx.beginPath();
              let first = true;
              
              ring.forEach(pt => {
                const lon = pt[0];
                const lat = pt[1];
                const rLat = lat * Math.PI / 180;
                const rLon = lon * Math.PI / 180;
                const x = Math.cos(rLat) * Math.cos(rLon);
                const y = Math.sin(rLat);
                const z = Math.cos(rLat) * Math.sin(rLon);

                const cosY = Math.cos(rotY);
                const sinY = Math.sin(rotY);
                const x1 = x * cosY - z * sinY;
                const z1 = x * sinY + z * cosY;

                const cosX = Math.cos(rotX);
                const sinX = Math.sin(rotX);
                const y2 = y * cosX - z1 * sinX;
                const z2 = y * sinX + z1 * cosX;

                if (z2 > 0) {
                  const px = cx + x1 * radius;
                  const py = cy - y2 * radius;
                  if (first) {
                    ctx.moveTo(px, py);
                    first = false;
                  } else {
                    ctx.lineTo(px, py);
                  }
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

      // 4. Linhas de Grade Sombreadas
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.55;
      const drawGridRing = (latVal, lonVal, isLat) => {
        ctx.beginPath();
        let first = true;
        for (let i = 0; i <= 360; i += 15) {
          const theta = i * Math.PI / 180;
          const lat = isLat ? latVal : theta * 180 / Math.PI;
          const lon = isLat ? theta * 180 / Math.PI : lonVal;

          const rLat = lat * Math.PI / 180;
          const rLon = lon * Math.PI / 180;
          const x = Math.cos(rLat) * Math.cos(rLon);
          const y = Math.sin(rLat);
          const z = Math.cos(rLat) * Math.sin(rLon);

          const cosY = Math.cos(rotY);
          const sinY = Math.sin(rotY);
          const x1 = x * cosY - z * sinY;
          const z1 = x * sinY + z * cosY;

          const cosX = Math.cos(rotX);
          const sinX = Math.sin(rotX);
          const y2 = y * cosX - z1 * sinX;
          const z2 = y * sinX + z1 * cosX;

          const px = cx + x1 * radius;
          const py = cy - y2 * radius;

          if (z2 > 0) {
            if (first) {
              ctx.moveTo(px, py);
              first = false;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      };
      [-30, 0, 30].forEach(lat => drawGridRing(lat, 0, true));
      [0, 90, 180, 270].forEach(lon => drawGridRing(0, lon, false));

      // Atualiza o estado apenas se mudar o país
      const nextHoverName = currentHover ? currentHover.name : null;
      if (lastHoveredNameRef.current !== nextHoverName) {
        lastHoveredNameRef.current = nextHoverName;
        setHovered(currentHover);
      }

      // Loader Text
      if (isLoading) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '9px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Carregando mapa do globo...', cx, cy + radius - 20);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [worldData, countryCounts, zoom, isLoading, getCountryMatch]);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startMouseRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotationRef.current.x,
      rotY: rotationRef.current.y
    };
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    
    startMouseRef.current.localX = localX;
    startMouseRef.current.localY = localY;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - startMouseRef.current.x;
      const deltaY = e.clientY - startMouseRef.current.y;
      
      rotationRef.current.y = startMouseRef.current.rotY + deltaX * 0.0065;
      rotationRef.current.x = Math.max(-Math.PI/2.1, Math.min(Math.PI/2.1, startMouseRef.current.rotX - deltaY * 0.0065));
    }
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Funções de controle
  const handleZoomIn = () => setZoom(prev => Math.min(2.5, prev + 0.15));
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.15));
  const handleReset = () => {
    setZoom(1.0);
    rotationRef.current = { x: 0.35, y: 0.8 };
  };

  return (
    <div className="relative flex flex-col items-center justify-center bg-zinc-950/25 border border-zinc-900/60 rounded-2xl p-6 min-h-[380px] w-full">
      
      {/* Botões Flutuantes de Controle (Zoom & Reset) */}
      <div className="absolute top-4 right-4 flex gap-1.5 z-20">
        <button
          onClick={() => setAutoRotate(prev => !prev)}
          title={autoRotate ? "Pausar Rotação" : "Iniciar Rotação"}
          className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 p-2 rounded-lg border border-zinc-800 transition-all duration-300 cursor-pointer shadow-lg flex items-center justify-center"
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleZoomIn}
          title="Ampliar Globo"
          className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 p-2 rounded-lg border border-zinc-800 transition-all duration-300 cursor-pointer shadow-lg flex items-center justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Reduzir Globo"
          className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 p-2 rounded-lg border border-zinc-800 transition-all duration-300 cursor-pointer shadow-lg flex items-center justify-center"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleReset}
          title="Resetar Orientação e Zoom"
          className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 p-2 rounded-lg border border-zinc-800 transition-all duration-300 cursor-pointer shadow-lg flex items-center justify-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={340}
        height={340}
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
      <div className="text-[10px] uppercase font-bold text-zinc-500 mt-3 select-none text-center">
        🌐 Arraste para girar • Países com filmes ficam acesos • Passe o mouse para detalhes
      </div>

      {hovered && (
        <div 
          className="absolute bg-zinc-950/95 border border-zinc-800 rounded-xl px-4 py-3 shadow-2xl flex flex-col gap-2 backdrop-blur-sm pointer-events-none select-none z-10"
          style={{ left: `${hovered.x + 15}px`, top: `${hovered.y - 45}px` }}
        >
          <div className="flex items-center gap-2">
            {hovered.iso ? (
              <img 
                src={`https://flagcdn.com/w40/${hovered.iso}.png`} 
                alt={hovered.name}
                className="w-6 h-4 object-cover rounded border border-zinc-800/80"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <span>🏳️</span>
            )}
            <span className="text-xs font-black text-zinc-100 uppercase tracking-wide">{hovered.name}</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">{hovered.count} {hovered.count === 1 ? 'filme visto' : 'filmes vistos'}</span>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsDashboard({ movies = [] }) {
  const [selectedYear, setSelectedYear] = useState('Geral');
  const [compareMode, setCompareMode] = useState('combined'); // 'combined' ou 'grid'

  // 1. Anos
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    movies.forEach(movie => {
      if (movie.year_seen) {
        yearsSet.add(String(movie.year_seen));
      }
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [movies]);

  // 2. Filtragem
  const filteredMovies = useMemo(() => {
    if (selectedYear === 'Geral') return movies;
    return movies.filter(m => String(m.year_seen) === selectedYear);
  }, [movies, selectedYear]);

  // 3. KPIs
  const kpis = useMemo(() => {
    const total = filteredMovies.length;

    let totalMinutes = 0;
    filteredMovies.forEach(m => {
      if (m.runtime) totalMinutes += Number(m.runtime);
    });
    const hours = Math.round(totalMinutes / 60);
    const days = (totalMinutes / 1440).toFixed(1);

    let ratingSum = 0;
    let ratedCount = 0;
    filteredMovies.forEach(m => {
      const r = Number(m.user_rating);
      if (r > 0) {
        ratingSum += r;
        ratedCount++;
      }
    });
    const avgRating = ratedCount > 0 ? (ratingSum / ratedCount).toFixed(2) : 'N/A';

    let oscarWins = 0;
    let oscarNoms = 0;
    filteredMovies.forEach(m => {
      oscarWins += Number(m.oscar_wins) || 0;
      oscarNoms += Number(m.oscar_nominations) || 0;
    });

    const xp = total * 100 + totalMinutes * 2;
    const level = Math.floor(Math.sqrt(xp / 200)) + 1;
    const nextLevelXp = Math.pow(level, 2) * 200;
    const prevLevelXp = Math.pow(level - 1, 2) * 200;
    const xpPercentage = Math.min(100, Math.max(0, ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));

    return { total, hours, days, avgRating, oscarWins, oscarNoms, xp, level, nextLevelXp, xpPercentage };
  }, [filteredMovies]);

  // 4. Fluxo Mensal
  const monthlyData = useMemo(() => {
    const data = MONTH_NAMES.map(m => ({
      name: m,
      quantidade: 0,
      somaNota: 0,
      qtdNotas: 0,
      notaMedia: 0
    }));

    filteredMovies.forEach(m => {
      if (m.month_seen) {
        const monthIndex = parseInt(String(m.month_seen), 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          data[monthIndex].quantidade += 1;
          const r = Number(m.user_rating);
          if (r > 0) {
            data[monthIndex].somaNota += r;
            data[monthIndex].qtdNotas += 1;
          }
        }
      }
    });

    data.forEach(item => {
      item.notaMedia = item.qtdNotas > 0 ? parseFloat((item.somaNota / item.qtdNotas).toFixed(2)) : 0;
    });

    return data;
  }, [filteredMovies]);

  // Cálculo da comparação mensal multiano (quando selecionado Geral)
  const monthlyComparisonData = useMemo(() => {
    const data = MONTH_NAMES.map((m) => {
      const row = { name: m };
      availableYears.forEach(yr => {
        row[yr] = 0;
      });
      return row;
    });

    movies.forEach(m => {
      if (m.year_seen && m.month_seen) {
        const yr = String(m.year_seen);
        const monthIndex = parseInt(String(m.month_seen), 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12 && data[monthIndex]) {
          if (data[monthIndex][yr] !== undefined) {
            data[monthIndex][yr]++;
          }
        }
      }
    });
    return data;
  }, [movies, availableYears]);

  // 5. Distribuição de Notas
  const ratingData = useMemo(() => {
    const counts = {};
    filteredMovies.forEach(m => {
      const val = Number(m.user_rating);
      if (val > 0) {
        const bucket = val >= 10 ? 10 : Math.floor(val);
        counts[bucket] = (counts[bucket] || 0) + 1;
      }
    });
    return Object.keys(counts)
      .map(key => ({
        name: `Nota ${key}`,
        quantidade: counts[key],
        numericKey: Number(key)
      }))
      .filter(item => item.quantidade > 0)
      .sort((a, b) => a.numericKey - b.numericKey);
  }, [filteredMovies]);

  // 6. Distribuição por Eras e Décadas
  const erasData = useMemo(() => {
    const counts = {
      'Clássicos (1922-69)': 0,
      'Anos 70': 0,
      'Anos 80': 0,
      'Anos 90': 0,
      'Anos 2000': 0,
      'Anos 2010': 0,
      'Anos 2020': 0
    };
    filteredMovies.forEach(m => {
      const yr = Number(m.release_year);
      if (!yr) return;
      if (yr >= 1922 && yr <= 1969) counts['Clássicos (1922-69)']++;
      else if (yr >= 1970 && yr <= 1979) counts['Anos 70']++;
      else if (yr >= 1980 && yr <= 1989) counts['Anos 80']++;
      else if (yr >= 1990 && yr <= 1999) counts['Anos 90']++;
      else if (yr >= 2000 && yr <= 2009) counts['Anos 2000']++;
      else if (yr >= 2010 && yr <= 2019) counts['Anos 2010']++;
      else if (yr >= 2020 && yr <= 2029) counts['Anos 2020']++;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      quantidade: counts[key]
    }));
  }, [filteredMovies]);

  // 7. Países Counts (ignora União Soviética e Alemanha Ocidental)
  const countryCounts = useMemo(() => {
    const counts = {};
    filteredMovies.forEach(m => {
      const countriesList = m.countries || [];
      countriesList.forEach(c => {
        if (c && c.trim()) {
          const name = c.trim();
          if (name !== 'União Soviética' && name !== 'Alemanha Ocidental') {
            counts[name] = (counts[name] || 0) + 1;
          }
        }
      });
    });
    return counts;
  }, [filteredMovies]);

  const countryChartData = useMemo(() => {
    return Object.keys(countryCounts)
      .map(name => ({ name, quantidade: countryCounts[name] }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }, [countryCounts]);

  // 8. Plataformas (Top 10)
  const platformData = useMemo(() => {
    const counts = {};
    filteredMovies.forEach(m => {
      if (m.platform) {
        const p = m.platform.trim();
        counts[p] = (counts[p] || 0) + 1;
      }
    });
    return Object.keys(counts)
      .map(name => ({ name, quantidade: counts[name] }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }, [filteredMovies]);

  // 9. Atributos de Gênero (Top 10)
  const genreChartData = useMemo(() => {
    const genreCounts = {};
    filteredMovies.forEach(m => {
      const genresList = m.genres || [];
      genresList.forEach(g => {
        if (g && g.trim()) {
          const name = g.trim();
          genreCounts[name] = (genreCounts[name] || 0) + 1;
        }
      });
    });
    return Object.keys(genreCounts)
      .map(name => ({ genre: name, count: genreCounts[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredMovies]);

  // 10. Leaderboards / High Scores (Top 10)
  const leaderboards = useMemo(() => {
    const countsTags = {};
    const studioCounts = {};
    const distributorCounts = {};

    filteredMovies.forEach(m => {
      const tagsList = m.tags || [];
      tagsList.forEach(t => {
        if (t && t.trim()) countsTags[t] = (countsTags[t] || 0) + 1;
      });

      const studiosList = m.studios || [];
      studiosList.forEach(s => {
        const clean = normalizeName(s);
        if (clean) studioCounts[clean] = (studioCounts[clean] || 0) + 1;
      });

      if (m.distributor) {
        const dists = getDistributorsList(m.distributor);
        dists.forEach(d => {
          if (d) distributorCounts[d] = (distributorCounts[d] || 0) + 1;
        });
      }
    });

    const getTop10 = (countsObj) => {
      return Object.keys(countsObj)
        .map(name => ({ name, value: countsObj[name] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    };

    return {
      tags: getTop10(countsTags),
      studios: getTop10(studioCounts),
      distributors: getTop10(distributorCounts)
    };
  }, [filteredMovies]);

  // Tooltip customizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-950/95 border border-zinc-800 rounded-xl p-3.5 shadow-2xl flex flex-col gap-1.5 backdrop-blur-md">
          <span className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-1">{data.name}</span>
          <span className="text-xs text-zinc-300 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span>Filmes: <strong className="text-purple-400 font-black">{data.quantidade}</strong></span>
          </span>
          {data.notaMedia !== undefined && (
            <span className="text-xs text-zinc-300 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
              <span>Nota Média: <strong className="text-cyan-400 font-black">{data.notaMedia || 'N/A'}</strong></span>
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  // Tooltip de Comparação de Anos Simplificada e Ordenada
  const ComparisonTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const name = data.name;

      const items = [];
      let total = 0;
      Object.keys(data).forEach(key => {
        if (key !== 'name') {
          const count = Number(data[key]) || 0;
          total += count;
          if (count >= 1) {
            items.push({ year: key, count });
          }
        }
      });

      items.sort((a, b) => b.count - a.count);

      return (
        <div className="bg-zinc-950/95 border border-zinc-800 rounded-xl p-3.5 shadow-2xl flex flex-col gap-1.5 backdrop-blur-md">
          <span className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-1">{name}</span>
          <span className="text-xs text-zinc-300 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-purple-400" />
            <span>Total Acumulado: <strong className="text-purple-400 font-black">{total}</strong></span>
          </span>
          {items.length > 0 && (
            <div className="flex flex-col gap-1 mt-1 border-t border-zinc-900 pt-1.5">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px] gap-4">
                  <span className="text-zinc-400 font-bold">Ano {item.year}:</span>
                  <span className="text-cyan-400 font-black">{item.count} {item.count === 1 ? 'filme' : 'filmes'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      
      {/* 1. Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-4 px-2 gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-500 animate-pulse" />
          <h2 className="text-xl font-black uppercase tracking-widest text-zinc-100">
            Painel de Estatísticas RPG
          </h2>
          <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-black uppercase tracking-widest">
            Campaign Mode Active
          </span>
        </div>

        {/* Filtro de Anos */}
        <div className="flex flex-wrap gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900">
          <button
            onClick={() => setSelectedYear('Geral')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              selectedYear === 'Geral'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            Geral
          </button>
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                selectedYear === year
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* 2. KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Level e XP */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300 shadow-lg shadow-black/30">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-16 h-16 bg-amber-500/5 rounded-full blur-xl"></div>
          <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            XP & Nível
          </span>
          <span className="text-3xl font-black bg-gradient-to-r from-zinc-50 to-amber-400 bg-clip-text text-transparent">
            Lvl {kpis.level}
          </span>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between text-[8px] text-zinc-400 font-bold">
              <span>{kpis.xp} XP acumulado</span>
              <span>{kpis.nextLevelXp} XP</span>
            </div>
            <div className="w-full bg-zinc-950 h-1.5 rounded-full border border-zinc-800/50 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${kpis.xpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Tempo de Campanha */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-cyan-500/50 transition-all duration-300 shadow-lg shadow-black/30">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl"></div>
          <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Tempo de Campanha
          </span>
          <span className="text-3xl font-black bg-gradient-to-r from-zinc-50 to-cyan-400 bg-clip-text text-transparent">
            {kpis.hours}h
          </span>
          <span className="text-[9px] text-zinc-400">Equivale a <strong className="text-zinc-200">{kpis.days} dias</strong> de play</span>
        </div>

        {/* KPI 3: Precisão Crítica (Nota Média) */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-purple-500/50 transition-all duration-300 shadow-lg shadow-black/30">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-16 h-16 bg-purple-500/5 rounded-full blur-xl"></div>
          <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-purple-400 fill-purple-400/10" />
            Precisão Crítica
          </span>
          <span className="text-3xl font-black bg-gradient-to-r from-zinc-50 to-purple-400 bg-clip-text text-transparent">
            {kpis.avgRating}
          </span>
          <span className="text-[9px] text-zinc-400">Total de <strong className="text-zinc-250 font-bold">{kpis.total} filmes</strong> jogados</span>
        </div>

        {/* KPI 4: Conquistas de Oscar */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 shadow-lg shadow-black/30">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl"></div>
          <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            Glória da Academia
          </span>
          <span className="text-2xl font-black text-zinc-200 mt-1 flex items-center gap-1.5">
            🏆 {kpis.oscarWins} <span className="text-[10px] text-zinc-500 font-bold">/</span> 🎬 {kpis.oscarNoms}
          </span>
          <span className="text-[9px] text-zinc-400">Vitórias / Indicações no Oscar</span>
        </div>
      </div>

      {/* 3. Globo 3D Gigante e Centralizado */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-4 items-center">
        <div className="w-full flex items-center justify-between border-b border-zinc-800/50 pb-3">
          <span className="text-xs uppercase font-black text-zinc-300 tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Mapa Mundi 3D: Controle Geográfico de Playbacks
          </span>
          <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2 py-0.5 rounded font-black uppercase tracking-wider">
            Realtime Projection
          </span>
        </div>
        <div className="w-full flex justify-center py-4">
          <InteractiveGlobe countryCounts={countryCounts} />
        </div>
      </div>

      {/* 4. Grid de 2 Colunas: Top 10 Países & Evolução Mensal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top 10 Países */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-4 lg:col-span-1">
          <span className="text-xs uppercase font-black text-zinc-300 tracking-wider flex items-center gap-2 border-b border-zinc-800/50 pb-3">
            <Globe className="w-4 h-4 text-cyan-400" />
            Top 10 Países Assistidos
          </span>
          <div className="w-full h-72 flex items-center">
            {countryChartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs italic">Nenhum país registrado...</div>
            ) : (
              <ResponsiveContainer width="100%" height="95%">
                <BarChart data={countryChartData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <XAxis type="number" stroke="#52525b" tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" stroke="#52525b" tickLine={false} tick={{ fill: '#e4e4e7', fontSize: 10, fontWeight: 'bold' }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="quantidade" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Evolução Mensal */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/50 pb-3 gap-2">
            <span className="text-xs uppercase font-black text-zinc-300 tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Evolução de Mídia e Fluidez (Mês a Mês)
            </span>
            {selectedYear === 'Geral' && (
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 text-[10px] font-black uppercase">
                <button
                  onClick={() => setCompareMode('combined')}
                  className={`px-3 py-1 rounded-lg transition-all duration-300 cursor-pointer ${
                    compareMode === 'combined'
                      ? 'bg-purple-500/25 text-purple-400 font-black border border-purple-500/30'
                      : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  Mesclado
                </button>
                <button
                  onClick={() => setCompareMode('grid')}
                  className={`px-3 py-1 rounded-lg transition-all duration-300 cursor-pointer ${
                    compareMode === 'grid'
                      ? 'bg-purple-500/25 text-purple-400 font-black border border-purple-500/30'
                      : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  Grade
                </button>
                <button
                  onClick={() => setCompareMode('table')}
                  className={`px-3 py-1 rounded-lg transition-all duration-300 cursor-pointer ${
                    compareMode === 'table'
                      ? 'bg-purple-500/25 text-purple-400 font-black border border-purple-500/30'
                      : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  Planilha
                </button>
              </div>
            )}
          </div>
          
          <div className="w-full">
            {selectedYear === 'Geral' ? (
              compareMode === 'combined' ? (
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyComparisonData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#52525b" tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis stroke="#52525b" tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                      <Tooltip content={<ComparisonTooltip />} />
                      {availableYears.map((yr, idx) => {
                        const colors = ['#22d3ee', '#d946ef', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];
                        const color = colors[idx % colors.length];
                        return (
                          <Area 
                            key={yr} 
                            type="monotone" 
                            dataKey={yr} 
                            name={`Ano ${yr}`} 
                            stroke={color} 
                            strokeWidth={2} 
                            fill={color} 
                            fillOpacity={0.02} 
                          />
                        );
                      })}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : compareMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-h-[320px] overflow-y-auto pr-1 scrollbar-hide py-1">
                  {availableYears.map((yr, idx) => {
                    const colors = ['#22d3ee', '#d946ef', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];
                    const color = colors[idx % colors.length];

                    const dataForYear = MONTH_NAMES.map((m, monthIdx) => {
                      let count = 0;
                      movies.forEach(movie => {
                        if (String(movie.year_seen) === yr && Number(movie.month_seen) === (monthIdx + 1)) {
                          count++;
                        }
                      });
                      return { name: m, quantidade: count };
                    });

                    const yearTotal = dataForYear.reduce((acc, curr) => acc + curr.quantidade, 0);

                    return (
                      <div key={yr} className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-xl flex flex-col gap-2 relative overflow-hidden group hover:border-zinc-800 transition-all duration-300">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5 z-10">
                          <span className="text-[10px] font-black text-zinc-300 uppercase tracking-wider">Ano {yr}</span>
                          <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-black uppercase">{yearTotal} filmes</span>
                        </div>
                        <div className="w-full h-28">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataForYear} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                              <XAxis dataKey="name" stroke="#3f3f46" tickLine={false} tick={{ fill: '#71717a', fontSize: 8 }} />
                              <YAxis stroke="#3f3f46" tickLine={false} tick={{ fill: '#71717a', fontSize: 8 }} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                                itemStyle={{ color: color, fontSize: '10px', fontWeight: 'bold' }}
                                labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '10px' }}
                              />
                              <Area type="monotone" dataKey="quantidade" name="Filmes" stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.05} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full overflow-x-auto border border-zinc-900 rounded-xl bg-zinc-950/40 scrollbar-hide max-h-[320px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-10">
                        <th className="p-2.5 text-zinc-400 font-bold uppercase tracking-wider bg-zinc-950">Mês</th>
                        {availableYears.map(yr => (
                          <th key={yr} className="p-2.5 text-zinc-300 font-black uppercase text-center bg-zinc-950">{yr}</th>
                        ))}
                        <th className="p-2.5 text-purple-400 font-black uppercase text-center bg-zinc-950">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MONTH_NAMES.map((m, monthIdx) => {
                        let rowTotal = 0;
                        return (
                          <tr key={m} className="border-b border-zinc-900/60 hover:bg-zinc-900/10 transition-colors">
                            <td className="p-2.5 text-zinc-200 font-bold uppercase">{m}</td>
                            {availableYears.map(yr => {
                              const count = monthlyComparisonData[monthIdx][yr] || 0;
                              rowTotal += count;
                              return (
                                <td key={yr} className="p-2.5 text-zinc-400 text-center font-semibold">
                                  {count > 0 ? count : '-'}
                                </td>
                              );
                            })}
                            <td className="p-2.5 text-purple-400 text-center font-black bg-purple-500/5">{rowTotal}</td>
                          </tr>
                        );
                      })}
                      {/* Linha de Rodapé com Totais */}
                      <tr className="bg-zinc-950/80 border-t border-zinc-800 font-bold sticky bottom-0 z-10">
                        <td className="p-2.5 text-zinc-100 font-black uppercase tracking-wider bg-zinc-950">Total</td>
                        {availableYears.map(yr => {
                          const colTotal = monthlyComparisonData.reduce((acc, curr) => acc + (curr[yr] || 0), 0);
                          return (
                            <td key={yr} className="p-2.5 text-cyan-400 text-center font-black bg-cyan-500/5 bg-zinc-950">{colTotal}</td>
                          );
                        })}
                        <td className="p-2.5 text-amber-400 text-center font-black bg-amber-500/10 border border-amber-500/20 bg-zinc-950">
                          {movies.length}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d946ef" stopOpacity={0.45}/>
                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#52525b" tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis stroke="#52525b" tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="quantidade" stroke="#d946ef" strokeWidth={2} fill="url(#purpleGrad)" />
                    <Area type="monotone" dataKey="notaMedia" stroke="#22d3ee" strokeWidth={2} fill="url(#cyanGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. Grid de 2 Colunas: Notas Pessoais & Eras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribuição de Notas */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <span className="text-xs uppercase font-black text-zinc-300 tracking-wider flex items-center gap-2 border-b border-zinc-800/50 pb-3">
            <Star className="w-4 h-4 text-purple-400" />
            Perfil Crítico (Distribuição de Notas Reais)
          </span>
          <div className="w-full h-64">
            {ratingData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs italic">Nenhuma nota cadastrada...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#52525b" tickLine={false} tick={{ fill: '#e4e4e7', fontSize: 10, fontWeight: 'black' }} />
                  <YAxis stroke="#52525b" tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#d946ef', fontSize: '11px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '11px' }}
                  />
                  <Bar dataKey="quantidade" fill="#d946ef" shape={<CanisterBar />} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Eras e Décadas */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <span className="text-xs uppercase font-black text-zinc-300 tracking-wider flex items-center gap-2 border-b border-zinc-800/50 pb-3">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Eras de Lançamento (Clássicos & Décadas)
          </span>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={erasData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#52525b" tickLine={false} tick={{ fill: '#e4e4e7', fontSize: 8, fontWeight: 'bold' }} />
                <YAxis stroke="#52525b" tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#22d3ee', fontSize: '11px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '11px' }}
                />
                <Bar dataKey="quantidade" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 6. Grid de 2 Colunas: Plataformas & Gêneros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Plataformas */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <span className="text-xs uppercase font-black text-zinc-300 tracking-wider flex items-center gap-2 border-b border-zinc-800/50 pb-3">
            <Tv className="w-4 h-4 text-cyan-400" />
            Canais de Acesso (Top 10 Plataformas)
          </span>
          <div className="w-full h-64">
            {platformData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs italic">Nenhum canal registrado...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
                  <XAxis type="number" stroke="#52525b" tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" stroke="#52525b" tickLine={false} tick={{ fill: '#e4e4e7', fontSize: 10, fontWeight: 'bold' }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="quantidade" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Radar de Gêneros */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <span className="text-xs uppercase font-black text-zinc-300 tracking-wider flex items-center gap-2 border-b border-zinc-800/50 pb-3">
            <Flame className="w-4 h-4 text-fuchsia-500 animate-pulse" />
            Perfil de Gêneros (Top 10)
          </span>
          <div className="w-full h-64 flex items-center justify-center">
            {genreChartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-zinc-650 text-xs italic">Nenhum gênero cadastrado...</div>
            ) : (
              <ResponsiveContainer width="100%" height="95%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={genreChartData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="genre" tick={{ fill: '#e4e4e7', fontSize: 9, fontWeight: 'black' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#71717a', fontSize: 8 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }} 
                    itemStyle={{ color: '#d946ef', fontSize: '11px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '11px' }}
                  />
                  <Radar name="Filmes" dataKey="count" stroke="#d946ef" fill="#d946ef" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 7. Leaderboards de Alta Pontuação (Top 10) */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
        <span className="text-xs uppercase font-black text-zinc-300 tracking-wider flex items-center gap-2 border-b border-zinc-800/50 pb-3">
          <Target className="w-4 h-4 text-amber-500" />
          High Scores: Ranking Geral de Metadados (Top 10)
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Tags */}
          <div className="flex flex-col gap-3 bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-black text-purple-400 tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-1.5">
              🏷️ Top 10 Tags
            </span>
            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-hide">
              {leaderboards.tags.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-zinc-900/20 border border-zinc-900 px-3 py-2 rounded-lg">
                  <span className="font-semibold text-zinc-300 truncate max-w-[130px]">{idx+1}. {item.name}</span>
                  <span className="text-[9px] font-black bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/25">{item.value}x</span>
                </div>
              ))}
              {leaderboards.tags.length === 0 && <span className="text-[10px] text-zinc-650 italic py-2 text-center">Nenhum dado...</span>}
            </div>
          </div>

          {/* Top Estúdios */}
          <div className="flex flex-col gap-3 bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-black text-cyan-400 tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-1.5">
              🏢 Top 10 Estúdios
            </span>
            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-hide">
              {leaderboards.studios.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-zinc-900/20 border border-zinc-900 px-3 py-2 rounded-lg">
                  <span className="font-semibold text-zinc-300 truncate max-w-[130px]">{idx+1}. {item.name}</span>
                  <span className="text-[9px] font-black bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/25">{item.value}x</span>
                </div>
              ))}
              {leaderboards.studios.length === 0 && <span className="text-[10px] text-zinc-650 italic py-2 text-center">Nenhum dado...</span>}
            </div>
          </div>

          {/* Top Distribuidoras */}
          <div className="flex flex-col gap-3 bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-black text-amber-400 tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-1.5">
              📦 Top 10 Distribuidoras
            </span>
            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-hide">
              {leaderboards.distributors.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-zinc-900/20 border border-zinc-900 px-3 py-2 rounded-lg">
                  <span className="font-semibold text-zinc-300 truncate max-w-[130px]">{idx+1}. {item.name}</span>
                  <span className="text-[9px] font-black bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/25">{item.value}x</span>
                </div>
              ))}
              {leaderboards.distributors.length === 0 && <span className="text-[10px] text-zinc-650 italic py-2 text-center">Nenhum dado...</span>}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
