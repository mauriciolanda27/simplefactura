import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LogAction {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
}

export const LOG_ACTIONS = {
  // Invoice actions
  CREATE_INVOICE: 'CREATE_INVOICE',
  UPDATE_INVOICE: 'UPDATE_INVOICE',
  DELETE_INVOICE: 'DELETE_INVOICE',
  
  // Category actions
  CREATE_CATEGORY: 'CREATE_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  
  // Rubro actions
  CREATE_RUBRO: 'CREATE_RUBRO',
  UPDATE_RUBRO: 'UPDATE_RUBRO',
  DELETE_RUBRO: 'DELETE_RUBRO',
  
  // Report actions
  GENERATE_REPORT: 'GENERATE_REPORT',
  EXPORT_REPORT: 'EXPORT_REPORT',
  
  // Analytics actions
  GENERATE_PREDICTIONS: 'GENERATE_PREDICTIONS',
  
  // Export actions
  EXPORT_PDF: 'EXPORT_PDF',
  EXPORT_CSV: 'EXPORT_CSV',
  
  // Authentication actions
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  
  // System actions
  SEARCH_INVOICES: 'SEARCH_INVOICES',
  BULK_OPERATION: 'BULK_OPERATION',
} as const;

export const ENTITY_TYPES = {
  INVOICE: 'Invoice',
  CATEGORY: 'Category',
  RUBRO: 'Rubro',
  REPORT: 'Report',
  ANALYTICS: 'Analytics',
  USER: 'User',
} as const;

/**
 * Log a user action to the database
 */
export async function logUserAction(logData: LogAction): Promise<void> {
  try {
    await prisma.userLog.create({
      data: {
        userId: logData.userId,
        action: logData.action,
        entity_type: logData.entityType,
        entity_id: logData.entityId,
        details: logData.details,
      },
    });
  } catch (error) {
    // Don't throw errors from logging to avoid breaking the main functionality
    console.error('Error logging user action:', error);
  }
}

/**
 * Log invoice-related actions
 */
export async function logInvoiceAction(
  userId: string,
  action: string,
  invoiceId?: string,
  details?: Record<string, any>
): Promise<void> {
  await logUserAction({
    userId,
    action,
    entityType: ENTITY_TYPES.INVOICE,
    entityId: invoiceId,
    details,
  });
}

/**
 * Log category-related actions
 */
export async function logCategoryAction(
  userId: string,
  action: string,
  categoryId?: string,
  details?: Record<string, any>
): Promise<void> {
  await logUserAction({
    userId,
    action,
    entityType: ENTITY_TYPES.CATEGORY,
    entityId: categoryId,
    details,
  });
}

/**
 * Log rubro-related actions
 */
export async function logRubroAction(
  userId: string,
  action: string,
  rubroId?: string,
  details?: Record<string, any>
): Promise<void> {
  await logUserAction({
    userId,
    action,
    entityType: ENTITY_TYPES.RUBRO,
    entityId: rubroId,
    details,
  });
}

/**
 * Log report-related actions
 */
export async function logReportAction(
  userId: string,
  action: string,
  details?: Record<string, any>
): Promise<void> {
  await logUserAction({
    userId,
    action,
    entityType: ENTITY_TYPES.REPORT,
    details,
  });
}

/**
 * Log analytics-related actions
 */
export async function logAnalyticsAction(
  userId: string,
  action: string,
  details?: Record<string, any>
): Promise<void> {
  await logUserAction({
    userId,
    action,
    entityType: ENTITY_TYPES.ANALYTICS,
    details,
  });
}

/**
 * Log authentication actions
 */
export async function logAuthAction(
  userId: string,
  action: string,
  details?: Record<string, any>
): Promise<void> {
  await logUserAction({
    userId,
    action,
    entityType: ENTITY_TYPES.USER,
    details,
  });
}

/**
 * Get user logs with pagination and filtering
 */
export async function getUserLogs(
  userId: string,
  options: {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<{
  logs: any[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const {
    page = 1,
    limit = 20,
    action,
    entityType,
    startDate,
    endDate,
  } = options;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = { userId };

  if (action) {
    where.action = action;
  }

  if (entityType) {
    where.entity_type = entityType;
  }

  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) {
      where.created_at.gte = startDate;
    }
    if (endDate) {
      where.created_at.lte = endDate;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.userLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.userLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get activity summary for a user
 */
export async function getUserActivitySummary(userId: string, days: number = 30): Promise<{
  totalActions: number;
  actionsByType: Record<string, number>;
  recentActivity: any[];
  mostActiveDay: string;
  mostCommonAction: string;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await prisma.userLog.findMany({
    where: {
      userId,
      created_at: {
        gte: startDate,
      },
    },
    orderBy: { created_at: 'desc' },
  });

  // Count actions by type
  const actionsByType = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Find most common action
  const mostCommonAction = Object.entries(actionsByType).reduce(
    (max, [action, count]) => (count > max.count ? { action, count } : max),
    { action: '', count: 0 }
  ).action;

  // Group by day to find most active day
  const dailyActivity = logs.reduce((acc, log) => {
    const day = log.created_at.toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostActiveDay = Object.entries(dailyActivity).reduce(
    (max, [day, count]) => (count > max.count ? { day, count } : max),
    { day: '', count: 0 }
  ).day;

  return {
    totalActions: logs.length,
    actionsByType,
    recentActivity: logs.slice(0, 10),
    mostActiveDay,
    mostCommonAction,
  };
} 