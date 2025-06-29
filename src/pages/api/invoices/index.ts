import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { logInvoiceAction, LOG_ACTIONS } from '../../../utils/logging';

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
      return getInvoices(req, res, user.id);
    case 'POST':
      return createInvoice(req, res, user.id);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}

async function getInvoices(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: {
        category: true,
        rubro: true
      },
      orderBy: { purchase_date: 'desc' }
    });

    return res.status(200).json(invoices);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function createInvoice(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const {
      authorization_code,
      name,
      nit,
      nit_ci_cex,
      number_receipt,
      purchase_date,
      total_amount,
      vendor,
      rubroId,
      categoryId
    } = req.body;

    if (!authorization_code || !name || !nit || !number_receipt || !purchase_date || !total_amount || !categoryId || !rubroId) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        authorization_code,
        name,
        nit,
        nit_ci_cex,
        number_receipt,
        purchase_date: new Date(purchase_date),
        total_amount: parseFloat(total_amount),
        vendor,
        rubroId,
        categoryId,
        userId
      },
      include: {
        category: true,
        rubro: true
      }
    });

    // Log the action
    await logInvoiceAction(
      userId,
      LOG_ACTIONS.CREATE_INVOICE,
      invoice.id,
      {
        invoiceNumber: number_receipt,
        vendor,
        totalAmount: total_amount,
        categoryId,
        rubroId
      }
    );

    return res.status(201).json(invoice);
  } catch (error) {
    console.error('Error al crear factura:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
