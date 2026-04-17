import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestsInterceptor implements NestInterceptor {
  private logger = new Logger('RequestsInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const requestStr = `${request.method} ${request.url}`;
    this.logger.log(`${requestStr}`);

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`${requestStr} Response time: ${Date.now() - now}ms`);
      }),
    );
  }
}
