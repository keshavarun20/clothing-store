import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from 'src/database/supabase.service';
import { CreateOrderDto } from './create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private supabase: SupabaseService) {}

  async create(dto: CreateOrderDto) {
    // step 1 — fetch all variants to get prices and check stock
    const variantIds = dto.items.map((i) => i.variantId);

    const { data: variants, error: variantError } = await this.supabase.db
      .from('product_variants')
      .select('id, stock, product_id, color, size, products(name, price)')
      .in('id', variantIds);

    if (variantError) throw new Error(variantError.message);

    // step 2 — validate each item
    for (const item of dto.items) {
      const variant = variants.find((v) => v.id === item.variantId);

      if (!variant) {
        throw new NotFoundException(`Variant ${item.variantId} not found`);
      }
      if (variant.stock < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for ${(variant.products as any).name} - ${variant.color} / ${variant.size}`,
        );
      }
    }

    // step 3 — calculate total server side (never trust frontend price)
    const total = dto.items.reduce((sum, item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) return sum;
      const price = (variant.products as any).price;
      return sum + price * item.quantity;
    }, 0);

    // step 4 — create the order
    const { data: order, error: orderError } = await this.supabase.db
      .from('orders')
      .insert({
        customer_name: dto.customerName,
        customer_email: dto.customerEmail,
        address_line1: dto.addressLine1,
        address_line2: dto.addressLine2,
        city: dto.city,
        postal_code: dto.postalCode,
        country: dto.country,
        total: total,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // step 5 — create order items
    const orderItems = dto.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant)
        throw new NotFoundException(`Variant ${item.variantId} not found`);
      return {
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: (variant.products as any).price,
      };
    });

    const { error: itemsError } = await this.supabase.db
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw new Error(itemsError.message);

    // step 6 — reduce stock for each variant
    for (const item of dto.items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) continue;
      await this.supabase.db
        .from('product_variants')
        .update({ stock: variant.stock - item.quantity })
        .eq('id', item.variantId);
    }

    return { orderId: order.id, total };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from('orders')
      .select(
        `
        *,
        order_items(
          *,
          products(name, price),
          product_variants(color, size)
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Order not found');
    return data;
  }

  async updateStatus(id: string, status: string) {
    const { error } = await this.supabase.db
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { updated: true };
  }

  async updateStripeIntent(id: string, paymentIntentId: string) {
    const { error } = await this.supabase.db
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntentId })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
