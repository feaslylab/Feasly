// Production-ready logging system
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVELS = {
  ERROR: 'error' as const,
  WARN: 'warn' as const,
  INFO: 'info' as const,
  DEBUG: 'debug' as const,
};

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  source?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private formatMessage(level: LogLevel, message: string, data?: any, source?: string): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      source,
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  error(message: string, data?: any, source?: string) {
    const entry = this.formatMessage(LOG_LEVELS.ERROR, message, data, source);
    this.addLog(entry);
    
    if (this.isDevelopment) {
      console.error(`[${entry.timestamp}] ${source ? `[${source}] ` : ''}${message}`, data);
    }

    // In production, you might want to send to an external service
    if (!this.isDevelopment) {
      this.sendToExternalService(entry);
    }
  }

  warn(message: string, data?: any, source?: string) {
    const entry = this.formatMessage(LOG_LEVELS.WARN, message, data, source);
    this.addLog(entry);
    
    if (this.isDevelopment) {
      console.warn(`[${entry.timestamp}] ${source ? `[${source}] ` : ''}${message}`, data);
    }
  }

  info(message: string, data?: any, source?: string) {
    const entry = this.formatMessage(LOG_LEVELS.INFO, message, data, source);
    this.addLog(entry);
    
    if (this.isDevelopment) {
      console.info(`[${entry.timestamp}] ${source ? `[${source}] ` : ''}${message}`, data);
    }
  }

  debug(message: string, data?: any, source?: string) {
    const entry = this.formatMessage(LOG_LEVELS.DEBUG, message, data, source);
    this.addLog(entry);
    
    if (this.isDevelopment) {
      console.debug(`[${entry.timestamp}] ${source ? `[${source}] ` : ''}${message}`, data);
    }
  }

  // Get recent logs for debugging
  getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Send to external logging service in production
  private sendToExternalService(entry: LogEntry) {
    // Implementation for external logging service
    // e.g., Sentry, LogRocket, etc.
  }
}

export const logger = new Logger();

// Performance monitoring utilities
export const performanceLogger = {
  startTimer: (label: string) => {
    if (import.meta.env.DEV) {
      console.time(label);
    }
    return Date.now();
  },

  endTimer: (label: string, startTime?: number) => {
    if (import.meta.env.DEV) {
      console.timeEnd(label);
    }
    if (startTime) {
      const duration = Date.now() - startTime;
      logger.debug(`Performance: ${label} took ${duration}ms`);
    }
  },

  markRender: (componentName: string) => {
    if (import.meta.env.DEV) {
      console.log(`🔄 Rendering: ${componentName}`);
    }
  }
};