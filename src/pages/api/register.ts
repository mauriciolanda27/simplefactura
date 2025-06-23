// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { 
  validationSchemas, 
  validateAndSanitize, 
  sanitizeUserData 
} from '../../utils/validation';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // Validar y sanitizar datos de entrada
    const validation = validateAndSanitize(
      validationSchemas.userRegistration,
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: validation.errors
      });
    }

    const userData = validation.data;
    
    // Sanitizar datos adicionales
    const sanitizedData = sanitizeUserData(userData);
    
    // Verificar si el email ya está en uso
    const exists = await prisma.user.findUnique({ 
      where: { email: sanitizedData.email } 
    });
    
    if (exists) {
      return res.status(400).json({ 
        error: "Ya existe una cuenta con este correo",
        details: ["El correo electrónico ya está registrado"]
      });
    }
    
    // Hashear la contraseña con salt rounds aumentados para mayor seguridad
    const passwordHash = await hash(sanitizedData.password, 12);
    
    // Crear el nuevo usuario
    const user = await prisma.user.create({
      data: { 
        name: sanitizedData.name, 
        email: sanitizedData.email, 
        password_hash: passwordHash 
      },
      select: {
        id: true,
        name: true,
        email: true,
        // No incluir password_hash por seguridad
      }
    });
    
    // Configurar headers para cache
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return res.status(201).json({ 
      message: "Usuario registrado exitosamente", 
      userId: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error: unknown) {
    console.error("[REGISTER] Error:", error);
    
    // Manejar errores específicos de Prisma
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return res.status(400).json({ 
        error: "Ya existe una cuenta con este correo",
        details: ["El correo electrónico ya está registrado"]
      });
    }
    
    return res.status(500).json({ 
      error: "Error de servidor al registrar usuario",
      details: ["Error interno del servidor. Por favor, inténtelo de nuevo."]
    });
  }
}
