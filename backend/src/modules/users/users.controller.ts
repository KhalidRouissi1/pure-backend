import { Controller, Get, Post, Patch, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; role?: string; city?: string; phone?: string },
  ) {
    const user = await this.usersService.create(body);
    const accessToken = await this.usersService.generateToken(user.id, user.email, user.role);
    return {
      data: { user, accessToken },
      message: 'Registration successful',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.usersService.validateUser(body.email, body.password);
    const accessToken = await this.usersService.generateToken(user.id, user.email, user.role);
    return {
      data: { user, accessToken },
      message: 'Login successful',
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    const userId = req.user.sub;
    return this.usersService.findOne(userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: any, @Body() updateData: UpdateProfileDto) {
    const userId = req.user.sub;
    return this.usersService.update(userId, updateData);
  }
}
