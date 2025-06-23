# Manual de Usuario — SimpleFactura

Este manual te guiará paso a paso en el uso de SimpleFactura, desde el registro hasta la exportación y análisis de tus facturas.

---

## 1. Registro e inicio de sesión

1. Accede a `/auth/register` y completa el formulario para crear tu cuenta.
2. Inicia sesión en `/auth/login` con tu email y contraseña.
3. Si olvidas tu contraseña, contacta al administrador para restablecerla.

---

## 2. Gestión de categorías

- Ve a la sección **Categorías** desde el dashboard principal.
- Haz clic en **Nueva Categoría** para crear una nueva (ej: Personal, Negocio, Combustible).
- Puedes editar o eliminar tus categorías. No puedes eliminar una categoría si tiene facturas asociadas.
- Cada usuario tiene sus propias categorías.

**Sugerencia:** Usa nombres claros y una breve descripción para cada categoría.

---

## 3. Registrar facturas

### Opción A: Registro manual
1. Haz clic en **Nueva Factura**.
2. Completa los campos obligatorios:
   - Fecha de compra
   - Vendedor
   - Monto total
   - Rubro (texto libre, ej: "Alimentación", "Combustible")
   - Categoría (selecciona una de tus categorías)
3. Puedes completar los campos opcionales si lo deseas (NIT, número de recibo, etc).
4. Haz clic en **Guardar Factura**.

### Opción B: Registro con cámara y OCR
1. Haz clic en **Usar Cámara** en el formulario de nueva factura.
2. Captura la imagen de la factura.
3. El sistema extraerá automáticamente los datos principales (puedes editarlos antes de guardar).
4. Completa los campos faltantes y guarda la factura.

---

## 4. Visualizar, filtrar y editar facturas

- En el dashboard principal verás la tabla con todas tus facturas.
- Usa los filtros para buscar por fecha, proveedor, NIT, categoría o monto.
- Haz clic en el ícono de lápiz para editar una factura, o en el ícono de papelera para eliminarla.
- Puedes ordenar las facturas por fecha o monto.

---

## 5. Exportar facturas

1. Haz clic en **Exportar** en el dashboard.
2. Selecciona el rango de fechas, formato (PDF o CSV) y filtros adicionales (proveedor, NIT, categoría).
3. Haz clic en **Exportar** para descargar el archivo.
   - **CSV:** Puedes abrirlo en Excel, Google Sheets, etc. Incluye todos los campos y un resumen de IVA.
   - **PDF:** Incluye tabla de facturas, resumen ejecutivo y totales.

**Ejemplo de uso:**
- Exporta todas las facturas del mes para tu contador.
- Filtra por categoría "Negocio" y exporta solo esos gastos.

---

## 6. Reportes y estadísticas

- Ve a la sección **Estadísticas** desde el dashboard.
- Explora los gráficos de barras, pastel y línea:
  - Gastos por semana, mes, categoría, rubro y proveedor
  - Comparativo entre meses (verás si gastaste más o menos que el mes anterior)
  - Tendencias de gasto (últimos 6 meses)
  - Top 10 rubros y categorías
- Consulta el resumen de totales y la factura de mayor monto registrada.

**Sugerencia:** Consulta los reportes mensualmente para identificar oportunidades de ahorro.

---

## 7. Consejos y mejores prácticas

- Crea categorías personalizadas para separar tus gastos personales y de negocio.
- Usa el OCR para ahorrar tiempo y evitar errores de tipeo.
- Exporta tus datos regularmente para respaldo y control tributario.
- Aprovecha los filtros avanzados para encontrar facturas específicas.
- Si tienes dudas, consulta el README o contacta soporte.

---

## 8. Capturas de pantalla sugeridas

- Dashboard principal con filtros y tabla de facturas
- Formulario de nueva factura (con OCR y campos personalizados)
- Gestión de categorías
- Exportación de datos (diálogo de exportar)
- Página de estadísticas con gráficos

---

## 9. Preguntas frecuentes (FAQ)

**¿Puedo tener categorías diferentes a otros usuarios?**
> Sí, cada usuario gestiona sus propias categorías.

**¿Puedo registrar facturas desde el celular?**
> Sí, la app es responsive y puedes usar la cámara del móvil para el OCR.

**¿Qué pasa si borro una categoría con facturas?**
> El sistema no te dejará eliminarla hasta que no muevas o borres esas facturas.

**¿Cómo se calcula el IVA?**
> El sistema calcula automáticamente el 13% de IVA en los reportes y exportaciones.

**¿Puedo exportar solo un subconjunto de facturas?**
> Sí, usa los filtros antes de exportar.

---

## 10. Soporte

¿Tienes dudas, sugerencias o encontraste un error? Contacta a [tu correo o github]. 