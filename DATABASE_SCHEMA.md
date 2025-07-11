# Esquema de Base de Datos - SimpleFactura

Documentación completa del esquema de base de datos del sistema de gestión de facturas SimpleFactura.

## Información General

### Descripción
Este documento describe la estructura completa de la base de datos PostgreSQL utilizada en SimpleFactura, incluyendo todas las tablas, relaciones, índices y configuraciones de seguridad.

### Tecnologías Utilizadas
- **Base de Datos**: PostgreSQL 15+
- **ORM**: Prisma
- **Migraciones**: Prisma Migrate
- **Validaciones**: Prisma Schema

### Características
- **Escalabilidad**: Diseño optimizado para crecimiento
- **Seguridad**: Validaciones y constraints robustos
- **Performance**: Índices optimizados
- **Integridad**: Relaciones y foreign keys

## Estructura de Tablas

### User (Usuarios)
Tabla principal para almacenar información de usuarios del sistema.

```sql
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "password" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY ("id"),
  UNIQUE("email")
);
```

**Campos:**
- `id`: Identificador único del usuario (UUID)
- `email`: Email único del usuario
- `name`: Nombre completo del usuario
- `password`: Contraseña hasheada
- `created_at`: Fecha de creación del registro
- `updated_at`: Fecha de última actualización

**Constraints:**
- Email único
- Contraseña requerida
- Timestamps automáticos

### Category (Categorías)
Tabla para categorizar las facturas por tipo de gasto.

```sql
CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "userId" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY ("id"),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
```

**Campos:**
- `id`: Identificador único de la categoría
- `name`: Nombre de la categoría
- `description`: Descripción opcional
- `userId`: Usuario propietario de la categoría
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

**Relaciones:**
- Pertenece a un User (N:1)
- Tiene múltiples Invoices (1:N)

### Vendor (Proveedores)
Tabla para almacenar información de proveedores de facturas.

```sql
CREATE TABLE "Vendor" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "nit" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "userId" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY ("id"),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
```

**Campos:**
- `id`: Identificador único del proveedor
- `name`: Nombre o razón social del proveedor
- `nit`: Número de Identificación Tributaria
- `email`: Email de contacto (opcional)
- `phone`: Teléfono de contacto (opcional)
- `address`: Dirección física (opcional)
- `userId`: Usuario propietario del proveedor
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

**Relaciones:**
- Pertenece a un User (N:1)
- Tiene múltiples Invoices (1:N)

### Invoice (Facturas)
Tabla principal para almacenar las facturas del sistema.

```sql
CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL,
  "authorization_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "nit" TEXT NOT NULL,
  "nit_ci_cex" TEXT NOT NULL,
  "number_receipt" TEXT NOT NULL,
  "purchase_date" DATETIME NOT NULL,
  "total_amount" REAL NOT NULL,
  "vendor" TEXT NOT NULL,
  "vendorId" TEXT,
  "rubro" TEXT NOT NULL,
  "categoryId" TEXT,
  "userId" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY ("id"),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL,
  FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL
);
```

**Campos:**
- `id`: Identificador único de la factura
- `authorization_code`: Código de autorización fiscal
- `name`: Nombre de la empresa o persona
- `nit`: Número de Identificación Tributaria
- `nit_ci_cex`: NIT, CI o CEX del comprador
- `number_receipt`: Número de factura
- `purchase_date`: Fecha de compra
- `total_amount`: Monto total de la factura
- `vendor`: Nombre del proveedor (texto)
- `vendorId`: Referencia al proveedor (opcional)
- `rubro`: Rubro o categoría de la factura
- `categoryId`: Categoría asignada (opcional)
- `userId`: Usuario propietario de la factura
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

**Relaciones:**
- Pertenece a un User (N:1)
- Pertenece a una Category (N:1, opcional)
- Pertenece a un Vendor (N:1, opcional)
- Tiene múltiples InvoiceItems (1:N)

### InvoiceItem (Items de Factura)
Tabla para almacenar las líneas individuales de cada factura.

```sql
CREATE TABLE "InvoiceItem" (
  "id" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" REAL NOT NULL,
  "unit_price" REAL NOT NULL,
  "total" REAL NOT NULL,
  "tax_rate" REAL NOT NULL DEFAULT 0,
  "invoiceId" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY ("id"),
  FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE
);
```

**Campos:**
- `id`: Identificador único del item
- `description`: Descripción del producto o servicio
- `quantity`: Cantidad de unidades
- `unit_price`: Precio unitario
- `total`: Total del item (calculado)
- `tax_rate`: Tasa de impuesto aplicada
- `invoiceId`: Factura a la que pertenece
- `created_at`: Fecha de creación

**Relaciones:**
- Pertenece a una Invoice (N:1)

### UserSettings (Configuración de Usuario)
Tabla para almacenar las preferencias y configuración de cada usuario.

```sql
CREATE TABLE "UserSettings" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "theme" TEXT NOT NULL DEFAULT 'light',
  "language" TEXT NOT NULL DEFAULT 'es',
  "notifications" TEXT NOT NULL DEFAULT '{"system": true, "email": false, "frequency": "weekly"}',
  "exportFormat" TEXT NOT NULL DEFAULT 'csv',
  "exportFields" TEXT NOT NULL DEFAULT '[]',
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY ("id"),
  UNIQUE("userId"),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
```

**Campos:**
- `id`: Identificador único de la configuración
- `userId`: Usuario al que pertenece la configuración
- `theme`: Tema de la interfaz (light/dark/auto)
- `language`: Idioma preferido (es/en)
- `notifications`: Configuración de notificaciones (JSON)
- `exportFormat`: Formato de exportación preferido
- `exportFields`: Campos a incluir en exportaciones (JSON)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

**Relaciones:**
- Pertenece a un User (1:1)

## Índices y Optimización

### Índices Principales
```sql
-- Índices para búsqueda por usuario
CREATE INDEX "idx_invoice_userId" ON "Invoice"("userId");
CREATE INDEX "idx_category_userId" ON "Category"("userId");
CREATE INDEX "idx_vendor_userId" ON "Vendor"("userId");

-- Índices para búsqueda por fecha
CREATE INDEX "idx_invoice_purchase_date" ON "Invoice"("purchase_date");

-- Índices para búsqueda por proveedor
CREATE INDEX "idx_invoice_vendorId" ON "Invoice"("vendorId");

-- Índices para búsqueda por categoría
CREATE INDEX "idx_invoice_categoryId" ON "Invoice"("categoryId");

-- Índices para búsqueda de items
CREATE INDEX "idx_invoiceitem_invoiceId" ON "InvoiceItem"("invoiceId");

-- Índices únicos
CREATE UNIQUE INDEX "idx_user_email" ON "User"("email");
CREATE UNIQUE INDEX "idx_usersettings_userId" ON "UserSettings"("userId");
```

### Índices Compuestos
```sql
-- Índice compuesto para búsquedas frecuentes
CREATE INDEX "idx_invoice_user_date" ON "Invoice"("userId", "purchase_date");

-- Índice para búsquedas por proveedor y fecha
CREATE INDEX "idx_invoice_vendor_date" ON "Invoice"("vendorId", "purchase_date");

-- Índice para búsquedas por categoría y fecha
CREATE INDEX "idx_invoice_category_date" ON "Invoice"("categoryId", "purchase_date");
```

### Optimización de Consultas
```sql
-- Configuración de PostgreSQL para mejor rendimiento
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
```

## Seguridad y Validación

### Constraints de Validación
```sql
-- Validación de email
ALTER TABLE "User" ADD CONSTRAINT "valid_email" 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Validación de NIT (formato boliviano)
ALTER TABLE "Vendor" ADD CONSTRAINT "valid_nit" 
CHECK (nit ~* '^[0-9]{7,15}$');

-- Validación de montos positivos
ALTER TABLE "Invoice" ADD CONSTRAINT "positive_amount" 
CHECK (total_amount > 0);

ALTER TABLE "InvoiceItem" ADD CONSTRAINT "positive_item_amount" 
CHECK (quantity > 0 AND unit_price >= 0 AND total >= 0);

-- Validación de tasas de impuesto
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "valid_tax_rate" 
CHECK (tax_rate >= 0 AND tax_rate <= 100);
```

### Triggers de Auditoría
```sql
-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_updated_at BEFORE UPDATE ON "Category" 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_updated_at BEFORE UPDATE ON "Vendor" 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_updated_at BEFORE UPDATE ON "Invoice" 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usersettings_updated_at BEFORE UPDATE ON "UserSettings" 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Funciones de Validación
```sql
-- Función para validar formato de teléfono
CREATE OR REPLACE FUNCTION validate_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN phone ~* '^[\d\s\-\+\(\)]+$';
END;
$$ LANGUAGE plpgsql;

-- Función para calcular total de factura
CREATE OR REPLACE FUNCTION calculate_invoice_total(invoice_id TEXT)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL := 0;
BEGIN
    SELECT COALESCE(SUM(total), 0) INTO total
    FROM "InvoiceItem"
    WHERE "invoiceId" = invoice_id;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;
```

## Estadísticas de la Base de Datos

### Métricas de Rendimiento
```sql
-- Consulta para obtener estadísticas de uso
SELECT 
    COUNT(*) as total_users,
    (SELECT COUNT(*) FROM "Invoice") as total_invoices,
    (SELECT COUNT(*) FROM "Vendor") as total_vendors,
    (SELECT COUNT(*) FROM "Category") as total_categories,
    (SELECT AVG(total_amount) FROM "Invoice") as avg_invoice_amount
FROM "User";
```

### Consultas de Análisis
```sql
-- Gastos por categoría
SELECT 
    c.name as category,
    COUNT(i.id) as invoice_count,
    SUM(i.total_amount) as total_amount,
    AVG(i.total_amount) as avg_amount
FROM "Category" c
LEFT JOIN "Invoice" i ON c.id = i."categoryId"
GROUP BY c.id, c.name
ORDER BY total_amount DESC;

-- Gastos por proveedor
SELECT 
    v.name as vendor,
    COUNT(i.id) as invoice_count,
    SUM(i.total_amount) as total_amount,
    AVG(i.total_amount) as avg_amount
FROM "Vendor" v
LEFT JOIN "Invoice" i ON v.id = i."vendorId"
GROUP BY v.id, v.name
ORDER BY total_amount DESC;

-- Gastos por mes
SELECT 
    DATE_TRUNC('month', purchase_date) as month,
    COUNT(*) as invoice_count,
    SUM(total_amount) as total_amount
FROM "Invoice"
GROUP BY DATE_TRUNC('month', purchase_date)
ORDER BY month DESC;
```

## Migraciones y Despliegue

### Migración Inicial
```sql
-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tablas en orden correcto
-- (Ver esquemas completos arriba)

-- Crear índices
-- (Ver índices arriba)

-- Crear triggers
-- (Ver triggers arriba)

-- Insertar datos iniciales
INSERT INTO "Category" (id, name, description, "userId") VALUES
('cat-001', 'Servicios', 'Servicios profesionales y consultoría', 'user-001'),
('cat-002', 'Suministros', 'Materiales y suministros de oficina', 'user-001'),
('cat-003', 'Equipos', 'Equipos y dispositivos electrónicos', 'user-001');
```

### Scripts de Mantenimiento
```sql
-- Limpiar datos antiguos (más de 2 años)
DELETE FROM "Invoice" 
WHERE purchase_date < CURRENT_DATE - INTERVAL '2 years';

-- Optimizar tablas
VACUUM ANALYZE "Invoice";
VACUUM ANALYZE "InvoiceItem";
VACUUM ANALYZE "Vendor";

-- Actualizar estadísticas
ANALYZE "Invoice";
ANALYZE "InvoiceItem";
ANALYZE "Vendor";
ANALYZE "Category";
```

### Backup y Recuperación
```bash
#!/bin/bash
# Script de backup

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="simplefactura"

# Backup completo
pg_dump $DATABASE_URL > $BACKUP_DIR/full_backup_$DATE.sql

# Backup solo datos (sin estructura)
pg_dump --data-only $DATABASE_URL > $BACKUP_DIR/data_backup_$DATE.sql

# Backup solo estructura
pg_dump --schema-only $DATABASE_URL > $BACKUP_DIR/schema_backup_$DATE.sql

# Comprimir backups
gzip $BACKUP_DIR/*_backup_$DATE.sql

# Limpiar backups antiguos (mantener 30 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

---

**Esquema de Base de Datos - SimpleFactura v2.0**
*Última actualización: Diciembre 2024*
