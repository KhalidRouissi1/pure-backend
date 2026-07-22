import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role, Roles } from '../../common/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dtos/checkout.dto';

@Controller()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.USER, Role.SELLER)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('checkout')
  async checkout(@Request() req: any, @Body() dto: CheckoutDto) {
    return { success: true, data: await this.ordersService.checkout(req.user.sub, dto) };
  }

  @Get('orders')
  async findAll(@Request() req: any) {
    return { success: true, data: await this.ordersService.findAll(req.user.sub) };
  }

  @Get('orders/:id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return { success: true, data: await this.ordersService.findOne(req.user.sub, id, req.user.role) };
  }
}
