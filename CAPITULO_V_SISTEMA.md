# CAPÍTULO V
## 5 DESARROLLO Y PRUEBAS

### 5.1 DESARROLLO DEL SISTEMA

#### 5.1.1 Página de Inicio

**Figura 1: Página de Inicio del Sistema**

[INSERTAR CAPTURA DE PANTALLA: src/pages/landing.tsx - Página principal con información del sistema, botones de login y registro]

*Fuente: Elaboración Propia*

La página de inicio es la interfaz principal del sistema de gestión de facturas SimpleFactura. Proporciona información general sobre el sistema y brinda acceso a las diferentes funcionalidades. En esta página, los usuarios pueden iniciar sesión, registrarse o acceder a información relevante sobre el sistema. La interfaz está diseñada con un diseño moderno y responsivo que se adapta a diferentes dispositivos.

#### 5.1.2 Registro de Cuenta

**Figura 2: Formulario de Registro de Usuario**

[INSERTAR CAPTURA DE PANTALLA: src/pages/auth/register.tsx - Formulario de registro con campos de email, nombre y contraseña]

*Fuente: Elaboración Propia*

La funcionalidad de registro de cuenta permite a los usuarios crear una cuenta en el sistema. Los usuarios deben proporcionar información personal, como su dirección de correo electrónico, nombre completo y contraseña, para completar el proceso de registro. El sistema incluye validaciones en tiempo real para asegurar que los datos ingresados sean correctos. Una vez registrado, el usuario puede acceder al sistema con sus credenciales.

#### 5.1.3 Iniciar Sesión

**Figura 3: Formulario de Inicio de Sesión**

[INSERTAR CAPTURA DE PANTALLA: src/pages/auth/login.tsx - Formulario de login con campos de email y contraseña]

*Fuente: Elaboración Propia*

El sistema utiliza NextAuth.js, un framework de autenticación y autorización, para gestionar el proceso de inicio de sesión. Los usuarios pueden iniciar sesión utilizando su dirección de correo electrónico y contraseña registrados. NextAuth.js proporciona una capa de seguridad adicional y garantiza la autenticidad de los usuarios. El sistema también incluye funcionalidades de recuperación de contraseña y gestión de sesiones seguras.

#### 5.1.4 Dashboard Principal

**Figura 4: Dashboard Principal del Sistema**

[INSERTAR CAPTURA DE PANTALLA: src/pages/index.tsx - Dashboard con estadísticas, gráficos y navegación principal]

*Fuente: Elaboración Propia*

El dashboard principal es el centro de control del sistema, donde los usuarios pueden visualizar un resumen completo de sus facturas. Incluye métricas importantes como el total de facturas, gastos por período, categorías más utilizadas y tendencias de gastos. La interfaz presenta gráficos interactivos y estadísticas en tiempo real que permiten a los usuarios tomar decisiones informadas sobre sus finanzas.

#### 5.1.5 Crear Factura Vía Cámara

**Figura 5: Captura Inicial de Factura**

[INSERTAR CAPTURA DE PANTALLA: src/pages/invoices/new.tsx - Interfaz de captura de factura con botón de cámara]

*Fuente: Elaboración Propia*

Una de las funcionalidades clave del sistema es la capacidad de crear facturas utilizando la cámara del dispositivo. Los usuarios pueden capturar una imagen de una factura física y el sistema utiliza tecnología de reconocimiento óptico de caracteres (OCR) para extraer automáticamente los datos relevantes, como el número de factura, fechas y montos.

**Figura 6: Resultado de Captura OCR**

[INSERTAR CAPTURA DE PANTALLA: src/pages/invoices/new.tsx - Formulario con datos extraídos automáticamente por OCR]

*Fuente: Elaboración Propia*

El sistema procesa la imagen capturada y extrae automáticamente la información de la factura. Los datos extraídos se muestran en un formulario pre-llenado, permitiendo al usuario verificar y corregir cualquier información si es necesario.

**Figura 7: Procesado de Factura Manual**

[INSERTAR CAPTURA DE PANTALLA: src/pages/invoices/new.tsx - Formulario con factura manual procesada]

*Fuente: Elaboración Propia*

El sistema también puede procesar facturas manuales sin códigos QR. La tecnología OCR es capaz de reconocer texto escrito a mano y extraer información relevante de diferentes formatos de facturas.

#### 5.1.6 Llenado de Datos del Formulario

**Figura 8: Formulario de Llenado de Factura**

[INSERTAR CAPTURA DE PANTALLA: src/pages/invoices/new.tsx - Formulario completo con todos los campos de factura]

*Fuente: Elaboración Propia*

Este es el resultado que Cradl.AI nos devuelve en base a la captura de nuestra factura. En el caso de que la cámara no haya podido capturar todos los datos de manera exitosa, el usuario puede ingresar los datos restantes manualmente. Los únicos dos campos que el usuario tendría que llenar manualmente son los de Categoría y Rubro, ya que requieren conocimiento específico del negocio.

#### 5.1.7 Gestión de Categorías

**Figura 9: Gestión de Categorías**

[INSERTAR CAPTURA DE PANTALLA: src/pages/categories.tsx - Lista de categorías con opciones de crear, editar y eliminar]

*Fuente: Elaboración Propia*

El sistema permite a los usuarios crear y gestionar categorías personalizadas para organizar sus facturas. Los usuarios pueden crear categorías como "Servicios", "Suministros", "Equipos", etc., y asignarlas a sus facturas para facilitar el análisis y reportes.

#### 5.1.8 Gestión de Proveedores

**Figura 10: Gestión de Proveedores**

[INSERTAR CAPTURA DE PANTALLA: src/pages/vendors.tsx - Lista de proveedores con información detallada]

*Fuente: Elaboración Propia*

El sistema incluye un módulo completo de gestión de proveedores donde los usuarios pueden registrar información detallada de sus proveedores, incluyendo NIT, dirección, teléfono y email. Esta información se utiliza automáticamente al crear nuevas facturas.

#### 5.1.9 Lista de Facturas

**Figura 11: Lista de Facturas**

[INSERTAR CAPTURA DE PANTALLA: src/pages/invoices/index.tsx - Tabla con todas las facturas del usuario]

*Fuente: Elaboración Propia*

La lista de facturas muestra todas las facturas registradas por el usuario en una tabla organizada. Incluye filtros por fecha, categoría, proveedor y monto, así como opciones de búsqueda avanzada. Los usuarios pueden ver, editar o eliminar facturas directamente desde esta interfaz.

#### 5.1.10 Edición de Facturas

**Figura 12: Edición de Factura**

[INSERTAR CAPTURA DE PANTALLA: src/pages/invoices/edit/[id].tsx - Formulario de edición de factura]

*Fuente: Elaboración Propia*

El sistema permite a los usuarios editar facturas existentes. La interfaz de edición es similar al formulario de creación, pero pre-llenada con los datos actuales de la factura. Los usuarios pueden modificar cualquier campo y guardar los cambios.

#### 5.1.11 Análisis y Estadísticas

**Figura 13: Página de Análisis Estadístico**

[INSERTAR CAPTURA DE PANTALLA: src/pages/analytics.tsx - Gráficos y análisis estadísticos]

*Fuente: Elaboración Propia*

El sistema incluye un módulo de análisis estadístico avanzado que presenta gráficos interactivos y análisis de tendencias. Los usuarios pueden visualizar sus gastos por categoría, período de tiempo, proveedor y otros criterios relevantes.

#### 5.1.12 Reportes y Exportación

**Figura 14: Generación de Reportes**

[INSERTAR CAPTURA DE PANTALLA: src/pages/reports.tsx - Interfaz de generación de reportes]

*Fuente: Elaboración Propia*

El sistema permite generar reportes personalizados basados en diferentes criterios como fecha, categoría, proveedor, etc. Los usuarios pueden exportar estos reportes en formatos CSV, Excel o PDF para su uso posterior.

#### 5.1.13 Descargar Facturas

**Figura 15: Descarga de Facturas**

[INSERTAR CAPTURA DE PANTALLA: src/pages/reports.tsx - Opciones de exportación de datos]

*Fuente: Elaboración Propia*

El usuario tiene la opción de descargar todas sus facturas en formato CSV para su posterior uso o referencia. Esta funcionalidad es especialmente útil para análisis externos o para compartir información con contadores o asesores financieros.

#### 5.1.14 Visualizar Estadísticas de Facturas

**Figura 16: Visualización de Estadísticas de Facturas**

[INSERTAR CAPTURA DE PANTALLA: src/pages/stats.tsx - Dashboard de estadísticas con gráficos]

*Fuente: Elaboración Propia*

El sistema presenta estadísticas detalladas de las facturas en un dashboard interactivo. Los usuarios pueden ver métricas como total de gastos, promedio por factura, tendencias mensuales y distribución por categorías.

#### 5.1.15 Configuración de Usuario

**Figura 17: Configuración de Usuario**

[INSERTAR CAPTURA DE PANTALLA: src/pages/user-settings.tsx - Panel de configuración personal]

*Fuente: Elaboración Propia*

El sistema incluye un panel de configuración donde los usuarios pueden personalizar sus preferencias, incluyendo tema de interfaz, configuración de notificaciones, formato de exportación y otras opciones personalizables.

#### 5.1.16 Demostración Predicción Individual de una Factura en Cradl.AI

**Figura 18: Demostración Individual de Análisis de una Factura Manual**

[INSERTAR CAPTURA DE PANTALLA: src/pages/invoices/new.tsx - Resultado de análisis OCR de factura manual]

*Fuente: Elaboración Propia*

El sistema demuestra su capacidad para analizar facturas manuales utilizando la tecnología Cradl.AI. La imagen muestra cómo el sistema extrae información precisa de una factura escrita a mano, incluyendo números, fechas y montos.

#### 5.1.17 Dataset para el Modelo de Entrenamiento

**Figura 19: Dataset de Entrenamiento para el Modelo**

[INSERTAR CAPTURA DE PANTALLA: src/pages/test-data.tsx - Visualización de datos de entrenamiento]

*Fuente: Elaboración Propia*

El sistema utiliza un dataset de entrenamiento específico para mejorar la precisión del reconocimiento OCR. Este dataset incluye diferentes tipos de facturas, formatos y estilos de escritura para asegurar que el sistema pueda procesar una amplia variedad de documentos.

#### 5.1.18 API Documentation

**Figura 20: Documentación de la API**

[INSERTAR CAPTURA DE PANTALLA: src/pages/api-docs.tsx - Documentación interactiva de la API]

*Fuente: Elaboración Propia*

El sistema incluye documentación completa de la API REST que permite a desarrolladores integrar el sistema con otras aplicaciones. La documentación es interactiva y permite probar los endpoints directamente desde el navegador.

#### 5.1.19 Testing de la API

**Figura 21: Consola de Testing de API**

[INSERTAR CAPTURA DE PANTALLA: src/pages/api-test.tsx - Interfaz para probar endpoints de la API]

*Fuente: Elaboración Propia*

El sistema proporciona una consola de testing integrada donde los desarrolladores pueden probar todos los endpoints de la API, enviar datos de prueba y verificar las respuestas del sistema.

#### 5.1.20 Tutorial del Sistema

**Figura 22: Tutorial Interactivo**

[INSERTAR CAPTURA DE PANTALLA: src/pages/tutorial.tsx - Tutorial paso a paso del sistema]

*Fuente: Elaboración Propia*

El sistema incluye un tutorial interactivo que guía a los nuevos usuarios a través de todas las funcionalidades principales. El tutorial es paso a paso y permite a los usuarios familiarizarse con el sistema de manera práctica.

#### 5.1.21 Sistema de Alertas

**Figura 23: Sistema de Alertas y Notificaciones**

[INSERTAR CAPTURA DE PANTALLA: src/pages/test-alerts.tsx - Panel de alertas y notificaciones]

*Fuente: Elaboración Propia*

El sistema incluye un sistema de alertas inteligente que notifica a los usuarios sobre eventos importantes como facturas próximas a vencer, límites de gasto alcanzados o anomalías detectadas en los datos.

#### 5.1.22 Análisis Predictivo

**Figura 24: Análisis Predictivo de Gastos**

[INSERTAR CAPTURA DE PANTALLA: src/pages/analytics.tsx - Predicciones y tendencias futuras]

*Fuente: Elaboración Propia*

El sistema utiliza algoritmos de machine learning para realizar análisis predictivo de gastos futuros basándose en el historial de facturas del usuario. Esto permite a los usuarios planificar mejor sus finanzas y tomar decisiones informadas.

#### 5.1.23 Gestión de Items de Factura

**Figura 25: Gestión Detallada de Items de Factura**

[INSERTAR CAPTURA DE PANTALLA: src/pages/invoices/new.tsx - Sección de items de factura con cálculos automáticos]

*Fuente: Elaboración Propia*

El sistema permite a los usuarios gestionar los items individuales de cada factura, incluyendo descripción, cantidad, precio unitario y cálculos automáticos de totales e impuestos.

#### 5.1.24 Búsqueda Avanzada

**Figura 26: Búsqueda Avanzada de Facturas**

[INSERTAR CAPTURA DE PANTALLA: src/pages/invoices/index.tsx - Filtros y búsqueda avanzada]

*Fuente: Elaboración Propia*

El sistema incluye funcionalidades de búsqueda avanzada que permiten a los usuarios encontrar facturas específicas utilizando múltiples criterios como fecha, monto, proveedor, categoría y texto libre.

#### 5.1.25 Responsive Design

**Figura 27: Interfaz Responsive en Dispositivo Móvil**

[INSERTAR CAPTURA DE PANTALLA: src/pages/index.tsx - Vista móvil del dashboard]

*Fuente: Elaboración Propia*

El sistema está diseñado para ser completamente responsivo, adaptándose a diferentes tamaños de pantalla. La interfaz se optimiza automáticamente para dispositivos móviles, tablets y computadoras de escritorio.

#### 5.1.26 Modo Oscuro

**Figura 28: Interfaz en Modo Oscuro**

[INSERTAR CAPTURA DE PANTALLA: src/pages/index.tsx - Dashboard en modo oscuro]

*Fuente: Elaboración Propia*

El sistema incluye un modo oscuro que mejora la experiencia del usuario en condiciones de poca luz y reduce la fatiga visual. Los usuarios pueden alternar entre modo claro y oscuro según sus preferencias.

#### 5.1.27 Validación en Tiempo Real

**Figura 29: Validación de Formularios en Tiempo Real**

[INSERTAR CAPTURA DE PANTALLA: src/pages/invoices/new.tsx - Mensajes de validación en formulario]

*Fuente: Elaboración Propia*

El sistema incluye validación en tiempo real en todos los formularios, proporcionando retroalimentación inmediata al usuario sobre errores o campos requeridos. Esto mejora la experiencia del usuario y reduce errores de entrada de datos.

#### 5.1.28 Carga Lazy de Componentes

**Figura 30: Carga Optimizada de Componentes**

[INSERTAR CAPTURA DE PANTALLA: src/pages/test-lazy.tsx - Demostración de carga lazy]

*Fuente: Elaboración Propia*

El sistema utiliza técnicas de carga lazy para optimizar el rendimiento, cargando componentes solo cuando son necesarios. Esto mejora significativamente los tiempos de carga inicial y la experiencia general del usuario.

#### 5.1.29 Gestión de Errores

**Figura 31: Sistema de Manejo de Errores**

[INSERTAR CAPTURA DE PANTALLA: src/pages/test-alerts.tsx - Mensajes de error y recuperación]

*Fuente: Elaboración Propia*

El sistema incluye un sistema robusto de manejo de errores que proporciona mensajes claros y útiles al usuario cuando ocurren problemas. El sistema también incluye funcionalidades de recuperación automática cuando es posible.

#### 5.1.30 Auditoría y Logs

**Figura 32: Sistema de Auditoría**

[INSERTAR CAPTURA DE PANTALLA: src/pages/audit.tsx - Logs de auditoría del sistema]

*Fuente: Elaboración Propia*

El sistema mantiene un registro completo de auditoría de todas las acciones realizadas por los usuarios, incluyendo creación, modificación y eliminación de facturas. Esto proporciona trazabilidad completa y seguridad del sistema.

---

**Nota:** Todas las capturas de pantalla deben ser tomadas del sistema funcionando en el navegador, mostrando las interfaces reales con datos de ejemplo. Las imágenes deben ser de alta calidad y mostrar claramente las funcionalidades descritas en cada sección. 