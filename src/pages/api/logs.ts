import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { getUserLogs, getUserActivitySummary } from '../../utils/logging';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }

  switch (req.method) {
    case 'GET':
      return getLogs(req, res, user.id);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}

async function getLogs(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { 
      page = '1', 
      limit = '20', 
      action, 
      entityType, 
      startDate, 
      endDate,
      summary = 'false'
    } = req.query;

    // If summary is requested, return activity summary
    if (summary === 'true') {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const summary = await getUserActivitySummary(userId, days);
      return res.status(200).json(summary);
    }

    // Parse pagination parameters
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Parse date filters
    const startDateObj = startDate ? new Date(startDate as string) : undefined;
    const endDateObj = endDate ? new Date(endDate as string) : undefined;

    // Get logs with filters
    const result = await getUserLogs(userId, {
      page: pageNum,
      limit: limitNum,
      action: action as string,
      entityType: entityType as string,
      startDate: startDateObj,
      endDate: endDateObj,
    });

    // Format logs for response
    const formattedLogs = result.logs.map(log => ({
      id: log.id,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      details: log.details,
      createdAt: log.created_at,
      // Add human-readable action descriptions
      actionDescription: getActionDescription(log.action),
      entityTypeDescription: getEntityTypeDescription(log.entity_type),
    }));

    return res.status(200).json({
      logs: formattedLogs,
      pagination: {
        page: result.page,
        total: result.total,
        totalPages: result.totalPages,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error al obtener logs:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

function getActionDescription(action: string): string {
  const descriptions: Record<string, string> = {
    CREATE_INVOICE: 'Crear factura',
    UPDATE_INVOICE: 'Actualizar factura',
    DELETE_INVOICE: 'Eliminar factura',
    CREATE_CATEGORY: 'Crear categoría',
    UPDATE_CATEGORY: 'Actualizar categoría',
    DELETE_CATEGORY: 'Eliminar categoría',
    CREATE_RUBRO: 'Crear rubro',
    UPDATE_RUBRO: 'Actualizar rubro',
    DELETE_RUBRO: 'Eliminar rubro',
    GENERATE_REPORT: 'Generar reporte',
    EXPORT_REPORT: 'Exportar reporte',
    EXPORT_PDF: 'Exportar PDF',
    EXPORT_CSV: 'Exportar CSV',
    GENERATE_PREDICTIONS: 'Generar predicciones',
    LOGIN: 'Iniciar sesión',
    LOGOUT: 'Cerrar sesión',
    REGISTER: 'Registrarse',
    PASSWORD_CHANGE: 'Cambiar contraseña',
    SEARCH_INVOICES: 'Buscar facturas',
    BULK_OPERATION: 'Operación masiva',
  };

  return descriptions[action] || action;
}

function getEntityTypeDescription(entityType: string | null): string {
  if (!entityType) return 'Sistema';
  
  const descriptions: Record<string, string> = {
    Invoice: 'Factura',
    Category: 'Categoría',
    Rubro: 'Rubro',
    Report: 'Reporte',
    Analytics: 'Análisis',
    User: 'Usuario',
  };

  return descriptions[entityType] || entityType;
} 