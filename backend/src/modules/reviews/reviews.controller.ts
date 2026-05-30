import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dtos/review.dto';

@Controller()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('products/:id/reviews')
  async listProductReviews(@Param('id') id: string) {
    return { success: true, data: await this.reviewsService.listForProduct(id) };
  }

  @Post('products/:id/reviews')
  @UseGuards(JwtAuthGuard)
  async createProductReview(@Request() req: any, @Param('id') id: string, @Body() dto: CreateReviewDto) {
    return { success: true, data: await this.reviewsService.createForProduct(req.user.sub, id, dto) };
  }

  @Get('stores/:id/reviews')
  async listStoreReviews(@Param('id') id: string) {
    return { success: true, data: await this.reviewsService.listForStore(id) };
  }

  @Post('stores/:id/reviews')
  @UseGuards(JwtAuthGuard)
  async createStoreReview(@Request() req: any, @Param('id') id: string, @Body() dto: CreateReviewDto) {
    return { success: true, data: await this.reviewsService.createForStore(req.user.sub, id, dto) };
  }
}
