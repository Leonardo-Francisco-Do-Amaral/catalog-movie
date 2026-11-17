import React, { useState } from 'react';
import { Sparkles, X, Flame, Tv, CheckCircle2, Layers, Building2, Mic } from 'lucide-react';

const LEVEL_RANKS = [
  { range: '1–4', min: 1, title: 'Criança Escolhida do Acampamento de Verão (Cadê Meu Digivice?!)' },
  { range: '5–9', min: 5, title: 'Pulei a Abertura? Jamais!' },
  { range: '10–14', min: 10, title: 'Corda Arrebentada da Fender Stratocaster do Mafuyu' },
  { range: '15–19', min: 15, title: 'Esperando a Temporada 2 que Nunca Vem' },
  { range: '20–24', min: 20, title: 'Treinando a 100x a Gravidade na Nave da Corporação Cápsula' },
  { range: '25–29', min: 25, title: 'Vocalista da Banda Given no Primeiro Live' },
  { range: '30–34', min: 30, title: 'Alquimista Federal: Lei da Troca Equivalente (Sono por Episódios!)' },
  { range: '35–39', min: 35, title: 'Digievolução para o Nível Mega!' },
  { range: '40–44', min: 40, title: 'Capitão do Gotei 13 do Sofá' },
  { range: '45–49', min: 45, title: '"Esse Ainda Não É nem o Meu Poder Total!" (Mais de 8.000!)' },
  { range: '50–54', min: 50, title: 'Atravessou o Portão da Verdade sem Usar Pedra Filosofal' },
  { range: '55–59', min: 55, title: 'Dominou a Bankai Completa na Soul Society' },
  { range: '60–64', min: 60, title: 'Cavaleiro Real do Mundo Digital (Omegamon Approves!)' },
  { range: '65–69', min: 65, title: 'Instinto Superior do Controle Remoto' },
  { range: '70–74', min: 70, title: 'Sobrevivente da Guerra Sangrenta dos Mil Anos' },
  { range: '75+', min: 75, title: 'A Entidade Absoluta dos Animes (Shenlong Já Te Conhece pelo Nome!)' },
];

export default function TvXpBar({ xpStatus }) {
  const [open, setOpen] = useState(false);

  const level = xpStatus?.level ?? 1;
  const title = xpStatus?.levelTitle ?? LEVEL_RANKS[0].title;
  const totalXp = xpStatus?.totalXp ?? 0;
  const pct = xpStatus?.progressPercentage ?? 0;
  const xpInLevel = xpStatus?.xpInCurrentLevel ?? 0;
  const xpNeeded = xpStatus?.xpNeededForNextLevel ?? 60;
  const breakdown = xpStatus?.breakdown || {
    episodesWatched: 0,
    episodeXp: 0,
    completedSeasons: 0,
    seasonXp: 0,
    completedShows: 0,
    showXp: 0,
    marathonDays: 0,
    marathonXp: 0,
    unlockedStudios: 0,
    studioLeagueXp: 0,
    unlockedVoices: 0,
    voiceAlbumXp: 0,
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`⛩️ LVL ${level} • ${title} (${totalXp} XP) — Clique para ver detalhes do XP Sakura`}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-pink-500/35 bg-zinc-900/80 hover:border-pink-400/70 hover:bg-pink-500/10 text-zinc-100 transition-all duration-200 cursor-pointer shadow-[0_0_16px_rgba(236,72,153,0.12)]"
      >
        <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
        <div className="flex flex-col items-start leading-none gap-1">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
            <span className="text-pink-400 shrink-0">⛩️ LVL {level}</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-200 max-w-[140px] lg:max-w-[200px] truncate hidden sm:inline">
              {title}
            </span>
          </div>
          <div className="w-full min-w-[110px] bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-pink-500/25">
            <div
              className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(pct > 0 ? 5 : 0, pct)}%` }}
            />
          </div>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-zinc-950 border border-pink-500/40 rounded-2xl shadow-2xl shadow-pink-500/15 overflow-hidden flex flex-col max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-zinc-950 border-b border-pink-500/25 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-pink-400">
                  ⛩️ Sistema de XP Exclusivo (Animes &amp; Séries)
                </div>
                <h3 className="text-lg font-black text-zinc-100 mt-0.5">
                  Nível {level} — {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto tv-sakura-scroll space-y-5">
              <div className="bg-zinc-900/70 border border-pink-500/25 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-pink-300">{totalXp.toLocaleString('pt-BR')} XP Total</span>
                  <span className="text-zinc-400">
                    {xpInLevel} / {xpNeeded} XP para Nível {level + 1} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct > 0 ? 3 : 0, pct)}%` }}
                  />
                </div>
                {xpStatus?.nextTitleMilestone && (
                  <p className="text-[11px] text-purple-300/90 mt-2">
                    Próximo título no nível <strong>{xpStatus.nextTitleMilestone.level}</strong>:{' '}
                    {xpStatus.nextTitleMilestone.title}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-400">
                    <Tv className="w-3.5 h-3.5 text-pink-400" />
                    Episódios
                  </div>
                  <div className="text-lg font-black text-zinc-100 mt-1">{breakdown.episodesWatched}</div>
                  <div className="text-[11px] text-pink-400 font-bold">+{breakdown.episodeXp} XP</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-400">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Temporadas
                  </div>
                  <div className="text-lg font-black text-zinc-100 mt-1">{breakdown.completedSeasons}</div>
                  <div className="text-[11px] text-purple-400 font-bold">+{breakdown.seasonXp} XP</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Obras Feitas
                  </div>
                  <div className="text-lg font-black text-zinc-100 mt-1">{breakdown.completedShows}</div>
                  <div className="text-[11px] text-emerald-400 font-bold">+{breakdown.showXp} XP</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-400">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    Maratonas
                  </div>
                  <div className="text-lg font-black text-zinc-100 mt-1">{breakdown.marathonDays} dias</div>
                  <div className="text-[11px] text-rose-400 font-bold">+{breakdown.marathonXp} XP</div>
                </div>
                <div className="bg-zinc-900/60 border border-fuchsia-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-400">
                    <Building2 className="w-3.5 h-3.5 text-fuchsia-400" />
                    Estúdios
                  </div>
                  <div className="text-lg font-black text-zinc-100 mt-1">{breakdown.unlockedStudios ?? 0}/19</div>
                  <div className="text-[11px] text-fuchsia-400 font-bold">+{breakdown.studioLeagueXp ?? 0} XP</div>
                </div>
                <div className="bg-zinc-900/60 border border-purple-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-400">
                    <Mic className="w-3.5 h-3.5 text-purple-400" />
                    Dubladores
                  </div>
                  <div className="text-lg font-black text-zinc-100 mt-1">{breakdown.unlockedVoices ?? 0} vozes</div>
                  <div className="text-[11px] text-purple-400 font-bold">+{breakdown.voiceAlbumXp ?? 0} XP</div>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3">
                <strong className="text-pink-300">Fontes Ativas de XP:</strong> Episódios (+1 XP),
                Temporadas concluídas (+20 XP), Obras concluídas (+50 XP), Maratonas ao vivo (+15 XP),
                <strong> Liga dos Estúdios</strong> (20/30/50/100/170 + ★30 XP) e <strong>Álbum de Dubladores JP/EUA</strong> (15/30/50/80/120 XP).
                Os Troféus exclusivos entram na Fase 5!
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2.5">
                  Patentes Otaku (Níveis Separados do Cinema)
                </h4>
                <div className="space-y-1.5">
                  {LEVEL_RANKS.map((rank) => {
                    const unlocked = level >= rank.min;
                    const isCurrent =
                      level >= rank.min &&
                      (LEVEL_RANKS.find((r) => r.min > rank.min)?.min ?? Infinity) > level;
                    return (
                      <div
                        key={rank.range}
                        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border text-xs ${
                          isCurrent
                            ? 'bg-pink-500/20 border-pink-400/60 text-pink-100 font-bold'
                            : unlocked
                            ? 'bg-zinc-900/70 border-zinc-800 text-zinc-200'
                            : 'bg-zinc-950/60 border-zinc-900 text-zinc-600'
                        }`}
                      >
                        <span className="truncate">{rank.title}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 shrink-0">
                          LVL {rank.range}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
