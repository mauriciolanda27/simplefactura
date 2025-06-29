import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from '@prisma/client';
import { logInvoiceAction, LOG_ACTIONS } from '../../../utils/logging';

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
    return res.status(400).json({ error: "ID de factura requerido" });
  }

  switch (req.method) {
    case "GET":
      try {
        const invoice = await prisma.invoice.findFirst({
          where: {
            id: id,
            userId: user.id // Solo facturas del usuario actual
          },
          include: {
            category: true, // Incluir datos de la categoría
            rubro: true
          }
        });
        
        if (!invoice) {
          return res.status(404).json({ error: "Factura no encontrada" });
        }
        
        return res.status(200).json(invoice);
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al obtener factura" });
      }
      
    case "PUT":
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
        
        // Validaciones básicas
        if (!purchase_date || !vendor || total_amount == null || !rubroId || !categoryId) {
          return res.status(400).json({ error: "Fecha, vendedor, monto, rubro y categoría son obligatorios" });
        }
        
        // Verificar que la factura pertenece al usuario
        const existingInvoice = await prisma.invoice.findFirst({
          where: {
            id: id,
            userId: user.id
          }
        });
        
        if (!existingInvoice) {
          return res.status(404).json({ error: "Factura no encontrada" });
        }
        
        // Verificar que la categoría pertenece al usuario
        const category = await prisma.category.findFirst({
          where: {
            id: categoryId,
            userId: user.id
          }
        });
        
        if (!category) {
          return res.status(400).json({ error: "Categoría no válida" });
        }
        
        // Actualizar factura
        const updatedInvoice = await prisma.invoice.update({
          where: { id: id },
          data: {
            authorization_code: authorization_code || "",
            name: name || "",
            nit: nit || "",
            nit_ci_cex: nit_ci_cex || "",
            number_receipt: number_receipt || "",
            purchase_date: new Date(purchase_date),
            total_amount: Number(total_amount),
            vendor: vendor,
            rubroId: rubroId,
            categoryId: categoryId
          },
          include: {
            category: true, // Incluir datos de la categoría
            rubro: true
          }
        });

        // Log the action
        await logInvoiceAction(
          user.id,
          LOG_ACTIONS.UPDATE_INVOICE,
          updatedInvoice.id,
          {
            invoiceNumber: number_receipt,
            vendor,
            totalAmount: total_amount,
            categoryId,
            rubroId,
            previousAmount: existingInvoice.total_amount
          }
        );
        
        return res.status(200).json(updatedInvoice);
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al actualizar factura" });
      }
      
    case "DELETE":
      try {
        // Verificar que la factura pertenece al usuario
        const invoice = await prisma.invoice.findFirst({
          where: {
            id: id,
            userId: user.id
          }
        });
        
        if (!invoice) {
          return res.status(404).json({ error: "Factura no encontrada" });
        }

        // Log the action before deletion
        await logInvoiceAction(
          user.id,
          LOG_ACTIONS.DELETE_INVOICE,
          invoice.id,
          {
            invoiceNumber: invoice.number_receipt,
            vendor: invoice.vendor,
            totalAmount: invoice.total_amount,
            categoryId: invoice.categoryId,
            rubroId: invoice.rubroId
          }
        );
        
        await prisma.invoice.delete({
          where: { id: id }
        });
        
        return res.status(200).json({ message: "Factura eliminada correctamente" });
      } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Error al eliminar factura" });
      }
      
    default:
      res.setHeader("Allow", "GET, PUT, DELETE");
      return res.status(405).json({ error: "Método no permitido" });
  }
}

