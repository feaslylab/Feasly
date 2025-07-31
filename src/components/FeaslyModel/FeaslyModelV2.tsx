import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { feaslyModelSchema, type FeaslyModelFormData } from './types';
import { FormContent } from './FormContent';
import { useSupabaseAutosave, ConflictError } from '@/hooks/useSupabaseAutosave';
import { AutosaveContext } from '@/contexts/AutosaveContext';
import { SaveIndicator } from './SaveIndicator';
import { ConflictModal } from './ConflictModal';

// Check if v2 feature flag is enabled
const isV2Enabled = import.meta.env.VITE_MODEL_V2 === 'true';

interface FeaslyModelV2Props {
  projectId: string;
  onSubmit: (data: FeaslyModelFormData) => Promise<void>;
  onSaveDraft: () => void;
  initialData?: Partial<FeaslyModelFormData>;
}

function FeaslyModelV2({ projectId, onSubmit, onSaveDraft, initialData }: FeaslyModelV2Props) {
  // Form setup
  const form = useForm<FeaslyModelFormData>({
    resolver: zodResolver(feaslyModelSchema),
    defaultValues: {
      phasing_enabled: false,
      zakat_applicable: false,
      escrow_required: false,
      currency_code: "SAR",
      ...initialData,
    },
  });

  // Autosave integration
  const autosave = useSupabaseAutosave(projectId);
  const [conflict, setConflict] = useState<ConflictError | null>(null);

  // Watch form changes and autosave
  const watchedValues = useWatch({ control: form.control });
  
  useEffect(() => {
    if (watchedValues && Object.keys(watchedValues).length > 0) {
      const timeoutId = setTimeout(() => {
        autosave.setDraft(watchedValues);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues, autosave]);

  // Process queue on startup if online
  useEffect(() => {
    if (navigator.onLine) {
      autosave.processQueue();
    }
  }, [autosave]);

  // Request storage persistence for better offline experience
  useEffect(() => {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      navigator.storage.persist();
    }
  }, []);

  // Enhanced submit handler with conflict resolution
  const handleSubmit = async (data: FeaslyModelFormData) => {
    try {
      await autosave.commit(data);
      await onSubmit(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'ConflictError') {
        setConflict(error as ConflictError);
      } else {
        throw error;
      }
    }
  };

  // Enhanced save draft handler
  const handleSaveDraft = async () => {
    const currentValues = form.getValues();
    autosave.setDraft(currentValues);
    onSaveDraft();
  };

  // Conflict resolution handler
  const handleConflictResolve = async (resolution: 'overwrite' | 'merge' | 'cancel') => {
    if (!conflict) return;

    try {
      switch (resolution) {
        case 'overwrite':
          await autosave.commit(conflict.localData);
          break;
        case 'merge':
          // Simple last-write-wins merge strategy
          const mergedData = { ...conflict.serverData, ...conflict.localData };
          await autosave.commit(mergedData);
          form.reset(mergedData);
          break;
        case 'cancel':
          // Reset form to server data
          form.reset(conflict.serverData);
          break;
      }
      setConflict(null);
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      // Could set a new conflict if another conflict occurs
    }
  };

  const autosaveContextValue = {
    state: autosave.state,
    setDraft: autosave.setDraft,
    commit: autosave.commit,
    clearDraft: autosave.clearDraft,
    processQueue: autosave.processQueue,
  };

  return (
    <>
      <div className="relative">
        {/* Save indicator - positioned to avoid overlapping with header */}
        <div className="fixed top-20 right-4 z-40">
          <SaveIndicator state={autosave.state} />
        </div>

        <AutosaveContext.Provider value={autosaveContextValue}>
          <FormProvider {...form}>
            <FormContent 
              projectId={projectId}
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
            />
          </FormProvider>
        </AutosaveContext.Provider>
      </div>

      {/* Conflict resolution modal */}
      <ConflictModal
        isOpen={!!conflict}
        onClose={() => setConflict(null)}
        conflict={conflict}
        onResolve={handleConflictResolve}
      />
    </>
  );
}

export { FeaslyModelV2, isV2Enabled };