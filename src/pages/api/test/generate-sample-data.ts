import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from '@prisma/client';
import { generateSampleInvoices, generateSampleCategories } from '../../../utils/sampleData';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "No autenticado" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const userEmail = session.user?.email;
    if (!userEmail) {
      return res.status(400).json({ error: "Email de usuario no disponible" });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return res.status(500).json({ error: "Usuario inválido" });
    }

    // Check if user already has data
    const existingInvoices = await prisma.invoice.count({ where: { userId: user.id } });
    const existingCategories = await prisma.category.count({ where: { userId: user.id } });

    if (existingInvoices > 0 || existingCategories > 0) {
      return res.status(400).json({ 
        error: "El usuario ya tiene datos. Solo se puede generar datos de muestra para usuarios nuevos." 
      });
    }

    // Generate sample categories first
    const sampleCategories = generateSampleCategories(user.id);
    const createdCategories = await Promise.all(
      sampleCategories.map(category => prisma.category.create({ data: category }))
    );

    // Generate sample rubros
    const sampleRubros = generateSampleRubros(user.id);
    const createdRubros = await Promise.all(
      sampleRubros.map(rubro => prisma.rubro.create({ data: rubro }))
    );

    // Generate sample invoices
    const sampleInvoices = generateSampleInvoices(createdCategories, createdRubros, user.id);
    const createdInvoices = await Promise.all(
      sampleInvoices.map(invoice => prisma.invoice.create({ data: invoice }))
    );

    return res.status(200).json({
      message: "Datos de muestra generados exitosamente",
      categoriesCreated: createdCategories.length,
      rubrosCreated: createdRubros.length,
      invoicesCreated: createdInvoices.length,
      totalAmount: createdInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.total_amount)), 0)
    });

  } catch (error) {
    console.error('Error generating sample data:', error);
    return res.status(500).json({ error: "Error al generar datos de muestra" });
  }
}

function generateSampleRubros(userId: string) {
  return [
    { name: 'Servicios', description: 'Servicios generales', type: 'business', userId },
    { name: 'Materiales', description: 'Materiales y suministros', type: 'business', userId },
    { name: 'Tecnología', description: 'Equipos y software', type: 'business', userId },
    { name: 'Logística', description: 'Gastos de logística', type: 'business', userId },
    { name: 'Consultoría', description: 'Servicios de consultoría', type: 'business', userId },
    { name: 'Mantenimiento', description: 'Mantenimiento y reparación', type: 'business', userId },
    { name: 'Suministros', description: 'Suministros varios', type: 'business', userId },
    { name: 'Equipos', description: 'Equipos y maquinaria', type: 'business', userId },
    { name: 'Transporte', description: 'Gastos de transporte', type: 'business', userId },
    { name: 'Capacitación', description: 'Capacitación y formación', type: 'personal', userId },
  ];
} 