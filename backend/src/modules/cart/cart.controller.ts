import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dtos/cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async getCart(@Request() req: any) {
    return { success: true, data: await this.cartService.getCart(req.user.sub) };
  }

  @Post()
  async addItem(@Request() req: any, @Body() dto: AddCartItemDto) {
    return { success: true, data: await this.cartService.addItem(req.user.sub, dto) };
  }

  @Patch(':id')
  async updateItem(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return { success: true, data: await this.cartService.updateItem(req.user.sub, id, dto) };
  }

  @Delete(':id')
  async removeItem(@Request() req: any, @Param('id') id: string) {
    return { success: true, data: await this.cartService.removeItem(req.user.sub, id) };
  }

  @Delete()
  async clearCart(@Request() req: any) {
    return { success: true, data: await this.cartService.clearCart(req.user.sub) };
  }
}
