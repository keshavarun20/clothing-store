import {
  IsString, IsNumber, IsPositive,
  IsOptional, IsArray, ValidateNested, Min, IsInt
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductImageDto {
  @IsString()
  url: string;

  @IsInt() @Min(0) @IsOptional()
  position?: number;
}

export class CreateProductVariantDto {
  @IsString()
  color: string;

  @IsString()
  size: string;

  @IsInt() @Min(0)
  stock: number;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsNumber() @IsPositive()
  price: number;

  @IsOptional() @IsString()
  category?: string;

  @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images: CreateProductImageDto[];

  @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];
}