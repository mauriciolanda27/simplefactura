import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

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
      return getUserSettings(req, res, user.id);
    case 'PUT':
      return updateUserSettings(req, res, user.id);
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}

async function getUserSettings(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId }
    });
    return res.status(200).json(settings);
  } catch (error) {
    console.error('Error al obtener configuración de usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function updateUserSettings(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { theme, language, notifications, export_format } = req.body;
    const updated = await prisma.userSettings.upsert({
      where: { userId },
      update: { theme, language, notifications, export_format },
      create: { userId, theme, language, notifications, export_format }
    });
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error al actualizar configuración de usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 