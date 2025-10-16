# Error Logging System - Seguimiento de Errores

Este documento describe el sistema completo de seguimiento y logging de errores implementado siguiendo los principios de arquitectura limpia.

## 📋 Resumen del Sistema

El sistema de logging de errores está diseñado para:
- ✅ Registrar automáticamente todos los errores que ocurren en la aplicación
- ✅ Proporcionar información detallada para debugging y monitoreo
- ✅ Permitir consultas y filtrado de logs de error
- ✅ Ofrecer estadísticas y métricas de errores
- ✅ Facilitar el seguimiento de resolución de problemas
- ✅ Mantener un historial completo de incidentes

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos
```
src/
├── domain/
│   └── entities/
│       └── ErrorLog.ts                    # Entidad de base de datos
├── application/
│   └── services/
│       └── ErrorLoggingService.ts         # Servicio de aplicación
├── presentation/
│   ├── controllers/
│   │   └── ErrorLogController.ts          # Controlador REST
│   ├── routes/
│   │   └── errorLogRoutes.ts              # Rutas de API
│   └── middlewares/
│       └── errorHandler.ts                # Middleware de captura
└── shared/
    └── errors/
        ├── CustomError.ts                 # Clase base de errores
        ├── BadRequestError.ts
        ├── NotFoundError.ts
        ├── UnauthorizedError.ts
        └── ForbiddenError.ts
```

## 📊 Base de Datos - Tabla `error_logs`

### Estructura de la Tabla
```sql
CREATE TABLE error_logs (
  id VARCHAR(36) PRIMARY KEY,
  message VARCHAR(500) NOT NULL,
  stack_trace TEXT,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  category ENUM('authentication', 'authorization', 'validation', 'database', 'external_api', 'business_logic', 'system', 'network', 'unknown') DEFAULT 'unknown',
  status_code VARCHAR(10) NOT NULL,
  endpoint VARCHAR(500),
  method VARCHAR(10),
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  user_id VARCHAR(255),
  request_body JSON,
  request_headers JSON,
  error_context JSON,
  error_code VARCHAR(100),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  resolved_by VARCHAR(255),
  resolution_notes TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  service_name VARCHAR(100),
  service_version VARCHAR(100),
  environment_info JSON,

  INDEX idx_timestamp_severity (timestamp, severity),
  INDEX idx_user_id (user_id),
  INDEX idx_endpoint (endpoint)
);
```

### Campos Importantes
- **severity**: Nivel de criticidad (low, medium, high, critical)
- **category**: Categoría del error (authentication, database, system, etc.)
- **is_resolved**: Indica si el error ha sido resuelto
- **resolved_by**: Usuario que resolvió el error
- **resolution_notes**: Notas sobre la resolución

## 🚨 Captura Automática de Errores

### Middleware de Error Handler
Todos los errores son capturados automáticamente por el middleware `errorHandler.ts`:

```typescript
// Captura errores personalizados
if (err instanceof CustomError) {
  await errorLoggingService.logError({
    message: errorMessage,
    statusCode,
    endpoint: req.path,
    method: req.method,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    userId,
    requestBody: req.method !== 'GET' ? req.body : undefined,
    requestHeaders: req.headers,
    errorCode: err.constructor.name,
  });
}

// Captura errores de JWT
if (err.name === 'JsonWebTokenError') {
  // Logging específico para JWT
}

// Captura errores de base de datos
if (err.message.includes('duplicate key value')) {
  // Logging específico para DB
}
```

### Información Capturada Automáticamente
- ✅ Mensaje de error
- ✅ Stack trace completo
- ✅ Código de estado HTTP
- ✅ Endpoint y método HTTP
- ✅ Dirección IP del cliente
- ✅ User Agent
- ✅ ID del usuario (si está autenticado)
- ✅ Cuerpo de la petición (para POST/PUT)
- ✅ Headers de la petición
- ✅ Información del entorno (Node.js, plataforma, etc.)
- ✅ Timestamp preciso

## 📡 API Endpoints - Gestión de Logs

### 1. Obtener Logs de Error
```http
GET /api/error-logs
Authorization: Bearer {token}
```

**Parámetros de consulta:**
- `severity`: Filtrar por severidad (low, medium, high, critical)
- `category`: Filtrar por categoría
- `userId`: Filtrar por usuario
- `endpoint`: Filtrar por endpoint
- `isResolved`: Filtrar por estado de resolución
- `startDate`: Fecha de inicio (ISO format)
- `endDate`: Fecha de fin (ISO format)
- `limit`: Número de resultados (1-1000, default: 50)
- `offset`: Desplazamiento para paginación

**Ejemplo:**
```bash
curl -H "Authorization: Bearer eyJ..." \
  "http://localhost:3000/api/error-logs?severity=critical&limit=10"
```

### 2. Obtener Estadísticas de Errores
```http
GET /api/error-logs/statistics
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalErrors": 150,
    "errorsBySeverity": {
      "low": 45,
      "medium": 67,
      "high": 25,
      "critical": 13
    },
    "errorsByCategory": {
      "database": 40,
      "system": 35,
      "validation": 30,
      "authentication": 25,
      "network": 20
    },
    "recentErrors": [...],
    "unresolvedErrors": 23
  }
}
```

### 3. Obtener Log Específico
```http
GET /api/error-logs/{id}
Authorization: Bearer {token}
```

### 4. Marcar Error como Resuelto
```http
PUT /api/error-logs/{id}/resolve
Authorization: Bearer {token}
Content-Type: application/json

{
  "resolutionNotes": "Fixed by updating database connection string"
}
```

### 5. Limpiar Logs Antiguos
```http
DELETE /api/error-logs/cleanup?daysToKeep=90
Authorization: Bearer {token}
```

## 📊 Dashboard y Monitoreo

### Métricas Disponibles
- **Total de errores** por período
- **Errores por severidad** (gráfico de barras)
- **Errores por categoría** (gráfico circular)
- **Tendencia de errores** (gráfico de líneas)
- **Errores no resueltos** (contador)
- **Errores recientes** (últimas 24 horas)

### Alertas Recomendadas
- ❌ Más de 10 errores críticos en 1 hora
- ⚠️ Más de 50 errores de alta severidad en 24 horas
- 🔄 Errores sin resolver por más de 7 días
- 📈 Aumento del 50% en errores respecto al día anterior

## 🔍 Consultas Útiles para Debugging

### Errores Críticos Recientes
```sql
SELECT * FROM error_logs
WHERE severity = 'critical'
  AND timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```

### Errores por Usuario
```sql
SELECT user_id, COUNT(*) as error_count
FROM error_logs
WHERE user_id IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY error_count DESC;
```

### Errores por Endpoint
```sql
SELECT endpoint, COUNT(*) as error_count
FROM error_logs
WHERE endpoint IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY endpoint
ORDER BY error_count DESC;
```

## 🎯 Casos de Uso

### 1. Monitoreo en Tiempo Real
- Dashboard con métricas actualizadas cada 5 minutos
- Alertas automáticas por email/Slack
- Notificaciones push para errores críticos

### 2. Análisis Post-Mortem
- Revisar logs después de incidentes
- Identificar patrones de error
- Mejorar la estabilidad del sistema

### 3. Soporte al Usuario
- Buscar errores específicos por usuario
- Ver contexto completo de errores
- Proporcionar soporte proactivo

### 4. Mantenimiento
- Limpiar logs antiguos automáticamente
- Archivar logs históricos
- Generar reportes mensuales

## 🔧 Configuración y Mantenimiento

### Variables de Entorno
```env
# Logging Configuration
LOG_RETENTION_DAYS=90
LOG_MAX_FILE_SIZE=100MB
LOG_COMPRESSION=gzip

# Alert Thresholds
ALERT_CRITICAL_ERRORS_PER_HOUR=10
ALERT_HIGH_ERRORS_PER_DAY=50
ALERT_UNRESOLVED_ERRORS_DAYS=7
```

### Tareas de Mantenimiento
```bash
# Limpiar logs antiguos (ejecutar semanalmente)
curl -X DELETE \
  -H "Authorization: Bearer {admin-token}" \
  "http://localhost:3000/api/error-logs/cleanup?daysToKeep=90"

# Backup de logs (ejecutar diariamente)
pg_dump -t error_logs restaurant_db > error_logs_backup.sql
```

## 📈 Beneficios del Sistema

### Para Desarrolladores
- ✅ **Debugging más rápido** con información completa
- ✅ **Rastreo de errores** desde el frontend hasta la base de datos
- ✅ **Contexto completo** de cada error
- ✅ **Historial de incidentes** para análisis

### Para DevOps/SRE
- ✅ **Monitoreo proactivo** de la salud del sistema
- ✅ **Alertas automáticas** para problemas críticos
- ✅ **Métricas detalladas** para dashboards
- ✅ **Capacidad de respuesta** inmediata a incidentes

### Para el Negocio
- ✅ **Mayor uptime** del sistema
- ✅ **Mejor experiencia** de usuario
- ✅ **Resolución rápida** de problemas
- ✅ **Transparencia** en el estado del sistema

## 🚀 Próximos Pasos

### Mejoras Sugeridas
1. **Integración con herramientas externas:**
   - Sentry para error tracking avanzado
   - DataDog/New Relic para monitoreo
   - Slack/Teams para notificaciones

2. **Machine Learning:**
   - Detección automática de anomalías
   - Predicción de errores basados en patrones
   - Clasificación automática de severidad

3. **Dashboards Avanzados:**
   - Gráficos en tiempo real
   - Filtros avanzados
   - Exportación de reportes

4. **Integración con CI/CD:**
   - Alertas en pipelines de deployment
   - Rollbacks automáticos en caso de errores

Este sistema proporciona una base sólida para el monitoreo y debugging de la aplicación, asegurando una respuesta rápida y efectiva ante cualquier problema que pueda surgir en producción.
