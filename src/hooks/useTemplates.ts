// src/hooks/useTemplates.ts
import { useState, useCallback } from 'react'
import useSlideStore from '@/stores/slideStore'
import { getTemplateById } from '@/data/templates'
import type { SlideTemplate } from '@/types/template.types'

export default function useTemplates() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [recentTemplates, setRecentTemplates] = useState<string[]>([])
  const addSlide = useSlideStore(state => state.addSlide)
  
  const openTemplateModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])
  
  const closeTemplateModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])
  
  const applyTemplate = useCallback((template: SlideTemplate) => {
    // Add to recent templates
    setRecentTemplates(prev => {
      const filtered = prev.filter(id => id !== template.id)
      return [template.id, ...filtered].slice(0, 5) // Keep last 5
    })
    
    // Add slide with template
    const slideId = addSlide(template)
    
    // Close modal
    closeTemplateModal()
    
    return slideId
  }, [addSlide, closeTemplateModal])
  
  const getRecentTemplates = useCallback((): SlideTemplate[] => {
    return recentTemplates
      .map(id => getTemplateById(id))
      .filter((t): t is SlideTemplate => t !== undefined)
  }, [recentTemplates])
  
  return {
    isModalOpen,
    openTemplateModal,
    closeTemplateModal,
    applyTemplate,
    getRecentTemplates,
    recentTemplateIds: recentTemplates
  }
}
