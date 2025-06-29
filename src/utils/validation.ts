import { z } from 'zod';
import { NextApiRequest, NextApiResponse } from 'next';

// Esquemas de validación con Zod
export const validationSchemas = {
  // Esquema para facturas
  invoice: z.object({
    authorization_code: z.string().optional(),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
    nit: z.string().optional(),
    nit_ci_cex: z.string().optional(),
    number_receipt: z.string().min(1, 'El número de recibo es obligatorio'),
    purchase_date: z.string().refine((date: string) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed <= new Date();
    }, 'Fecha debe ser válida y no puede ser futura'),
    total_amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto debe ser un número válido').refine(
      (val: string) => parseFloat(val) > 0, 'Monto debe ser mayor a 0'
    ),
    vendor: z.string().min(2, 'El vendedor debe tener al menos 2 caracteres'),
    rubro: z.string().min(2, 'El rubro debe tener al menos 2 caracteres'),
    categoryId: z.string().min(1, 'ID de categoría es obligatorio')
  }),

  // Esquema para categorías
  category: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es muy largo'),
    description: z.string().max(500, 'La descripción es muy larga').optional()
  }),

  // Esquema para registro de usuario
  userRegistration: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es muy largo'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número')
  }),

  // Esquema para login
  userLogin: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es obligatoria')
  }),

  // Esquema para filtros de facturas
  invoiceFilters: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
    vendor: z.string().optional(),
    nit: z.string().optional(),
    categoryId: z.string().optional(),
    minAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto mínimo inválido').optional(),
    maxAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto máximo inválido').optional()
  })
};

// Función para sanitizar strings
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres peligrosos
    .replace(/\s+/g, ' ') // Normalizar espacios
    .substring(0, 1000); // Limitar longitud
}

// Función para sanitizar números
export function sanitizeNumber(input: string | number): number {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  return isNaN(num) ? 0 : Math.max(0, num);
}

// Función para sanitizar fecha
export function sanitizeDate(input: string): Date {
  const date = new Date(input);
  return isNaN(date.getTime()) ? new Date() : date;
}

// Función para validar y sanitizar datos
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err: z.ZodIssue) => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Error de validación desconocido'] };
  }
}

// Función para validar ID de UUID
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Función para validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para validar NIT
export function isValidNIT(nit: string): boolean {
  const trimmedNit = nit.trim();
  // NIT debe tener entre 7 y 11 dígitos y ser solo números
  const nitRegex = /^\d{7,11}$/;
  return nitRegex.test(trimmedNit);
}

// Función para validar monto
export function isValidAmount(amount: string): boolean {
  const amountRegex = /^\d+(\.\d{1,2})?$/;
  return amountRegex.test(amount) && parseFloat(amount) > 0;
}

// Tipos para datos de entrada
interface InvoiceInput {
  authorization_code?: string;
  name?: string;
  nit?: string;
  nit_ci_cex?: string;
  number_receipt?: string;
  purchase_date?: string;
  total_amount?: string | number;
  vendor?: string;
  rubro?: string;
  categoryId?: string;
}

interface CategoryInput {
  name?: string;
  description?: string;
}

interface UserInput {
  name?: string;
  email?: string;
  password?: string;
}

// Función para sanitizar datos de factura
export function sanitizeInvoiceData(data: InvoiceInput) {
  return {
    authorization_code: sanitizeString(data.authorization_code || ''),
    name: sanitizeString(data.name || ''),
    nit: sanitizeString(data.nit || ''),
    nit_ci_cex: sanitizeString(data.nit_ci_cex || ''),
    number_receipt: sanitizeString(data.number_receipt || ''),
    purchase_date: sanitizeDate(data.purchase_date || ''),
    total_amount: sanitizeNumber(data.total_amount || 0),
    vendor: sanitizeString(data.vendor || ''),
    rubro: sanitizeString(data.rubro || ''),
    categoryId: data.categoryId
  };
}

// Función para sanitizar datos de categoría
export function sanitizeCategoryData(data: CategoryInput) {
  return {
    name: sanitizeString(data.name || ''),
    description: sanitizeString(data.description || '')
  };
}

// Función para sanitizar datos de usuario
export function sanitizeUserData(data: UserInput) {
  return {
    name: sanitizeString(data.name || ''),
    email: data.email?.toLowerCase().trim() || '',
    password: data.password || ''
  };
}

// Extender NextApiRequest para incluir validatedData
interface ValidatedRequest extends NextApiRequest {
  validatedData?: unknown;
}

// Middleware de validación para APIs
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: ValidatedRequest, res: NextApiResponse, next: () => void) => {
    const result = validateAndSanitize(schema, req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: result.errors
      });
    }
    
    req.validatedData = result.data;
    next();
  };
}

// Función para generar mensajes de error personalizados
export function generateErrorMessage(field: string, error: string): string {
  const fieldNames: Record<string, string> = {
    authorization_code: 'Código de autorización',
    name: 'Nombre',
    nit: 'NIT',
    nit_ci_cex: 'NIT/CI/CEX',
    number_receipt: 'Número de recibo',
    purchase_date: 'Fecha de compra',
    total_amount: 'Monto total',
    vendor: 'Vendedor',
    rubro: 'Rubro',
    categoryId: 'Categoría',
    email: 'Correo electrónico',
    password: 'Contraseña'
  };
  
  const fieldName = fieldNames[field] || field;
  return `${fieldName}: ${error}`;
} 