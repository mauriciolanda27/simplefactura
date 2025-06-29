export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface ErrorInfo {
  type: 'network' | 'server' | 'validation' | 'auth' | 'unknown';
  message: string;
  retryable: boolean;
  shouldAlertAdmin: boolean;
  timestamp: Date;
  context?: Record<string, any>;
}

export class RetryQueue {
  private queue: Array<{
    id: string;
    operation: () => Promise<any>;
    config: RetryConfig;
    attempts: number;
    lastError?: Error;
  }> = [];
  private processing = false;

  async add(
    operation: () => Promise<any>,
    config: Partial<RetryConfig> = {}
  ): Promise<any> {
    const defaultConfig: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR']
    };

    const finalConfig = { ...defaultConfig, ...config };
    const id = `retry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      this.queue.push({
        id,
        operation,
        config: finalConfig,
        attempts: 0
      });

      this.processQueue().then(resolve).catch(reject);
    });
  }

  private async processQueue(): Promise<any> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      try {
        const result = await this.executeWithRetry(item);
        return result;
      } catch (error) {
        // If this was the last item, throw the error
        if (this.queue.length === 0) {
          throw error;
        }
        // Otherwise, continue with the next item
      }
    }

    this.processing = false;
  }

  private async executeWithRetry(item: any): Promise<any> {
    while (item.attempts < item.config.maxRetries) {
      try {
        return await item.operation();
      } catch (error) {
        item.attempts++;
        item.lastError = error as Error;

        const errorInfo = this.categorizeError(error as Error);
        
        // If error is not retryable, throw immediately
        if (!errorInfo.retryable) {
          throw error;
        }

        // If we've exhausted retries, throw the error
        if (item.attempts >= item.config.maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          item.config.baseDelay * Math.pow(item.config.backoffMultiplier, item.attempts - 1),
          item.config.maxDelay
        );

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private categorizeError(error: Error): ErrorInfo {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        type: 'network',
        message: error.message,
        retryable: true,
        shouldAlertAdmin: false,
        timestamp: new Date()
      };
    }

    // Server errors
    if (message.includes('500') || message.includes('server') || message.includes('internal')) {
      return {
        type: 'server',
        message: error.message,
        retryable: true,
        shouldAlertAdmin: true,
        timestamp: new Date()
      };
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('400')) {
      return {
        type: 'validation',
        message: error.message,
        retryable: false,
        shouldAlertAdmin: false,
        timestamp: new Date()
      };
    }

    // Auth errors
    if (message.includes('unauthorized') || message.includes('401') || message.includes('403')) {
      return {
        type: 'auth',
        message: error.message,
        retryable: false,
        shouldAlertAdmin: true,
        timestamp: new Date()
      };
    }

    // Unknown errors
    return {
      type: 'unknown',
      message: error.message,
      retryable: false,
      shouldAlertAdmin: true,
      timestamp: new Date()
    };
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing
    };
  }

  clearQueue() {
    this.queue = [];
  }
}

// Global retry queue instance
export const globalRetryQueue = new RetryQueue();

// Admin alert system
export class AdminAlertSystem {
  private static instance: AdminAlertSystem;
  private alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
    context?: Record<string, any>;
  }> = [];

  static getInstance(): AdminAlertSystem {
    if (!AdminAlertSystem.instance) {
      AdminAlertSystem.instance = new AdminAlertSystem();
    }
    return AdminAlertSystem.instance;
  }

  addAlert(type: 'error' | 'warning' | 'info', message: string, context?: Record<string, any>) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
      context
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔔 Admin Alert: ${type.toUpperCase()}`);
      console.log('Message:', message);
      console.log('Timestamp:', alert.timestamp);
      if (context) {
        console.log('Context:', context);
      }
      console.groupEnd();
    }

    return alert.id;
  }

  getAlerts(limit = 50) {
    return this.alerts.slice(-limit);
  }

  clearAlerts() {
    this.alerts = [];
  }

  getAlertStats() {
    const now = new Date();
    const last24h = this.alerts.filter(alert => 
      now.getTime() - alert.timestamp.getTime() < 24 * 60 * 60 * 1000
    );

    return {
      total: this.alerts.length,
      last24h: last24h.length,
      byType: {
        error: this.alerts.filter(a => a.type === 'error').length,
        warning: this.alerts.filter(a => a.type === 'warning').length,
        info: this.alerts.filter(a => a.type === 'info').length
      }
    };
  }
}

export const adminAlerts = AdminAlertSystem.getInstance();

// Utility function for enhanced error handling
export async function withEnhancedErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const errorInfo = globalRetryQueue['categorizeError'](error as Error);
    
    // Add admin alert if needed
    if (errorInfo.shouldAlertAdmin) {
      adminAlerts.addAlert('error', errorInfo.message, {
        ...context,
        errorType: errorInfo.type,
        timestamp: errorInfo.timestamp
      });
    }

    // Re-throw the error with enhanced context
    const enhancedError = new Error(errorInfo.message);
    (enhancedError as any).errorInfo = errorInfo;
    throw enhancedError;
  }
} 