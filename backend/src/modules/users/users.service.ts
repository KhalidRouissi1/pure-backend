import { Injectable, NotFoundException, Logger, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/database';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig } from '../../config/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async create(data: { email: string; password: string; role?: string; city?: string; phone?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: (data.role as any) || 'USER',
        city: data.city,
        phone: data.phone,
      },
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

    return user;
  }

  async generateToken(userId: string, email: string, role: string): Promise<string> {
    return this.jwtService.sign(
      { sub: userId, email, role },
    );
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
