import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database';
import { CreateReviewDto } from './dtos/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async listForProduct(productId: string) {
    return this.list({ productId });
  }

  async listForStore(storeId: string) {
    return this.list({ storeId });
  }

  private async list(whereTarget: { productId?: string; storeId?: string }) {
    const reviews = await this.prisma.review.findMany({
      where: { ...whereTarget, status: 'APPROVED' },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { reviews, summary: this.summarize(reviews) };
  }

  async createForProduct(userId: string, productId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.review.create({ data: { userId, productId, ...dto } });
  }

  async createForStore(userId: string, storeId: string, dto: CreateReviewDto) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Farm not found');
    return this.prisma.review.create({ data: { userId, storeId, ...dto } });
  }

  async moderate(id: string, status: 'APPROVED' | 'REJECTED') {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new BadRequestException('Invalid review status');
    }
    return this.prisma.review.update({ where: { id }, data: { status } });
  }

  async pending() {
    return this.prisma.review.findMany({
      where: { status: 'PENDING' },
      include: { user: true, product: true, store: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  private summarize(reviews: Array<{ rating: number }>) {
    const count = reviews.length;
    const averageRating = count
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / count) * 10) / 10
      : 0;
    return { count, averageRating };
  }
}
