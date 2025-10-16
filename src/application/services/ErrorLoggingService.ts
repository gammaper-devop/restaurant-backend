import { getRepository } from 'typeorm';
import { ErrorLog, ErrorSeverity, ErrorCategory } from '../../domain/entities/ErrorLog';

export interface ErrorLogData {
  message: string;
  stackTrace?: string | undefined;
  statusCode: number;
  endpoint?: string | undefined;
  method?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  userId?: string | undefined;
  requestBody?: any;
  requestHeaders?: any;
  errorContext?: any;
  errorCode?: string | undefined;
  serviceName?: string | undefined;
  serviceVersion?: string | undefined;
  environmentInfo?: any;
}

export class ErrorLoggingService {
  private errorLogRepository = getRepository(ErrorLog);

  /**
   * Registra un error en la base de datos
   */
  async logError(errorData: ErrorLogData): Promise<void> {
    try {
      const errorLogData: any = {
        message: errorData.message,
        severity: ErrorLog.getSeverityFromStatusCode(errorData.statusCode),
        category: this.determineCategory(errorData),
        statusCode: errorData.statusCode.toString(),
        serviceName: errorData.serviceName || 'restaurant-api',
        serviceVersion: errorData.serviceVersion || '1.0.0',
        environmentInfo: errorData.environmentInfo || this.getEnvironmentInfo(),
      };

      // Only add optional fields if they have values
      if (errorData.stackTrace) errorLogData.stackTrace = errorData.stackTrace;
      if (errorData.endpoint) errorLogData.endpoint = errorData.endpoint;
      if (errorData.method) errorLogData.method = errorData.method;
      if (errorData.ipAddress) errorLogData.ipAddress = errorData.ipAddress;
      if (errorData.userAgent) errorLogData.userAgent = errorData.userAgent;
      if (errorData.userId) errorLogData.userId = errorData.userId;
      if (errorData.requestBody) errorLogData.requestBody = errorData.requestBody;
      if (errorData.requestHeaders) errorLogData.requestHeaders = errorData.requestHeaders;
      if (errorData.errorContext) errorLogData.errorContext = errorData.errorContext;
      if (errorData.errorCode) errorLogData.errorCode = errorData.errorCode;

      const errorLogEntity = this.errorLogRepository.create(errorLogData);

      const savedErrorLog = await this.errorLogRepository.save(errorLogEntity);

      // Log adicional para monitoreo en producción
      console.error(`[ERROR_LOGGED] Error saved successfully with message: ${errorData.message}`);

    } catch (loggingError) {
      // Si falla el logging, no queremos que esto cause más errores
      console.error('[ERROR_LOGGING_FAILED]', loggingError);
    }
  }

  /**
   * Obtiene información del entorno para contexto
   */
  private getEnvironmentInfo(): any {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      environment: process.env.NODE_ENV || 'development',
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };
  }

  /**
   * Determina la categoría del error basado en la información disponible
   */
  private determineCategory(errorData: ErrorLogData): ErrorCategory {
    // Si hay stackTrace, probablemente es un error del sistema
    if (errorData.stackTrace) {
      return ErrorCategory.SYSTEM;
    }

    // Determinar por endpoint
    if (errorData.endpoint?.includes('/auth') || errorData.endpoint?.includes('/login')) {
      return ErrorCategory.AUTHENTICATION;
    }

    // Determinar por código de estado
    if (errorData.statusCode === 401 || errorData.statusCode === 403) {
      return ErrorCategory.AUTHORIZATION;
    }

    if (errorData.statusCode === 400) {
      return ErrorCategory.VALIDATION;
    }

    if (errorData.statusCode >= 500) {
      return ErrorCategory.SYSTEM;
    }

    // Determinar por mensaje de error
    if (errorData.message.toLowerCase().includes('database') ||
        errorData.message.toLowerCase().includes('connection')) {
      return ErrorCategory.DATABASE;
    }

    if (errorData.message.toLowerCase().includes('network') ||
        errorData.message.toLowerCase().includes('timeout')) {
      return ErrorCategory.NETWORK;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Obtiene logs de error con filtros
   */
  async getErrorLogs(filters?: {
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    userId?: string;
    endpoint?: string;
    isResolved?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: ErrorLog[]; total: number }> {
    try {
      const queryBuilder = this.errorLogRepository.createQueryBuilder('error_log');

      if (filters?.severity) {
        queryBuilder.andWhere('error_log.severity = :severity', { severity: filters.severity });
      }

      if (filters?.category) {
        queryBuilder.andWhere('error_log.category = :category', { category: filters.category });
      }

      if (filters?.userId) {
        queryBuilder.andWhere('error_log.userId = :userId', { userId: filters.userId });
      }

      if (filters?.endpoint) {
        queryBuilder.andWhere('error_log.endpoint LIKE :endpoint', { endpoint: `%${filters.endpoint}%` });
      }

      if (filters?.isResolved !== undefined) {
        queryBuilder.andWhere('error_log.isResolved = :isResolved', { isResolved: filters.isResolved });
      }

      if (filters?.startDate) {
        queryBuilder.andWhere('error_log.timestamp >= :startDate', { startDate: filters.startDate });
      }

      if (filters?.endDate) {
        queryBuilder.andWhere('error_log.timestamp <= :endDate', { endDate: filters.endDate });
      }

      // Ordenar por timestamp descendente (más recientes primero)
      queryBuilder.orderBy('error_log.timestamp', 'DESC');

      // Paginación
      if (filters?.limit) {
        queryBuilder.limit(filters.limit);
      }

      if (filters?.offset) {
        queryBuilder.offset(filters.offset);
      }

      const [logs, total] = await queryBuilder.getManyAndCount();

      return { logs, total };
    } catch (error) {
      console.error('[ERROR_GETTING_LOGS]', error);
      throw error;
    }
  }

  /**
   * Marca un error como resuelto
   */
  async markAsResolved(errorId: string, resolvedBy: string, resolutionNotes?: string): Promise<void> {
    try {
      const updateData: any = {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy,
      };

      if (resolutionNotes) {
        updateData.resolutionNotes = resolutionNotes;
      }

      await this.errorLogRepository.update(errorId, updateData);
    } catch (error) {
      console.error('[ERROR_MARKING_RESOLVED]', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de errores
   */
  async getErrorStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalErrors: number;
    errorsBySeverity: Record<ErrorSeverity, number>;
    errorsByCategory: Record<ErrorCategory, number>;
    recentErrors: ErrorLog[];
    unresolvedErrors: number;
  }> {
    try {
      const queryBuilder = this.errorLogRepository.createQueryBuilder('error_log');

      if (filters?.startDate) {
        queryBuilder.andWhere('error_log.timestamp >= :startDate', { startDate: filters.startDate });
      }

      if (filters?.endDate) {
        queryBuilder.andWhere('error_log.timestamp <= :endDate', { endDate: filters.endDate });
      }

      // Obtener todos los logs para estadísticas
      const allLogs = await queryBuilder.getMany();

      // Calcular estadísticas
      const errorsBySeverity = allLogs.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {} as Record<ErrorSeverity, number>);

      const errorsByCategory = allLogs.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
      }, {} as Record<ErrorCategory, number>);

      // Errores recientes (últimas 24 horas)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentErrors = allLogs
        .filter(log => log.timestamp >= oneDayAgo)
        .slice(0, 10); // Últimos 10

      // Errores no resueltos
      const unresolvedErrors = allLogs.filter(log => !log.isResolved).length;

      return {
        totalErrors: allLogs.length,
        errorsBySeverity,
        errorsByCategory,
        recentErrors,
        unresolvedErrors,
      };
    } catch (error) {
      console.error('[ERROR_GETTING_STATISTICS]', error);
      throw error;
    }
  }

  /**
   * Obtiene un log de error específico por ID
   */
  async getErrorLogById(id: string): Promise<ErrorLog | null> {
    try {
      return await this.errorLogRepository.findOne({
        where: { id }
      });
    } catch (error) {
      console.error('[ERROR_GETTING_LOG_BY_ID]', error);
      throw error;
    }
  }

  /**
   * Limpia logs antiguos (útil para mantenimiento)
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      const result = await this.errorLogRepository
        .createQueryBuilder()
        .delete()
        .from(ErrorLog)
        .where('timestamp < :cutoffDate', { cutoffDate })
        .andWhere('isResolved = :isResolved', { isResolved: true })
        .execute();

      return result.affected || 0;
    } catch (error) {
      console.error('[ERROR_CLEANUP_LOGS]', error);
      throw error;
    }
  }
}
