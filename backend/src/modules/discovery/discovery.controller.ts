import { Controller, Get, Query, UsePipes, UseGuards, Request } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { DiscoveryQueryDto } from './dtos/discovery-query.dto';
import { ValidationPipe } from '../../common/pipes/validation.pipe';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@Controller('discovery')
export class DiscoveryController {
  constructor(private discoveryService: DiscoveryService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  @UseGuards(OptionalJwtAuthGuard)
  async getDiscoveryFeed(@Query() query: DiscoveryQueryDto, @Request() req: any) {
    const userId = req.user?.sub;
    return this.discoveryService.getDiscoveryFeed(query, userId);
  }

  @Get('trending')
  @UseGuards(OptionalJwtAuthGuard)
  async getTrendingProducts(
    @Query('period') period: string = '7d',
    @Query('limit') limit: string = '20',
    @Request() req: any
  ) {
    const userId = req.user?.sub;
    return this.discoveryService.getTrendingProducts(period, parseInt(limit, 10), userId);
  }

  @Get('new')
  @UseGuards(OptionalJwtAuthGuard)
  async getNewProducts(
    @Query('days') days: string = '7',
    @Query('limit') limit: string = '20',
    @Request() req: any
  ) {
    const userId = req.user?.sub;
    return this.discoveryService.getNewProducts(parseInt(days, 10), parseInt(limit, 10), userId);
  }

  @Get('categories')
  async getCategories() {
    return this.discoveryService.getCategories();
  }
}
