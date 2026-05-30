import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database';
import { CreateAddressDto, UpdateAddressDto } from './dtos/address.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    return this.prisma.address.create({
      data: { ...dto, userId },
    });
  }

  async update(userId: string, id: string, dto: Partial<UpdateAddressDto>) {
    const address = await this.prisma.address.findFirst({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');

    if (dto.isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    return this.prisma.address.update({ where: { id }, data: dto });
  }

  async delete(userId: string, id: string) {
    const address = await this.prisma.address.findFirst({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');
    await this.prisma.address.delete({ where: { id } });
    return null;
  }
}
