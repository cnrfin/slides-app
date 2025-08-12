// src/components/sidebar/popups/ChartModal.tsx

import { useState, useRef, useEffect } from 'react'
import { BarChart3, Sparkles, Loader } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import type { ChartType, ColorOption } from '@/components/charts/ChartTypes'
import { parseChartPrompt, validateChartData } from '@/components/charts/ChartPromptParser'
import { 
  getChartColors, 
  createChartGradient, 
  getDefaultChartOptions,
  isValidForCircularChart 
} from '@/utils/chart-utils'
import Chart from 'chart.js/auto'
import type { ChartConfiguration } from 'chart.js'

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  onAddToSlide: (imageDataUrl: string, width: number, height: number) => void
}

export default function ChartModal({ isOpen, onClose, onAddToSlide }: ChartModalProps) {
  const [prompt, setPrompt] = useState('')
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [chartColor, setChartColor] = useState<ColorOption>('blue')
  const [preview, setPreview] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)
  
  // Auto-set multi-color for pie and doughnut charts
  useEffect(() => {
    if (chartType === 'pie' || chartType === 'doughnut') {
      setChartColor('multi')
    }
  }, [chartType])
  
  // Clean up chart instance when modal closes or component unmounts
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        console.log('Cleaning up chart instance on unmount')
        try {
          chartInstanceRef.current.destroy()
          chartInstanceRef.current = null
        } catch (e) {
          console.error('Error cleaning up chart:', e)
        }
      }
    }
  }, [])
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Clean up when closing
      if (chartInstanceRef.current) {
        console.log('Cleaning up chart instance on modal close')
        try {
          chartInstanceRef.current.destroy()
          chartInstanceRef.current = null
        } catch (e) {
          console.error('Error cleaning up chart on close:', e)
        }
      }
      // Reset state
      setPreview(null)
      setError(null)
      setPrompt('')
      // Keep chartType and chartColor to preserve user's selection
    }
  }, [isOpen])
  
  const generateChart = async () => {
    if (!prompt.trim() || !canvasRef.current) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      // Parse the prompt
      console.log('Parsing prompt:', prompt)
      const chartData = parseChartPrompt(prompt)
      console.log('Parsed data:', chartData)
      
      if (!chartData || !validateChartData(chartData)) {
        setError('Could not parse data from prompt. Please use format like: "January: 12000, February: 15500" or "Q1: 45K, Q2: 52K"')
        setIsGenerating(false)
        return
      }
      
      // Check if data is suitable for selected chart type
      if ((chartType === 'pie' || chartType === 'doughnut') && !isValidForCircularChart(chartData.datasets[0].data)) {
        setError('Pie and doughnut charts require positive values. Please use a different chart type or adjust your data.')
        setIsGenerating(false)
        return
      }
      
      // Destroy previous chart if exists
      if (chartInstanceRef.current) {
        console.log('Destroying previous chart instance')
        chartInstanceRef.current.destroy()
        chartInstanceRef.current = null
      }
      
      // Get canvas context
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) {
        setError('Failed to get canvas context')
        setIsGenerating(false)
        return
      }
      
      // Clear canvas completely
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      
      // Small delay to ensure canvas is ready
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Get colors based on data length
      const colors = getChartColors(chartColor, chartData.labels.length, chartType)
      
      // Apply gradient if needed
      let backgroundColor = colors.backgroundColor
      let borderColor = colors.borderColor
      
      if (chartColor === 'gradient-blue' || chartColor === 'gradient-purple') {
        backgroundColor = createChartGradient(ctx, chartColor)
        // For line charts with gradient, we want the border to be solid
        if (chartType === 'line' || chartType === 'area') {
          borderColor = chartColor === 'gradient-blue' 
            ? (getChartColors('blue').borderColor as string)
            : (getChartColors('purple').borderColor as string)
        }
      }
      
      // Prepare chart configuration
      const actualChartType = chartType === 'area' ? 'line' : chartType
      
      const config: ChartConfiguration = {
        type: actualChartType as any,
        data: {
          labels: chartData.labels,
          datasets: [{
            ...chartData.datasets[0],
            backgroundColor: backgroundColor as any,
            borderColor: borderColor as any,
            borderWidth: chartType === 'pie' || chartType === 'doughnut' ? 2 : (chartType === 'line' || chartType === 'area' ? 3 : 2),
            fill: chartType === 'area' ? 'origin' : undefined,
            tension: chartType === 'line' || chartType === 'area' ? 0.4 : undefined,
            hoverOffset: chartType === 'pie' || chartType === 'doughnut' ? 4 : undefined,
          }]
        },
        options: {
          ...getDefaultChartOptions(actualChartType as ChartType),
          animation: {
            duration: 0 // Disable animation to avoid timing issues
          }
        }
      }
      
      // Create the chart
      console.log('Creating new chart instance')
      chartInstanceRef.current = new Chart(ctx, config)
      
      // Wait for chart to render
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Generate preview image
      const imageUrl = canvasRef.current.toDataURL('image/png')
      setPreview(imageUrl)
      console.log('Chart generated successfully')
      
    } catch (error) {
      console.error('Chart generation failed:', error)
      setError('Failed to generate chart. Please check your data format and try again.')
      // Clean up on error
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy()
          chartInstanceRef.current = null
        } catch (e) {
          console.error('Error destroying chart on failure:', e)
        }
      }
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleAddToSlide = () => {
    if (!preview || !canvasRef.current) return
    
    // Get canvas dimensions
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    
    // Scale down to reasonable size for slide (max 400px wide)
    const maxWidth = 400
    const scale = width > maxWidth ? maxWidth / width : 1
    const finalWidth = width * scale
    const finalHeight = height * scale
    
    // Add to slide
    onAddToSlide(preview, finalWidth, finalHeight)
    
    // Close modal
    onClose()
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Chart" size="lg">
      <div className="p-6 space-y-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Step 1: Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            1. Write Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Examples: Sales: 450, Marketing: 320, Development: 680..."
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Step 2: Chart Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. Choose Chart type
            </label>
            <select
              value={chartType}
              onChange={(e) => {
                const newType = e.target.value as ChartType
                setChartType(newType)
                // Auto-set multi-color for pie and doughnut charts
                if (newType === 'pie' || newType === 'doughnut') {
                  setChartColor('multi')
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="doughnut">Doughnut Chart</option>
              <option value="scatter">Scatter Plot</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <select
              value={chartColor}
              onChange={(e) => setChartColor(e.target.value as ColorOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
              <option value="yellow">Yellow</option>
              <option value="gray">Gray</option>
              <option value="gradient-blue">Gradient Blue</option>
              <option value="gradient-purple">Gradient Purple</option>
              <option value="multi">Multi Color</option>
            </select>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {/* Generate Button */}
        <button
          onClick={generateChart}
          disabled={!prompt.trim() || isGenerating}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Chart
            </>
          )}
        </button>
        
        {/* Chart Preview */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 min-h-[300px] flex items-center justify-center bg-gray-50">
          {preview ? (
            <div className="space-y-4 w-full">
              <div className="flex justify-center">
                <img 
                  src={preview} 
                  alt="Chart preview" 
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  style={{ maxHeight: '400px' }}
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleAddToSlide}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
                >
                  Add to Slide
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Chart preview will appear here</p>
            </div>
          )}
        </div>
        
        {/* Hidden canvas for chart rendering */}
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          style={{ display: 'none' }}
        />
      </div>
    </Modal>
  )
}
