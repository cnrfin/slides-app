// src/components/admin/VocabularyFixButton.tsx
import React, { useState } from 'react'
import { fixExistingLessonsVocabulary, fixLessonVocabulary } from '@/utils/fix-vocabulary'
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function VocabularyFixButton() {
  const [isFixing, setIsFixing] = useState(false)
  const [fixResults, setFixResults] = useState<any>(null)
  const [specificLessonId, setSpecificLessonId] = useState('')

  const handleFixAll = async () => {
    setIsFixing(true)
    setFixResults(null)
    
    try {
      const results = await fixExistingLessonsVocabulary()
      setFixResults(results)
    } catch (error) {
      console.error('Error running vocabulary fix:', error)
      setFixResults({
        success: false,
        message: 'Failed to run vocabulary fix'
      })
    } finally {
      setIsFixing(false)
    }
  }

  const handleFixSingle = async () => {
    if (!specificLessonId.trim()) {
      alert('Please enter a lesson ID')
      return
    }

    setIsFixing(true)
    setFixResults(null)

    try {
      const result = await fixLessonVocabulary(specificLessonId.trim())
      setFixResults(result)
    } catch (error) {
      console.error('Error fixing single lesson:', error)
      setFixResults({
        success: false,
        message: 'Failed to fix lesson vocabulary'
      })
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-dark-text">
        Vocabulary Fix Utility
      </h3>
      
      <div className="space-y-4">
        {/* Fix All Lessons */}
        <div>
          <p className="text-sm text-gray-600 dark:text-app-light-gray mb-2">
            This will extract and save vocabulary for all lessons that don't have vocabulary data.
          </p>
          <button
            onClick={handleFixAll}
            disabled={isFixing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isFixing
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isFixing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Fix All Lessons
              </>
            )}
          </button>
        </div>

        {/* Fix Single Lesson */}
        <div>
          <p className="text-sm text-gray-600 dark:text-app-light-gray mb-2">
            Fix vocabulary for a specific lesson:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={specificLessonId}
              onChange={(e) => setSpecificLessonId(e.target.value)}
              placeholder="Enter lesson ID"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-bg dark:text-dark-text"
              disabled={isFixing}
            />
            <button
              onClick={handleFixSingle}
              disabled={isFixing || !specificLessonId.trim()}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isFixing || !specificLessonId.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              Fix Lesson
            </button>
          </div>
        </div>

        {/* Results Display */}
        {fixResults && (
          <div className={`mt-4 p-4 rounded-lg border ${
            fixResults.success 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {fixResults.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <span className={`font-semibold ${
                fixResults.success 
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-red-800 dark:text-red-300'
              }`}>
                {fixResults.success ? 'Fix Complete!' : 'Fix Failed'}
              </span>
            </div>

            {fixResults.message && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {fixResults.message}
              </p>
            )}

            {fixResults.totalProcessed !== undefined && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Processed:</span>
                  <span className="ml-2 font-medium">{fixResults.totalProcessed}</span>
                </div>
                {fixResults.fixed !== undefined && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Fixed:</span>
                    <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                      {fixResults.fixed}
                    </span>
                  </div>
                )}
                {fixResults.errors !== undefined && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Errors:</span>
                    <span className="ml-2 font-medium text-red-600 dark:text-red-400">
                      {fixResults.errors}
                    </span>
                  </div>
                )}
                {fixResults.noVocabulary !== undefined && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">No Vocabulary:</span>
                    <span className="ml-2 font-medium text-yellow-600 dark:text-yellow-400">
                      {fixResults.noVocabulary}
                    </span>
                  </div>
                )}
                {fixResults.vocabularyCount !== undefined && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Vocabulary Found:</span>
                    <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                      {fixResults.vocabularyCount} words
                    </span>
                  </div>
                )}
              </div>
            )}

            {fixResults.error && (
              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-700 dark:text-red-300">
                Error: {fixResults.error}
              </div>
            )}

            {fixResults.results && fixResults.results.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  View detailed results
                </summary>
                <div className="mt-2 max-h-40 overflow-y-auto text-xs space-y-1">
                  {fixResults.results.map((result: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-1">
                      {result.status === 'fixed' && (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      )}
                      {result.status === 'error' && (
                        <XCircle className="w-3 h-3 text-red-500" />
                      )}
                      {result.status === 'no_vocabulary' && (
                        <AlertCircle className="w-3 h-3 text-yellow-500" />
                      )}
                      <span>{result.title}</span>
                      {result.vocabularyCount && (
                        <span className="text-gray-500">({result.vocabularyCount} words)</span>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
