export interface CursorOptions {
  /** The radius of the glow effect in pixels. Default is 2160. */
  radius?: number
  /** The interpolation delay for smooth movement. Lower is smoother/slower. Default is 0.1. */
  delay?: number
  /** The element to apply the custom properties to. Default is document.documentElement. */
  container?: HTMLElement
}

/**
 * Distance between two points.
 */
const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor
}

/**
 * Sets up a smooth cursor glow effect using CSS custom properties.
 * Returns a cleanup function to remove event listeners and stop the animation loop.
 */
export const setupCursorGlow = (options: CursorOptions = {}) => {
  const {
    radius = 2160,
    delay = 0.05,
    container = document.documentElement,
  } = options

  container.style.setProperty('--cursor-size', `${radius}px`)

  let targetX = window.innerWidth / 2
  let targetY = window.innerHeight / 2
  let currentX = targetX
  let currentY = targetY
  let animationFrameId: number

  const handlePointerMove = (event: PointerEvent) => {
    targetX = event.clientX
    targetY = event.clientY
  }

  const updatePosition = () => {
    // Smoothly move towards next pos
    currentX = lerp(currentX, targetX, delay)
    currentY = lerp(currentY, targetY, delay)

    container.style.setProperty('--cursor-x', `${currentX.toFixed(2)}px`)
    container.style.setProperty('--cursor-y', `${currentY.toFixed(2)}px`)

    animationFrameId = requestAnimationFrame(updatePosition)
  }

  // Initialize at center of cursor
  container.style.setProperty('--cursor-x', `${currentX}px`)
  container.style.setProperty('--cursor-y', `${currentY}px`)

  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  animationFrameId = requestAnimationFrame(updatePosition)

  // Return the cleanup function
  return () => {
    window.removeEventListener('pointermove', handlePointerMove)
    cancelAnimationFrame(animationFrameId)

    // Clear properties to prevent side effects on other pages
    container.style.removeProperty('--cursor-x')
    container.style.removeProperty('--cursor-y')
    container.style.removeProperty('--cursor-size')
  }
}
