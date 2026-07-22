import { 
  IsString, 
  IsNotEmpty, 
  MinLength, 
  MaxLength, 
  IsEnum, 
  Matches, 
  IsOptional, 
  IsUrl, 
  Min, 
  Max, 
  IsNumber,
  IsArray,
  ArrayMaxSize,
  IsBoolean,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export enum Category {
  FRUITS_VEGETABLES = 'FRUITS_VEGETABLES',
  HONEY = 'HONEY',
  DAIRY = 'DAIRY',
  HERBS = 'HERBS',
  NATURAL_BEAUTY = 'NATURAL_BEAUTY',
}

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Store name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Store name must not exceed 100 characters' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  addressText?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80, { message: 'City must not exceed 80 characters' })
  city: string;

  @IsEnum(Category)
  @IsNotEmpty()
  category: Category;

  @IsString()
  @IsNotEmpty()
  @Matches(/^966\d{9}$/, { message: 'WhatsApp number must be in format: 966XXXXXXXXX' })
  whatsappNumber: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Instagram handle must not exceed 100 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Instagram handle must contain only letters, numbers, and underscores' })
  instagramHandle?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo URL must be a valid URL' })
  logoUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsUrl({}, { each: true })
  galleryUrls?: string[];

  @IsOptional()
  @IsUrl({}, { message: 'Certification URL must be a valid URL' })
  certificationUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(16, { message: 'Latitude must be between 16 and 32 (Saudi Arabia bounds)' })
  @Max(32, { message: 'Latitude must be between 16 and 32 (Saudi Arabia bounds)' })
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(34, { message: 'Longitude must be between 34 and 56 (Saudi Arabia bounds)' })
  @Max(56, { message: 'Longitude must be between 34 and 56 (Saudi Arabia bounds)' })
  longitude?: number;
}

export class UpdateStoreDto extends PartialType(CreateStoreDto) {}

export class StoreQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  verified?: boolean;

  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class VerifyStoreDto {
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isVerified: boolean;
}

export class SubmitCertificationDto {
  @IsUrl({ protocols: ['https'], require_protocol: true })
  certificationUrl: string;
}
