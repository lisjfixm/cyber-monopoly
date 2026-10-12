import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { BusinessException } from '../interfaces/exception.interface';
import { HTTP_STATUS_TO_RESPONSE_CODE_MAP, ResponseCode } from '../constants/api_response_code';
import { ApiErrorResponse } from '../interfaces/api_response.interface';

// 全域性異常過濾器，用於捕獲所有未處理的異常
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
     
    // 如果響應頭已傳送，則不處理
    if (response.headersSent) {
      return;
    }

    let errorResponse: Omit<ApiErrorResponse, 'httpStatus'>;
    let httpStatus: HttpStatus;

    if (exception instanceof BusinessException) {
      // 業務異常
      httpStatus = exception.httpStatus;
      errorResponse = {
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
          fieldErrors: exception.fieldErrors,
          timestamp: Date.now(),
        },
      };
    } else if (exception instanceof HttpException) {
      // HTTP異常
      httpStatus = exception.getStatus() as HttpStatus;
      const exceptionResponse = exception.getResponse();

      errorResponse = {
        error: {
          code: HTTP_STATUS_TO_RESPONSE_CODE_MAP[httpStatus],
          message: typeof exceptionResponse === 'string' ? exceptionResponse : exception.message,
          details: typeof exceptionResponse === 'object' ? JSON.stringify(exceptionResponse) : undefined,
          timestamp: Date.now(),
        },
      };
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      (exception as { code?: unknown }).code === '22P02'
    ) {
      // Postgres invalid_text_representation：路徑/查詢引數與列型別不配對（最常見是非法 UUID）
      // 與「合法 UUID 但記錄不存在」走同一條 not-found 語義，避免 500 雜訊
      httpStatus = HttpStatus.NOT_FOUND;
      errorResponse = {
        error: {
          code: ResponseCode.NOT_FOUND,
          message: '資源不存在',
          timestamp: Date.now(),
        },
      };
    } else {
      // 未知異常：生產環境不對外公開堆疊與底層原因，避免洩漏實作細節
      const isDev = process.env.NODE_ENV !== 'production';
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        error: {
          code: ResponseCode.INTERNAL_ERROR,
          message: '伺服器內部錯誤',
          ...(isDev
            ? {
                stack: (exception as Error).stack,
                cause: (exception as Error).cause as string,
              }
            : {}),
          timestamp: Date.now(),
        },
      };
    }

    response.status(httpStatus).json(errorResponse);
  }
}
