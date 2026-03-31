import { IsString, IsNumber, IsPositive,
         IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()                   name: string;
  @IsOptional() @IsString()     description?: string;
  @IsNumber()   @IsPositive()   price: number;
  @IsNumber()   @Min(0)         stock: number;
  @IsOptional() @IsString()     image_url?: string;
  @IsOptional() @IsString()     category?: string;
}

