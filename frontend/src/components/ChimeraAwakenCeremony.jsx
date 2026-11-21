import React, { useEffect, useState, useRef } from 'react';
import {
  Sparkles,
  CheckCircle2,
  X,
  Swords,
  Crown,
  Film,
  Coins,
  Flame,
} from 'lucide-react';

const COIN_BURST_PARTICLES = [
  { icon: '🪙', tx: '-160px', ty: '-120px', rot: '-220deg' },
  { icon: '👑', tx: '-110px', ty: '-165px', rot: '180deg' },
  { icon: '✨', tx: '-55px', ty: '-185px', rot: '-140deg' },
  { icon: '💎', tx: '0px', ty: '-195px', rot: '260deg' },
  { icon: '🪙', tx: '60px', ty: '-180px', rot: '-200deg' },
  { icon: '🎰', tx: '118px', ty: '-155px', rot: '210deg' },
  { icon: '✨', tx: '165px', ty: '-115px', rot: '-280deg' },
  { icon: '🪙', tx: '-185px', ty: '-45px', rot: '150deg' },
  { icon: '⭐', tx: '185px', ty: '-45px', rot: '-150deg' },
  { icon: '💎', tx: '-140px', ty: '40px', rot: '240deg' },
  { icon: '🪙', tx: '140px', ty: '40px', rot: '-240deg' },
  { icon: '🔥', tx: '-85px', ty: '-95px', rot: '190deg' },
  { icon: '🪙', tx: '90px', ty: '-95px', rot: '-190deg' },
  { icon: '👑', tx: '0px', ty: '-130px', rot: '360deg' },
];

function getJackpotTierBanner(hitCount, isClaimed) {
  if (hitCount >= 4) {
    return {
      title: isClaimed ? '👑 MEGA FULL JACKPOT 4/4 COLHIDO!' : '👑 MEGA FULL JACKPOT 4/4!',
      cls: 'chimera-jackpot-banner bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 text-zinc-950 border-yellow-100',
    };
  }
  if (hitCount === 3) {
    return {
      title: isClaimed ? '🎰 TRIPLO JACKPOT DOURADO COLHIDO!' : '🎰 TRIPLO JACKPOT DOURADO!',
      cls: 'chimera-jackpot-banner bg-gradient-to-r from-amber-500/35 via-yellow-400/35 to-amber-500/35 text-amber-100 border-amber-300',
    };
  }
  if (hitCount === 2) {
    return {
      title: isClaimed ? '🎰 DUPLO JACKPOT COLHIDO!' : '🎰 DUPLO JACKPOT ATINGIDO!',
      cls: 'chimera-jackpot-banner bg-amber-500/25 text-amber-100 border-amber-300',
    };
  }
  if (hitCount === 1) {
    return {
      title: isClaimed ? '🎰 JACKPOT COLHIDO!' : '🎰 JACKPOT ATINGIDO!',
      cls: 'bg-amber-500/20 text-amber-200 border-amber-400/70',
    };
  }
  return {
    title: isClaimed ? '⚔️ ESPÓLIO DE VITÓRIA COLHIDO!' : '⚔️ QUIMERA ABATIDA — VITÓRIA!',
    cls: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60',
  };
}

export default function ChimeraAwakenCeremony({
  contract = null,
  revealStep = 0,
  claiming = false,
  claimResult = null,
  onConfirmClaim = () => {},
  onClose = () => {},
}) {
  const [displayedXp, setDisplayedXp] = useState(0);
  const displayedXpRef = useRef(0);

  const r = contract?.recipe || {};
  const md = contract?.matchDetails || {};
  const movie = contract?.matchedMovie || {};
  const totalXp = Number(md.totalClaimableXp || r.totalBaseXp || 0);
  const jackpotsHit = Number(md.jackpotsHitCount || 0);
  const isClaimed = Boolean(claimResult);

  // Odômetro acelerado sincronizado com o avanço das etapas
  useEffect(() => {
    if (!contract) return;
    const target =
      revealStep >= 5
        ? totalXp
        : Math.round((totalXp * Math.min(4, revealStep)) / 5);

    const startVal = displayedXpRef.current;
    if (startVal === target) return;

    const duration = 360;
    const startTs = performance.now();
    let rafId = 0;

    const tick = (now) => {
      const elapsed = now - startTs;
      const pct = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - pct, 3);
      const nextVal = Math.round(startVal + (target - startVal) * eased);
      displayedXpRef.current = nextVal;
      setDisplayedXp(nextVal);
      if (pct < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [contract, revealStep, totalXp]);

  useEffect(() => {
    if (!contract) {
      displayedXpRef.current = 0;
      setDisplayedXp(0);
    }
  }, [contract]);

  if (!contract) return null;

  const visibleJackpots =
    (revealStep >= 1 && md.hitJackpotYear ? 1 : 0) +
    (revealStep >= 2 && md.hitJackpotCountry ? 1 : 0) +
    (revealStep >= 3 && md.hitJackpotGenre ? 1 : 0) +
    (revealStep >= 4 && md.hitJackpotTag ? 1 : 0);

  const banner = getJackpotTierBanner(revealStep >= 4 ? jackpotsHit : visibleJackpots, isClaimed);
  const sacSet = new Set(r.sacrificedPillars || []);
  const optSet = new Set(r.optionalPillars || []);
  const sealedRunes =
    Array.isArray(r.chosenFateRunes) && r.chosenFateRunes.length > 0
      ? r.chosenFateRunes
      : r.chosenFateRune
      ? [r.chosenFateRune]
      : [];

  const yearSkipped = !sacSet.has('year') && optSet.has('year') && md.baseYearOk === false;
  const countrySkipped = !sacSet.has('country') && optSet.has('country') && md.baseCountryOk === false;
  const genreSkipped = !sacSet.has('genre') && optSet.has('genre') && md.baseGenreOk === false;
  const tagSkipped = !sacSet.has('tag') && optSet.has('tag') && md.baseTagOk === false;

  const steps = [
    {
      label: sacSet.has('year')
        ? '🗡️ Época Sacrificada'
        : yearSkipped
        ? '♾️ Época Dispensada'
        : `📅 Época (${r.minYear}–${r.maxYear}${r.allowPost2000 ? ' ou 2000+' : ''})`,
      hit: !sacSet.has('year') && !yearSkipped && md.hitJackpotYear,
      hitText: '🎰 JACKPOT! Critério de Ano Premiado!',
      sacrificed: sacSet.has('year'),
      optionalSkipped: yearSkipped,
      baseXp: sacSet.has('year') || yearSkipped ? 0 : (r.baseYearXp || 0),
      bonusXp: yearSkipped ? 0 : (md.jackpotYearXp || 0),
    },
    {
      label: sacSet.has('country')
        ? '🗡️ Bloco Sacrificado'
        : countrySkipped
        ? '🧭 Países Dispensados'
        : `${r.blockIcon || '🌍'} Bloco (${r.blockLabel})`,
      hit: !sacSet.has('country') && !countrySkipped && md.hitJackpotCountry,
      hitText: `🎰 JACKPOT! País Premiado (${(md.matchedCountries || [])[0] || r.jackpotCountry})`,
      sacrificed: sacSet.has('country'),
      optionalSkipped: countrySkipped,
      baseXp: sacSet.has('country') || countrySkipped ? 0 : (r.baseCountryXp || 0),
      bonusXp: countrySkipped ? 0 : (md.jackpotCountryXp || 0),
    },
    {
      label: sacSet.has('genre')
        ? '🗡️ Gêneros Sacrificados'
        : genreSkipped
        ? '🕊️ Gêneros Dispensados'
        : `🎭 Gêneros (${(r.genres || []).slice(0, 3).join(' / ')}${(r.genres || []).length > 3 ? '…' : ''})`,
      hit: !sacSet.has('genre') && !genreSkipped && md.hitJackpotGenre,
      hitText: r.stackableGenreJackpots
        ? '🌀 JACKPOT! Gêneros & Ouros Acumulados!'
        : '🎰 JACKPOT! Dupla de Gêneros!',
      sacrificed: sacSet.has('genre'),
      optionalSkipped: genreSkipped,
      baseXp: sacSet.has('genre') || genreSkipped ? 0 : (r.baseGenreXp || 0),
      bonusXp: genreSkipped ? 0 : (md.jackpotGenreXp || 0),
    },
    {
      label: sacSet.has('tag')
        ? '🗡️ Tags Sacrificadas'
        : tagSkipped
        ? '🌑 Tags Dispensadas'
        : `🏷️ Tags (${(md.matchedTags || []).join(', ') || 'Tag compatível'})`,
      hit: !sacSet.has('tag') && !tagSkipped && md.hitJackpotTag,
      hitText: r.stackableTagJackpots
        ? '☄️ JACKPOT! Tags Ouro Acumuladas!'
        : '👑 JACKPOT! Tag Dourada Ativada!',
      sacrificed: sacSet.has('tag'),
      optionalSkipped: tagSkipped,
      baseXp: sacSet.has('tag') || tagSkipped ? 0 : (r.baseTagXp || 0),
      bonusXp: tagSkipped ? 0 : (md.jackpotTagXp || 0),
    },
  ];

  return (
    <div className="fixed inset-0 z-[130] bg-black/88 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`relative w-full max-w-2xl rounded-3xl border-2 p-5 sm:p-7 flex flex-col gap-5 overflow-hidden transition-all duration-500 ${
          isClaimed || (revealStep >= 4 && jackpotsHit >= 2)
            ? 'border-amber-300 bg-gradient-to-b from-amber-950/60 via-zinc-950 to-amber-950/45 shadow-[0_0_95px_rgba(251,191,36,0.42)]'
            : 'border-amber-400/70 bg-gradient-to-b from-zinc-900 via-zinc-950 to-emerald-950/35 shadow-[0_0_70px_rgba(251,191,36,0.28)]'
        }`}
      >
        {/* Brilho Diagonal de Golpe Crítico ao Abater */}
        <div className="chimera-slash-effect pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />

        {/* Chuva de Moedas & Estrelas Douradas ao Colher! */}
        {isClaimed && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
            {COIN_BURST_PARTICLES.map((p, idx) => (
              <span
                key={idx}
                className="chimera-coin-particle absolute text-2xl sm:text-3xl select-none"
                style={{
                  '--tx': p.tx,
                  '--ty': p.ty,
                  '--rot': p.rot,
                  animationDelay: `${(idx % 5) * 0.05}s`,
                }}
              >
                {p.icon}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-zinc-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho de Abate RPG + Banner Jackpot */}
        <div className="relative z-10 flex flex-col items-center text-center gap-2.5">
          <div
            className={`px-4 py-1.5 rounded-full border text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${banner.cls}`}
          >
            {banner.title}
          </div>

          <div className="flex items-center gap-4 mt-1">
            <div className="w-16 h-24 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.4)] bg-zinc-900 shrink-0">
              {movie.posterUrl ? (
                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-300">
                  <Film className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-300 flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5" />
                Golpe Final Aplicado Por:
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
                {movie.title || 'Filme Compatível'}
              </h3>
              {r.creatureTitle && (
                <div className="text-xs text-amber-200/85 mt-0.5">
                  Abateu <strong>👾 {r.creatureTitle}</strong> • 🎰 {jackpotsHit}/4 Jackpots
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Espólios & Carimbos de Jackpot */}
        <div className="relative z-10 flex flex-col gap-2">
          {steps.map((st, idx) => {
            const revealed = revealStep > idx;
            return (
              <div
                key={st.label}
                className={`rounded-2xl border px-4 py-2.5 flex items-center justify-between gap-3 transition-all duration-300 ${
                  !revealed
                    ? 'opacity-30 border-zinc-800 bg-zinc-900/50'
                    : st.hit
                    ? 'chimera-wax-slam border-amber-400 bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-yellow-500/20 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                    : 'chimera-jackpot-pop border-emerald-500/45 bg-emerald-500/10 text-emerald-100'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-black">{st.label}</span>
                  {revealed && (
                    <span className="text-[11px] opacity-90">
                      {st.sacrificed
                        ? '🗡️ Liberada pela Carta de Sacrifício'
                        : st.optionalSkipped
                        ? '🕊️ Dispensada pela Carta (Fora do critério → +0 XP)'
                        : st.hit
                        ? st.hitText
                        : '✅ Base concluída'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {revealed && st.hit && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black uppercase tracking-wider">
                      JACKPOT!
                    </span>
                  )}
                  <span
                    className={`font-mono text-xs font-black ${
                      !revealed ? 'text-zinc-500' : st.hit ? 'text-amber-300' : 'text-emerald-300'
                    }`}
                  >
                    {revealed ? `+${st.baseXp + st.bonusXp} XP` : '...'}
                  </span>
                </div>
              </div>
            );
          })}

          {revealStep >= 5 &&
            ((r.difficultyBonusXp || 0) > 0 ||
              r.specialRule ||
              (md.dubbingBonusXp || 0) > 0 ||
              (r.requiresDubbedBonusXp || 0) > 0 ||
              (md.subbingBonusXp || 0) > 0 ||
              (r.requiresSubbedBonusXp || 0) > 0 ||
              (md.categoryBoostXp || 0) > 0 ||
              (r.categoryXpMultiplierBonusRate || 0) > 0 ||
              sealedRunes.length > 0) && (
            <div className="chimera-jackpot-pop grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              {(r.difficultyBonusXp || 0) > 0 && (
                <div className="rounded-xl border border-rose-400/50 bg-rose-500/15 px-3 py-2 flex items-center justify-between text-[11px] text-rose-100 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-300" /> Bônus D20 Difícil
                  </span>
                  <span className="font-mono font-black">+{r.difficultyBonusXp} XP</span>
                </div>
              )}

              {r.specialRule && (
                <div
                  className={`rounded-xl border px-3 py-2 flex items-center justify-between text-[11px] font-bold ${
                    md.hitSpecialBonus
                      ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-100'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-500'
                  }`}
                >
                  <span className="truncate">{r.specialRule.icon} {r.specialRule.label}</span>
                  <span className="font-mono font-black shrink-0 ml-2">
                    {md.hitSpecialBonus ? `+${md.specialBonusXp} XP` : '+0 XP'}
                  </span>
                </div>
              )}

              {(r.requiresDubbedBonusXp || 0) > 0 && (
                <div
                  className={`rounded-xl border px-3 py-2 flex items-center justify-between text-[11px] font-bold ${
                    md.hitDubbingBonus
                      ? 'border-emerald-400/65 bg-emerald-500/15 text-emerald-100'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-500'
                  }`}
                >
                  <span>🎙️ Estrela da Dublagem</span>
                  <span className="font-mono font-black">
                    {md.hitDubbingBonus ? `+${md.dubbingBonusXp} XP` : '+0 XP (Legendado)'}
                  </span>
                </div>
              )}

              {(r.requiresSubbedBonusXp || 0) > 0 && (
                <div
                  className={`rounded-xl border px-3 py-2 flex items-center justify-between text-[11px] font-bold ${
                    md.hitSubbingBonus
                      ? 'border-sky-400/65 bg-sky-500/15 text-sky-100'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-500'
                  }`}
                >
                  <span>💬 Estrela das Legendas</span>
                  <span className="font-mono font-black">
                    {md.hitSubbingBonus ? `+${md.subbingBonusXp} XP` : '+0 XP (Não Legendado)'}
                  </span>
                </div>
              )}

              {((r.categoryXpMultiplierBonusRate || 0) > 0 || (md.categoryBoostXp || 0) > 0) && (
                <div className="rounded-xl border border-amber-400/65 bg-amber-500/15 px-3 py-2 flex items-center justify-between text-[11px] text-amber-100 font-bold">
                  <span>
                    🗼 Sobrecarga da Torre (+{Math.round((r.categoryXpMultiplierBonusRate || 0.25) * 100)}%/Cat)
                  </span>
                  <span className="font-mono font-black">+{md.categoryBoostXp || 0} XP</span>
                </div>
              )}

              {sealedRunes.length > 0 && (
                <div
                  className={`rounded-xl border px-3 py-2 flex items-center justify-between gap-2 text-[11px] font-bold sm:col-span-2 ${
                    (md.runeBonusXp || 0) > 0
                      ? 'border-purple-400/65 bg-purple-500/15 text-purple-100'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                  }`}
                >
                  <span>
                    🔮 Cartas de Tarô ({sealedRunes.length}):{' '}
                    {sealedRunes.map((sr) => `${sr.icon} ${sr.runeName}`).join(' • ')}
                  </span>
                  <span className="font-mono font-black shrink-0">
                    {(md.runeBonusXp || 0) > 0 ? `+${md.runeBonusXp} XP` : 'Poderes Aplicados'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Baú de Tesouro / Odômetro de XP + CTA Final */}
        <div
          className={`relative z-10 rounded-2xl border-2 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            isClaimed
              ? 'border-emerald-400 bg-emerald-950/40'
              : 'border-amber-400/65 bg-zinc-950/90'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isClaimed
                  ? 'bg-emerald-400 text-zinc-950'
                  : 'bg-gradient-to-br from-amber-300 to-yellow-500 text-zinc-950 shadow-lg shadow-amber-400/30'
              }`}
            >
              {isClaimed ? <Crown className="w-6 h-6" /> : <Coins className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-widest text-amber-300/85">
                {isClaimed ? 'Espólio Adicionado ao Seu Nível!' : 'Baú de XP da Quimera'}
              </div>
              <div className="text-3xl font-black font-mono text-amber-300 leading-none mt-1">
                +{displayedXp.toLocaleString('pt-BR')} XP
              </div>
            </div>
          </div>

          {isClaimed ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black uppercase text-xs tracking-wider shadow-lg cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Vitória Selada! Fechar
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirmClaim}
              disabled={claiming || revealStep < 4}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black uppercase text-xs sm:text-sm tracking-wider transition-all cursor-pointer disabled:opacity-50 ${
                jackpotsHit >= 1
                  ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 text-zinc-950 shadow-[0_0_32px_rgba(251,191,36,0.55)] hover:scale-[1.03]'
                  : 'bg-gradient-to-r from-emerald-400 to-amber-300 text-zinc-950 shadow-lg hover:scale-[1.02]'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${claiming ? 'animate-spin' : ''}`} />
              {claiming
                ? 'Colhendo Espólio...'
                : jackpotsHit >= 1
                ? '🎰 COLHER JACKPOT & XP!'
                : '⚔️ COLHER ESPÓLIO & XP!'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
