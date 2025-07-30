import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class SearchGuestOrdersDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  query: string;
}
