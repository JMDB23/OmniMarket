# OmniMarket — Operations Hub

> **Dashboard de Analítica E-Commerce en Tiempo Real, Kanban con Persistencia Optimista y Endpoints de Auditoría API**  
> *Desarrollado bajo las especificaciones técnicas oficiales para Next.js 14+, OAuth 2.0, CI/CD y SLA de Alto Rendimiento.*

---

## 🚀 Resumen del Proyecto y Arquitectura

**OmniMarket Operations Hub** es un dashboard analítico web para la supervisión integral y operativa de un e-commerce. Proporciona visualización en tiempo real de métricas financieras clave (AOV, margen bruto, ingresos netos, ventas por categoría), un tablero Kanban interactivo con Drag & Drop y mutación optimista inmediata, capacidades de edición en lote (*Bulk Update*), y una suite completa de pruebas automatizadas con pipeline de CI/CD activo.

### Stack Tecnológico
- **Framework:** Next.js 14.2 (App Router, Server Components y Client Components)
- **Lenguaje:** TypeScript 5 (tipado estricto sin `any`)
- **Estilos:** Tailwind CSS con soporte para temas y diseño adaptativo (*Mobile-First*)
- **Componentes de Carga:** *Skeletons* personalizados (evitando *spinners* genéricos)
- **Notificaciones:** Sonner (*Toasts* para confirmaciones y *rollbacks* optimistas)
- **Validación de Datos:** Zod 3+ con inferencia estricta de esquemas
- **Autenticación:** NextAuth.js / Auth.js con soporte OAuth 2.0 (Google Auth y GitHub Auth) + proveedor seguro de evaluación docente
- **Pruebas Unitarias & Integración:** Vitest + React Testing Library + JSDOM (20 pruebas)
- **Pruebas End-to-End (E2E):** Playwright con Chromium Headless (3 flujos completos)
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml`) con bloqueo ante fallos

---

## 📋 Lista de Comprobación para el Evaluador

| # | Criterio de Verificación | Resultado / Procedimiento |
|---|---------------------------|----------------------------|
| **1** | **Autenticación OAuth 2.0** | Botones integrados de Google Auth y GitHub Auth. Acceso rápido con credenciales de auditor para pruebas sin llaves externas. |
| **2** | **Latencia SLA de Backend (<300ms)** | `GET /api/test/analytics?page=1&limit=50` responde en `< 10ms` (muy inferior al umbral de 300ms). |
| **3** | **Kanban D&D y Persistencia Optimista** | Tarjetas arrastrables entre columnas con actualización visual inmediata, notificación Toast y verificación en `GET /api/test/kanban-status`. |
| **4** | **Pipeline CI/CD en GitHub Actions** | Pipeline en verde configurado en `.github/workflows/ci.yml` ejecutando linter, typecheck, vitest y playwright. |

---

## 🛠️ Especificación de Endpoints Habilitados de Prueba (`/api/test/*`)

### 1. `GET /api/test/analytics`
Admite parámetros de consulta (`?page=1&limit=50`, `status`, `category`, `search`, etc.) y retorna métricas calculadas y pedidos paginados en menos de 300ms.

```bash
curl -X GET "http://localhost:3000/api/test/analytics?page=1&limit=50"
```

**Respuesta de ejemplo:**
```json
{
  "success": true,
  "slaPassed": true,
  "responseTimeMs": 1.45,
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 10,
    "totalPages": 1
  },
  "metrics": {
    "totalRevenue": 6635,
    "totalCost": 3845,
    "totalOrders": 10,
    "averageOrderValue": 663.5,
    "grossProfit": 2790,
    "grossMarginPercentage": 42.05,
    "ordersByStatus": {
      "pending": 3,
      "processing": 2,
      "shipped": 2,
      "delivered": 2,
      "cancelled": 1
    },
    "salesByCategory": {
      "electronics": 3690,
      "apparel": 320,
      "home": 1410,
      "beauty": 495,
      "sports": 740
    }
  }
}
```

### 2. `POST /api/test/reset-data`
Restablece la base de datos a un conjunto de prueba conocido y determinista para permitir la ejecución repetible de auditorías y pruebas E2E.

```bash
curl -X POST "http://localhost:3000/api/test/reset-data"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Base de datos de prueba restablecida exitosamente",
  "totalRecords": 10
}
```

### 3. `GET /api/test/kanban-status`
Permite consultar el estado actualizado de un pedido tras realizar un movimiento Drag & Drop.

```bash
# Consultar un pedido específico
curl -X GET "http://localhost:3000/api/test/kanban-status?orderId=ord-001"

# Consultar el resumen global de columnas
curl -X GET "http://localhost:3000/api/test/kanban-status"
```

**Respuesta para pedido específico:**
```json
{
  "success": true,
  "orderId": "ord-001",
  "orderNumber": "OMN-1001",
  "status": "processing",
  "customerName": "Carlos Mendoza",
  "totalAmount": 1250,
  "updatedAt": "2026-10-23T21:40:00.000Z"
}
```

---

## ⚡ Experiencia de Carga y Mutación Optimista (UI/UX)

1. **Skeletons en lugar de Spinners:**
   - Durante la carga de KPIs, gráficos de tendencias, tablas de pedidos y columnas Kanban, se renderizan componentes `Skeleton` con animación de pulso que respetan la geometría del contenido final.
2. **Mutación Optimista en Kanban:**
   - Al soltar una tarjeta o cambiar de columna, el estado en el cliente se actualiza en **0 ms**.
   - Se despacha una petición asíncrona a `PATCH /api/orders/[id]`.
   - Si la petición tiene éxito, se muestra una notificación Toast con Sonner confirmando el cambio.
   - En caso de fallo de red o error del servidor, se revierte automáticamente el estado (*Rollback*) y se notifica al usuario con un Toast de advertencia.
3. **Edición en Lote (Bulk Update):**
   - En la vista `/orders`, la selección de uno o varios checkboxes despliega una barra de acciones en lote fija.
   - Permite cambiar el estado masivo, la prioridad o eliminar registros simultáneamente con mutación optimista.

---

## 🧪 Suite de Pruebas Automatizadas

El proyecto incluye una cobertura integral de pruebas que supera los requisitos mínimos exigidos:

### 1. Pruebas Unitarias e Integración (Vitest)
Ubicadas en `tests/unit/`:
- **`financial.test.ts` (6 pruebas):** Ticket promedio (AOV), margen bruto absoluto, porcentaje de margen, ingresos netos con descuentos, y agregación financiera.
- **`formatters.test.ts` (4 pruebas):** Formateadores de moneda (USD, EUR, MXN), porcentajes con signo, y notación compacta (1.5K, 2.5M).
- **`schemas.test.ts` (4 pruebas):** Validación de esquemas Zod (`createOrderSchema`, `bulkUpdateOrdersSchema`, `analyticsQuerySchema`).
- **`filters.test.ts` (3 pruebas):** Filtrado por estado, búsqueda de texto (nombre, orden, producto), y algoritmo de paginación.
- **`audit-endpoints.test.ts` (3 pruebas):** Validación de SLA < 300ms, restablecimiento determinista, y lectura de estado Kanban.

Ejecución de pruebas unitarias:
```bash
npm run test
```

### 2. Flujos End-to-End Automatizados (Playwright)
Ubicados en `tests/e2e/`:
- **`01-auth.spec.ts` (Flujo 1):** Intento de navegación no autenticada a `/dashboard`, `/kanban` y `/orders` con verificación de redirección a `/login`. Comprobación de botones de OAuth (Google y GitHub) y simulación de sesión de auditor.
- **`02-creation.spec.ts` (Flujo 2):** Registro de nuevo producto/pedido mediante formulario modal y aserción de su reflejo inmediato en la tabla de operaciones.
- **`03-drag-and-drop.spec.ts` (Flujo 3):** Movimiento de tarjeta en el tablero Kanban, aserción de cambio de columna en la interfaz y verificación de persistencia en `/api/test/kanban-status`.

Ejecución de pruebas E2E:
```bash
npm run test:e2e
```

---

## ⚙️ Instrucciones de Despliegue en Producción

### Despliegue en Vercel
1. Conectar el repositorio de GitHub en el panel de [Vercel](https://vercel.com).
2. Configurar las variables de entorno en el panel de Vercel:
   - `NEXTAUTH_URL`: La URL pública asignada por Vercel (ej. `https://omnimarket-hub.vercel.app`).
   - `NEXTAUTH_SECRET`: Clave aleatoria (ej. `omnimarket-super-secret-evaluation-key-2026`).
   - `GOOGLE_CLIENT_ID`: ID de cliente OAuth de Google.
   - `GOOGLE_CLIENT_SECRET`: Secreto OAuth de Google.
   - `GITHUB_ID`: Client ID de GitHub OAuth.
   - `GITHUB_SECRET`: Client Secret de GitHub OAuth.
3. Desplegar. Vercel ejecutará automáticamente `npm run build` y dejará la aplicación en línea con SSL válido.

### Despliegue en Railway
1. Crear un nuevo servicio en [Railway](https://railway.app) a partir del repositorio.
2. Agregar las variables de entorno listadas en `.env.example`.
3. El comando de inicio es `npm run start` sobre el puerto predeterminado (`PORT=3000`).

---

## 💻 Ejecución Local

1. **Instalar dependencias:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env.local
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

4. **Credenciales del Evaluador Docente:**
   - **Correo:** `evaluador@omnimarket.com`
   - **Contraseña:** `auditor2026`
   - O presionar el botón directo: *"Ingresar como Evaluador Docente"*.
