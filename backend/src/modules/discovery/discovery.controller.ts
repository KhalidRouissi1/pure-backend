import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { DiscoveryQueryDto, NewProductsQueryDto, TrendingQueryDto } from './dtos/discovery-query.dto';
import { OptionalSessionAuthGuard } from '../../common/guards/optional-session-auth.guard';

@Controller('discovery')
export class DiscoveryController {
  constructor(private discoveryService: DiscoveryService) {}

  @Get()
  @UseGuards(OptionalSessionAuthGuard)
  async getDiscoveryFeed(@Query() query: DiscoveryQueryDto, @Request() req: any) {
    const userId = req.user?.sub;
    return this.discoveryService.getDiscoveryFeed(query, userId);
  }

  @Get('trending')
  @UseGuards(OptionalSessionAuthGuard)
  async getTrendingProducts(
    @Query() query: TrendingQueryDto,
    @Request() req: any
  ) {
    const userId = req.user?.sub;
    return this.discoveryService.getTrendingProducts(query.period, query.limit, userId);
  }

  @Get('new')
  @UseGuards(OptionalSessionAuthGuard)
  async getNewProducts(
    @Query() query: NewProductsQueryDto,
    @Request() req: any
  ) {
    const userId = req.user?.sub;
    return this.discoveryService.getNewProducts(query.days, query.limit, userId);
  }

  @Get('categories')
  async getCategories() {
    return this.discoveryService.getCategories();
  }
}
