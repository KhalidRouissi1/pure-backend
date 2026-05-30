import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @Matches(/^05\d{8}$/, { message: 'Phone must match Saudi format (05XXXXXXXX)' })
  phone?: string;
}
