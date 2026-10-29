<script setup lang="ts">
// "Mana Core" as a vessel: the lettering masks a pool of animated mana
// (waves, bubbles, sparkles) tinted by the --mc-accent-* theme colors.
// Geometry is tuned for Inter 700 at 100px with -3.5px tracking.
const W = 520
const H = 120
// The baseline arches up 10px in the middle; the liquid stays level.
const ARC = 'M6 100 Q260 80 514 100'
const SURFACE = 46 // caps span y≈16 (middle) to y≈100 (ends)
// Hard shadow layers behind the lettering, nearest first.
const layers = [
  { dx: 4, dy: 4, cls: 'layer-1' },
  { dx: 8, dy: 8, cls: 'layer-2' }
]

// Sine wave across two widths so translating by one width loops seamlessly.
function crestLine(level: number, amp: number, length: number, phase = 0) {
  const pts: string[] = []
  for (let x = 0; x <= W * 2; x += 8) {
    pts.push(`${x} ${(level + Math.sin((x / length) * Math.PI * 2 + phase) * amp).toFixed(2)}`)
  }
  return `M${pts.join(' L')}`
}
const body = (line: string) => `${line} L${W * 2} ${H} L0 ${H} Z`

const backWave = body(crestLine(SURFACE - 3, 4, 130, 1.4))
const crest = crestLine(SURFACE, 5, 104)
const frontWave = body(crest)

// Deterministic so the prerendered HTML matches hydration.
const bubbles = [
  { x: 40, r: 2.4, dur: 4.2, delay: 0 },
  { x: 92, r: 1.6, dur: 3.4, delay: 1.1 },
  { x: 150, r: 2.8, dur: 5.0, delay: 2.3 },
  { x: 205, r: 1.8, dur: 3.8, delay: 0.6 },
  { x: 262, r: 2.2, dur: 4.6, delay: 1.8 },
  { x: 318, r: 1.5, dur: 3.2, delay: 2.9 },
  { x: 365, r: 2.6, dur: 4.4, delay: 0.3 },
  { x: 418, r: 1.9, dur: 3.6, delay: 1.5 },
  { x: 470, r: 2.3, dur: 4.8, delay: 2.6 }
]

const sparkles = [
  { x: 70, y: 80, r: 4, delay: 0 },
  { x: 178, y: 70, r: 3, delay: 1.2 },
  { x: 300, y: 74, r: 4.5, delay: 0.6 },
  { x: 402, y: 72, r: 3.2, delay: 1.8 },
  { x: 488, y: 84, r: 3.6, delay: 2.4 }
]
const star = (r: number) =>
  `M0 ${-r} Q0 0 ${r} 0 Q0 0 0 ${r} Q0 0 ${-r} 0 Q0 0 0 ${-r}Z`
</script>

<template>
  <svg class="mana-title" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Mana Core">
    <defs>
      <path id="mana-title-arc" :d="ARC" />
      <clipPath id="mana-title-clip">
        <text class="glyphs"><textPath href="#mana-title-arc" startOffset="50%">Mana Core</textPath></text>
      </clipPath>
      <linearGradient id="mana-title-liquid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style="stop-color: color-mix(in srgb, var(--mc-accent-1) 70%, white)" />
        <stop offset=".35" style="stop-color: var(--mc-accent-1)" />
        <stop offset="1" style="stop-color: var(--mc-accent-3)" />
      </linearGradient>
      <radialGradient id="mana-title-glow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#fff" stop-opacity=".55" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </radialGradient>
    </defs>

    <text
      v-for="l in [...layers].reverse()"
      :key="l.cls"
      class="glyphs"
      :class="l.cls"
      :transform="`translate(${l.dx} ${l.dy})`"
    ><textPath href="#mana-title-arc" startOffset="50%">Mana Core</textPath></text>

    <g clip-path="url(#mana-title-clip)">
      <!-- empty part of the vessel -->
      <rect :width="W" :height="H" class="glass" />

      <!-- liquid -->
      <g class="flow slow"><path :d="backWave" class="back" /></g>
      <g class="flow"><path :d="frontWave" fill="url(#mana-title-liquid)" /></g>
      <g class="flow"><path :d="crest" class="crest" /></g>

      <!-- drifting light inside the liquid -->
      <ellipse class="swirl" cx="120" cy="78" rx="90" ry="22" fill="url(#mana-title-glow)" />
      <ellipse class="swirl late" cx="380" cy="78" rx="100" ry="20" fill="url(#mana-title-glow)" />

      <circle
        v-for="(b, i) in bubbles"
        :key="`b${i}`"
        class="bubble"
        :cx="b.x"
        :cy="H - 18"
        :r="b.r"
        :style="{ animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }"
      />

      <g v-for="(s, i) in sparkles" :key="`s${i}`" :transform="`translate(${s.x} ${s.y})`">
        <path class="sparkle" :d="star(s.r)" :style="{ animationDelay: `${s.delay}s` }" />
      </g>
    </g>

    <!-- letter outline so the empty top still reads -->
    <text class="glyphs rim"><textPath href="#mana-title-arc" startOffset="50%">Mana Core</textPath></text>
  </svg>
</template>

<style scoped>
.mana-title {
  display: block;
  width: min(560px, 90vw);
  height: auto;
  overflow: visible;
}
.layer-1 { fill: color-mix(in srgb, var(--mc-accent-2) 70%, black); }
.layer-2 { fill: color-mix(in srgb, var(--mc-accent-3) 70%, black); }
.glyphs {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 100px;
  font-weight: 700;
  letter-spacing: -3.5px;
  text-anchor: middle;
}
.glass { fill: color-mix(in srgb, var(--mc-accent-2) 14%, var(--vp-c-bg)); }
.back { fill: var(--mc-accent-2); opacity: .55; }
.crest { fill: none; stroke: color-mix(in srgb, var(--mc-accent-1) 50%, white); stroke-width: 1.6; opacity: .9; }
.rim {
  fill: none;
  stroke: color-mix(in srgb, var(--mc-accent-1) 55%, transparent);
  stroke-width: 1.2;
}
.bubble { fill: #fff; opacity: 0; }
.sparkle { fill: #fff; opacity: .9; }

.flow, .swirl, .bubble, .sparkle { transform-box: fill-box; transform-origin: center; }
.flow { animation: mana-flow 6s linear infinite; transform-box: view-box; transform-origin: 0 0; }
.flow.slow { animation-duration: 9s; animation-direction: reverse; }
.swirl { animation: mana-swirl 7s ease-in-out infinite alternate; }
.swirl.late { animation-delay: -3.5s; }
.bubble { animation: mana-rise 4s ease-in infinite; }
.sparkle { animation: mana-twinkle 2.6s ease-in-out infinite; }

@keyframes mana-flow { to { transform: translateX(-520px); } }
@keyframes mana-swirl { to { transform: translateX(60px) scale(1.2); } }
@keyframes mana-rise {
  0% { transform: translateY(0); opacity: 0; }
  15% { opacity: .7; }
  85% { opacity: .5; }
  100% { transform: translateY(-52px); opacity: 0; }
}
@keyframes mana-twinkle {
  0%, 100% { transform: scale(.4) rotate(0deg); opacity: .2; }
  50% { transform: scale(1) rotate(45deg); opacity: .95; }
}
</style>
