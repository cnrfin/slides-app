// src/utils/shadow.utils.ts
import type { DropShadow } from '@/types/slide.types'

/**
 * Convert hex color to RGBA
 */
export function hexToRgba(hex: string, opacity: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  return hex
}

/**
 * Get Konva shadow props from DropShadow config
 * Note: Konva doesn't support shadowSpread directly, 
 * so we simulate it by adjusting the blur radius
 */
export function getKonvaShadowProps(dropShadow?: DropShadow) {
  if (!dropShadow || !dropShadow.enabled) {
    return {
      shadowEnabled: false,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 0,
      shadowColor: 'transparent'
    }
  }
  
  // Calculate effective blur with spread simulation
  // Spread is simulated by adjusting the blur radius and opacity
  const spread = Math.abs(dropShadow.spread || 0)
  const blur = dropShadow.blur || 0
  
  // Increase blur to simulate spread
  const effectiveBlur = blur + (spread * 2)
  
  // Adjust opacity based on spread to maintain visual consistency
  const baseOpacity = dropShadow.opacity || 0.25
  const effectiveOpacity = spread > 0 ? Math.min(1, baseOpacity * (1 + spread / 20)) : baseOpacity
  
  return {
    shadowEnabled: true,
    shadowOffsetX: dropShadow.offsetX || 0,
    shadowOffsetY: dropShadow.offsetY || 0,
    shadowBlur: effectiveBlur,
    shadowColor: hexToRgba(dropShadow.color || '#000000', effectiveOpacity),
    shadowForStrokeEnabled: true
  }
}

/**
 * Get CSS box-shadow string from DropShadow config
 */
export function getCSSBoxShadow(dropShadow?: DropShadow): string {
  if (!dropShadow || !dropShadow.enabled) {
    return 'none'
  }
  
  const offsetX = dropShadow.offsetX || 0
  const offsetY = dropShadow.offsetY || 0
  const blur = dropShadow.blur || 0
  const spread = dropShadow.spread || 0
  const color = hexToRgba(dropShadow.color || '#000000', dropShadow.opacity || 0.25)
  
  return `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`
}

/**
 * Apply drop shadow to canvas 2D context
 */
export function applyCanvasShadow(ctx: CanvasRenderingContext2D, dropShadow?: DropShadow) {
  if (!dropShadow || !dropShadow.enabled) {
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
    return
  }
  
  // For canvas 2D context, we simulate spread by adjusting blur and opacity
  const spread = Math.abs(dropShadow.spread || 0)
  const blur = dropShadow.blur || 0
  const effectiveBlur = blur + (spread * 2)
  
  // Adjust opacity based on spread
  const baseOpacity = dropShadow.opacity || 0.25
  const effectiveOpacity = spread > 0 ? Math.min(1, baseOpacity * (1 + spread / 20)) : baseOpacity
  
  ctx.shadowOffsetX = dropShadow.offsetX || 0
  ctx.shadowOffsetY = dropShadow.offsetY || 0
  ctx.shadowBlur = effectiveBlur
  ctx.shadowColor = hexToRgba(dropShadow.color || '#000000', effectiveOpacity)
}


