import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import env from '../env';

@Injectable()
export class ServiceTokenGuard implements CanActivate {
  private readonly validToken = env.SERVICE_TOKEN;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    if (!token || token !== `Bearer ${this.validToken}`) {
      throw new UnauthorizedException('Invalid or missing service token');
    }

    return true;
  }
}
