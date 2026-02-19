import { Response } from 'express';

interface SuccessResponse<T> {
  status: 'success';
  requestId: string;
  data: T;
}

interface ErrorResponse {
  status: 'error';
  requestId: string;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

interface PaginatedResponse<T> extends SuccessResponse<T> {
  data: T;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function successResponse<T>(
  res: Response,
  data: T,
  requestId: string | undefined,
  statusCode = 200
): void {
  const response: SuccessResponse<T> = {
    status: 'success',
    requestId: requestId || '',
    data,
  };
  res.status(statusCode).json(response);
}

export function errorResponse(
  res: Response,
  message: string,
  requestId: string | undefined,
  statusCode = 400,
  code?: string,
  details?: unknown
): void {
  const response: ErrorResponse = {
    status: 'error',
    requestId: requestId || '',
    error: {
      message,
      code,
      details,
    },
  };
  res.status(statusCode).json(response);
}

export function paginatedResponse<T>(
  res: Response,
  data: T,
  requestId: string | undefined,
  pagination: {
    total: number;
    limit: number;
    offset: number;
  },
  statusCode = 200
): void {
  const response: PaginatedResponse<T> = {
    status: 'success',
    requestId: requestId || '',
    data,
    pagination: {
      ...pagination,
      hasMore: pagination.offset + pagination.limit < pagination.total,
    },
  };
  res.status(statusCode).json(response);
}
