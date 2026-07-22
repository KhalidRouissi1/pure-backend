import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(SessionAuthGuard)
  async getProfile(@Request() req: any) {
    const userId = req.user.sub;
    return this.usersService.findOne(userId);
  }

  @Patch('profile')
  @UseGuards(SessionAuthGuard)
  async updateProfile(@Request() req: any, @Body() updateData: UpdateProfileDto) {
    const userId = req.user.sub;
    return this.usersService.update(userId, updateData);
  }
}
