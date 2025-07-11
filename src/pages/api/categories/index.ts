import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from '@prisma/client';
import { logCategoryAction, LOG_ACTIONS } from '../../../utils/logging';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "No autenticado" });
  }
  
  const userEmail = session.user.email;
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    return res.status(500).json({ error: "Usuario inválido" });
  }

  switch(req.method) {
    case "GET":
      try {
        console.log('Buscando categorías para usuario:', user.id);
        
        const categories = await prisma.category.findMany({
          where: {
            userId: user.id
          },
          include: {
            _count: {
              select: {
                invoices: true
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        });
        
        console.log('Categorías encontradas:', categories.map((c: { id: string; name: string; _count: { invoices: number } }) => ({ id: c.id, name: c.name, invoiceCount: c._count.invoices })));
        
        return res.status(200).json(categories);
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al obtener categorías" });
      }
      
    case "POST":
      try {
        const { name, description } = req.body;
        
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          return res.status(400).json({ error: "Nombre de categoría es obligatorio" });
        }
        
        // Verificar que no existe una categoría con el mismo nombre para este usuario
        const existingCategory = await prisma.category.findFirst({
          where: {
            name: name.trim(),
            userId: user.id
          }
        });
        
        if (existingCategory) {
          return res.status(400).json({ error: "Ya existe una categoría con ese nombre" });
        }
        
        const category = await prisma.category.create({
          data: {
            name: name.trim(),
            description: description?.trim() || null,
            userId: user.id
          }
        });

        // Log the action
        await logCategoryAction(
          user.id,
          LOG_ACTIONS.CREATE_CATEGORY,
          category.id,
          {
            name: category.name,
            description: category.description
          }
        );
        
        return res.status(201).json(category);
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al crear categoría" });
      }
      
    default:
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ error: "Método no permitido" });
  }
}
