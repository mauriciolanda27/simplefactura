import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';
import { 
  validationSchemas, 
  validateAndSanitize, 
  sanitizeInvoiceData 
} from '../../../utils/validation';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Aplicar middleware de autenticación
  await withAuth(req as AuthenticatedRequest, res, async () => {
    const authenticatedReq = req as AuthenticatedRequest;
    const user = authenticatedReq.user!;

    switch(req.method) {
      case "GET":
        try {
          // Validar y sanitizar filtros de query
          const queryValidation = validateAndSanitize(
            validationSchemas.invoiceFilters,
            req.query
          );

          if (!queryValidation.success) {
            return res.status(400).json({
              error: "Filtros inválidos",
              details: queryValidation.errors
            });
          }

          const filters = queryValidation.data;
          
          // Construir filtros de Prisma
          const prismaFilters: Prisma.InvoiceWhereInput = {
            userId: user.id, // Solo facturas del usuario actual
          };
          
          if (filters.start) {
            prismaFilters.purchase_date = { gte: new Date(filters.start) };
          }
          if (filters.end) {
            if (prismaFilters.purchase_date && typeof prismaFilters.purchase_date === 'object' && 'gte' in prismaFilters.purchase_date) {
              (prismaFilters.purchase_date as Prisma.DateTimeFilter).lte = new Date(filters.end);
            } else {
              prismaFilters.purchase_date = { lte: new Date(filters.end) };
            }
          }
          if (filters.vendor) {
            prismaFilters.vendor = { contains: filters.vendor, mode: 'insensitive' as const };
          }
          if (filters.nit) {
            prismaFilters.nit = { contains: filters.nit, mode: 'insensitive' as const };
          }
          if (filters.categoryId) {
            prismaFilters.categoryId = filters.categoryId;
          }
          if (filters.minAmount) {
            prismaFilters.total_amount = { gte: parseFloat(filters.minAmount) };
          }
          if (filters.maxAmount) {
            if (prismaFilters.total_amount && typeof prismaFilters.total_amount === 'object' && 'gte' in prismaFilters.total_amount) {
              (prismaFilters.total_amount as Prisma.FloatFilter).lte = parseFloat(filters.maxAmount);
            } else {
              prismaFilters.total_amount = { lte: parseFloat(filters.maxAmount) };
            }
          }

          const invoices = await prisma.invoice.findMany({
            where: prismaFilters,
            include: {
              category: true,
            },
            orderBy: {
              purchase_date: 'desc',
            },
          });

          // Configurar headers para cache de SWR
          res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
          return res.status(200).json(invoices);
        } catch (e) {
          console.error('Error fetching invoices:', e);
          return res.status(500).json({ error: "Error al obtener facturas" });
        }

      case "POST":
        try {
          // Validar y sanitizar datos de entrada
          const validation = validateAndSanitize(
            validationSchemas.invoice,
            req.body
          );

          if (!validation.success) {
            return res.status(400).json({
              error: "Datos inválidos",
              details: validation.errors
            });
          }

          const invoiceData = validation.data;
          
          // Sanitizar datos adicionales
          const sanitizedData = sanitizeInvoiceData(invoiceData);
          
          // Verificar que la categoría pertenece al usuario
          console.log('Buscando categoría:', sanitizedData.categoryId, 'para usuario:', user.id);
          
          const category = await prisma.category.findFirst({
            where: {
              id: sanitizedData.categoryId,
              userId: user.id
            }
          });
          
          console.log('Categoría encontrada:', category);
          
          if (!category) {
            return res.status(400).json({ 
              error: "Categoría no válida",
              details: [`No se encontró la categoría con ID: ${sanitizedData.categoryId}`]
            });
          }
          
          // Crear factura
          const factura = await prisma.invoice.create({
            data: {
              authorization_code: sanitizedData.authorization_code,
              name: sanitizedData.name,
              nit: sanitizedData.nit,
              nit_ci_cex: sanitizedData.nit_ci_cex,
              number_receipt: sanitizedData.number_receipt,
              purchase_date: sanitizedData.purchase_date,
              total_amount: sanitizedData.total_amount,
              vendor: sanitizedData.vendor,
              rubro: sanitizedData.rubro,
              categoryId: sanitizedData.categoryId!,
              userId: user.id
            },
            include: {
              category: true,
            }
          });

          // Invalidar cache de SWR
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          return res.status(201).json(factura);
        } catch (e) {
          console.error('Error creating invoice:', e);
          return res.status(500).json({ error: "Error al registrar factura" });
        }

      default:
        res.setHeader("Allow", "GET, POST");
        return res.status(405).json({ error: "Método no permitido" });
    }
  });
}
