import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

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

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido' });
  }

  switch (req.method) {
    case 'GET':
      return getRubro(req, res, user.id, id);
    case 'PUT':
      return updateRubro(req, res, user.id, id);
    case 'DELETE':
      return deleteRubro(req, res, user.id, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}

async function getRubro(req: NextApiRequest, res: NextApiResponse, userId: string, id: string) {
  try {
    const rubro = await prisma.rubro.findFirst({ where: { id, userId } });
    if (!rubro) return res.status(404).json({ error: 'Rubro no encontrado' });
    return res.status(200).json(rubro);
  } catch (error) {
    console.error('Error al obtener rubro:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function updateRubro(req: NextApiRequest, res: NextApiResponse, userId: string, id: string) {
  try {
    const { name, description, type } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const rubro = await prisma.rubro.update({
      where: { id },
      data: {
        name,
        description: description || '',
        type: type || 'business',
      },
    });
    return res.status(200).json(rubro);
  } catch (error) {
    console.error('Error al actualizar rubro:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function deleteRubro(req: NextApiRequest, res: NextApiResponse, userId: string, id: string) {
  try {
    await prisma.rubro.delete({ where: { id } });
    return res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar rubro:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 