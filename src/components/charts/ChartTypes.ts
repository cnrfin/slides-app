// src/components/charts/ChartTypes.ts

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter'

export type ColorOption = 
  | 'blue' 
  | 'purple' 
  | 'green' 
  | 'red' 
  | 'yellow' 
  | 'gray'
  | 'gradient-blue'
  | 'gradient-purple'
  | 'multi'

export interface ParsedChartData {
  labels: string[]
  datasets: {
    label?: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }[]
}
