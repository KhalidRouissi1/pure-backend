import { Controller, Get, Post, Body, Param, UseGuards, Query, Patch, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { OrdersService } from '../orders/orders.service';
import { ReviewsService } from '../reviews/reviews.service';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/decorators/roles.decorator';
import { AdminLimitDto, AdminPaginationDto, ModerateReviewDto, ReviewCertificationDto, UpdateUserRoleDto } from './dto/admin.dto';

@Controller('admin')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly ordersService: OrdersService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get('pending-stores')
  async getPendingStores() {
    const stores = await this.adminService.getPendingStores();
    return {
      success: true,
      data: stores,
      message: `Found ${stores.length} pending stores`,
    };
  }

  @Get('dashboard')
  async getDashboard() {
    const [stats, categoryStats, regionStats, recentStores, recentProducts] = await Promise.all([
      this.adminService.getAdminDashboardStats(),
      this.adminService.getStoresByCategory(),
      this.adminService.getStoresByRegion(),
      this.adminService.getRecentStores(5),
      this.adminService.getRecentProducts(5),
    ]);

    return {
      success: true,
      data: {
        stats,
        categoryStats,
        regionStats,
        recentStores,
        recentProducts,
      },
    };
  }

  @Get('stores/recent')
  async getRecentStores(@Query() query: AdminLimitDto) {
    const stores = await this.adminService.getRecentStores(query.limit);
    return { success: true, data: stores };
  }

  @Get('products/recent')
  async getRecentProducts(@Query() query: AdminLimitDto) {
    const products = await this.adminService.getRecentProducts(query.limit);
    return { success: true, data: products };
  }

  @Get('orders')
  async getOrders() {
    return { success: true, data: await this.ordersService.findAllForAdmin() };
  }

  @Get('reviews/pending')
  async getPendingReviews() {
    return { success: true, data: await this.reviewsService.pending() };
  }

  @Post('reviews/:id/moderate')
  async moderateReview(@Param('id') id: string, @Body() dto: ModerateReviewDto) {
    return { success: true, data: await this.reviewsService.moderate(id, dto.status) };
  }

  @Post('stores/:id/certification-review')
  async reviewCertification(
    @Param('id') id: string,
    @Body() dto: ReviewCertificationDto,
  ) {
    return { success: true, data: await this.adminService.reviewCertification(id, dto.status, dto.notes) };
  }

  @Get('users')
  async getUsers(@Query() query: AdminPaginationDto) {
    return {
      success: true,
      data: await this.adminService.getUsers(
        query.page,
        query.limit,
      ),
    };
  }

  @Patch('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return { success: true, data: await this.adminService.updateUserRole(id, dto.role) };
  }

  @Get('stores')
  async getAllStores(@Query() query: AdminPaginationDto) {
    return {
      success: true,
      data: await this.adminService.getAllStores(
        query.page,
        query.limit,
      ),
    };
  }

  @Delete('stores/:id')
  async deleteStore(@Param('id') id: string) {
    await this.adminService.deleteStore(id);
    return { success: true, message: 'Store deleted successfully' };
  }
}
