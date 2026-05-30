import { IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CheckoutDto {
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @IsString()
  @Length(3, 40)
  paymentMethod: string;

  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED'])
  paymentStatus?: 'PENDING' | 'CONFIRMED';
}
