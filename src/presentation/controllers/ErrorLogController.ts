import { Request, Response } from 'express';
import { ErrorLoggingService } from '../../application/services/ErrorLoggingService';
import { ResponseHandler } from '../../shared/responses/ApiResponse';
import { BadRequestError, NotFoundError } from '../../shared/errors';
import { ErrorSeverity, ErrorCategory } from '../../domain/entities/ErrorLog';

export class ErrorLogController {
  private errorLoggingService = new ErrorLoggingService();

  /**
   * Obtener logs de error con filtros
   */
  getErrorLogs = async (req: Request, res: Response) => {
    try {
      const {
        severity,
        category,
        userId,
        endpoint,
        isResolved,
        startDate,
        endDate,
        limit = '50',
        offset = '0'
      } = req.query;

      // Validar y convertir parámetros
      const filters: any = {};

      if (severity && Object.values(ErrorSeverity).includes(severity as ErrorSeverity)) {
        filters.severity = severity as ErrorSeverity;
      }

      if (category && Object.values(ErrorCategory).includes(category as ErrorCategory)) {
        filters.category = category as ErrorCategory;
      }

      if (userId) {
        filters.userId = userId as string;
      }

      if (endpoint) {
        filters.endpoint = endpoint as string;
      }

      if (isResolved !== undefined) {
        filters.isResolved = isResolved === 'true';
      }

      if (startDate) {
        const start = new Date(startDate as string);
        if (!isNaN(start.getTime())) {
          filters.startDate = start;
        }
      }

      if (endDate) {
        const end = new Date(endDate as string);
        if (!isNaN(end.getTime())) {
          filters.endDate = end;
        }
      }

      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
        throw new BadRequestError('Limit must be between 1 and 1000');
      }

      if (isNaN(offsetNum) || offsetNum < 0) {
        throw new BadRequestError('Offset must be non-negative');
      }

      filters.limit = limitNum;
      filters.offset = offsetNum;

      const { logs, total } = await this.errorLoggingService.getErrorLogs(filters);

      const response = ResponseHandler.success({
        logs,
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total
      }, 'Error logs retrieved successfully');

      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Obtener estadísticas de errores
   */
  getErrorStatistics = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      const filters: any = {};

      if (startDate) {
        const start = new Date(startDate as string);
        if (!isNaN(start.getTime())) {
          filters.startDate = start;
        }
      }

      if (endDate) {
        const end = new Date(endDate as string);
        if (!isNaN(end.getTime())) {
          filters.endDate = end;
        }
      }

      const statistics = await this.errorLoggingService.getErrorStatistics(filters);

      const response = ResponseHandler.success(statistics, 'Error statistics retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Marcar un error como resuelto
   */
  markAsResolved = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { resolutionNotes } = req.body;

      if (!id) {
        throw new BadRequestError('Error log ID is required');
      }

      // Obtener información del usuario que está resolviendo el error
      const resolvedBy = (req as any).user?.id || 'system';

      await this.errorLoggingService.markAsResolved(id, resolvedBy, resolutionNotes);

      const response = ResponseHandler.success(
        { id, resolvedBy, resolvedAt: new Date() },
        'Error marked as resolved successfully'
      );
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Obtener un log de error específico por ID
   */
  getErrorLogById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('Error log ID is required');
      }

      const errorLog = await this.errorLoggingService.getErrorLogById(id);

      if (!errorLog) {
        throw new NotFoundError('Error log not found');
      }

      const response = ResponseHandler.success(errorLog, 'Error log retrieved successfully');
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Limpiar logs antiguos (solo para administradores)
   */
  cleanupOldLogs = async (req: Request, res: Response) => {
    try {
      const { daysToKeep = '90' } = req.query;
      const daysNum = parseInt(daysToKeep as string);

      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        throw new BadRequestError('Days to keep must be between 1 and 365');
      }

      const deletedCount = await this.errorLoggingService.cleanupOldLogs(daysNum);

      const response = ResponseHandler.success(
        { deletedCount, daysToKeep: daysNum },
        `Successfully cleaned up ${deletedCount} old error logs`
      );
      response.response.path = req.path;
      response.response.method = req.method;
      res.status(response.statusCode).json(response.response);
    } catch (error) {
      throw error;
    }
  };
}
