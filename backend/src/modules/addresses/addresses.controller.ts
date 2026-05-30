import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dtos/address.dto';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Get()
  async findAll(@Request() req: any) {
    return { success: true, data: await this.addressesService.findAll(req.user.sub) };
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreateAddressDto) {
    return { success: true, data: await this.addressesService.create(req.user.sub, dto) };
  }

  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<UpdateAddressDto>) {
    return { success: true, data: await this.addressesService.update(req.user.sub, id, dto) };
  }

  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    return { success: true, data: await this.addressesService.delete(req.user.sub, id) };
  }
}
