// src/hooks/useSupabaseSync.ts
// Hook to sync local Zustand store with Supabase database

import { useEffect, useCallback, useState, useRef } from 'react';
import { supabaseService } from '@/database/supabase-service';
import useSlideStore from '@/stores/slideStore';
import type { DatabasePresentation, DatabaseSlide } from '@/database/types';
import type { Presentation, Slide } from '@/types/slide.types';
import { debounce } from 'lodash-es';
import { nanoid } from 'nanoid';

interface UseSupabaseSyncOptions {
  autoSave?: boolean;
  autoSaveDelay?: number; // milliseconds
  syncOnMount?: boolean;
}

interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: Error | null;
  isOnline: boolean;
}

export function useSupabaseSync(options: UseSupabaseSyncOptions = {}) {
  const {
    autoSave = true,
    autoSaveDelay = 2000,
    syncOnMount = true
  } = options;

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
    isOnline: navigator.onLine
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [presentationId, setPresentationId] = useState<string | null>(null);
  
  const presentation = useSlideStore(state => state.presentation);
  const slides = useSlideStore(state => state.slides);
  const updatePresentationTitle = useSlideStore(state => state.updatePresentationTitle);
  const isMountedRef = useRef(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await supabaseService.auth.getCurrentUser();
        setUserId(user?.id || null);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUserId(null);
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
      isMountedRef.current = false;
    };
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setSyncStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Convert local Presentation to DatabasePresentation
  const convertToDbPresentation = useCallback((local: Presentation): Omit<DatabasePresentation, 'id' | 'created_at' | 'updated_at'> => {
    return {
      user_id: userId!,
      organization_id: null,
      title: local.title,
      description: local.description || null,
      thumbnail_url: null,
      is_template: false,
      is_public: false,
      version: local.version,
      settings: local.settings || {},
      tags: []
    };
  }, [userId]);

  // Convert local Slide to DatabaseSlide
  const convertToDbSlide = useCallback((local: Slide, index: number): Omit<DatabaseSlide, 'id' | 'created_at' | 'updated_at'> => {
    return {
      presentation_id: presentationId!,
      order_index: index,
      slide_type: local.slideType || null,
      template_id: local.templateId || null,
      background: typeof local.background === 'string' 
        ? { type: 'color', value: local.background }
        : local.background,
      elements: local.elements,
      notes: local.notes || null,
      metadata: local.metadata || {}
    };
  }, [presentationId]);

  // Save presentation to Supabase
  const saveToSupabase = useCallback(async () => {
    if (!userId || !presentation || !syncStatus.isOnline) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      let dbPresentationId = presentationId;

      // Create or update presentation
      if (!dbPresentationId) {
        // Create new presentation
        const dbPresentation = await supabaseService.presentation.createPresentation(
          convertToDbPresentation(presentation)
        );
        dbPresentationId = dbPresentation.id;
        setPresentationId(dbPresentationId);
      } else {
        // Update existing presentation
        await supabaseService.presentation.updatePresentation(
          dbPresentationId,
          {
            title: presentation.title,
            description: presentation.description || null,
            version: presentation.version,
            settings: presentation.settings || {}
          }
        );
      }

      // Sync slides
      if (dbPresentationId && slides.length > 0) {
        // Get existing slides from database
        const { data: existingSlides } = await supabase
          .from('slides')
          .select('id, order_index')
          .eq('presentation_id', dbPresentationId)
          .order('order_index');

        // Delete removed slides
        const localSlideIds = slides.map(s => s.id);
        const slidesToDelete = existingSlides?.filter(s => !localSlideIds.includes(s.id)) || [];
        
        for (const slide of slidesToDelete) {
          await supabaseService.slide.deleteSlide(slide.id);
        }

        // Update or create slides
        for (let i = 0; i < slides.length; i++) {
          const localSlide = slides[i];
          const dbSlideData = convertToDbSlide(localSlide, i);
          
          const existingSlide = existingSlides?.find(s => s.id === localSlide.id);
          
          if (existingSlide) {
            // Update existing slide
            await supabaseService.slide.updateSlide(localSlide.id, dbSlideData);
          } else {
            // Create new slide with the same ID as local
            await supabase
              .from('slides')
              .insert({
                ...dbSlideData,
                id: localSlide.id
              });
          }
        }
      }

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null
      }));

      // Log activity
      await supabaseService.activity.logActivity(userId, 'presentation_saved', {
        resourceType: 'presentation',
        resourceId: dbPresentationId,
        metadata: { title: presentation.title }
      });

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error as Error
      }));
    }
  }, [userId, presentation, slides, presentationId, syncStatus.isOnline, convertToDbPresentation, convertToDbSlide]);

  // Debounced auto-save
  const debouncedSave = useRef(
    debounce(saveToSupabase, autoSaveDelay)
  ).current;

  // Auto-save when presentation or slides change
  useEffect(() => {
    if (autoSave && userId && presentation && syncStatus.isOnline) {
      debouncedSave();
    }
  }, [presentation, slides, autoSave, userId, syncStatus.isOnline]);

  // Load presentation from Supabase
  const loadFromSupabase = useCallback(async (dbPresentationId: string) => {
    if (!userId) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const data = await supabaseService.presentation.getPresentationWithSlides(dbPresentationId);
      
      if (!data) {
        throw new Error('Presentation not found');
      }

      // Convert to local format and update store
      const localPresentation: Presentation = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        slides: data.slides?.map(s => s.id) || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        version: data.version,
        settings: data.settings
      };

      const localSlides: Slide[] = data.slides?.map(s => ({
        id: s.id,
        presentationId: s.presentation_id,
        elements: s.elements,
        background: s.background,
        order: s.order_index,
        templateId: s.template_id || undefined,
        slideType: s.slide_type || undefined,
        notes: s.notes || undefined,
        metadata: s.metadata,
        createdAt: s.created_at,
        updatedAt: s.updated_at
      })) || [];

      // Update local store
      const store = useSlideStore.getState();
      store.presentation = localPresentation;
      store.slides = localSlides;
      store.currentSlideId = localSlides[0]?.id || null;
      store.selectedSlideId = localSlides[0]?.id || null;

      setPresentationId(dbPresentationId);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null
      }));

    } catch (error) {
      console.error('Load failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error as Error
      }));
    }
  }, [userId]);

  // List user's presentations
  const listPresentations = useCallback(async () => {
    if (!userId) return [];

    try {
      const presentations = await supabaseService.presentation.getUserPresentations(userId);
      return presentations;
    } catch (error) {
      console.error('Failed to list presentations:', error);
      return [];
    }
  }, [userId]);

  // Create a new presentation
  const createPresentation = useCallback(async (title: string, description?: string) => {
    if (!userId) return null;

    try {
      const dbPresentation = await supabaseService.presentation.createPresentation({
        user_id: userId,
        organization_id: null,
        title,
        description: description || null,
        thumbnail_url: null,
        is_template: false,
        is_public: false,
        version: 1,
        settings: {},
        tags: []
      });

      // Create first slide
      await supabaseService.slide.createSlide({
        presentation_id: dbPresentation.id,
        order_index: 0,
        slide_type: 'title',
        template_id: null,
        background: { type: 'color', value: '#ffffff' },
        elements: [],
        notes: null,
        metadata: {}
      });

      setPresentationId(dbPresentation.id);
      
      // Load into local store
      await loadFromSupabase(dbPresentation.id);
      
      return dbPresentation.id;
    } catch (error) {
      console.error('Failed to create presentation:', error);
      return null;
    }
  }, [userId, loadFromSupabase]);

  // Delete presentation
  const deletePresentation = useCallback(async (dbPresentationId: string) => {
    if (!userId) return;

    try {
      await supabaseService.presentation.deletePresentation(dbPresentationId);
      
      // Clear local store if it's the current presentation
      if (presentationId === dbPresentationId) {
        const store = useSlideStore.getState();
        store.presentation = null;
        store.slides = [];
        store.currentSlideId = null;
        store.selectedSlideId = null;
        setPresentationId(null);
      }
    } catch (error) {
      console.error('Failed to delete presentation:', error);
      throw error;
    }
  }, [userId, presentationId]);

  // Upload media
  const uploadMedia = useCallback(async (file: File, tags: string[] = []) => {
    if (!userId) return null;

    try {
      const media = await supabaseService.media.uploadMedia(userId, file, tags);
      return media;
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    }
  }, [userId]);

  return {
    // State
    syncStatus,
    userId,
    presentationId,
    isAuthenticated: !!userId,
    
    // Actions
    saveToSupabase,
    loadFromSupabase,
    listPresentations,
    createPresentation,
    deletePresentation,
    uploadMedia,
    
    // Manual sync trigger
    sync: saveToSupabase,
    
    // Auth actions
    signIn: supabaseService.auth.signIn,
    signOut: supabaseService.auth.signOut,
    signUp: supabaseService.auth.signUp
  };
}

// Re-export for convenience
export { supabaseService } from '@/database/supabase-service';
export type { SyncStatus };

// Import supabase client for auth listener
import { supabase } from '@/lib/supabase'; 