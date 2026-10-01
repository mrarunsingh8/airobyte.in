<script setup lang="ts">
/**
 * Roadmap illustration: a 3D-looking road winding from the bottom-left to the top-right,
 * wide in front and narrowing into the distance, with map pins along it.
 * Not tied to any course. Colours come from the Nuxt UI theme.
 * Hover (or focus) a pin to see what that stop means.
 */
interface Stop {
  title: string
  description: string
  icon: string
  color: 'primary' | 'info' | 'success' | 'warning' | 'error'
}

const stops: Stop[] = [
  { title: 'Start from zero', description: 'No experience needed.', icon: 'i-lucide-footprints', color: 'primary' },
  { title: 'Learn through stories', description: 'Everyday examples make ideas stick.', icon: 'i-lucide-lightbulb', color: 'error' },
  { title: 'Run it yourself', description: 'Edit and run code in your browser.', icon: 'i-lucide-square-terminal', color: 'warning' },
  { title: 'One idea at a time', description: 'Short, focused lessons.', icon: 'i-lucide-layers', color: 'success' },
  { title: 'Track your progress', description: 'Complete lessons, star favourites.', icon: 'i-lucide-circle-check-big', color: 'info' },
  { title: 'Revise in minutes', description: 'Key takeaways, ready for interviews.', icon: 'i-lucide-trophy', color: 'primary' }
]

const pinBg: Record<Stop['color'], string> = { primary: 'bg-primary', info: 'bg-info', success: 'bg-success', warning: 'bg-warning', error: 'bg-error' }
const pinText: Record<Stop['color'], string> = { primary: 'text-primary', info: 'text-info', success: 'text-success', warning: 'text-warning', error: 'text-error' }

/* ---------- road geometry (viewBox units) ---------- */
const W = 1600
const H = 440
const WIDE = 160 // road width in front
const NARROW = 14 // road width far away

// Centre line: starts off the bottom-left edge, ends off the top-right edge. Pins on points 1..6.
type P = [number, number]
const points: P[] = [
  [-60, 300], [190, 300], [450, 330], [700, 225], [945, 245], [1170, 150], [1385, 100], [1700, 30]
]

function sample(pts: P[], perSegment = 80) {
  const out: { p: P, stop?: number }[] = []
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]!
    const [x3, y3] = pts[i]!
    const mx = (x0 + x3) / 2
    for (let k = i === 1 ? 0 : 1; k <= perSegment; k++) {
      const t = k / perSegment
      const u = 1 - t
      out.push({
        p: [u * u * u * x0 + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y0 + 3 * u * t * t * y3 + t * t * t * y3],
        stop: k === perSegment && i < pts.length - 1 ? i - 1 : undefined
      })
    }
  }
  return out
}

const samples = sample(points)
const n = samples.length
// Ease the taper so the road shrinks faster near the front, like real perspective
const depth = (i: number) => 1 - Math.pow(1 - i / (n - 1), 1.6)
const widthAt = (i: number) => WIDE + (NARROW - WIDE) * depth(i)

function normalAt(i: number): P {
  const [ax, ay] = samples[Math.max(0, i - 1)]!.p
  const [bx, by] = samples[Math.min(n - 1, i + 1)]!.p
  const len = Math.hypot(bx - ax, by - ay) || 1
  return [-(by - ay) / len, (bx - ax) / len]
}

/** Road outline, optionally pushed down by a fraction of the local width (for the 3D edge and shadow) */
function outline(drop = 0) {
  const left: P[] = []
  const right: P[] = []
  samples.forEach(({ p: [x, y] }, i) => {
    const [nx, ny] = normalAt(i)
    const w = widthAt(i)
    const dy = w * drop
    left.push([x + nx * w / 2, y + ny * w / 2 + dy])
    right.push([x - nx * w / 2, y - ny * w / 2 + dy])
  })
  return `${[...left, ...right.reverse()].map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')} Z`
}
const road = outline()
const edge = outline(0.11) // the road's thickness
const shadow = outline(0.3) // soft shadow on the ground

/**
 * A band along the road between two offsets (as fractions of the local width, 0 = centre),
 * for samples i0..i1. Used for every marking so they all taper with the road.
 */
function band(k1: number, k2: number, i0 = 0, i1 = n - 1) {
  const a: P[] = []
  const b: P[] = []
  for (let i = i0; i <= i1; i++) {
    const [x, y] = samples[i]!.p
    const [nx, ny] = normalAt(i)
    const w = widthAt(i)
    a.push([x + nx * w * k1, y + ny * w * k1])
    b.push([x + nx * w * k2, y + ny * w * k2])
  }
  return `${[...a, ...b.reverse()].map(([x, y], j) => `${j ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')} Z`
}

// Dash ranges (sample index from..to), with dash length following the road width
const dashRanges: [number, number][] = []
{
  let acc = 0
  let on = true
  let from = 0
  for (let i = 1; i < n; i++) {
    const [px, py] = samples[i - 1]!.p
    const [x, y] = samples[i]!.p
    acc += Math.hypot(x - px, y - py)
    const w = widthAt(i)
    if (acc >= (on ? w * 0.4 : w * 0.3)) {
      if (on) dashRanges.push([from, i])
      on = !on
      acc = 0
      from = i
    }
  }
}

// Two-lane road: solid white edge lines, dashed white strip in the middle
const LINE = 0.025 // marking thickness, as a fraction of the road width
const edgeLines = [band(0.42 - LINE, 0.42), band(-0.42, -0.42 + LINE)]
const divider = dashRanges.map(([i0, i1]) => band(-LINE * 0.75, LINE * 0.75, i0, i1))

// Pins sit on the stop points; size follows the road (in % of the illustration width)
const pins = samples
  .map((s, i) => ({ ...s, i }))
  .filter(s => s.stop !== undefined)
  .map(({ p: [x, y], i, stop }) => ({
    ...stops[stop!]!,
    left: `${(x / W) * 100}%`,
    top: `${(y / H) * 100}%`,
    size: `${(5.2 * (1 - 0.6 * depth(i))).toFixed(2)}cqw`
  }))
</script>

<template>
  <div class="relative w-full [container-type:inline-size]" :style="{ aspectRatio: `${W} / ${H}` }">
    <svg :viewBox="`0 0 ${W} ${H}`" class="absolute inset-0 size-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id="road-shadow" x="-10%" y="-10%" width="120%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <path :d="shadow" class="fill-neutral-900/15 dark:fill-black/40" filter="url(#road-shadow)" />
      <path :d="edge" class="fill-neutral-400 dark:fill-neutral-500" />
      <path :d="road" class="fill-neutral-800 dark:fill-neutral-700" />
      <!-- markings -->
      <path v-for="(d, i) in edgeLines" :key="`edge-${i}`" :d="d" class="fill-white/85" />
      <path v-for="(d, i) in divider" :key="`div-${i}`" :d="d" class="fill-white/90" />
    </svg>

    <UTooltip
      v-for="pin in pins"
      :key="pin.title"
      :text="`${pin.title}: ${pin.description}`"
    >
      <button
        type="button"
        class="absolute -translate-x-1/2 -translate-y-full drop-shadow-lg transition-transform duration-200 hover:-translate-y-[110%] focus-visible:outline-2 focus-visible:outline-primary"
        :style="{ left: pin.left, top: pin.top, width: pin.size }"
        :aria-label="`${pin.title}: ${pin.description}`"
      >
        <!-- map pin: rotated rounded square with the point at the bottom -->
        <span class="flex aspect-square w-full rotate-45 items-center justify-center rounded-[50%_50%_0_50%]" :class="pinBg[pin.color]">
          <span class="flex size-[70%] -rotate-45 items-center justify-center rounded-full bg-default">
            <UIcon :name="pin.icon" class="size-[55%]" :class="pinText[pin.color]" />
          </span>
        </span>
      </button>
    </UTooltip>
  </div>
</template>
