# Error Handling System - Clean Architecture

Este documento describe el sistema de manejo de errores implementado siguiendo los principios de arquitectura limpia para asegurar una comunicación consistente entre el backend y el frontend.

## 📋 Resumen del Sistema

El sistema de manejo de errores está diseñado para:
- Proporcionar respuestas consistentes y predecibles
- Facilitar el manejo de errores en el frontend
- Seguir los principios de arquitectura limpia
- Incluir información detallada para debugging

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos
```
src/
├── shared/
│   ├── errors/
│   │   ├── CustomError.ts          # Clase base para errores personalizados
│   │   ├── BadRequestError.ts      # Error 400 - Solicitud incorrecta
│   │   ├── NotFoundError.ts        # Error 404 - Recurso no encontrado
│   │   ├── UnauthorizedError.ts    # Error 401 - No autorizado
│   │   ├── ForbiddenError.ts       # Error 403 - Prohibido
│   │   └── index.ts                # Exportaciones centralizadas
│   └── responses/
│       └── ApiResponse.ts          # Utilidades para respuestas consistentes
└── presentation/
    └── middlewares/
        └── errorHandler.ts         # Middleware centralizado de errores
```

## 📝 Formato de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación completada exitosamente",
  "timestamp": "2025-01-11T16:00:00.000Z",
  "path": "/api/users",
  "method": "GET"
}
```

### Respuesta de Error
```json
{
  "success": false,
  "errors": [
    {
      "message": "El email ya está registrado",
      "field": "email"
    }
  ],
  "timestamp": "2025-01-11T16:00:00.000Z",
  "path": "/api/users/register",
  "method": "POST"
}
```

## 🚨 Tipos de Errores

### 1. BadRequestError (400)
**Cuándo usarlo:** Validación de datos, parámetros faltantes, formato incorrecto
```typescript
throw new BadRequestError('El email es requerido');
```

### 2. NotFoundError (404)
**Cuándo usarlo:** Recurso no encontrado en la base de datos
```typescript
throw new NotFoundError('Usuario no encontrado');
```

### 3. UnauthorizedError (401)
**Cuándo usarlo:** Usuario no autenticado o token inválido
```typescript
throw new UnauthorizedError('Token de autenticación requerido');
```

### 4. ForbiddenError (403)
**Cuándo usarlo:** Usuario autenticado pero sin permisos suficientes
```typescript
throw new ForbiddenError('No tienes permisos para esta acción');
```

## 💻 Uso en Controladores

### Ejemplo Básico
```typescript
import { BadRequestError, NotFoundError } from '../../shared/errors';
import { ResponseHandler } from '../../shared/responses/ApiResponse';

export class UserController {
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('ID de usuario es requerido');
      }

      const userId = parseInt(id);
      if (isNaN(userId)) {
        throw new BadRequestError('ID de usuario inválido');
      }

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      const response = ResponseHandler.success(user, 'Usuario encontrado');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      // El error será manejado por el middleware errorHandler
      throw error;
    }
  }
}
```

### Ejemplo con Validación Compleja
```typescript
static async register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    // Validaciones
    if (!email || !password || !name) {
      throw new BadRequestError('Email, contraseña y nombre son requeridos');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError('Formato de email inválido');
    }

    // Validar fortaleza de contraseña
    if (password.length < 6) {
      throw new BadRequestError('La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar si el usuario ya existe
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestError('Ya existe un usuario con este email');
    }

    // Crear usuario...
    const user = await userRepository.save(newUser);

    const response = ResponseHandler.success(
      { user, token },
      'Usuario registrado exitosamente',
      201
    );
    response.response.path = req.path;
    response.response.method = req.method;
    res.status(response.statusCode).json(response.response);
  } catch (error) {
    throw error;
  }
}
```

## 🌐 Integración con Frontend

### JavaScript/TypeScript - Fetch API
```javascript
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!data.success) {
      // Manejar errores
      const error = data.errors[0]; // Tomar el primer error
      throw new Error(error.message);
    }

    return data.data; // Retornar solo los datos
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
}

// Uso
try {
  const user = await apiCall('/users/profile');
  console.log('Usuario:', user);
} catch (error) {
  alert(error.message); // Mostrar mensaje de error al usuario
}
```

### React - Custom Hook
```javascript
import { useState, useCallback } from 'react';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!data.success) {
        const apiError = data.errors[0];
        setError(apiError.message);
        throw new Error(apiError.message);
      }

      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error };
}

// Uso en componente
function UserProfile() {
  const { call, loading, error } = useApi();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await call('/users/profile');
        setUser(userData);
      } catch (err) {
        // Error ya está manejado por el hook
      }
    };

    fetchUser();
  }, [call]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>Bienvenido, {user?.name}</div>;
}
```

### Vue.js - Composables
```javascript
import { ref, computed } from 'vue';

export function useApi() {
  const loading = ref(false);
  const error = ref(null);

  const call = async (endpoint, options = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!data.success) {
        const apiError = data.errors[0];
        error.value = apiError.message;
        throw new Error(apiError.message);
      }

      return data.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    call,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    clearError: () => error.value = null
  };
}

// Uso en componente Vue
<script setup>
import { useApi } from '@/composables/useApi';

const { call, loading, error, clearError } = useApi();
const user = ref(null);

const fetchUser = async () => {
  try {
    user.value = await call('/users/profile');
  } catch (err) {
    // Error manejado automáticamente
  }
};

onMounted(fetchUser);
</script>

<template>
  <div v-if="loading">Cargando...</div>
  <div v-else-if="error">
    Error: {{ error }}
    <button @click="clearError">Reintentar</button>
  </div>
  <div v-else>
    Bienvenido, {{ user?.name }}
  </div>
</template>
```

### Angular - Service
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  path: string;
  method: string;
}

export interface ApiError {
  success: false;
  errors: { message: string; field?: string }[];
  timestamp: string;
  path: string;
  method: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
  }

  call<T>(endpoint: string, options: any = {}): Observable<T> {
    return this.http.request<ApiResponse<T>>('GET', `/api${endpoint}`, {
      headers: this.getHeaders(),
      ...options
    }).pipe(
      map(response => {
        if (!response.success) {
          const error = response as ApiError;
          throw new Error(error.errors[0].message);
        }
        return response.data!;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = error.error.message;
    } else if (error.error && !error.error.success) {
      // Error del backend
      errorMessage = error.error.errors[0].message;
    } else {
      // Error de HTTP
      errorMessage = `Código de error: ${error.status}`;
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

// Uso en componente
@Component({...})
export class UserProfileComponent {
  user: any = null;
  loading = false;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchUser();
  }

  fetchUser() {
    this.loading = true;
    this.error = null;

    this.apiService.call('/users/profile').subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}
```

## 📊 Códigos de Estado HTTP

| Código | Error Class | Descripción |
|--------|-------------|-------------|
| 400 | BadRequestError | Datos inválidos, parámetros faltantes |
| 401 | UnauthorizedError | No autenticado, token inválido/expirado |
| 403 | ForbiddenError | Autenticado pero sin permisos |
| 404 | NotFoundError | Recurso no encontrado |
| 409 | - | Conflicto (manejado automáticamente por DB) |
| 422 | - | Entidad no procesable (validaciones) |
| 500 | - | Error interno del servidor |

## 🔧 Manejo Automático de Errores

### Errores de Base de Datos
- **Claves duplicadas**: Se convierten automáticamente en error 409
- **Violaciones de clave foránea**: Se convierten en error 400 con mensaje descriptivo

### Errores de JWT
- **Token inválido**: Error 401 con mensaje "Invalid token"
- **Token expirado**: Error 401 con mensaje "Token expired"

### Errores de Validación
- **Campos requeridos faltantes**: BadRequestError con mensaje específico
- **Formatos inválidos**: BadRequestError con validación detallada

## 🎯 Mejores Prácticas

### Para Backend Developers
1. **Usar errores específicos**: Elegir la clase de error más apropiada
2. **Mensajes descriptivos**: Proporcionar mensajes claros y útiles
3. **Validación temprana**: Validar datos lo antes posible
4. **Logging adecuado**: Registrar errores para debugging
5. **No exponer datos sensibles**: No incluir información interna en mensajes de error

### Para Frontend Developers
1. **Manejar todos los estados**: Loading, success, error
2. **Mostrar mensajes amigables**: Convertir errores técnicos en mensajes comprensibles
3. **Reintentar automáticamente**: Para errores temporales (500, timeouts)
4. **Validación del lado del cliente**: Prevenir errores comunes
5. **Logging de errores**: Registrar errores para análisis

## 📈 Beneficios del Sistema

- **Consistencia**: Todas las respuestas siguen el mismo formato
- **Predecibilidad**: Los frontend saben exactamente qué esperar
- **Mantenibilidad**: Fácil de extender con nuevos tipos de error
- **Debugging**: Información detallada para desarrollo
- **Experiencia de usuario**: Mensajes de error claros y útiles
- **Separación de responsabilidades**: Backend maneja lógica, frontend maneja UI

Este sistema asegura una comunicación robusta y confiable entre el backend y el frontend, facilitando el desarrollo y mantenimiento de aplicaciones escalables.
