export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string | undefined;
  timestamp: string;
  path: string;
  method: string;
}

export interface ErrorResponse {
  success: false;
  errors: { message: string; field?: string }[];
  timestamp: string;
  path: string;
  method: string;
}

export class ResponseHandler {
  static success<T>(
    data: T,
    message?: string,
    statusCode: number = 200
  ): { statusCode: number; response: ApiResponse<T> } {
    return {
      statusCode,
      response: {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
        path: '', // Will be set by the controller
        method: '', // Will be set by the controller
      },
    };
  }

  static error(
    errors: { message: string; field?: string }[],
    statusCode: number = 500
  ): { statusCode: number; response: ErrorResponse } {
    return {
      statusCode,
      response: {
        success: false,
        errors,
        timestamp: new Date().toISOString(),
        path: '', // Will be set by the controller
        method: '', // Will be set by the controller
      },
    };
  }
}
