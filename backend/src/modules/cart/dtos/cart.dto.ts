import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number = 1;
}

export class UpdateCartItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
