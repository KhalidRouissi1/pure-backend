import { IsOptional, IsString, IsUrl, MaxLength, Matches, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  @MaxLength(50)
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
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
