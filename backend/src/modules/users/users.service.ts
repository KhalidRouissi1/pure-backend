import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        city: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateData: { name?: string; avatarUrl?: string; city?: string; phone?: string }) {
    this.logger.log(`Updating user ${id}`);

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        city: true,
        phone: true,
        updatedAt: true,
      },
    });
  }

  async validateOwnership(userId: string, storeId: string): Promise<boolean> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    });

    return store?.ownerId === userId;
  }
}
