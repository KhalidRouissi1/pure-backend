import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/response.interceptor';
import { json, urlencoded, NextFunction, Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth, authPrisma, authSecret } from './auth';
import { randomUUID } from 'crypto';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { validateProductionEnvironment } from './config/environment';

interface RequestWithId extends Request {
  id?: string | string[];
}

async function bootstrap() {
  validateProductionEnvironment();
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: process.env.NODE_ENV === 'production'
            ? winston.format.combine(winston.format.timestamp(), winston.format.json())
            : winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      ],
    }),
    bodyParser: false,
  });
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use((request: RequestWithId, response: Response, next: NextFunction) => {
    const requestId = request.headers['x-request-id'] || randomUUID();
    request.id = requestId;
    response.setHeader('x-request-id', requestId);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });
  // Express 5/path-to-regexp no longer accepts unnamed `*` wildcards.
  // A RegExp also matches the auth base path and every Better Auth endpoint.
  expressApp.all(/^\/api\/auth(?:\/.*)?$/, toNodeHandler(auth));
  expressApp.use(json({ limit: '28mb' }));
  expressApp.use(urlencoded({ extended: true, limit: '1mb' }));
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const configuredOrigins = configService.get<string>('CORS_ORIGIN', '');
  const corsOrigins = configuredOrigins.split(',').map((origin) => origin.trim()).filter(Boolean);

  if (process.env.NODE_ENV === 'production' && (corsOrigins.length === 0 || corsOrigins.includes('*'))) {
    throw new Error('CORS_ORIGIN must list explicit origins in production');
  }

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  logger.log(`Authentication secret configured: ${authSecret.length >= 32 ? '✓' : '✗ (too short!)'}`);
  logger.log(`CORS enabled for ${corsOrigins.length || 'development'} origin configuration`);

  await app.listen(port);
  logger.log(`🚀 Backend API is running on: http://localhost:${port}`);
  logger.log(`📚 Environment: ${configService.get<string>('NODE_ENV', 'development')}`);

  app.enableShutdownHooks();
  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.log(`Received ${signal}; shutting down gracefully`);
    await app.close();
    await authPrisma.$disconnect();
  };
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch(async (error) => {
  await authPrisma.$disconnect();
  throw error;
});
