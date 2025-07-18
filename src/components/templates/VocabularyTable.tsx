// src/components/templates/VocabularyTable.tsx
import { useState } from 'react'

interface VocabularyTableProps {
  rows?: number
  columns?: number
  data?: VocabItem[]
}

interface VocabItem {
  id: string
  text: string
  translation: string
  image?: string
  audio?: string
}

export default function VocabularyTable({ 
  rows = 3, 
  columns = 4,
  data = [] 
}: VocabularyTableProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  
  return (
    <div className="grid gap-4" style={{
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`
    }}>
      {Array.from({ length: rows * columns }).map((_, index) => {
        const item = data[index]
        return (
          <div
            key={index}
            onClick={() => setSelectedCell(item?.id || `cell-${index}`)}
            className={`
              relative p-4 bg-white rounded-lg shadow-md cursor-pointer
              transition-all duration-200 hover:shadow-lg hover:scale-105
              ${selectedCell === (item?.id || `cell-${index}`) ? 'ring-2 ring-blue-500' : ''}
            `}
          >
            {item ? (
              <>
                {item.image && (
                  <div className="mb-2 h-24 bg-gray-200 rounded" />
                )}
                <p className="text-lg font-semibold text-center">{item.text}</p>
                <p className="text-sm text-gray-600 text-center">{item.translation}</p>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Empty
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}