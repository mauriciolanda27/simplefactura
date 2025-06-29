import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { logRubroAction, LOG_ACTIONS } from '../../../utils/logging';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }

  switch (req.method) {
    case 'GET':
      return getRubros(req, res, user.id);
    case 'POST':
      return createRubro(req, res, user.id);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}

async function getRubros(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const rubros = await prisma.rubro.findMany({
      where: { userId },
      orderBy: { created_at: 'asc' },
    });

    return res.status(200).json(rubros);
  } catch (error) {
    console.error('Error al obtener rubros:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function createRubro(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { name, description, type } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const rubro = await prisma.rubro.create({
      data: {
        name,
        description: description || '',
        type: type || 'business',
        userId,
      },
    });

    // Log the action
    await logRubroAction(
      userId,
      LOG_ACTIONS.CREATE_RUBRO,
      rubro.id,
      {
        name: rubro.name,
        description: rubro.description,
        type: rubro.type
      }
    );

    return res.status(201).json(rubro);
  } catch (error) {
    console.error('Error al crear rubro:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 