import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tipos para el middleware
export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// Middleware de autenticación básica
export async function withAuth(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.email) {
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Debe iniciar sesión para acceder a este recurso'
      });
    }

    // Obtener usuario completo de la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario inválido',
        message: 'El usuario no existe en la base de datos'
      });
    }

    // Agregar usuario al request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Error de autenticación',
      message: 'Error interno del servidor'
    });
  }
}

// Middleware de autenticación con verificación de propiedad
export async function withOwnership(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  resourceType: 'invoice' | 'category',
  resourceId: string,
  next: () => void
) {
  try {
    // Primero verificar autenticación
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.email) {
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Debe iniciar sesión para acceder a este recurso'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario inválido',
        message: 'El usuario no existe en la base de datos'
      });
    }

    // Verificar propiedad del recurso
    let resource;
    
    if (resourceType === 'invoice') {
      resource = await prisma.invoice.findFirst({
        where: {
          id: resourceId,
          userId: user.id
        }
      });
    } else if (resourceType === 'category') {
      resource = await prisma.category.findFirst({
        where: {
          id: resourceId,
          userId: user.id
        }
      });
    }

    if (!resource) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'No tiene permisos para acceder a este recurso'
      });
    }

    // Agregar usuario y recurso al request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    (req as AuthenticatedRequest & { resource: unknown }).resource = resource;
    next();
  } catch (error) {
    console.error('Ownership middleware error:', error);
    return res.status(500).json({ 
      error: 'Error de verificación',
      message: 'Error interno del servidor'
    });
  }
}

// Middleware para verificar roles (extensible para futuras funcionalidades)
export async function withRole(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  requiredRoles: string[],
  next: () => void
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.email) {
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Debe iniciar sesión para acceder a este recurso'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario inválido',
        message: 'El usuario no existe en la base de datos'
      });
    }

    // Por ahora, todos los usuarios tienen el rol 'user'
    // En el futuro, esto se puede extender con un campo role en la base de datos
    const userRole = 'user'; // user.role || 'user'
    
    if (!requiredRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Permisos insuficientes',
        message: 'No tiene los permisos necesarios para acceder a este recurso'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (error) {
    console.error('Role middleware error:', error);
    return res.status(500).json({ 
      error: 'Error de verificación de roles',
      message: 'Error interno del servidor'
    });
  }
}

// Middleware para rate limiting básico
export function withRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  // TODO: Implement rate limiting logic
  // For now, just call next()
  next();
}

// Middleware combinado para APIs protegidas
export async function withApiProtection(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  options: {
    requireAuth?: boolean;
    requireOwnership?: {
      resourceType: 'invoice' | 'category';
      resourceId: string;
    };
    requireRoles?: string[];
    rateLimit?: {
      limit: number;
      windowMs: number;
    };
  } = {},
  next: () => void
) {
  const {
    requireAuth = true,
    requireOwnership,
    requireRoles,
    rateLimit
  } = options;

  try {
    // Rate limiting
    if (rateLimit) {
      withRateLimit(req, res, () => {});
    }

    // Autenticación
    if (requireAuth) {
      await withAuth(req, res, () => {});
    }

    // Verificación de propiedad
    if (requireOwnership) {
      await withOwnership(req, res, requireOwnership.resourceType, requireOwnership.resourceId, () => {});
    }

    // Verificación de roles
    if (requireRoles) {
      await withRole(req, res, requireRoles, () => {});
    }

    next();
  } catch (error) {
    console.error('API protection middleware error:', error);
    return res.status(500).json({ 
      error: 'Error de protección',
      message: 'Error interno del servidor'
    });
  }
}

// Función helper para obtener usuario autenticado
export async function getAuthenticatedUser(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true
    }
  });

  return user;
}

// Función helper para verificar si el usuario es propietario de un recurso
export async function isResourceOwner(
  userId: string,
  resourceType: 'invoice' | 'category',
  resourceId: string
): Promise<boolean> {
  try {
    let resource;
    
    if (resourceType === 'invoice') {
      resource = await prisma.invoice.findFirst({
        where: {
          id: resourceId,
          userId: userId
        }
      });
    } else if (resourceType === 'category') {
      resource = await prisma.category.findFirst({
        where: {
          id: resourceId,
          userId: userId
        }
      });
    }

    return !!resource;
  } catch (error) {
    console.error('Error checking resource ownership:', error);
    return false;
  }
} 