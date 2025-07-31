import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useUndoRedoStack } from './useUndoRedoStack';
import { FeaslyModelFormData } from '@/components/FeaslyModel/types';

export interface GridUndoRedoActions {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  saveState: () => void;
  clearHistory: () => void;
  resetHistory: () => void;
}

/**
 * Undo/Redo functionality specifically for grid form fields
 * Integrates with react-hook-form to provide undo/redo for specific grid arrays
 */
export function useGridUndoRedo(fieldName: keyof FeaslyModelFormData): GridUndoRedoActions {
  const { watch, setValue, getValues } = useFormContext<FeaslyModelFormData>();
  
  // Watch the specific field
  const currentValue = watch(fieldName) || [];
  
  // Initialize undo/redo stack with current field value
  const [stackState, stackActions] = useUndoRedoStack(currentValue, {
    maxHistorySize: 30, // Reasonable history size for grids
    debounceMs: 500     // Debounce rapid changes
  });

  const undo = useCallback(() => {
    stackActions.undo();
    // The stack state will update, and we'll sync with form in useEffect
  }, [stackActions]);

  const redo = useCallback(() => {
    stackActions.redo();
    // The stack state will update, and we'll sync with form in useEffect
  }, [stackActions]);

  const saveState = useCallback(() => {
    const currentFieldValue = getValues(fieldName) || [];
    stackActions.set(currentFieldValue);
  }, [fieldName, getValues, stackActions]);

  const clearHistory = useCallback(() => {
    stackActions.clear();
  }, [stackActions]);

  const resetHistory = useCallback(() => {
    const currentFieldValue = getValues(fieldName) || [];
    stackActions.reset(currentFieldValue);
  }, [fieldName, getValues, stackActions]);

  // Sync stack state changes back to form
  // This is triggered when undo/redo is called
  const syncStackToForm = useCallback(() => {
    const currentFormValue = getValues(fieldName);
    if (JSON.stringify(currentFormValue) !== JSON.stringify(stackState)) {
      setValue(fieldName, stackState, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    }
  }, [fieldName, getValues, setValue, stackState]);

  // Effect to sync stack state to form when undo/redo occurs
  React.useEffect(() => {
    syncStackToForm();
  }, [syncStackToForm]);

  // Effect to sync form changes to stack (for external form updates)
  React.useEffect(() => {
    const currentFormValue = getValues(fieldName) || [];
    if (JSON.stringify(currentFormValue) !== JSON.stringify(stackState)) {
      stackActions.set(currentFormValue);
    }
  }, [currentValue, fieldName, getValues, stackActions, stackState]);

  return {
    canUndo: stackActions.canUndo,
    canRedo: stackActions.canRedo,
    undo,
    redo,
    saveState,
    clearHistory,
    resetHistory
  };
}

// Import React for useEffect
import React from 'react';