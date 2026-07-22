import { IsString, IsNumber, IsArray, IsOptional, Min, Max, Length, IsEnum, IsUUID, IsUrl, ArrayMinSize, ArrayMaxSize, IsIn, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Category } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @Length(3, 200)
  name: string;

  @IsString()
  @Length(10, 1000)
  description: string;

  @IsNumber()
  @Min(0.01)
  @Max(999999.99)
  price: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999999)
  inventoryQuantity: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsEnum(Category)
  category: Category;

  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  originAddressText?: string;

  @IsOptional()
  @IsString()
  @Length(2, 80)
  originCity?: string;

  @IsOptional()
  @IsNumber()
  @Min(16)
  @Max(32)
  originLatitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(34)
  @Max(56)
  originLongitude?: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Length(3, 200)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(10, 1000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(999999.99)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999999)
  inventoryQuantity?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  originAddressText?: string;

  @IsOptional()
  @IsString()
  @Length(2, 80)
  originCity?: string;

  @IsOptional()
  @IsNumber()
  @Min(16)
  @Max(32)
  originLatitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(34)
  @Max(56)
  originLongitude?: number;
}

export class ProductQueryDto {
  @IsOptional()
  @Type(() => String)
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @Type(() => String)
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @Type(() => String)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => String)
  @IsIn(['createdAt', 'price', 'name'])
  sort?: string = 'createdAt';

  @IsOptional()
  @Type(() => String)
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
