import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  finAll(@Query('category') cat?: string) {
    return this.products.findAll(cat);
  }

  @Get('admin')
  findAllAdmin() {
    return this.products.findAllAdmin();
  }

  @Get(':id') // GET /products/:id
  findOne(@Param('id') id: string) {
    return this.products.findOne(id);
  }

  @Post() // POST /products
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Patch(':id') // PATCH /products/:id
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.products.update(id, dto);
  }

  @Patch(':id/images')
  replaceImages(
    @Param('id') id: string,
    @Body() body: { images: { url: string; position: number }[] },
  ) {
    return this.products.replaceImages(id, body.images);
  }

  @Patch(':id/variants')
  replaceVariants(
    @Param('id') id: string,
    @Body()
    body: { variants: { color: string; size: string; stock: number }[] },
  ) {
    return this.products.replaceVariants(id, body.variants);
  }

  @Delete(':id') // DELETE /products/:id
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }
}
