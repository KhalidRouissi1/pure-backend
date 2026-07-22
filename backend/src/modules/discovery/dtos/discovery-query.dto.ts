import { IsEnum, IsOptional, IsInt, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class DiscoveryQueryDto {
  @IsEnum(['category', 'region'])
  groupBy: 'category' | 'region';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

}

export class TrendingQueryDto {
  @IsOptional()
  @IsIn(['1d', '7d', '30d'])
  period = '7d';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

export class NewProductsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days = 7;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
