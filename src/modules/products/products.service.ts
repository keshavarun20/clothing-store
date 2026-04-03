import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from 'src/database/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private supabase: SupabaseService) {}

  // LIST VIEW — name, category, price, one image only
  async findAll(category?: string) {
    let query = this.supabase.db
      .from('products')
      .select(
        `
      id,
      name,
      category,
      price,
      product_images!inner(url, position)
    `,
      )
      .eq('product_images.position', 0) // main image only
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  // DETAIL VIEW — everything
  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from('products')
      .select(
        `
      *,
      product_images(*),
      product_variants(*)
    `,
      )
      .eq('id', id)
      .order('position', { referencedTable: 'product_images', ascending: true })
      .single();

    if (error || !data) throw new NotFoundException('Product not found');
    return data;
  }

  async create(dto: CreateProductDto) {
    // step 1 — insert the product
    const { data: product, error: productError } = await this.supabase.db
      .from('products')
      .insert({
        name: dto.name,
        description: dto.description,
        price: dto.price,
        category: dto.category,
      })
      .select()
      .single();

    if (productError) throw new Error(productError.message);

    // step 2 — insert images
    if (dto.images?.length) {
      const images = dto.images.map((img, index) => ({
        product_id: product.id,
        url: img.url,
        position: img.position ?? index,
      }));

      const { error: imagesError } = await this.supabase.db
        .from('product_images')
        .insert(images);

      if (imagesError) throw new Error(imagesError.message);
    }

    // step 3 — insert variants
    if (dto.variants?.length) {
      const variants = dto.variants.map((v) => ({
        product_id: product.id,
        color: v.color,
        size: v.size,
        stock: v.stock,
      }));

      const { error: variantsError } = await this.supabase.db
        .from('product_variants')
        .insert(variants);

      if (variantsError) throw new Error(variantsError.message);
    }

    // step 4 — return full product with images and variants
    return this.findOne(product.id);
  }

  async update(id: string, body: any) {
    const { data, error } = await this.supabase.db
      .from('products')
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        category: body.category,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('Product not found');
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.db
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new NotFoundException('Product not found');
    return { deleted: true };
  }
}
