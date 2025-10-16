import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../shared/errors/CustomError';
import { ErrorLoggingService } from '../../application/services/ErrorLoggingService';

const errorLoggingService = new ErrorLoggingService();

export const errorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let errorMessage = 'Internal server error';
  let errorCode: string | undefined;

  // Extract user ID from request if available
  const userId = (req as any).user?.id;

  // Check if it's a custom error
  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    const serializedErrors = err.serializeErrors();
    errorMessage = serializedErrors[0]?.message || errorMessage;

    // Log custom errors with medium severity
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

    return res.status(statusCode).json({
      success: false,
      errors: serializedErrors,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorMessage = 'Invalid token';
    errorCode = 'JWT_INVALID';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorMessage = 'Token expired';
    errorCode = 'JWT_EXPIRED';
  }
  // Handle database errors
  else if (err.message.includes('duplicate key value')) {
    statusCode = 409;
    errorMessage = 'Resource already exists';
    errorCode = 'DB_DUPLICATE_KEY';
  } else if (err.message.includes('violates foreign key constraint')) {
    statusCode = 400;
    errorMessage = 'Invalid reference to related resource';
    errorCode = 'DB_FOREIGN_KEY_VIOLATION';
  }
  // Handle validation errors (if using a validation library)
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = err.message;
    errorCode = 'VALIDATION_ERROR';
  }
  // Handle other known errors
  else if (err.name === 'CastError') {
    statusCode = 400;
    errorMessage = 'Invalid data format';
    errorCode = 'CAST_ERROR';
  } else if (err.message.includes('ECONNREFUSED')) {
    statusCode = 503;
    errorMessage = 'Service temporarily unavailable';
    errorCode = 'CONNECTION_REFUSED';
  } else if (err.message.includes('timeout')) {
    statusCode = 408;
    errorMessage = 'Request timeout';
    errorCode = 'TIMEOUT_ERROR';
  }

  // Log the error with full context
  await errorLoggingService.logError({
    message: errorMessage,
    stackTrace: err.stack,
    statusCode,
    endpoint: req.path,
    method: req.method,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
    userId,
    requestBody: req.method !== 'GET' ? req.body : undefined,
    requestHeaders: req.headers,
    errorContext: {
      originalError: err.message,
      errorName: err.name,
      stack: err.stack,
    },
    errorCode,
  });

  // Log to console for immediate debugging
  console.error(`[ERROR_HANDLER] ${statusCode} - ${errorMessage}`, {
    path: req.path,
    method: req.method,
    userId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: err.message,
    stack: err.stack
  });

  return res.status(statusCode).json({
    success: false,
    errors: [{ message: errorMessage }],
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        errorName: err.name,
        errorCode,
      }
    })
  });
};
