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
- `rubroId` (opcional): Filtro por rubro
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
    "categoryId": "clx1234567892",
    "rubroId": "clx1234567893",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "category": {
      "id": "clx1234567892",
      "name": "Servicios",
      "description": "Servicios profesionales"
    },
    "rubro": {
      "id": "clx1234567893",
      "name": "Gastos Operativos",
      "description": "Gastos relacionados con operaciones",
      "type": "business"
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
        "id": "clx1234567894",
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
  "categoryId": "clx1234567892",
  "rubroId": "clx1234567893",
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
  "categoryId": "clx1234567892",
  "rubroId": "clx1234567893",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "category": {
    "id": "clx1234567892",
    "name": "Servicios",
    "description": "Servicios profesionales"
  },
  "rubro": {
    "id": "clx1234567893",
    "name": "Gastos Operativos",
    "description": "Gastos relacionados con operaciones",
    "type": "business"
  },
  "vendorRelation": {
    "id": "clx1234567891",
    "name": "Proveedor XYZ",
    "nit": "9876543210"
  },
  "items": [
    {
      "id": "clx1234567894",
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
  "categoryId": "clx1234567892",
  "rubroId": "clx1234567893",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "category": {
    "id": "clx1234567892",
    "name": "Servicios",
    "description": "Servicios profesionales"
  },
  "rubro": {
    "id": "clx1234567893",
    "name": "Gastos Operativos",
    "description": "Gastos relacionados con operaciones",
    "type": "business"
  },
  "vendorRelation": {
    "id": "clx1234567891",
    "name": "Proveedor XYZ",
    "nit": "9876543210"
  },
  "items": [
    {
      "id": "clx1234567894",
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

**Cuerpo de la Petición:**
```json
{
  "authorization_code": "AUT-001-001-00000001",
  "name": "Empresa ABC Actualizada",
  "nit": "1234567890",
  "nit_ci_cex": "1234567890",
  "number_receipt": "FAC-001-001-00000001",
  "purchase_date": "2024-01-15",
  "total_amount": "1600.00",
  "vendor": "Proveedor XYZ",
  "vendorId": "clx1234567891",
  "categoryId": "clx1234567892",
  "rubroId": "clx1234567893"
}
```

### Eliminar Factura
```http
DELETE /api/invoices/{id}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Factura eliminada exitosamente"
}
```

### Extracción OCR de Facturas
```http
POST /api/invoices/ocr
```

**Cuerpo de la Petición (multipart/form-data):**
```
file: [archivo de imagen o PDF]
```

**Respuesta Exitosa (200):**
```json
{
  "extracted_data": {
    "authorization_code": "AUT-001-001-00000001",
    "name": "Empresa ABC",
    "nit": "1234567890",
    "number_receipt": "FAC-001-001-00000001",
    "purchase_date": "2024-01-15",
    "total_amount": "1500.00",
    "vendor": "Proveedor XYZ"
  },
  "confidence": 0.95
}
```

### Exportar Facturas
```http
GET /api/invoices/export
```

**Parámetros de Query:**
- `start` (obligatorio): Fecha de inicio (YYYY-MM-DD)
- `end` (obligatorio): Fecha de fin (YYYY-MM-DD)
- `format` (opcional): Formato de exportación (csv, pdf)
- `vendor` (opcional): Filtro por proveedor
- `categoryId` (opcional): Filtro por categoría
- `rubroId` (opcional): Filtro por rubro

**Respuesta Exitosa (200):**
- Archivo CSV o PDF según el formato especificado

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

### Obtener Categoría Específica
```http
GET /api/categories/{id}
```

### Actualizar Categoría
```http
PUT /api/categories/{id}
```

### Eliminar Categoría
```http
DELETE /api/categories/{id}
```

## Endpoints de Rubros

### Obtener Lista de Rubros
```http
GET /api/rubros
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "clx1234567893",
    "name": "Gastos Operativos",
    "description": "Gastos relacionados con operaciones",
    "type": "business",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### Crear Nuevo Rubro
```http
POST /api/rubros
```

**Cuerpo de la Petición:**
```json
{
  "name": "Gastos Operativos",
  "description": "Gastos relacionados con operaciones",
  "type": "business"
}
```

**Tipos de Rubro:**
- `business`: Rubros empresariales
- `personal`: Rubros personales

### Obtener Rubro Específico
```http
GET /api/rubros/{id}
```

### Actualizar Rubro
```http
PUT /api/rubros/{id}
```

### Eliminar Rubro
```http
DELETE /api/rubros/{id}
```

## Endpoints de Registro de Actividad (Logs)

### Obtener Registro de Actividad
```http
GET /api/logs
```

**Parámetros de Query:**
- `start` (opcional): Fecha de inicio (YYYY-MM-DD)
- `end` (opcional): Fecha de fin (YYYY-MM-DD)
- `action` (opcional): Filtro por tipo de acción
- `entity_type` (opcional): Filtro por tipo de entidad
- `limit` (opcional): Límite de registros (default: 50)

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "clx1234567895",
    "userId": "clx1234567896",
    "action": "CREATE_INVOICE",
    "entity_type": "Invoice",
    "entity_id": "clx1234567890",
    "details": {
      "invoice_number": "FAC-001-001-00000001",
      "amount": 1500.00,
      "vendor": "Proveedor XYZ"
    },
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

**Tipos de Acciones Registradas:**
- `CREATE_INVOICE`: Creación de facturas
- `UPDATE_INVOICE`: Actualización de facturas
- `DELETE_INVOICE`: Eliminación de facturas
- `CREATE_CATEGORY`: Creación de categorías
- `UPDATE_CATEGORY`: Actualización de categorías
- `DELETE_CATEGORY`: Eliminación de categorías
- `CREATE_RUBRO`: Creación de rubros
- `UPDATE_RUBRO`: Actualización de rubros
- `DELETE_RUBRO`: Eliminación de rubros
- `EXPORT_PDF`: Exportación de PDF
- `EXPORT_CSV`: Exportación de CSV
- `LOGIN`: Inicio de sesión
- `LOGOUT`: Cierre de sesión

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

### Obtener Proveedor Específico
```http
GET /api/vendors/{id}
```

### Actualizar Proveedor
```http
PUT /api/vendors/{id}
```

### Eliminar Proveedor
```http
DELETE /api/vendors/{id}
```

## Endpoints de Estadísticas

### Obtener Estadísticas Generales
```http
GET /api/stats
```

**Respuesta Exitosa (200):**
```json
{
  "total_invoices": 150,
  "total_amount": 75000.00,
  "average_amount": 500.00,
  "total_iva": 9750.00,
  "top_categories": [
    {
      "name": "Servicios",
      "count": 45,
      "total": 22500.00
    }
  ],
  "top_rubros": [
    {
      "name": "Gastos Operativos",
      "count": 60,
      "total": 30000.00
    }
  ],
  "top_vendors": [
    {
      "name": "Proveedor XYZ",
      "count": 25,
      "total": 12500.00
    }
  ],
  "monthly_trends": [
    {
      "month": "2024-01",
      "total": 15000.00,
      "count": 30
    }
  ]
}
```

## Endpoints de Reportes

### Generar Reporte
```http
POST /api/reports
```

**Cuerpo de la Petición:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "format": "pdf",
  "filters": {
    "categoryId": "clx1234567892",
    "rubroId": "clx1234567893",
    "vendor": "Proveedor XYZ"
  }
}
```

### Exportar Reporte
```http
GET /api/reports/export
```

**Parámetros de Query:**
- `start_date` (obligatorio): Fecha de inicio
- `end_date` (obligatorio): Fecha de fin
- `format` (opcional): Formato (csv, pdf)
- `categoryId` (opcional): Filtro por categoría
- `rubroId` (opcional): Filtro por rubro
- `vendor` (opcional): Filtro por proveedor

## Endpoints de Análisis

### Obtener Predicciones
```http
GET /api/analytics/predictions
```

**Respuesta Exitosa (200):**
```json
{
  "cash_flow_prediction": {
    "next_month": 8500.00,
    "next_quarter": 25000.00,
    "confidence": 0.85
  },
  "spending_patterns": {
    "seasonal_trends": [
      {
        "month": "Enero",
        "expected_amount": 8000.00
      }
    ],
    "category_insights": [
      {
        "category": "Servicios",
        "trend": "increasing",
        "recommendation": "Considerar negociar mejores precios"
      }
    ]
  }
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
  "name": "Usuario Ejemplo",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

### Iniciar Sesión
```http
POST /api/auth/signin
```

**Cuerpo de la Petición:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

### Cerrar Sesión
```http
POST /api/auth/signout
```

## Códigos de Error

### Errores Comunes

**400 - Bad Request**
```json
{
  "error": "Datos de entrada inválidos",
  "details": ["El campo 'name' es requerido"]
}
```

**401 - Unauthorized**
```json
{
  "error": "No autorizado",
  "message": "Token de autenticación inválido o expirado"
}
```

**403 - Forbidden**
```json
{
  "error": "Acceso denegado",
  "message": "No tienes permisos para realizar esta acción"
}
```

**404 - Not Found**
```json
{
  "error": "Recurso no encontrado",
  "message": "La factura con ID especificado no existe"
}
```

**409 - Conflict**
```json
{
  "error": "Conflicto",
  "message": "Ya existe una categoría con ese nombre"
}
```

**500 - Internal Server Error**
```json
{
  "error": "Error interno del servidor",
  "message": "Ocurrió un error inesperado"
}
```

## Límites y Restricciones

- **Tamaño máximo de archivo**: 10MB para OCR
- **Formatos soportados**: JPG, PNG, PDF para OCR
- **Límite de registros**: 1000 por página en listados
- **Rate limiting**: 100 requests por minuto por usuario
- **Tamaño máximo de exportación**: 50,000 registros

## Ejemplos de Uso

### Crear Factura Completa
```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "authorization_code": "AUT-001-001-00000001",
    "name": "Empresa ABC",
    "nit": "1234567890",
    "nit_ci_cex": "1234567890",
    "number_receipt": "FAC-001-001-00000001",
    "purchase_date": "2024-01-15",
    "total_amount": "1500.00",
    "vendor": "Proveedor XYZ",
    "categoryId": "clx1234567892",
    "rubroId": "clx1234567893",
    "items": [
      {
        "description": "Servicio de consultoría",
        "quantity": 1,
        "unit_price": 1500.00,
        "total": 1500.00,
        "tax_rate": 13.00
      }
    ]
  }'
```

### Exportar Facturas
```bash
curl -X GET "http://localhost:3000/api/invoices/export?start=2024-01-01&end=2024-01-31&format=csv" \
  -H "Authorization: Bearer <token>" \
  --output facturas.csv
```

### Obtener Logs de Actividad
```bash
curl -X GET "http://localhost:3000/api/logs?start=2024-01-01&end=2024-01-31&action=CREATE_INVOICE" \
  -H "Authorization: Bearer <token>"
```

## Notas Importantes

- Todos los endpoints requieren autenticación excepto `/api/register`
- Las fechas deben enviarse en formato ISO 8601 (YYYY-MM-DD)
- Los montos se manejan como números decimales
- El IVA se calcula automáticamente al 13%
- Los logs se generan automáticamente para todas las acciones
- Los rubros permiten una clasificación contable más específica que las categorías 