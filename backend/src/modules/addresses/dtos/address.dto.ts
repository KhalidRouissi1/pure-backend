import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @Length(2, 40)
  label: string;

  @IsString()
  @Length(2, 100)
  recipient: string;

  @IsString()
  @Matches(/^966\d{9}$/)
  phone: string;

  @IsString()
  @Length(2, 80)
  city: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  addressText?: string;

  @IsString()
  @Length(5, 200)
  line1: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  line2?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(16)
  @Max(32)
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(34)
  @Max(56)
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto extends CreateAddressDto {}
