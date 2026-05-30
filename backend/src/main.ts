import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/response.interceptor';
import { getJwtSecret } from './config/jwt';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  logger.log(`JWT_SECRET configured: ${getJwtSecret().length >= 32 ? '✓' : '✗ (too short!)'}`);
  logger.log(`CORS enabled for origin: ${corsOrigin}`);

  await app.listen(port);
  logger.log(`🚀 Backend API is running on: http://localhost:${port}`);
  logger.log(`📚 Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
}

bootstrap();
