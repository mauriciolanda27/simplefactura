# SimpleFactura - Sistema de Gestión de Facturas para Pymes

Sistema multiplataforma de gestión de facturas desarrollado para Pequeñas y Medianas Empresas (Pymes) en Cochabamba, Bolivia. Permite la digitalización, organización y análisis de facturas con funcionalidades avanzadas de OCR, análisis estadístico, gestión de rubros y registro de actividad.

## Características Principales

### Gestión de Facturas
- **Registro de Facturas**: Formulario completo con validación automática
- **OCR Inteligente**: Extracción automática de datos mediante reconocimiento óptico de caracteres
- **Captura por Cámara**: Integración con cámara web para captura directa
- **Items de Factura**: Gestión detallada de líneas de factura con cálculos automáticos
- **Selección de Proveedores**: Dropdown con proveedores registrados del usuario

### Gestión de Usuarios
- **Autenticación Segura**: Sistema de login/registro con NextAuth.js
- **Configuración Personalizada**: Tema, idioma, notificaciones y formato de exportación
- **Perfiles de Usuario**: Gestión individual de preferencias

### Gestión de Proveedores
- **CRUD Completo**: Crear, leer, actualizar y eliminar proveedores
- **Información Detallada**: NIT, contacto, dirección y datos fiscales
- **Integración con Facturas**: Selección automática en formularios de facturación

### Gestión de Rubros
- **Clasificación Contable**: Rubros específicos para análisis detallado
- **Tipos de Rubros**: Empresariales y personales
- **Organización Jerárquica**: Categoría → Rubro → Factura
- **Análisis Granular**: Control presupuestario por área específica

### Registro de Actividad (Logs)
- **Trazabilidad Completa**: Registro automático de todas las acciones
- **Auditoría**: Rastreo de cambios en datos y accesos al sistema
- **Seguridad**: Monitoreo de actividades sospechosas
- **Análisis de Uso**: Identificación de patrones de uso

### Análisis y Reportes
- **Análisis Estadístico Avanzado**: Tendencias, patrones de gasto y predicciones
- **Gráficos Interactivos**: Visualizaciones con Chart.js
- **Exportación de Datos**: Formatos CSV y PDF
- **Dashboard Inteligente**: Métricas en tiempo real

### Organización
- **Categorización**: Sistema de categorías personalizable
- **Rubros Específicos**: Clasificación contable detallada
- **Búsqueda Avanzada**: Filtros por fecha, proveedor, categoría y rubro
- **Ordenamiento**: Múltiples criterios de ordenamiento

## Tecnologías Utilizadas

### Frontend
- **Next.js 15.3.4**: Framework React con SSR
- **TypeScript**: Tipado estático para mayor seguridad
- **Material-UI**: Componentes de interfaz modernos
- **Tailwind CSS**: Utilidades CSS para diseño responsivo
- **Chart.js**: Gráficos interactivos para análisis

### Backend
- **Node.js**: Runtime de JavaScript
- **Prisma**: ORM para gestión de base de datos
- **PostgreSQL**: Base de datos relacional (Neon)
- **NextAuth.js**: Autenticación y autorización

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **Jest**: Testing unitario
- **Git**: Control de versiones

## Requisitos del Sistema

- Node.js 18+ 
- npm o yarn
- Base de datos PostgreSQL (Neon recomendado)

## Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd simplefactura
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```
Editar `.env` con tus credenciales:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="tu-secreto-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Configurar base de datos**
```bash
npx prisma generate
npx prisma db push
```

5. **Ejecutar el servidor de desarrollo**
```bash
npm run dev
```

El sistema estará disponible en `http://localhost:3000`

## Documentación de la API

### Endpoints Principales

#### Autenticación
- `POST /api/auth/signin` - Iniciar sesión
- `POST /api/auth/signout` - Cerrar sesión
- `POST /api/register` - Registro de usuarios

#### Facturas
- `GET /api/invoices` - Listar facturas
- `POST /api/invoices` - Crear factura
- `GET /api/invoices/[id]` - Obtener factura específica
- `PUT /api/invoices/[id]` - Actualizar factura
- `DELETE /api/invoices/[id]` - Eliminar factura
- `POST /api/invoices/ocr` - Extracción OCR de facturas
- `GET /api/invoices/export` - Exportar facturas

#### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría
- `GET /api/categories/[id]` - Obtener categoría específica
- `PUT /api/categories/[id]` - Actualizar categoría
- `DELETE /api/categories/[id]` - Eliminar categoría

#### Rubros
- `GET /api/rubros` - Listar rubros
- `POST /api/rubros` - Crear rubro
- `GET /api/rubros/[id]` - Obtener rubro específico
- `PUT /api/rubros/[id]` - Actualizar rubro
- `DELETE /api/rubros/[id]` - Eliminar rubro

#### Registro de Actividad
- `GET /api/logs` - Obtener registro de actividad

#### Proveedores
- `GET /api/vendors` - Listar proveedores
- `POST /api/vendors` - Crear proveedor
- `GET /api/vendors/[id]` - Obtener proveedor específico
- `PUT /api/vendors/[id]` - Actualizar proveedor
- `DELETE /api/vendors/[id]` - Eliminar proveedor

#### Análisis Estadístico
- `GET /api/analytics/predictions` - Predicciones y análisis
- `GET /api/stats` - Estadísticas generales
- `GET /api/reports` - Generar reportes

### Documentación Interactiva
- **API Docs**: `http://localhost:3000/api-docs` - Documentación completa de la API
- **API Testing**: `http://localhost:3000/api-test` - Consola de pruebas de API

## Testing

### Ejecutar Tests
```bash
# Todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Tipos de Tests
- **Tests Unitarios**: Validación, utilidades, componentes
- **Tests de Integración**: Endpoints de API
- **Tests de Componentes**: React components con Jest

## Estructura de la Base de Datos

### Tablas Principales
- **User**: Usuarios del sistema
- **Category**: Categorías de facturas
- **Rubro**: Rubros contables específicos
- **Vendor**: Proveedores registrados
- **Invoice**: Facturas principales
- **InvoiceItem**: Líneas de factura
- **UserLog**: Registro de actividad del sistema
- **ExportHistory**: Historial de exportaciones
- **ExportAnalytics**: Análisis de exportaciones

### Relaciones
- Usuario → Categorías (1:N)
- Usuario → Rubros (1:N)
- Usuario → Proveedores (1:N)
- Usuario → Facturas (1:N)
- Usuario → Logs (1:N)
- Factura → Items (1:N)
- Factura → Categoría (N:1)
- Factura → Rubro (N:1)
- Factura → Proveedor (N:1)

## Características de la Interfaz

### Diseño Responsivo
- Compatible con dispositivos móviles
- Interfaz adaptativa para diferentes tamaños de pantalla
- Navegación optimizada para touch

### Temas y Personalización
- Modo claro/oscuro
- Configuración de idioma (Español/Inglés)
- Preferencias de exportación personalizables

### Experiencia de Usuario
- Carga lazy de componentes
- Animaciones suaves
- Feedback visual inmediato
- Validación en tiempo real

## Seguridad

- Autenticación JWT con NextAuth.js
- Encriptación de contraseñas con bcrypt
- Validación de entrada en todos los endpoints
- Protección CSRF
- Headers de seguridad configurados
- Registro completo de actividades para auditoría

## Funcionalidades Avanzadas

### Gestión de Rubros
- **Clasificación Contable**: Organización jerárquica de gastos
- **Tipos Específicos**: Rubros empresariales y personales
- **Análisis Detallado**: Control presupuestario por área
- **Reportes Especializados**: Análisis por rubro específico

### Sistema de Logs
- **Trazabilidad**: Registro automático de todas las acciones
- **Auditoría**: Rastreo de cambios y accesos
- **Seguridad**: Detección de actividades sospechosas
- **Análisis**: Identificación de patrones de uso

### Análisis Predictivo
- **Predicciones de Flujo de Caja**: Análisis de series temporales
- **Patrones de Gasto**: Identificación de tendencias
- **Evaluación de Riesgo**: Análisis estadístico de gastos
- **Recomendaciones**: Insights automáticos

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## Soporte

Para soporte técnico, contactar:
- Email: soporte@simplefactura.com
- Documentación: [API Documentation](API_DOCUMENTATION.md)
- Manual de Usuario: [Manual de Usuario](ANEXO_4_MANUAL_USUARIO_ACTUALIZADO.md)

---

**SimpleFactura v2.0** - Sistema completo de gestión de facturas para Pymes