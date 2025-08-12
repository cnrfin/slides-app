// src/components/charts/ChartGenerator.tsx

import { useRef, useEffect } from 'react'
import Chart from 'chart.js/auto'
import type { ChartConfiguration } from 'chart.js'

interface ChartGeneratorProps {
  config: ChartConfiguration
  width?: number
  height?: number
  onGenerated?: (dataUrl: string) => void
  className?: string
}

export default function ChartGenerator({ 
  config, 
  width = 600, 
  height = 400,
  onGenerated,
  className = ''
}: ChartGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)
  
  useEffect(() => {
    if (!canvasRef.current) return
    
    // Destroy previous chart if exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }
    
    // Create new chart
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    
    chartInstanceRef.current = new Chart(ctx, config)
    
    // Generate image after render
    if (onGenerated) {
      setTimeout(() => {
        if (canvasRef.current) {
          const dataUrl = canvasRef.current.toDataURL('image/png')
          onGenerated(dataUrl)
        }
      }, 100)
    }
    
    // Cleanup
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
        chartInstanceRef.current = null
      }
    }
  }, [config, onGenerated])
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  )
}
