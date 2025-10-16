#!/bin/bash

# Script para probar el sistema de logging de errores
# Este script genera varios tipos de errores para verificar que se registren correctamente

BASE_URL="http://localhost:3000"
TOKEN="" # Reemplaza con un token JWT válido

echo "🧪 Probando Sistema de Logging de Errores"
echo "=========================================="

# Función para hacer requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3

    if [ "$method" = "GET" ]; then
        curl -s -X GET \
             -H "Authorization: Bearer $TOKEN" \
             "$BASE_URL$endpoint"
    else
        curl -s -X $method \
             -H "Authorization: Bearer $TOKEN" \
             -H "Content-Type: application/json" \
             -d "$data" \
             "$BASE_URL$endpoint"
    fi
}

echo "1️⃣ Probando errores de validación..."
echo "   Enviando request con datos inválidos a /api/restaurants"

make_request "POST" "/api/restaurants" '{
  "name": "",
  "category": "invalid"
}' > /dev/null

echo "2️⃣ Probando errores de autenticación..."
echo "   Enviando request sin token a /api/users/profile"

curl -s -X GET "$BASE_URL/api/users/profile" > /dev/null

echo "3️⃣ Probando errores de autorización..."
echo "   Enviando request con token inválido"

curl -s -X GET \
     -H "Authorization: Bearer invalid.token.here" \
     "$BASE_URL/api/users/profile" > /dev/null

echo "4️⃣ Probando errores de recursos no encontrados..."
echo "   Buscando restaurante con ID inexistente"

make_request "GET" "/api/restaurants/99999" > /dev/null

echo "5️⃣ Probando errores de base de datos..."
echo "   Intentando crear usuario duplicado"

# Primero crear un usuario
make_request "POST" "/api/users/register" '{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}' > /dev/null

# Intentar crear el mismo usuario nuevamente
make_request "POST" "/api/users/register" '{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}' > /dev/null

echo ""
echo "📊 Verificando logs de error generados..."
echo "=========================================="

# Obtener estadísticas de errores
echo "Estadísticas de errores:"
make_request "GET" "/api/error-logs/statistics" | jq '.data' 2>/dev/null || echo "Instala jq para ver JSON formateado"

echo ""
echo "Logs de error recientes:"
make_request "GET" "/api/error-logs?limit=5" | jq '.data.logs[] | {id, message, severity, category, timestamp}' 2>/dev/null || echo "Instala jq para ver JSON formateado"

echo ""
echo "✅ Pruebas completadas!"
echo ""
echo "📋 Resumen de pruebas realizadas:"
echo "   • Error de validación (datos inválidos)"
echo "   • Error de autenticación (sin token)"
echo "   • Error de autorización (token inválido)"
echo "   • Error 404 (recurso no encontrado)"
echo "   • Error de base de datos (usuario duplicado)"
echo ""
echo "🔍 Revisa los logs en: $BASE_URL/api-docs"
echo "   Endpoint: /api/error-logs"
echo ""
echo "🧹 Para limpiar los logs de prueba:"
echo "   curl -X DELETE -H \"Authorization: Bearer \$TOKEN\" \"$BASE_URL/api/error-logs/cleanup?daysToKeep=0\""
