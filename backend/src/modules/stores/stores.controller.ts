import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { OptionalSessionAuthGuard } from '../../common/guards/optional-session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/decorators/roles.decorator';
import { CreateStoreDto, StoreQueryDto, SubmitCertificationDto, UpdateStoreDto, VerifyStoreDto } from './dtos/create-store.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.SELLER, Role.ADMIN)
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
  @UseGuards(OptionalSessionAuthGuard)
  async findAll(@Query() query: StoreQueryDto, @Request() req: any) {
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    const { verified, category, page, limit } = query;

    const result = await this.storesService.findAll(userId, userRole, {
      verified,
      category,
      page,
      limit,
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
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.SELLER)
  async getSellerDashboard(@Request() req: any) {
    const userId = req.user.sub;
    const dashboard = await this.storesService.getSellerDashboard(userId);

    return {
      success: true,
      data: dashboard,
    };
  }

  @Get('pending')
  @UseGuards(SessionAuthGuard, RolesGuard)
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
  @UseGuards(SessionAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
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
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async verifyStore(
    @Param('id') id: string,
    @Body() dto: VerifyStoreDto,
  ) {
    const store = await this.storesService.verifyStore(id, dto.isVerified);

    const message = dto.isVerified
      ? 'Store verified successfully. Products are now visible in the marketplace.'
      : 'Store verification revoked. Products are no longer visible in the marketplace.';

    return {
      success: true,
      data: store,
      message,
    };
  }

  @Post(':id/certification')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  async submitCertification(
    @Param('id') id: string,
    @Body() dto: SubmitCertificationDto,
    @Request() req: any
  ) {
    const store = await this.storesService.submitCertification(id, dto.certificationUrl, req.user.sub, req.user.role);
    return {
      success: true,
      data: store,
      message: 'Certification submitted for admin review',
    };
  }

  @Delete(':id')
  @UseGuards(SessionAuthGuard, RolesGuard)
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
