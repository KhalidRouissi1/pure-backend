import { 
  IsArray, 
  ArrayMinSize, 
  ArrayMaxSize, 
  IsNotEmpty, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';

export class UploadImagesDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least 1 image is required' })
  @ArrayMaxSize(5, { message: 'Maximum 5 images allowed' })
  @IsNotEmpty({ each: true, message: 'Image cannot be empty' })
  @Type(() => String)
  images: string[];
}
