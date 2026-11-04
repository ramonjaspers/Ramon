<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import headShotTransparent from '../assets/headShotTransparent.png'

interface RawParticle {
  x: number
  y: number
  char: string
  alpha: number
}

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  char: string
  baseAlpha: number
  currentAlpha: number
  delay: number
  shimmer: number
}

/** ASCII ramp from sparse to dense */
const CHARS = ' .:-=+*#%@'.split('')

/** Persists processed pixel data between remounts / resizes */
const memoryCache: Record<number, RawParticle[]> = {}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const size = ref(400)

let animationId: number | null = null
let particles: Particle[] = []
let dataReady = false
let startTime = 0
let loadToken = 0

const mouse = { x: -1000, y: -1000, active: false }
const mouseTarget = { x: -1000, y: -1000 }

const getFontSize = (s: number) => (s <= 280 ? 6 : 8)

/** Updates canvas size based on windowWidth */
const updateSize = () => {
  const width = window.innerWidth

  if (width <= 480) {
    size.value = Math.min(220, width - 40)
  } else if (width <= 768) {
    size.value = Math.min(280, width - 60)
  } else {
    size.value = 400
  }
}

/** Sample the image into a grid of ASCII characters based on averaged, contrast-stretched brightness */
const processImage = (img: HTMLImageElement, target: number): RawParticle[] => {
  /** Sample at higher resolution so each cell can average many pixels */
  const SS = 3
  const res = target * SS
  const offscreen = document.createElement('canvas')
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true })
  if (!offCtx) return []

  offscreen.width = res
  offscreen.height = res
  offCtx.imageSmoothingQuality = 'high'

  const scale = 0.85
  const imgAspect = img.width / img.height

  let drawHeight = res * scale
  let drawWidth = drawHeight * imgAspect

  if (drawWidth > res * scale) {
    drawWidth = res * scale
    drawHeight = drawWidth / imgAspect
  }

  const offsetX = (res - drawWidth) / 2
  const offsetY = (res - drawHeight) / 2

  offCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
  const pixels = offCtx.getImageData(0, 0, res, res).data

  const fontSize = getFontSize(target)
  const colGap = fontSize * 0.6
  const rowGap = fontSize * 0.95

  const cells: { x: number; y: number; lum: number; r: number; c: number }[] =
    []
  const cols = Math.ceil(target / colGap)
  const rows = Math.ceil(target / rowGap)
  const grid = new Float32Array(cols * rows).fill(-1)
  let min = 1
  let max = 0

  for (let r = 0, y = 0; y < target; r++, y = r * rowGap) {
    for (let c = 0, x = 0; x < target; c++, x = c * colGap) {
      /** Average luminance + coverage over the cell */
      const x0 = Math.floor(x * SS)
      const y0 = Math.floor(y * SS)
      const x1 = Math.min(res, Math.ceil((x + colGap) * SS))
      const y1 = Math.min(res, Math.ceil((y + rowGap) * SS))

      let sum = 0
      let alpha = 0
      let count = 0
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * res + xx) * 4
          const a = pixels[i + 3] / 255
          sum +=
            (0.299 * pixels[i] +
              0.587 * pixels[i + 1] +
              0.114 * pixels[i + 2]) *
            a
          alpha += a
          count++
        }
      }
      if (!count || alpha / count < 0.5) continue

      grid[r * cols + c] = sum / alpha / 255
      cells.push({ x, y, lum: 0, r, c })
    }
  }

  /** Unsharp mask on the cell grid: boosts local contrast (mouth, eyes, edges) */
  const SHARPEN = 1.8
  for (const cell of cells) {
    let total = 0
    let n = 0
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const rr = cell.r + dr
        const cc = cell.c + dc
        if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue
        const v = grid[rr * cols + cc]
        if (v < 0) continue
        total += v
        n++
      }
    }
    const center = grid[cell.r * cols + cell.c]
    cell.lum = center + SHARPEN * (center - total / n)
    min = Math.min(min, cell.lum)
    max = Math.max(max, cell.lum)
  }

  /** Stretch contrast to the full ramp and apply gamma for more facial definition */
  const range = Math.max(max - min, 0.01)
  const raw: RawParticle[] = []

  for (const c of cells) {
    const norm = Math.pow(Math.min(1, Math.max(0, (c.lum - min) / range)), 0.8)
    const charIndex = Math.round(norm * (CHARS.length - 1))
    if (charIndex === 0) continue // skip blanks

    raw.push({
      x: Number((c.x + colGap / 2).toFixed(1)),
      y: Number((c.y + rowGap / 2).toFixed(1)),
      char: CHARS[charIndex],
      alpha: Number((0.45 + norm * 0.55).toFixed(2)),
    })
  }
  return raw
}

const createParticles = (raw: RawParticle[]): Particle[] =>
  raw.map((p) => ({
    x: p.x + (Math.random() - 0.5) * 400,
    y: p.y + (Math.random() - 0.5) * 400,
    targetX: p.x,
    targetY: p.y,
    vx: 0,
    vy: 0,
    char: p.char,
    baseAlpha: p.alpha,
    currentAlpha: 0,
    delay: Math.random() * 0.4,
    shimmer: Math.random() * Math.PI * 2,
  }))

const start = (raw: RawParticle[]) => {
  particles = createParticles(raw)
  dataReady = true
  startTime = performance.now()
}

const loadData = () => {
  const token = ++loadToken
  const target = size.value
  dataReady = false
  particles = []

  if (memoryCache[target]) {
    start(memoryCache[target])
    return
  }

  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = headShotTransparent
  img.onload = () => {
    if (token !== loadToken) return // stale (size changed meanwhile)
    const raw = processImage(img, target)
    memoryCache[target] = raw
    start(raw)
  }
}

/** Configure canvas for current size with devicePixelRatio for crisp text */
const setupCanvas = () => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  const dpr = window.devicePixelRatio || 1
  canvas.width = size.value * dpr
  canvas.height = size.value * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  animationId = requestAnimationFrame(draw)

  const s = size.value
  ctx.clearRect(0, 0, s, s)

  if (!dataReady || !particles.length) return

  const elapsed = (performance.now() - startTime) / 1000

  /** Smooth the mouse position */
  mouse.x += (mouseTarget.x - mouse.x) * 0.15
  mouse.y += (mouseTarget.y - mouse.y) * 0.15

  ctx.font = `${getFontSize(s)}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const maxDist = s * 0.2

  for (const p of particles) {
    const particleTime = elapsed - p.delay
    if (particleTime < 0) continue

    /** Fade in + shimmer (only while animating / interacting) */
    const fadeProgress = Math.min(particleTime / 1.5, 1)
    const easedFade = 1 - Math.pow(1 - fadeProgress, 2)

    const isActive = mouse.active || particleTime < 3.0
    const shimmerVal = isActive ? Math.sin(elapsed * 2 + p.shimmer) * 0.1 : 0
    p.currentAlpha = Math.max(0, p.baseAlpha * easedFade + shimmerVal)

    const moveProgress = Math.min(particleTime / 2.5, 1)
    const easedMove = 1 - Math.pow(1 - moveProgress, 3)

    /** Mouse interaction */
    if (mouse.active) {
      const mdx = p.x - mouse.x
      const mdy = p.y - mouse.y
      const dist = Math.sqrt(mdx * mdx + mdy * mdy)

      if (dist < maxDist && dist > 0) {
        const force = (1 - dist / maxDist) * 4
        p.vx += (mdx / dist) * force
        p.vy += (mdy / dist) * force
      }
    }

    const dx = p.targetX - p.x
    const dy = p.targetY - p.y

    /** Bounceback original position */
    const pullStrength = 0.01 + easedMove * 0.08
    p.vx += dx * pullStrength
    p.vy += dy * pullStrength

    /** Slow down movement */
    if (isActive) {
      p.vx += Math.sin(elapsed * 0.5 + p.targetY * 0.1) * 0.15
      p.vy += Math.cos(elapsed * 0.5 + p.targetX * 0.1) * 0.15
      p.vx *= 0.92
      p.vy *= 0.92
    } else {
      /** Rapidly settle when idle */
      p.vx *= 0.85
      p.vy *= 0.85

      if (particleTime > 4.0 && Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
        p.x = p.targetX
        p.y = p.targetY
        p.vx = 0
        p.vy = 0
      }
    }

    p.x += p.vx
    p.y += p.vy

    ctx.fillStyle = `rgba(4, 214, 143, ${p.currentAlpha})`
    ctx.fillText(p.char, p.x, p.y)
  }
}

const handleMouseMove = (e: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  mouseTarget.x = e.clientX - rect.left
  mouseTarget.y = e.clientY - rect.top
  if (!mouse.active) {
    mouse.x = mouseTarget.x
    mouse.y = mouseTarget.y
  }
  mouse.active = true
}

const handleTouchMove = (e: TouchEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const touch = e.touches[0]
  mouseTarget.x = touch.clientX - rect.left
  mouseTarget.y = touch.clientY - rect.top
  if (!mouse.active) {
    mouse.x = mouseTarget.x
    mouse.y = mouseTarget.y
  }
  mouse.active = true
  if (e.cancelable) e.preventDefault()
}

const handleLeave = () => {
  mouse.active = false
  mouseTarget.x = -1000
  mouseTarget.y = -1000
}

onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)

  const canvas = canvasRef.value
  if (canvas) {
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleLeave)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleLeave)
  }

  setupCanvas()
  loadData()
  draw()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
  loadToken++

  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }

  const canvas = canvasRef.value
  if (canvas) {
    canvas.removeEventListener('mousemove', handleMouseMove)
    canvas.removeEventListener('mouseleave', handleLeave)
    canvas.removeEventListener('touchmove', handleTouchMove)
    canvas.removeEventListener('touchend', handleLeave)
  }
})

// Re-initialize when size changes (draw loop keeps running)
watch(size, () => {
  setupCanvas()
  loadData()
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="particle-portrait"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      cursor: 'crosshair',
      touchAction: 'none',
    }"
  />
</template>

<style src="./ParticlePortrait.css"></style>
