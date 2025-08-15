import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

interface SecurityEvent {
  id: string;
  type: 'login_failure' | 'suspicious_activity' | 'data_access';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

export const useSecurityAudit = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const { user } = useAuth();

  const logSecurityEvent = (type: SecurityEvent['type'], message: string, severity: SecurityEvent['severity'] = 'medium') => {
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date(),
      severity
    };
    
    setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
    
    // In a real app, you'd send this to your security monitoring service
    if (severity === 'high') {
      console.warn('Security Alert:', event);
    }
  };

  const logFailedLogin = (email: string, reason: string) => {
    logSecurityEvent('login_failure', `Failed login attempt for ${email}: ${reason}`, 'medium');
  };

  const logSuspiciousActivity = (activity: string) => {
    logSecurityEvent('suspicious_activity', activity, 'high');
  };

  const logDataAccess = (resource: string, action: string) => {
    logSecurityEvent('data_access', `${action} access to ${resource}`, 'low');
  };

  return {
    events,
    logSecurityEvent,
    logFailedLogin,
    logSuspiciousActivity,
    logDataAccess
  };
};