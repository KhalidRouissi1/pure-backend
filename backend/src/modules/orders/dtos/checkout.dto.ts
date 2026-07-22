import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  CARD_ON_DELIVERY = 'CARD_ON_DELIVERY',
}

export class CheckoutDto {
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
