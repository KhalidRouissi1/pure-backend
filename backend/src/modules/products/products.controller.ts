import { Controller, Get, Post, Delete, Param, Query, UseGuards, Request, Body, UsePipes, Put, Patch, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/decorators/roles.decorator';
import { ProductQueryDto, PaginationQueryDto, UpdateProductDto } from './dtos/product.dto';
import { ValidationPipe } from '../../common/pipes/validation.pipe';

import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@Query() query: ProductQueryDto, @Request() req: any) {
    const userId = req.user?.sub;
    return this.productsService.findAll(query, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.sub;
    return this.productsService.findOne(id, userId);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.SELLER, Role.ADMIN)
  async addFavorite(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.productsService.addFavorite(userId, id);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.SELLER, Role.ADMIN)
  async removeFavorite(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.productsService.removeFavorite(userId, id);
  }

  @Get('favorites/me')
  @UseGuards(JwtAuthGuard)
  async getUserFavorites(@Query() query: PaginationQueryDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.productsService.getUserFavorites(userId, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @UsePipes(new ValidationPipe())
  async create(@Body() createProductDto: any, @Request() req: any) {
    const userId = req.user.sub;
    const product = await this.productsService.create(createProductDto, userId);
    return {
      success: true,
      data: product,
      message: 'Product created successfully',
    };
  }

  @Post('upload-images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  async uploadImages(@Body('images') images: string[]) {
    const uploadedImages = await this.productsService.uploadProductImages(images);
    return {
      success: true,
      data: uploadedImages,
      message: 'Images uploaded successfully',
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @UsePipes(new ValidationPipe())
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
  @UseGuards(JwtAuthGuard, RolesGuard)
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
