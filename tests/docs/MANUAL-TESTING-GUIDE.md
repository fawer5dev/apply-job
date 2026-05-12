# 🧪 Guía de Pruebas Manuales del CV Upload

## Problema Identificado

El error que estás experimentando ocurre porque **el usuario no existe en la base de datos**:

```
Foreign key constraint violated: `base_cvs_userId_fkey (index)`
```

Esto sucede porque el código intenta crear un CV para un usuario que no existe en la tabla `users`.

---

## ✅ Soluciones Implementadas

### 1. Creación automática de usuario

Se ha actualizado el endpoint `/api/cv/upload` para **crear automáticamente el usuario** si no existe. Ahora el flujo es:

1. Se recibe el CV
2. Se parsea el archivo
3. **Se verifica si el usuario existe**
4. **Si no existe, se crea automáticamente**
5. Se guarda el CV

### 2. Script para crear usuario de prueba

Si prefieres tener el usuario creado previamente:

```bash
npx tsx scripts/create-test-user.ts
```

Este script crea un usuario con:

- **ID:** `temp-user`
- **Email:** `test@example.com`
- **Nombre:** Test User

---

## 🚀 Métodos de Prueba Manual

### Método 1: Usando el Formulario HTML (Recomendado)

1. **Asegúrate de que el servidor esté corriendo:**

   ```bash
   npm run dev
   ```

2. **Abre el formulario de prueba en tu navegador:**

   ```
   http://localhost:3000/test-upload.html
   ```

3. **Completa el formulario:**
   - **Título:** Nombre descriptivo para tu CV
   - **User ID:** Usa `temp-user` (se crea automáticamente si no existe)
   - **Archivo:** Selecciona tu archivo PDF

4. **Haz clic en "Subir y Procesar CV"**

5. **Espera 10-30 segundos** mientras la IA procesa el CV

✅ Deberías ver un mensaje de éxito con la información extraída del CV.

---

### Método 2: Usando cURL

```bash
# Ejecutar el script bash
./scripts/test-upload-manual.sh
```

O manualmente:

```bash
curl -X POST http://localhost:3000/api/cv/upload \
  -F "file=@files/FawerV-CV.pdf" \
  -F "title=Mi CV Profesional" \
  -F "userId=temp-user"
```

---

### Método 3: Usando Postman o Insomnia

1. **Método:** POST
2. **URL:** `http://localhost:3000/api/cv/upload`
3. **Body:** form-data con los siguientes campos:
   - `file`: Tu archivo PDF (type: File)
   - `title`: "Mi CV Profesional" (type: Text)
   - `userId`: "temp-user" (type: Text)

---

### Método 4: Usando el código del frontend (si existe)

Si ya tienes una página en tu app Next.js, simplemente usa el formulario existente.

---

## 🔍 Verificar que el CV se guardó

Después de subir el CV, puedes verificar que se guardó correctamente:

```bash
# Listar todos los CVs del usuario
curl http://localhost:3000/api/cv/upload?userId=temp-user | jq
```

O puedes conectarte a tu base de datos PostgreSQL y ejecutar:

```sql
-- Ver todos los CVs
SELECT id, title, "createdAt" FROM base_cvs;

-- Ver detalles de un CV específico
SELECT * FROM base_cvs WHERE "userId" = 'temp-user';
```

---

## 🐛 Solución de Problemas

### Error: "Foreign key constraint violated"

**Causa:** El usuario no existe en la base de datos.

**Solución:** Con el código actualizado, esto ya no debería ocurrir porque el usuario se crea automáticamente. Si persiste:

```bash
# Crear usuario manualmente
npx tsx scripts/create-test-user.ts
```

---

### Error: "DeprecationWarning: Buffer() is deprecated"

**Causa:** Advertencia de la librería `pdf-parse` que usa `Buffer()` en lugar de `Buffer.from()`.

**Solución:** Esto es solo una advertencia y no afecta la funcionalidad. Se puede ignorar. Para ocultarla:

```bash
# Ejecutar con la flag para ocultar deprecation warnings
NODE_NO_WARNINGS=1 npm run dev
```

O actualizar la librería `pdf-parse` cuando haya una nueva versión.

---

### Error: "GOOGLE_AI_API_KEY not configured"

**Causa:** La API key de Google AI no está configurada en `.env.local`.

**Solución:** Asegúrate de tener en `.env.local`:

```env
GOOGLE_AI_API_KEY="tu-api-key-aqui"
```

---

### El proceso toma demasiado tiempo (más de 60 segundos)

**Causa:** La API de Google AI puede estar lenta o hay un problema de red.

**Solución:**

- Verifica tu conexión a internet
- Verifica que la API key sea válida
- Prueba nuevamente en unos minutos

---

## 📊 Tiempos Esperados

| Operación                      | Tiempo Esperado    |
| ------------------------------ | ------------------ |
| Upload del archivo             | < 1 segundo        |
| Extracción de texto del PDF    | 1-2 segundos       |
| Parsing con IA (Google Gemini) | 10-30 segundos     |
| Guardado en base de datos      | < 1 segundo        |
| **TOTAL**                      | **15-35 segundos** |

---

## ✨ Resultado Esperado

Cuando todo funcione correctamente, deberías recibir una respuesta JSON como esta:

```json
{
  "success": true,
  "baseCV": {
    "id": "clxxx...",
    "title": "Mi CV Profesional",
    "personalInfo": {
      "name": "FAWER VARGAS",
      "email": "fawer5@hotmail.com",
      "phone": "...",
      "location": "..."
    },
    "summary": "...",
    "experience": [...],
    "education": [...],
    "skills": {
      "technical": [...],
      "soft": [...],
      "languages": [...]
    },
    "projects": [...],
    "certifications": [...]
  }
}
```

---

## 🎯 Siguiente Paso: Probar el Flujo Completo

Una vez que el CV se haya cargado exitosamente, puedes probar el flujo completo de generación de aplicación:

```bash
# Este script carga un CV, crea un job listing, y genera una aplicación
npx tsx scripts/test-complete-cv-flow.ts
```

---

## 📝 Notas Importantes

1. **Usuario temporal:** El `userId` "temp-user" es temporal. En producción, esto se reemplazará con autenticación real.

2. **Limpieza de datos:** Si haces muchas pruebas, puedes limpiar los CVs de prueba:

   ```sql
   DELETE FROM base_cvs WHERE "userId" = 'temp-user';
   ```

3. **Archivos soportados:** El sistema acepta PDF, DOCX y TXT. Los mejores resultados se obtienen con PDF.

4. **Costo de IA:** Cada parsing consume tokens de la API de Google Gemini. Usa con moderación durante las pruebas.

---

## 🆘 ¿Necesitas Ayuda?

Si sigues teniendo problemas:

1. Verifica los logs de la consola del servidor (`npm run dev`)
2. Revisa los logs del navegador (F12 → Console)
3. Verifica la conexión a la base de datos:
   ```bash
   npx prisma studio
   ```
4. Ejecuta el test completo para ver dónde falla:
   ```bash
   npx tsx scripts/test-complete-cv-flow.ts
   ```

---

**Última actualización:** 1 de Mayo, 2026
