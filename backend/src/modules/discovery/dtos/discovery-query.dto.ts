import { IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Category } from '@prisma/client';

export class DiscoveryQueryDto {
  @IsEnum(['category', 'region'])
  groupBy: 'category' | 'region';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Boolean)
  verified?: boolean = true;
}
