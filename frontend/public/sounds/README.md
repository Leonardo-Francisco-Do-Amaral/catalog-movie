# Pasta de Áudios e Memes (`frontend/public/sounds`)

Organização atual dos áudios usados pelos motores [`trophyAudio.js`](../../src/utils/trophyAudio.js) e [`universeAudio.js`](../../src/utils/universeAudio.js).

## Estrutura das subpastas

- `trofeus/` — conquistas desbloqueadas e progresso parcial (tocam 1 som vencedor por leva de 4: **Específico > Grau mais raro > Progresso**):
  - `especificos/` — sons exclusivos de troféus individuais (Prioridade 1)
  - `bronze/` — troféus Bronze (`all-chaos-emeralds-sonic-3-knuckles.mp3`)
  - `prata/` — troféus Prata (`two-time-respawne-forsaken.mp3`)
  - `epico/` — troféus Épico (`ocarina-of-time-puzzle-solve-jingle-secret-sound.mp3`)
  - `ouro/` — troféus Ouro (`ps4-trophy.mp3`)
  - `mitico/` — troféus Mítico (`ps5-original-trophy.mp3`)
  - `platina/` — troféu Platina (`seu-madruga-nossa.mp3`)
  - `progresso/` — aviso parcial (`26f8b9_sonic_ring_sound_effect.mp3`)
- `paises/` — Desafio dos 195:
  - `geral/` — som padrão de país novo (`25_plane.wav`, toca antes dos áudios específicos quando houver)
  - `por-pais/` — `cn_2F_announcer_china.wav` (China), `ru_30_announcer_ussr.wav` (Rússia), `th_33_announcer_thailand.wav` (Tailândia)
- `duelos/` — Tomada de Trono / Duelo pelo Trono (País ou Ano):
  - `efeitos/` — `shatter_glass_glass-breaking.mp3`, `slash_cleave_katana-1-hit.mp3`, `thanos_snap_thanos-snap-sound-effect.mp3`, `card_drop_shotgun.wav`
  - `desafiante/` — `here-comes-a-new-challenger.mp3` (toca logo após o efeito da derrota)
- `xp-e-nivel/`:
  - `xp/` — `orb.mp3` (barra subiu sem level up)
  - `level-up/` — `levelup_sVAqjan.mp3` (subiu de nível comum)
  - `patamar/` — `ragnarok_MVP.m4a` (novo título a cada 5 níveis)
  - `classe/` — `final-fantasy-vii-victory-fanfare-1_dZiSUE7.mp3` (evolução / nova classe RPG)
- `maquina-do-tempo/` — seleção aleatória para conquistas de ano inédito (`arch-vile sight.wav`, `life_is_strange-consequences.mp3`, `stranger-things-clock-final-sound.mp3`, `za-warudo-sfx-no-voice.mp3`, `zelda-ocarina-of-time-zelda-lullaby.mp3`)
- `universos/` — trilhas temáticas do Códice dos Universos (genérica `20th_century_fox-cut.mp3` + músicas das Mega-Sagas e subcategorias)
- `extras-memes/banco-reserva/` — demais áudios baixados aguardando definição
