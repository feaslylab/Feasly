import { useState, useCallback, useRef } from 'react';

export interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UndoRedoActions<T> {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  set: (newPresent: T) => void;
  clear: () => void;
  reset: (newState: T) => void;
}

export interface UndoRedoOptions {
  maxHistorySize?: number;
  debounceMs?: number;
}

/**
 * Generic undo/redo stack hook
 * Provides undo/redo functionality for any state type
 */
export function useUndoRedoStack<T>(
  initialState: T,
  options: UndoRedoOptions = {}
): [T, UndoRedoActions<T>] {
  const { maxHistorySize = 50, debounceMs = 300 } = options;
  
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: []
  });
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingStateRef = useRef<T | null>(null);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    setState(currentState => {
      if (currentState.past.length === 0) return currentState;
      
      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);
      
      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(currentState => {
      if (currentState.future.length === 0) return currentState;
      
      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);
      
      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  const set = useCallback((newPresent: T) => {
    // Clear any pending debounced state
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (debounceMs > 0) {
      // Store the new state for debouncing
      pendingStateRef.current = newPresent;
      
      debounceTimeoutRef.current = setTimeout(() => {
        const finalState = pendingStateRef.current;
        if (finalState !== null) {
          setState(currentState => {
            // Don't add to history if the state hasn't actually changed
            if (JSON.stringify(currentState.present) === JSON.stringify(finalState)) {
              return currentState;
            }

            const newPast = [...currentState.past, currentState.present];
            
            // Limit history size
            if (newPast.length > maxHistorySize) {
              newPast.shift();
            }

            return {
              past: newPast,
              present: finalState,
              future: [] // Clear future when new state is set
            };
          });
          pendingStateRef.current = null;
        }
      }, debounceMs);
    } else {
      // Immediate update without debouncing
      setState(currentState => {
        // Don't add to history if the state hasn't actually changed
        if (JSON.stringify(currentState.present) === JSON.stringify(newPresent)) {
          return currentState;
        }

        const newPast = [...currentState.past, currentState.present];
        
        // Limit history size
        if (newPast.length > maxHistorySize) {
          newPast.shift();
        }

        return {
          past: newPast,
          present: newPresent,
          future: [] // Clear future when new state is set
        };
      });
    }
  }, [maxHistorySize, debounceMs]);

  const clear = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    pendingStateRef.current = null;
    
    setState(currentState => ({
      past: [],
      present: currentState.present,
      future: []
    }));
  }, []);

  const reset = useCallback((newState: T) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    pendingStateRef.current = null;
    
    setState({
      past: [],
      present: newState,
      future: []
    });
  }, []);

  const actions: UndoRedoActions<T> = {
    canUndo,
    canRedo,
    undo,
    redo,
    set,
    clear,
    reset
  };

  return [state.present, actions];
}