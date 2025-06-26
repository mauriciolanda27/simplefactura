# Documentación de la API - SimpleFactura

Documentación completa de la API REST para el sistema de gestión de facturas SimpleFactura.

## Información General

- **Base URL**: `http://localhost:3000/api`
- **Autenticación**: JWT mediante NextAuth.js
- **Formato de Respuesta**: JSON
- **Codificación**: UTF-8

## Autenticación

Todos los endpoints requieren autenticación excepto los de registro e inicio de sesión.

### Headers Requeridos
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Endpoints de Facturas

### Obtener Lista de Facturas
```http
GET /api/invoices
```

**Parámetros de Query:**
- `start` (opcional): Fecha de inicio (YYYY-MM-DD)
- `end` (opcional): Fecha de fin (YYYY-MM-DD)
- `vendor` (opcional): Filtro por proveedor
- `categoryId` (opcional): Filtro por categoría
- `minAmount` (opcional): Monto mínimo
- `maxAmount` (opcional): Monto máximo

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "clx1234567890",
    "authorization_code": "AUT-001-001-00000001",
    "name": "Empresa ABC",
    "nit": "1234567890",
    "nit_ci_cex": "1234567890",
    "number_receipt": "FAC-001-001-00000001",
    "purchase_date": "2024-01-15T00:00:00.000Z",
    "total_amount": 1500.00,
    "vendor": "Proveedor XYZ",
    "vendorId": "clx1234567891",
    "rubro": "Servicios",
    "categoryId": "clx1234567892",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "category": {
      "id": "clx1234567892",
      "name": "Servicios",
      "description": "Servicios profesionales"
    },
    "vendorRelation": {
      "id": "clx1234567891",
      "name": "Proveedor XYZ",
      "nit": "9876543210",
      "email": "contacto@proveedor.com",
      "phone": "591-4-1234567",
      "address": "Av. Principal 123"
    },
    "items": [
      {
        "id": "clx1234567893",
        "description": "Servicio de consultoría",
        "quantity": 1,
        "unit_price": 1500.00,
        "total": 1500.00,
        "tax_rate": 13.00,
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
]
```

### Crear Nueva Factura
```http
POST /api/invoices
```

**Cuerpo de la Petición:**
```json
{
  "authorization_code": "AUT-001-001-00000001",
  "name": "Empresa ABC",
  "nit": "1234567890",
  "nit_ci_cex": "1234567890",
  "number_receipt": "FAC-001-001-00000001",
  "purchase_date": "2024-01-15",
  "total_amount": "1500.00",
  "vendor": "Proveedor XYZ",
  "vendorId": "clx1234567891",
  "rubro": "Servicios",
  "categoryId": "clx1234567892",
  "items": [
    {
      "description": "Servicio de consultoría",
      "quantity": 1,
      "unit_price": 1500.00,
      "total": 1500.00,
      "tax_rate": 13.00
    }
  ]
}
```

**Respuesta Exitosa (201):**
```json
{
  "id": "clx1234567890",
  "authorization_code": "AUT-001-001-00000001",
  "name": "Empresa ABC",
  "nit": "1234567890",
  "nit_ci_cex": "1234567890",
  "number_receipt": "FAC-001-001-00000001",
  "purchase_date": "2024-01-15T00:00:00.000Z",
  "total_amount": 1500.00,
  "vendor": "Proveedor XYZ",
  "vendorId": "clx1234567891",
  "rubro": "Servicios",
  "categoryId": "clx1234567892",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "category": {
    "id": "clx1234567892",
    "name": "Servicios",
    "description": "Servicios profesionales"
  },
  "vendorRelation": {
    "id": "clx1234567891",
    "name": "Proveedor XYZ",
    "nit": "9876543210"
  },
  "items": [
    {
      "id": "clx1234567893",
      "description": "Servicio de consultoría",
      "quantity": 1,
      "unit_price": 1500.00,
      "total": 1500.00,
      "tax_rate": 13.00,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Obtener Factura Específica
```http
GET /api/invoices/{id}
```

**Respuesta Exitosa (200):**
```json
{
  "id": "clx1234567890",
  "authorization_code": "AUT-001-001-00000001",
  "name": "Empresa ABC",
  "nit": "1234567890",
  "nit_ci_cex": "1234567890",
  "number_receipt": "FAC-001-001-00000001",
  "purchase_date": "2024-01-15T00:00:00.000Z",
  "total_amount": 1500.00,
  "vendor": "Proveedor XYZ",
  "vendorId": "clx1234567891",
  "rubro": "Servicios",
  "categoryId": "clx1234567892",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "category": {
    "id": "clx1234567892",
    "name": "Servicios",
    "description": "Servicios profesionales"
  },
  "vendorRelation": {
    "id": "clx1234567891",
    "name": "Proveedor XYZ",
    "nit": "9876543210"
  },
  "items": [
    {
      "id": "clx1234567893",
      "description": "Servicio de consultoría",
      "quantity": 1,
      "unit_price": 1500.00,
      "total": 1500.00,
      "tax_rate": 13.00,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Actualizar Factura
```http
PUT /api/invoices/{id}
```

**Cuerpo de la Petición:** (mismo formato que crear)

**Respuesta Exitosa (200):**
```json
{
  "id": "clx1234567890",
  "authorization_code": "AUT-001-001-00000001",
  "name": "Empresa ABC Actualizada",
  "nit": "1234567890",
  "nit_ci_cex": "1234567890",
  "number_receipt": "FAC-001-001-00000001",
  "purchase_date": "2024-01-15T00:00:00.000Z",
  "total_amount": 2000.00,
  "vendor": "Proveedor XYZ",
  "vendorId": "clx1234567891",
  "rubro": "Servicios",
  "categoryId": "clx1234567892",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z",
  "category": {
    "id": "clx1234567892",
    "name": "Servicios",
    "description": "Servicios profesionales"
  },
  "vendorRelation": {
    "id": "clx1234567891",
    "name": "Proveedor XYZ",
    "nit": "9876543210"
  },
  "items": [
    {
      "id": "clx1234567893",
      "description": "Servicio de consultoría actualizado",
      "quantity": 2,
      "unit_price": 1000.00,
      "total": 2000.00,
      "tax_rate": 13.00,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Eliminar Factura
```http
DELETE /api/invoices/{id}
```

**Respuesta Exitosa (204):** Sin contenido

### Extracción OCR de Facturas
```http
POST /api/invoices/ocr
```

**Cuerpo de la Petición:**
```json
{
  "fileContent": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "fileName": "factura.jpg"
}
```

**Respuesta Exitosa (200):**
```json
{
  "authorization_code": "AUT-001-001-00000001",
  "name": "Empresa ABC",
  "nit": "1234567890",
  "nit_ci_cex": "1234567890",
  "number_receipt": "FAC-001-001-00000001",
  "purchase_date": "2024-01-15",
  "total_amount": "1500.00",
  "vendor": "Proveedor XYZ"
}
```

### Exportar Facturas
```http
GET /api/invoices/export
```

**Parámetros de Query:**
- `format` (opcional): `csv`, `xlsx`, `pdf` (default: `csv`)
- `start` (opcional): Fecha de inicio
- `end` (opcional): Fecha de fin
- `vendor` (opcional): Filtro por proveedor
- `categoryId` (opcional): Filtro por categoría

**Respuesta Exitosa (200):**
- Para CSV/XLSX: Archivo descargable
- Para PDF: Archivo PDF con reporte

## Endpoints de Proveedores

### Obtener Lista de Proveedores
```http
GET /api/vendors
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "clx1234567891",
    "name": "Proveedor XYZ",
    "nit": "9876543210",
    "email": "contacto@proveedor.com",
    "phone": "591-4-1234567",
    "address": "Av. Principal 123",
    "category": "Servicios",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### Crear Nuevo Proveedor
```http
POST /api/vendors
```

**Cuerpo de la Petición:**
```json
{
  "name": "Proveedor XYZ",
  "nit": "9876543210",
  "email": "contacto@proveedor.com",
  "phone": "591-4-1234567",
  "address": "Av. Principal 123"
}
```

**Respuesta Exitosa (201):**
```json
{
  "id": "clx1234567891",
  "name": "Proveedor XYZ",
  "nit": "9876543210",
  "email": "contacto@proveedor.com",
  "phone": "591-4-1234567",
  "address": "Av. Principal 123",
  "category": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### Obtener Proveedor Específico
```http
GET /api/vendors/{id}
```

**Respuesta Exitosa (200):**
```json
{
  "id": "clx1234567891",
  "name": "Proveedor XYZ",
  "nit": "9876543210",
  "email": "contacto@proveedor.com",
  "phone": "591-4-1234567",
  "address": "Av. Principal 123",
  "category": "Servicios",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### Actualizar Proveedor
```http
PUT /api/vendors/{id}
```

**Cuerpo de la Petición:**
```json
{
  "name": "Proveedor XYZ Actualizado",
  "nit": "9876543210",
  "email": "nuevo@proveedor.com",
  "phone": "591-4-7654321",
  "address": "Av. Secundaria 456"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": "clx1234567891",
  "name": "Proveedor XYZ Actualizado",
  "nit": "9876543210",
  "email": "nuevo@proveedor.com",
  "phone": "591-4-7654321",
  "address": "Av. Secundaria 456",
  "category": "Servicios",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z"
}
```

### Eliminar Proveedor
```http
DELETE /api/vendors/{id}
```

**Respuesta Exitosa (204):** Sin contenido

## Endpoints de Configuración de Usuario

### Obtener Configuración de Usuario
```http
GET /api/user-settings
```

**Respuesta Exitosa (200):**
```json
{
  "id": "clx1234567894",
  "userId": "clx1234567890",
  "theme": "light",
  "language": "es",
  "notifications": true,
  "export_format": "csv",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### Actualizar Configuración de Usuario
```http
PUT /api/user-settings
```

**Cuerpo de la Petición:**
```json
{
  "theme": "dark",
  "language": "en",
  "notifications": false,
  "export_format": "xlsx"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": "clx1234567894",
  "userId": "clx1234567890",
  "theme": "dark",
  "language": "en",
  "notifications": false,
  "export_format": "xlsx",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z"
}
```

## Endpoints de Categorías

### Obtener Lista de Categorías
```http
GET /api/categories
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "clx1234567892",
    "name": "Servicios",
    "description": "Servicios profesionales",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### Crear Nueva Categoría
```http
POST /api/categories
```

**Cuerpo de la Petición:**
```json
{
  "name": "Servicios",
  "description": "Servicios profesionales"
}
```

**Respuesta Exitosa (201):**
```json
{
  "id": "clx1234567892",
  "name": "Servicios",
  "description": "Servicios profesionales",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### Obtener Categoría Específica
```http
GET /api/categories/{id}
```

**Respuesta Exitosa (200):**
```json
{
  "id": "clx1234567892",
  "name": "Servicios",
  "description": "Servicios profesionales",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### Actualizar Categoría
```http
PUT /api/categories/{id}
```

**Cuerpo de la Petición:**
```json
{
  "name": "Servicios Profesionales",
  "description": "Servicios profesionales y consultoría"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": "clx1234567892",
  "name": "Servicios Profesionales",
  "description": "Servicios profesionales y consultoría",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z"
}
```

### Eliminar Categoría
```http
DELETE /api/categories/{id}
```

**Respuesta Exitosa (204):** Sin contenido

## Endpoints de Análisis y Estadísticas

### Obtener Predicciones y Análisis
```http
GET /api/analytics/predictions
```

**Respuesta Exitosa (200):**
```json
{
  "riskAssessment": {
    "score": 75,
    "level": "medio",
    "factors": ["Gastos variables altos", "Concentración de proveedores"]
  },
  "spendingTrends": {
    "monthlyAverage": 2500.00,
    "trend": "ascendente",
    "seasonality": "alta en diciembre"
  },
  "paymentPatterns": {
    "averagePaymentTime": 30,
    "onTimePayments": 85,
    "latePayments": 15
  },
  "predictions": {
    "nextMonthSpending": 2800.00,
    "confidence": 0.85,
    "recommendations": [
      "Diversificar proveedores",
      "Negociar mejores términos de pago"
    ]
  }
}
```

### Obtener Estadísticas Generales
```http
GET /api/stats
```

**Respuesta Exitosa (200):**
```json
{
  "totalInvoices": 150,
  "totalAmount": 45000.00,
  "averageAmount": 300.00,
  "monthlyGrowth": 12.5,
  "topCategories": [
    {
      "name": "Servicios",
      "count": 45,
      "amount": 13500.00
    }
  ],
  "topVendors": [
    {
      "name": "Proveedor XYZ",
      "count": 25,
      "amount": 7500.00
    }
  ]
}
```

## Endpoints de Autenticación

### Registro de Usuario
```http
POST /api/register
```

**Cuerpo de la Petición:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@empresa.com",
  "password": "password123"
}
```

**Respuesta Exitosa (201):**
```json
{
  "id": "clx1234567890",
  "name": "Juan Pérez",
  "email": "juan@empresa.com",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

### Iniciar Sesión
```http
POST /api/auth/signin
```

**Cuerpo de la Petición:**
```json
{
  "email": "juan@empresa.com",
  "password": "password123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "user": {
    "id": "clx1234567890",
    "name": "Juan Pérez",
    "email": "juan@empresa.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Cerrar Sesión
```http
POST /api/auth/signout
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

## Códigos de Error

### Errores Comunes

**400 Bad Request**
```json
{
  "error": "Datos inválidos",
  "details": ["El campo 'email' es requerido"]
}
```

**401 Unauthorized**
```json
{
  "error": "No autorizado"
}
```

**404 Not Found**
```json
{
  "error": "Recurso no encontrado"
}
```

**500 Internal Server Error**
```json
{
  "error": "Error interno del servidor"
}
```

## Notas Importantes

### Validaciones
- Todos los campos de fecha deben estar en formato ISO 8601
- Los montos deben ser números positivos
- Los NITs deben tener entre 7 y 11 dígitos
- Los emails deben tener formato válido

### Límites
- Máximo 1000 facturas por usuario
- Máximo 100 proveedores por usuario
- Máximo 50 categorías por usuario
- Tamaño máximo de archivo OCR: 10MB

### Paginación
Los endpoints que devuelven listas soportan paginación:
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 20, max: 100)

### Ordenamiento
Los endpoints de listas soportan ordenamiento:
- `sortBy`: Campo para ordenar
- `sortOrder`: `asc` o `desc` (default: `desc`)

---

**Documentación generada automáticamente - SimpleFactura v2.0** 