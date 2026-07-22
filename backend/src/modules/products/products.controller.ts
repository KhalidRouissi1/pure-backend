import { Controller, Get, Post, Delete, Param, Query, UseGuards, Request, Body, Patch } from '@nestjs/common';
import { ProductsService } from './products.service';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/decorators/roles.decorator';
import { CreateProductDto, ProductQueryDto, PaginationQueryDto, UpdateProductDto } from './dtos/product.dto';
import { UploadImagesDto } from './dtos/upload-images.dto';

import { OptionalSessionAuthGuard } from '../../common/guards/optional-session-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @UseGuards(OptionalSessionAuthGuard)
  async findAll(@Query() query: ProductQueryDto, @Request() req: any) {
    const userId = req.user?.sub;
    return this.productsService.findAll(query, userId);
  }

  @Get('favorites/me')
  @UseGuards(SessionAuthGuard)
  async getUserFavorites(@Query() query: PaginationQueryDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.productsService.getUserFavorites(userId, query);
  }

  @Post('upload-images')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  async uploadImages(@Body() dto: UploadImagesDto) {
    const uploadedImages = await this.productsService.uploadProductImages(dto.images);
    return {
      success: true,
      data: uploadedImages,
      message: 'Images uploaded successfully',
    };
  }

  @Get(':id')
  @UseGuards(OptionalSessionAuthGuard)
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.sub;
    return this.productsService.findOne(id, userId);
  }

  @Post(':id/favorite')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.SELLER, Role.ADMIN)
  async addFavorite(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.productsService.addFavorite(userId, id);
  }

  @Delete(':id/favorite')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.SELLER, Role.ADMIN)
  async removeFavorite(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.productsService.removeFavorite(userId, id);
  }

  @Post()
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  async create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    const userId = req.user.sub;
    const product = await this.productsService.create(createProductDto, userId);
    return {
      success: true,
      data: product,
      message: 'Product created successfully',
    };
  }

  @Patch(':id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    const product = await this.productsService.update(id, updateProductDto, userId, userRole);
    return {
      success: true,
      data: product,
      message: 'Product updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  async delete(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    await this.productsService.delete(id, userId, userRole);
    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}
