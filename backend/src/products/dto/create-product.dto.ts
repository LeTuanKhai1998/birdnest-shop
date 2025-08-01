import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  price: string;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsArray()
  @IsOptional()
  images?: Array<{
    url: string;
    isPrimary: boolean;
  }>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
