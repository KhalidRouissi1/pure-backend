import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request, 
  UsePipes 
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/decorators/roles.decorator';
import { CreateStoreDto } from './dtos/create-store.dto';
import { ValidationPipe } from '../../common/pipes/validation.pipe';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @UsePipes(new ValidationPipe())
  async create(@Body() createStoreDto: CreateStoreDto, @Request() req: any) {
    const userId = req.user.sub;
    const store = await this.storesService.create(createStoreDto, userId);

    return {
      success: true,
      data: store,
      message: 'Store created successfully. Pending admin approval.',
    };
  }

  @Get()
  async findAll(@Query() query: any, @Request() req: any) {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    const { verified, category, page, limit } = query;

    const result = await this.storesService.findAll(userId, {
      verified: verified !== undefined ? verified === 'true' : undefined,
      category,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return {
      success: true,
      data: result.stores,
      meta: {
        total: result.total,
        pagination: result.pagination,
      },
    };
  }

  @Get('me/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  async getSellerDashboard(@Request() req: any) {
    const userId = req.user.sub;
    const dashboard = await this.storesService.getSellerDashboard(userId);

    return {
      success: true,
      data: dashboard,
    };
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getPendingStores() {
    const stores = await this.storesService.getPendingStores();

    return {
      success: true,
      data: stores,
      message: `Found ${stores.length} pending stores`,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    const store = await this.storesService.findOne(id, userId, userRole);

    return {
      success: true,
      data: store,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateStoreDto: Partial<CreateStoreDto>,
    @Request() req: any
  ) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    const store = await this.storesService.update(id, updateStoreDto, userId, userRole);

    return {
      success: true,
      data: store,
      message: 'Store updated successfully',
    };
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async verifyStore(
    @Param('id') id: string,
    @Body('isVerified') isVerified: boolean
  ) {
    const store = await this.storesService.verifyStore(id, isVerified);

    const message = isVerified 
      ? 'Store verified successfully. Products are now visible in the marketplace.'
      : 'Store verification revoked. Products are no longer visible in the marketplace.';

    return {
      success: true,
      data: store,
      message,
    };
  }

  @Post(':id/certification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  async submitCertification(
    @Param('id') id: string,
    @Body('certificationUrl') certificationUrl: string,
    @Request() req: any
  ) {
    const store = await this.storesService.submitCertification(id, certificationUrl, req.user.sub, req.user.role);
    return {
      success: true,
      data: store,
      message: 'Certification submitted for admin review',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    await this.storesService.delete(id, userId, userRole);

    return {
      success: true,
      message: 'Store deleted successfully',
    };
  }
}
