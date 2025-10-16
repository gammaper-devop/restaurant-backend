#!/bin/bash

echo "🚀 Iniciando despliegue..."

# Actualizar dependencias
npm ci

# Compilar TypeScript
npm run build

# Configurar PM2 (proceso manager)
npm install -g pm2

# Crear archivo ecosystem para PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'restaurant-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Detener procesos anteriores
pm2 delete restaurant-api 2>/dev/null || true

# Iniciar aplicación
pm2 start ecosystem.config.js

# Configurar inicio automático
pm2 save
pm2 startup

echo "✅ Despliegue completado!"
echo "📊 Ver logs: pm2 logs restaurant-api"
echo "🔍 Ver status: pm2 status"