// pages/api/register.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Validate input
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validationResult.error.errors 
      });
    }

    const { name, email, password } = validationResult.data;
    const sanitizedData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    };

    // Check if email already exists
    const exists = await prisma.user.findUnique({
      where: { email: sanitizedData.email }
    });

    if (exists) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await hash(sanitizedData.password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: sanitizedData.name,
        email: sanitizedData.email,
        password_hash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      }
    });

    console.log('[REGISTER] User created successfully:', user.email);

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('[REGISTER] Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    await prisma.$disconnect();
  }
}
