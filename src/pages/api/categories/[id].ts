import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from '@prisma/client';
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

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: "ID de categoría requerido" });
  }

  switch (req.method) {
    case "GET":
      try {
        const category = await prisma.category.findFirst({
          where: {
            id: id,
            userId: user.id // Solo categorías del usuario actual
          }
        });
        
        if (!category) {
          return res.status(404).json({ error: "Categoría no encontrada" });
        }
        
        return res.status(200).json(category);
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al obtener categoría" });
      }
      
    case "PUT":
      try {
        const { name, description } = req.body;
        
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          return res.status(400).json({ error: "Nombre de categoría es obligatorio" });
        }
        
        // Verificar que la categoría pertenece al usuario
        const existingCategory = await prisma.category.findFirst({
          where: {
            id: id,
            userId: user.id
          }
        });
        
        if (!existingCategory) {
          return res.status(404).json({ error: "Categoría no encontrada" });
        }
        
        // Verificar que no existe otra categoría con el mismo nombre para este usuario
        const duplicateCategory = await prisma.category.findFirst({
          where: {
            name: name.trim(),
            userId: user.id,
            id: { not: id } // Excluir la categoría actual
          }
        });
        
        if (duplicateCategory) {
          return res.status(400).json({ error: "Ya existe una categoría con ese nombre" });
        }
        
        // Actualizar categoría
        const updatedCategory = await prisma.category.update({
          where: { id: id },
          data: {
            name: name.trim(),
            description: description?.trim() || null
          }
        });
        
        return res.status(200).json(updatedCategory);
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al actualizar categoría" });
      }
      
    case "DELETE":
      try {
        // Verificar que la categoría pertenece al usuario
        const category = await prisma.category.findFirst({
          where: {
            id: id,
            userId: user.id
          },
          include: {
            _count: {
              select: { invoices: true }
            }
          }
        });
        
        if (!category) {
          return res.status(404).json({ error: "Categoría no encontrada" });
        }
        
        // Verificar si hay facturas usando esta categoría
        if (category._count.invoices > 0) {
          return res.status(400).json({ 
            error: `No se puede eliminar la categoría porque tiene ${category._count.invoices} factura(s) asociada(s)` 
          });
        }
        
        await prisma.category.delete({
          where: { id: id }
        });
        
        return res.status(200).json({ message: "Categoría eliminada correctamente" });
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al eliminar categoría" });
      }
      
    default:
      res.setHeader("Allow", "GET, PUT, DELETE");
      return res.status(405).json({ error: "Método no permitido" });
  }
}
