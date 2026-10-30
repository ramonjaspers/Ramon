<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface NodePoint {
  x: number
  y: number
  phase: number
  size: number
}

interface PointerPosition {
  x: number | null
  y: number | null
}

const MAX_DEVICE_PIXEL_RATIO = 1.25
const MAX_NODE_COUNT = 200
const NODE_CONNECTION_DISTANCE = 118
const POINTER_CONNECTION_DISTANCE = 150
const MAX_POINTER_CONNECTIONS = 6

const canvasRef = ref<HTMLCanvasElement | null>(null)

let context: CanvasRenderingContext2D | null = null
let animationFrame = 0
let width = 0
let height = 0
let points: NodePoint[] = []
let reducedMotion = false
let resizeObserver: ResizeObserver | null = null

const pointer: PointerPosition = { x: null, y: null }
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')

const calculateNodes = (count: number): NodePoint[] =>
  Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    phase: Math.random() * Math.PI * 2,
    size: 1.6 + Math.random() * 1.4,
  }))

const drawNodeConnections = (ctx: CanvasRenderingContext2D) => {
  points.forEach((point, index) => {
    for (
      let otherIndex = index + 1;
      otherIndex < points.length;
      otherIndex += 1
    ) {
      const other = points[otherIndex]
      const distance = Math.hypot(point.x - other.x, point.y - other.y)
      if (distance > NODE_CONNECTION_DISTANCE) continue

      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
      ctx.lineTo(other.x, other.y)
      ctx.strokeStyle = `rgba(121, 214, 165, ${(1 - distance / NODE_CONNECTION_DISTANCE) * 0.035})`
      ctx.lineWidth = 0.7
      ctx.stroke()
    }
  })
}

const drawNodes = (ctx: CanvasRenderingContext2D, time: number) => {
  points.forEach((point) => {
    const shimmer = reducedMotion
      ? 0.72
      : 0.48 + Math.sin(time * 0.0007 + point.phase) * 0.18

    ctx.beginPath()
    ctx.arc(point.x, point.y, point.size * shimmer, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(142, 220, 172, ${0.22 + shimmer * 0.18})`
    ctx.fill()
  })
}

const drawPointerConnections = (ctx: CanvasRenderingContext2D) => {
  const pointerX = pointer.x
  const viewportPointerY = pointer.y
  if (pointerX === null || viewportPointerY === null) return

  const pointerY = viewportPointerY + window.scrollY
  const nearestNodes = points
    .map((point) => ({
      point,
      distance: Math.hypot(point.x - pointerX, point.y - pointerY),
    }))
    .filter(({ distance }) => distance < POINTER_CONNECTION_DISTANCE)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_POINTER_CONNECTIONS)

  nearestNodes.forEach(({ point, distance }) => {
    ctx.beginPath()
    ctx.moveTo(pointerX, pointerY)
    ctx.lineTo(point.x, point.y)
    ctx.strokeStyle = `rgba(230, 177, 106, ${(1 - distance / POINTER_CONNECTION_DISTANCE) * 0.2})`
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(point.x, point.y, 1.8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(230, 177, 106, 0.48)'
    ctx.fill()
  })
}

const draw = (time = 0) => {
  if (!context) return

  context.clearRect(0, 0, width, height)
  drawNodeConnections(context)
  drawNodes(context, time)
  drawPointerConnections(context)

  if (!reducedMotion) animationFrame = requestAnimationFrame(draw)
}

const resizeCanvas = () => {
  const canvas = canvasRef.value
  const surface = canvas?.parentElement
  if (!canvas || !context || !surface) return

  width = surface.clientWidth
  height = Math.max(surface.scrollHeight, window.innerHeight)
  const pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    MAX_DEVICE_PIXEL_RATIO,
  )

  canvas.width = Math.round(width * pixelRatio)
  canvas.height = Math.round(height * pixelRatio)
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

  const nodeCount = Math.min(
    MAX_NODE_COUNT,
    Math.max(28, Math.round((width * height) / 26000)),
  )
  points = calculateNodes(nodeCount)

  cancelAnimationFrame(animationFrame)
  draw()
}

const trackPointer = (event: PointerEvent) => {
  pointer.x = event.clientX
  pointer.y = event.clientY
  if (reducedMotion) draw()
}

const clearPointer = () => {
  pointer.x = null
  pointer.y = null
  if (reducedMotion) draw()
}

const updateMotionPreference = () => {
  reducedMotion = motionPreference.matches
  cancelAnimationFrame(animationFrame)
  draw()
}

const updatePointerConnectionsOnScroll = () => {
  if (reducedMotion) draw()
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  context = canvas.getContext('2d')
  if (!context) return

  reducedMotion = motionPreference.matches
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('pointermove', trackPointer, { passive: true })
  window.addEventListener('pointerleave', clearPointer)
  window.addEventListener('scroll', updatePointerConnectionsOnScroll, {
    passive: true,
  })
  motionPreference.addEventListener('change', updateMotionPreference)

  const surface = canvas.parentElement
  if (surface) {
    resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(surface)
  }

  resizeCanvas()
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('pointermove', trackPointer)
  window.removeEventListener('pointerleave', clearPointer)
  window.removeEventListener('scroll', updatePointerConnectionsOnScroll)
  motionPreference.removeEventListener('change', updateMotionPreference)
  resizeObserver?.disconnect()
})
</script>

<template>
  <canvas ref="canvasRef" class="ambient-field" aria-hidden="true" />
</template>
