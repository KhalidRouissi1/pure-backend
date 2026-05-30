import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../config/database';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { jwtConfig } from '../../config/jwt';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn as any },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}
