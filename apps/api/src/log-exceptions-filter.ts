import {
  ArgumentsHost,
  Catch,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { Request, Response } from 'express';
import { DatabaseService } from './database.service';
@Injectable()
@Catch(HttpException)
export class LogHttpExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly databaseService: DatabaseService) {
    super();
  }
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const xSource = request.headers['x-source'];
    if (xSource === 'bot') {
      this.databaseService.client.botApiRequestException?.create({
        data: {
          statusCode: response.statusCode,
          requestHeaders: JSON.stringify(request.headers),
          requestBody: request.body ? JSON.stringify(request.body) : null,
          message: exception.message,
          method: request.method,
          url: request.url,
        },
      });
    }

    super.catch(exception, host);
  }
}
