import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample vendors for realistic data
const VENDORS = [
  'COTEL',
  'SAGUAPAC',
  'ELECTROPAZ',
  'ENTEL',
  'TIGO',
  'VIVA',
  'Supermercado IC Norte',
  'Ketal',
  'Hipermaxi',
  'Farmacorp',
  'Librería La Paz',
  'Restaurante El Fogón',
  'Café Express',
  'Ferretería Central',
  'Papelería Moderna'
];

// Sample descriptions
const DESCRIPTIONS = [
  'Servicio mensual',
  'Compra de materiales',
  'Suministros de oficina',
  'Productos varios',
  'Servicios profesionales',
  'Mantenimiento',
  'Productos alimenticios',
  'Artículos de limpieza',
  'Equipamiento',
  'Servicios básicos'
];

// Generate a random NIT
function generateNIT(): string {
  const nit = Math.floor(Math.random() * 9000000000) + 1000000000;
  return nit.toString();
}

// Generate a random authorization code
function generateAuthCode(): string {
  const code = Math.floor(Math.random() * 9000000000000000) + 1000000000000000;
  return code.toString();
}

// Generate a random receipt number
function generateReceiptNumber(): number {
  return Math.floor(Math.random() * 90000) + 10000;
}

// Generate random amount between min and max
function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Generate a date within the last N days
function generateDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  // Randomize the time slightly
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Get existing categories and rubros
    const [categories, rubros] = await Promise.all([
      prisma.category.findMany({ where: { userId: user.id } }),
      prisma.rubro.findMany({ where: { userId: user.id } })
    ]);

    if (categories.length === 0 || rubros.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Necesitas tener al menos una categoría y un rubro antes de generar datos de prueba.',
        error: 'No se encontraron categorías o rubros'
      });
    }

    // Generate invoices distributed across different dates
    const invoicesToCreate = [];
    const datesUsed = new Set<string>();
    let totalAmount = 0;

    // Generate 25-30 invoices across 10-15 different dates over the last 90 days
    const numberOfInvoices = Math.floor(Math.random() * 6) + 25; // 25-30
    const numberOfDates = Math.floor(Math.random() * 6) + 10; // 10-15

    // Generate specific dates
    const specificDates: Date[] = [];
    for (let i = 0; i < numberOfDates; i++) {
      // Distribute dates across 90 days
      const daysAgo = Math.floor((90 / numberOfDates) * i) + Math.floor(Math.random() * 5);
      specificDates.push(generateDate(daysAgo));
    }

    // Create invoices
    for (let i = 0; i < numberOfInvoices; i++) {
      // Pick a random date from our specific dates
      const purchaseDate = specificDates[Math.floor(Math.random() * specificDates.length)];
      const dateStr = purchaseDate.toISOString().split('T')[0];
      datesUsed.add(dateStr);

      const vendor = VENDORS[Math.floor(Math.random() * VENDORS.length)];
      const description = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const rubro = rubros[Math.floor(Math.random() * rubros.length)];
      const amount = randomAmount(50, 5000);
      totalAmount += amount;

      invoicesToCreate.push({
        authorization_code: generateAuthCode(),
        name: vendor,
        nit: generateNIT(),
        nit_ci_cex: generateNIT(),
        number_receipt: generateReceiptNumber().toString(),
        purchase_date: purchaseDate,
        total_amount: amount,
        vendor: vendor,
        categoryId: category.id,
        rubroId: rubro.id,
        userId: user.id
      });
    }

    // Create all invoices
    await prisma.invoice.createMany({
      data: invoicesToCreate
    });

    // Get date range
    const dates = Array.from(datesUsed).sort();
    const fromDate = dates[0];
    const toDate = dates[dates.length - 1];

    return res.status(200).json({
      success: true,
      message: `Se generaron ${numberOfInvoices} facturas en ${datesUsed.size} fechas diferentes`,
      data: {
        invoicesCreated: numberOfInvoices,
        datesUsed: datesUsed.size,
        dateRange: {
          from: fromDate,
          to: toDate
        },
        categoriesUsed: categories.length,
        rubrosUsed: rubros.length,
        totalAmount: Math.round(totalAmount * 100) / 100
      }
    });

  } catch (error) {
    console.error('Error generating predictive data:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al generar datos de prueba',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    await prisma.$disconnect();
  }
}

