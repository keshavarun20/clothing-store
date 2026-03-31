import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from 'src/database/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private supabase: SupabaseService) {}

  async findAll(category?: string) {
    let query = this.supabase.db
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Product not found');
    return data;
  }

  async create(dto: CreateProductDto) {
    const { data, error } = await this.supabase.db
      .from('products')
      .insert(dto)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, dto: Partial<CreateProductDto>) {
    const { data, error } = await this.supabase.db
      .from('products')
      .update(dto)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw new NotFoundException('Product not found');
    return data;
  }

  async remove(id: string) {
    const { data, error } = await this.supabase.db
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new NotFoundException('Product not found');
    return { deleted: true };
  }
}
