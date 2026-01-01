<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import headShotTransparent from '../assets/headShotTransparent.png'

interface Particle {
  x: number //pos
  y: number
  targetX: number
  targetY: number
  vx: number //velocity
  vy: number
  length: number
  baseAlpha: number //opacity
  currentAlpha: number
  delay: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const size = ref(400)

let animationId: number | null = null
let lines: Particle[] = []
let imageLoaded = false
let startTime: number | null = null

const mouse = {
  x: -1000,
  y: -1000,
  active: false,
}

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

const initParticles = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const canvasWidth = size.value
  const canvasHeight = size.value
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = headShotTransparent

  img.onload = () => {
    /** Create mock canvas to analyze pixel data */
    const offscreen = document.createElement('canvas')
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) return

    offscreen.width = canvasWidth
    offscreen.height = canvasHeight

    /** Fit image within canvas */
    const scale = 0.8
    const imgAspect = img.width / img.height

    let drawHeight = canvasHeight * scale
    let drawWidth = drawHeight * imgAspect

    if (drawWidth > canvasWidth * scale) {
      drawWidth = canvasWidth * scale
      drawHeight = drawWidth / imgAspect
    }

    const offsetX = (canvasWidth - drawWidth) / 2
    const offsetY = (canvasHeight - drawHeight) / 2

    offCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
    const imageData = offCtx.getImageData(0, 0, canvasWidth, canvasHeight)
    const pixels = imageData.data

    lines = []
    // Reduced gap for more detail/clarity
    const rowGap = size.value <= 280 ? 3 : 4

    /** Iterate through pixels to create particles */
    for (let y = 0; y < canvasHeight; y += rowGap) {
      let x = 0
      while (x < canvasWidth) {
        const i = (y * canvasWidth + x) * 4
        const a = pixels[i + 3]

        /** Only create particles for visible pixels */
        if (a > 128) {
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]
          const brightness = (r + g + b) / (3 * 255)

          // Shorter lines for more definition
          const lineLength = Math.floor(
            2 + brightness * (size.value <= 280 ? 6 : 10),
          )

          const scatterX = (Math.random() - 0.5) * 300
          const scatterY = (Math.random() - 0.5) * 300

          lines.push({
            x: x + scatterX,
            y: y + scatterY,
            targetX: x,
            targetY: y,
            vx: 0,
            vy: 0,
            length: lineLength,
            // Higher base alpha for better visibility
            baseAlpha: 0.7 + brightness * 0.3,
            currentAlpha: 0,
            delay: Math.random() * 0.3,
          })

          // Tighter horizontal spacing
          x += lineLength + 2
        } else {
          x += 4
        }
      }
    }

    imageLoaded = true
    startTime = performance.now()
  }
}

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  animationId = requestAnimationFrame(draw)

  const canvasWidth = size.value
  const canvasHeight = size.value

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  if (!imageLoaded || startTime === null) return

  const elapsed = (performance.now() - startTime) / 1000

  lines.forEach((p) => {
    const particleTime = elapsed - p.delay

    if (particleTime < 0) return

    /** Fade in animation */
    const fadeProgress = Math.min(particleTime / 1.5, 1)
    const easedFade = 1 - Math.pow(1 - fadeProgress, 2)
    p.currentAlpha = p.baseAlpha * easedFade

    /** Move to target animation */
    const moveProgress = Math.min(particleTime / 2.5, 1)
    const easedMove = 1 - Math.pow(1 - moveProgress, 3)

    /** Mouse interaction */
    if (mouse.active) {
      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const maxDist = 60

      if (dist < maxDist && dist > 0) {
        const force = (1 - dist / maxDist) * 2
        p.vx += (dx / dist) * force
        p.vy += (dy / dist) * force
      }
    }

    const dx = p.targetX - p.x
    const dy = p.targetY - p.y

    /** Bounceback original position */
    const pullStrength = 0.01 + easedMove * 0.07
    p.vx += dx * pullStrength
    p.vy += dy * pullStrength

    /** Slow down movement */
    p.vx *= 0.92
    p.vy *= 0.92

    p.x += p.vx
    p.y += p.vy

    // Use green accent color matching the site theme (brighter for clarity)
    ctx.strokeStyle = `rgba(4, 214, 143, ${p.currentAlpha})`
    ctx.lineWidth = size.value <= 280 ? 2.5 : 3
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x + p.length, p.y)
    ctx.stroke()
  })
}

const handleMouseMove = (e: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
  mouse.active = true
}

const handleTouchMove = (e: TouchEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const touch = e.touches[0]
  mouse.x = touch.clientX - rect.left
  mouse.y = touch.clientY - rect.top
  mouse.active = true
}

const handleLeave = () => {
  mouse.active = false
}

onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)

  const canvas = canvasRef.value
  if (canvas) {
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleLeave)
    canvas.addEventListener('touchmove', handleTouchMove)
    canvas.addEventListener('touchend', handleLeave)
  }

  initParticles()
  draw()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)

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

// Re-initialize when size changes
watch(size, () => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  imageLoaded = false
  startTime = null
  lines = []
  initParticles()
  draw()
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="particle-portrait"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
    }"
  />
</template>

<style src="./ParticlePortrait.css"></style>
