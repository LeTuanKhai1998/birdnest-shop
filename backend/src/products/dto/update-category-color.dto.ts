import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryColorDto {
  @IsOptional()
  @IsString()
  colorScheme?: string;
} 