import { Controller, Get, Post, Body, Param, UseGuards, Query, Patch, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { OrdersService } from '../orders/orders.service';
import { ReviewsService } from '../reviews/reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
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
  async getRecentStores(@Query('limit') limit?: string) {
    const stores = await this.adminService.getRecentStores(limit ? parseInt(limit) : 10);
    return { success: true, data: stores };
  }

  @Get('products/recent')
  async getRecentProducts(@Query('limit') limit?: string) {
    const products = await this.adminService.getRecentProducts(limit ? parseInt(limit) : 10);
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
  async moderateReview(@Param('id') id: string, @Body('status') status: 'APPROVED' | 'REJECTED') {
    return { success: true, data: await this.reviewsService.moderate(id, status) };
  }

  @Post('stores/:id/certification-review')
  async reviewCertification(
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
    @Body('notes') notes?: string,
  ) {
    return { success: true, data: await this.adminService.reviewCertification(id, status, notes) };
  }

  @Get('users')
  async getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return {
      success: true,
      data: await this.adminService.getUsers(
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 20,
      ),
    };
  }

  @Patch('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    return { success: true, data: await this.adminService.updateUserRole(id, role) };
  }

  @Get('stores')
  async getAllStores(@Query('page') page?: string, @Query('limit') limit?: string) {
    return {
      success: true,
      data: await this.adminService.getAllStores(
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 20,
      ),
    };
  }

  @Delete('stores/:id')
  async deleteStore(@Param('id') id: string) {
    await this.adminService.deleteStore(id);
    return { success: true, message: 'Store deleted successfully' };
  }
}
