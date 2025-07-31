import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationGuardOptions {
  isBlocking?: boolean;
  isDirty?: boolean;
  isCalculating?: boolean;
  message?: string;
}

interface PendingNavigation {
  to: string;
  replace?: boolean;
}

export function useNavigationGuard({
  isBlocking = false,
  isDirty = false,
  isCalculating = false,
  message = "You have unsaved changes that will be lost. Continue anyway?"
}: NavigationGuardOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null);

  const shouldBlock = isBlocking && (isDirty || isCalculating);

  const getConfirmMessage = useCallback(() => {
    if (isCalculating && isDirty) {
      return "You have unsaved changes and calculations in progress. Switching will lose your work. Continue anyway?";
    } else if (isCalculating) {
      return "Calculations are in progress. Switching will interrupt them. Continue anyway?";
    } else if (isDirty) {
      return "You have unsaved changes that will be lost. Continue anyway?";
    }
    return message;
  }, [isDirty, isCalculating, message]);

  const attemptNavigation = useCallback((to: string, replace = false) => {
    if (shouldBlock) {
      setPendingNavigation({ to, replace });
      setShowConfirmModal(true);
      return false;
    } else {
      navigate(to, { replace });
      return true;
    }
  }, [shouldBlock, navigate]);

  const confirmNavigation = useCallback(() => {
    if (pendingNavigation) {
      navigate(pendingNavigation.to, { replace: pendingNavigation.replace });
      setPendingNavigation(null);
    }
    setShowConfirmModal(false);
  }, [navigate, pendingNavigation]);

  const cancelNavigation = useCallback(() => {
    setPendingNavigation(null);
    setShowConfirmModal(false);
  }, []);

  return {
    shouldBlock,
    attemptNavigation,
    confirmNavigation,
    cancelNavigation,
    showConfirmModal,
    setShowConfirmModal,
    getConfirmMessage,
    currentPath: location.pathname
  };
}