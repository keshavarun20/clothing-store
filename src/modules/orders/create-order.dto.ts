import {
  IsString, IsEmail, IsArray,
  ValidateNested, IsUUID, IsInt, Min, IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString() 
  productId: string;

  @IsString() 
  variantId: string;

  @IsInt() @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  // customer info
  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  // shipping address
  @IsString()
  addressLine1: string;

  @IsOptional() @IsString()
  addressLine2?: string;

  @IsString()
  city: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  // items
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}