# 🔧 Troubleshooting: New Application Errors

## Páginas Creadas

He creado las siguientes páginas que faltaban:

### 1. ✅ Lista de Aplicaciones

**Ruta:** `/dashboard/applications`  
**Archivo:** `src/app/[locale]/dashboard/applications/page.tsx`

**Funcionalidad:**

- Muestra todas las aplicaciones del usuario
- Filtros por estado
- Métricas de ATS Score y Match Score
- Link para crear nueva aplicación

### 2. ✅ Detalle de Aplicación

**Ruta:** `/dashboard/applications/[id]`  
**Archivo:** `src/app/[locale]/dashboard/applications/[id]/page.tsx`

**Funcionalidad:**

- Muestra el CV personalizado generado
- Muestra la Cover Letter
- Muestra la descripción del trabajo
- Métricas de ATS y Match
- Botones para descargar documentos

### 3. ✅ API Endpoint para Aplicación Individual

**Ruta:** `/api/application/[id]`  
**Archivo:** `src/app/api/application/[id]/route.ts`

**Métodos:**

- `GET` - Obtener aplicación específica
- `PATCH` - Actualizar estado de aplicación
- `DELETE` - Eliminar aplicación

---

## Cómo Probar las Páginas

### 1. Verificar que el servidor esté corriendo

```bash
npm run dev
```

Deberías ver:

```
✓ Ready in X.Xs
○ Local:   http://localhost:3000
```

### 2. Probar las rutas

#### a) Lista de aplicaciones

```
http://localhost:3000/en/dashboard/applications
```

o

```
http://localhost:3000/es/dashboard/applications
```

#### b) Nueva aplicación

```
http://localhost:3000/en/dashboard/applications/new
```

#### c) Detalle de aplicación (usando el ID del test)

```
http://localhost:3000/en/dashboard/applications/cmomjzigm0004quy4ddk0m6vm
```

---

## Errores Comunes y Soluciones

### Error 1: "Page not found" o 404

**Causa:** El servidor de Next.js necesita reiniciarse para detectar las nuevas páginas.

**Solución:**

1. Detener el servidor (Ctrl+C)
2. Reiniciar:
   ```bash
   npm run dev
   ```

### Error 2: "No applications yet"

**Causa:** No hay aplicaciones en la base de datos para el usuario.

**Solución:**

1. Ejecuta el test para crear una aplicación de prueba:

   ```bash
   npx tsx scripts/test-new-application.ts
   ```

2. O crea una manualmente desde la UI:
   ```
   http://localhost:3000/en/dashboard/applications/new
   ```

### Error 3: Errores al crear nueva aplicación

**Posibles causas:**

#### a) No hay CVs base

**Error:** "You don't have base CVs. Upload one first."

**Solución:**

1. Ve a: `http://localhost:3000/en/test-upload`
2. Sube tu CV
3. Vuelve a intentar crear la aplicación

#### b) Error en el análisis del job

**Error:** "Error analyzing job offer"

**Solución:**

1. Verifica que la API key de Google AI esté configurada:

   ```bash
   grep GOOGLE_AI_API_KEY .env.local
   ```

2. Verifica que el modelo esté disponible:

   ```bash
   npx tsx scripts/check-models.ts
   ```

3. Revisa los logs del servidor en la terminal donde corre `npm run dev`

#### c) Error generando la aplicación

**Error:** "Error generating application"

**Posibles causas:**

- Timeout de la IA (proceso muy lento)
- Error de parsing de JSON
- Base de datos desconectada

**Solución:**

1. Revisa los logs del servidor
2. Verifica la conexión a la base de datos:

   ```bash
   npx prisma studio
   ```

3. Si el error es de JSON parsing, ya está corregido con el modelo Pro

### Error 4: "Failed to parse JSON response"

**Causa:** La respuesta de la IA es muy larga o tiene formato inválido.

**Solución:** Ya aplicada ✅

- Cambiado a Gemini 2.5 Pro
- Aumentado maxTokens a 8000
- Mejorado cleaning de JSON

### Error 5: "Foreign key constraint violated"

**Causa:** El usuario no existe en la base de datos.

**Solución:** Ya aplicada ✅

- El código ahora crea automáticamente el usuario si no existe
- Ver: `src/app/api/cv/upload/route.ts`

---

## Verificar que Todo Funciona

### Test Rápido Completo

```bash
# 1. Crear usuario de prueba (si no existe)
npx tsx scripts/create-test-user.ts

# 2. Subir un CV de prueba
# Ve a: http://localhost:3000/en/test-upload
# Sube el archivo files/FawerV-CV.pdf

# 3. Crear aplicación de prueba completa
npx tsx scripts/test-new-application.ts

# 4. Ver la aplicación en la UI
# Ve a: http://localhost:3000/en/dashboard/applications
```

---

## Endpoints API Disponibles

### CVs

- `POST /api/cv/upload` - Subir y parsear CV
- `GET /api/cv/upload?userId=temp-user` - Listar CVs del usuario

### Jobs

- `POST /api/job/analyze` - Analizar oferta de trabajo
- `GET /api/job/analyze` - Listar trabajos analizados

### Applications

- `POST /api/application/create` - Crear nueva aplicación
- `GET /api/application/create?userId=temp-user` - Listar aplicaciones del usuario
- `GET /api/application/[id]` - Obtener aplicación específica
- `PATCH /api/application/[id]` - Actualizar aplicación
- `DELETE /api/application/[id]` - Eliminar aplicación

---

## Verificar Base de Datos

### Usando Prisma Studio

```bash
npx prisma studio
```

Esto abre una UI en el navegador donde puedes ver:

- Tabla `users` - Usuarios
- Tabla `base_cvs` - CVs base
- Tabla `job_listings` - Ofertas de trabajo
- Tabla `applications` - Aplicaciones
- Tabla `cover_letters` - Cover letters

### Usando SQL directo

```bash
# Conéctate a tu base de datos PostgreSQL
# Verifica que existan aplicaciones
SELECT id, status, "atsScore", "createdAt" FROM applications LIMIT 5;

# Verifica que existan CVs
SELECT id, title, "userId" FROM base_cvs LIMIT 5;

# Verifica que existan jobs
SELECT id, title, company FROM job_listings LIMIT 5;
```

---

## Logs Útiles

### Ver logs del servidor Next.js

Los logs aparecen en la terminal donde ejecutaste `npm run dev`

Busca:

- ✅ `Analyzing job description with AI...`
- ✅ `Parsing CV...`
- ❌ `Error analyzing job:`
- ❌ `Error processing CV:`

### Ver logs de Prisma

Los logs de queries de Prisma aparecen automáticamente si hay errores.

Para ver todas las queries:

```bash
# En .env.local, añade:
DATABASE_URL="postgresql://...?connection_limit=5&pool_timeout=0"
DEBUG="prisma:*"
```

---

## Estructura de Archivos Creados/Modificados

```
src/
├── app/
│   ├── [locale]/
│   │   └── dashboard/
│   │       └── applications/
│   │           ├── page.tsx           ← NUEVO: Lista de aplicaciones
│   │           ├── [id]/
│   │           │   └── page.tsx       ← NUEVO: Detalle de aplicación
│   │           └── new/
│   │               └── page.tsx       ← Ya existía
│   └── api/
│       ├── application/
│       │   ├── create/route.ts        ← Ya existía
│       │   └── [id]/route.ts          ← NUEVO: API para aplicación individual
│       ├── cv/upload/route.ts         ← Modificado: Auto-crea usuario
│       └── job/analyze/route.ts       ← Ya existía
│
└── lib/ai/
    ├── google-ai.ts                   ← Modificado: Mejor JSON parsing, modelo Pro
    └── cv-generator.ts                ← Modificado: Más tokens

scripts/
├── test-new-application.ts            ← NUEVO: Test completo del flujo
├── create-test-user.ts                ← NUEVO: Crear usuario de prueba
└── test-complete-cv-flow.ts           ← Ya existía

TEST-NEW-APPLICATION-RESULTS.md        ← NUEVO: Documentación de resultados
MANUAL-TESTING-GUIDE.md                ← Ya existía
```

---

## Siguiente Paso

**Por favor dime:**

1. ¿Qué error específico ves cuando intentas crear una nueva aplicación?
2. ¿En qué paso falla? (¿Al analizar el job? ¿Al generar la aplicación?)
3. ¿Puedes copiar el error completo que aparece en la consola del navegador (F12) o en los logs del servidor?

Con esa información puedo ayudarte a resolver el problema específico.

---

**Última actualización:** 1 de Mayo, 2026
