import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ApiKeyGuard } from './auth/api-key.guard';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Resolve ConfigService to inject environment variables into global guards
  const configService = app.get(ConfigService);

  // Enable validation for all endpoints (whitelist strategy)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Register global API Key Guard
  app.useGlobalGuards(new ApiKeyGuard(configService)); 

  await app.listen(3000);
}
bootstrap();