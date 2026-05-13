#!/bin/bash

# Script para probar manualmente el upload de CV
# Ejecutar: ./scripts/test-upload-manual.sh

echo "🚀 Probando upload de CV manualmente..."
echo ""

# Verificar que el archivo existe
if [ ! -f "files/FawerV-CV.pdf" ]; then
    echo "❌ Error: El archivo files/FawerV-CV.pdf no existe"
    exit 1
fi

echo "📄 Archivo encontrado: files/FawerV-CV.pdf"
echo ""

# Verificar que el servidor está corriendo
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Error: El servidor Next.js no está corriendo en localhost:3000"
    echo "   Por favor, ejecuta: pnpm dev"
    exit 1
fi

echo "✅ Servidor detectado en http://localhost:3000"
echo ""

echo "📤 Subiendo CV..."
echo ""

# Hacer el request
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/cv/upload \
  -F "file=@files/FawerV-CV.pdf" \
  -F "title=Mi CV Profesional" \
  -F "userId=temp-user")

# Separar body y status code
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

echo "📊 Respuesta del servidor:"
echo ""

if [ "$http_code" = "200" ]; then
    echo "✅ Status: $http_code OK"
    echo ""
    echo "📋 Respuesta:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    echo "🎉 ¡CV subido exitosamente!"
else
    echo "❌ Status: $http_code ERROR"
    echo ""
    echo "📋 Respuesta de error:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    echo "💡 Tip: Asegúrate de que el usuario 'temp-user' existe en la base de datos"
    echo "   Ejecuta: pnpm tsx scripts/create-test-user.ts"
fi

echo ""
