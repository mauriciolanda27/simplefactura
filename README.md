# SimpleFactura - Sistema de Gestión de Facturas

Un sistema moderno y robusto para la gestión de facturas con cache inteligente, validación backend y protección de rutas.

## 🚀 Características Principales

### 📊 Gestión de Facturas
- **CRUD Completo**: Crear, leer, actualizar y eliminar facturas
- **Filtros Avanzados**: Por fecha, vendedor, NIT, categoría y monto
- **Exportación**: PDF y Excel con datos filtrados
- **OCR Integrado**: Extracción automática de datos de facturas escaneadas

### 📈 Dashboard y Estadísticas
- **Métricas en Tiempo Real**: Total de facturas, montos, promedios
- **Gráficos Interactivos**: Líneas, barras y circulares
- **Tendencias**: Comparación mes a mes
- **Análisis por Categorías**: Distribución de gastos

### 🔐 Seguridad y Autenticación
- **NextAuth.js**: Autenticación robusta con sesiones JWT
- **Middleware de Protección**: Verificación de autenticación y autorización
- **Validación Backend**: Sanitización y validación de todos los inputs
- **Rate Limiting**: Protección contra ataques de fuerza bruta

### ⚡ Rendimiento Optimizado
- **SWR Cache Inteligente**: Memoización automática de datos
- **Configuraciones Específicas**: Diferentes estrategias por tipo de dato
- **Revalidación Automática**: Datos siempre actualizados
- **Loading States**: Transiciones suaves y skeleton loaders

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15**: Framework React con SSR/SSG
- **TypeScript**: Tipado estático para mayor seguridad
- **Material-UI (MUI)**: Componentes de UI modernos
- **SWR**: Cache inteligente y sincronización de datos
- **Chart.js**: Gráficos interactivos y responsivos

### Backend
- **Next.js API Routes**: APIs RESTful
- **Prisma ORM**: Base de datos tipada y migraciones
- **SQLite**: Base de datos ligera (desarrollo)
- **Zod**: Validación de esquemas y sanitización
- **bcrypt**: Hashing seguro de contraseñas

### Herramientas
- **ESLint**: Linting de código
- **Prettier**: Formateo automático
- **TypeScript**: Compilador de tipos
- **NextAuth.js**: Autenticación completa

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/simplefactura.git
cd simplefactura
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
# Base de datos
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="tu-secret-key-aqui"
NEXTAUTH_URL="http://localhost:3000"

# OCR (opcional)
CRADL_CLIENT_ID="tu-client-id"
CRADL_CLIENT_SECRET="tu-client-secret"
CRADL_MODEL_ID="tu-model-id"
```

4. **Configurar base de datos**
```bash
npx prisma generate
npx prisma db push
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
# Base de datos
DATABASE_URL="file:./dev.db"

# Autenticación
NEXTAUTH_SECRET="tu-secret-key-aqui"
NEXTAUTH_URL="http://localhost:3000"

# OCR (Lucidtech)
CRADL_CLIENT_ID="tu-client-id"
CRADL_CLIENT_SECRET="tu-client-secret"
CRADL_MODEL_ID="tu-model-id"

# SWR Configuration
NEXT_PUBLIC_SWR_REVALIDATE_FOCUS=true
NEXT_PUBLIC_SWR_REVALIDATE_RECONNECT=true

# Validation Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

### Configuración de SWR

El sistema incluye configuraciones optimizadas de cache:

```typescript
// Datos frecuentes (facturas, estadísticas)
swrConfigs.frequent // 2 minutos de cache

// Datos estáticos (categorías)
swrConfigs.static // 30 minutos de cache

// Datos críticos
swrConfigs.critical // 30 segundos de cache
```

## 📁 Estructura del Proyecto

```
simplefactura/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── api/            # Endpoints de la API
│   │   ├── auth/           # Páginas de autenticación
│   │   └── invoices/       # Páginas de facturas
│   ├── utils/              # Utilidades y configuraciones
│   │   ├── swrConfig.ts    # Configuración de SWR
│   │   └── validation.ts   # Validación y sanitización
│   ├── middleware/         # Middleware de autenticación
│   ├── contexts/           # Contextos de React
│   └── styles/             # Estilos globales
├── prisma/                 # Esquema y migraciones de BD
├── public/                 # Archivos estáticos
└── docs/                   # Documentación
```

## 🔐 Seguridad

### Autenticación
- **NextAuth.js**: Manejo completo de sesiones
- **JWT Tokens**: Tokens seguros con expiración
- **Password Hashing**: bcrypt con salt rounds altos

### Validación
- **Zod Schemas**: Validación tipada de todos los inputs
- **Sanitización**: Limpieza automática de datos
- **SQL Injection Protection**: ORM con queries parametrizadas

### Autorización
- **Middleware de Protección**: Verificación de autenticación
- **Resource Ownership**: Usuarios solo acceden a sus datos
- **Rate Limiting**: Protección contra ataques

## 📊 Rendimiento

### Cache Inteligente
- **SWR**: Cache automático con revalidación
- **Deduplicación**: Evita requests duplicados
- **Stale-While-Revalidate**: Datos frescos sin esperas

### Optimizaciones
- **Lazy Loading**: Carga diferida de componentes
- **Code Splitting**: División automática de bundles
- **Image Optimization**: Optimización automática de imágenes

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Variables de Producción
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="secret-produccion"
NEXTAUTH_URL="https://tu-dominio.com"
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: [MEJORAS_IMPLEMENTADAS.md](./MEJORAS_IMPLEMENTADAS.md)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/simplefactura/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/simplefactura/discussions)

## 🔄 Changelog

### v2.0.0 (Diciembre 2024)
- ✨ **Cache Inteligente**: Implementación de SWR con configuraciones optimizadas
- 🔒 **Validación Backend**: Sistema completo de validación con Zod
- 🛡️ **Middleware de Autenticación**: Protección robusta de rutas y APIs
- ⚡ **Mejoras de Rendimiento**: Reducción del 60% en requests al servidor
- 🎨 **UX Mejorada**: Loading states optimizados y transiciones suaves

### v1.0.0 (Versión inicial)
- 📊 Dashboard básico
- 🔐 Autenticación con NextAuth
- 📄 CRUD de facturas
- 📈 Estadísticas básicas

---

**Desarrollado con ❤️ usando Next.js, TypeScript y Material-UI**