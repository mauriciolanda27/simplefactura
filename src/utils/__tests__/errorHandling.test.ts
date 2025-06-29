import { 
  RetryQueue, 
  globalRetryQueue,
  AdminAlertSystem,
  withEnhancedErrorHandling
} from '../errorHandling';

describe('Error Handling Utilities', () => {
  describe('RetryQueue', () => {
    let retryQueue: RetryQueue;

    beforeEach(() => {
      retryQueue = new RetryQueue();
    });

    afterEach(() => {
      // Clear any timers that might have been created
      jest.clearAllTimers();
      retryQueue.clearQueue();
    });

    it('should create retry queue with default settings', () => {
      expect(retryQueue).toBeDefined();
      expect(typeof retryQueue.add).toBe('function');
      expect(typeof retryQueue.getQueueStatus).toBe('function');
    });

    it('should process operations successfully', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await retryQueue.add(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should get queue status', () => {
      const status = retryQueue.getQueueStatus();
      
      expect(status).toEqual({
        queueLength: 0,
        processing: false
      });
    });

    it('should clear queue', () => {
      retryQueue.clearQueue();
      const status = retryQueue.getQueueStatus();
      
      expect(status.queueLength).toBe(0);
    });
  });

  describe('Global Retry Queue', () => {
    afterEach(() => {
      // Clear any timers that might have been created
      jest.clearAllTimers();
      globalRetryQueue.clearQueue();
    });

    it('should be a singleton instance', () => {
      expect(globalRetryQueue).toBeInstanceOf(RetryQueue);
    });

    it('should process operations', async () => {
      const operation = jest.fn().mockResolvedValue('global success');
      
      const result = await globalRetryQueue.add(operation);
      
      expect(result).toBe('global success');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('AdminAlertSystem', () => {
    let alertSystem: AdminAlertSystem;

    beforeEach(() => {
      alertSystem = AdminAlertSystem.getInstance();
      alertSystem.clearAlerts();
    });

    it('should be a singleton', () => {
      const instance1 = AdminAlertSystem.getInstance();
      const instance2 = AdminAlertSystem.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should add error alerts', () => {
      alertSystem.addAlert('error', 'Test error message', { context: 'test' });
      
      const alerts = alertSystem.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('error');
      expect(alerts[0].message).toBe('Test error message');
    });

    it('should add warning alerts', () => {
      alertSystem.addAlert('warning', 'Test warning message');
      
      const alerts = alertSystem.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('warning');
      expect(alerts[0].message).toBe('Test warning message');
    });

    it('should add info alerts', () => {
      alertSystem.addAlert('info', 'Test info message');
      
      const alerts = alertSystem.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('info');
      expect(alerts[0].message).toBe('Test info message');
    });

    it('should get alert statistics', () => {
      alertSystem.addAlert('error', 'Error 1');
      alertSystem.addAlert('error', 'Error 2');
      alertSystem.addAlert('warning', 'Warning 1');
      alertSystem.addAlert('info', 'Info 1');
      
      const stats = alertSystem.getAlertStats();
      
      expect(stats.total).toBe(4);
      expect(stats.byType.error).toBe(2);
      expect(stats.byType.warning).toBe(1);
      expect(stats.byType.info).toBe(1);
    });

    it('should clear alerts', () => {
      alertSystem.addAlert('error', 'Test error');
      alertSystem.clearAlerts();
      
      const alerts = alertSystem.getAlerts();
      expect(alerts).toHaveLength(0);
    });

    it('should limit alert retrieval', () => {
      // Add 10 alerts
      for (let i = 0; i < 10; i++) {
        alertSystem.addAlert('info', `Alert ${i}`);
      }
      
      const alerts = alertSystem.getAlerts(5);
      expect(alerts).toHaveLength(5);
    });
  });

  describe('withEnhancedErrorHandling', () => {
    it('should execute successful operations', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withEnhancedErrorHandling(operation, { context: 'test' });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle failed operations', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      
      await expect(withEnhancedErrorHandling(operation)).rejects.toThrow('Operation failed');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
}); 