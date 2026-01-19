import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Guard responsible for validating incoming requests using a static API Key.
 * It expects the 'x-api-key' header to match the 'API_SECRET_KEY' environment variable.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('API_SECRET_KEY');

    if (apiKey && apiKey === validApiKey) {
      return true;
    }

    throw new UnauthorizedException('⛔ Acceso denegado: API Key inválida o faltante');
  }
}