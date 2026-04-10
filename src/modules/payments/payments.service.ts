import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '../orders/orders.service';
import { EmailService } from '../email/email.service';


@Injectable()
export class PaymentsService {
  private stripe: any;  // ← any here

  constructor(
    private config: ConfigService,
    private orders: OrdersService,
    private email:   EmailService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY')!);
  }

  async createPaymentIntent(orderId: string) {
    const order = await this.orders.findOne(orderId);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount:   Math.round(order.total * 100),
      currency: 'gbp',
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    });

    await this.orders.updateStripeIntent(orderId, paymentIntent.id);

    return {
      clientSecret: paymentIntent.client_secret,
      orderId,
      total: order.total,  
    };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET')!;
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch {
      throw new Error('Invalid webhook signature');
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent  = event.data.object;
      const orderId = intent.metadata?.orderId;

      if (!orderId) return { received: true };

      // update order status
      await this.orders.updateStatus(orderId, 'paid');

      // fetch order details for email
      const order = await this.orders.findOne(orderId);

      // send confirmation email
      await this.email.sendOrderConfirmation({
        email:   order.customer_email,
        name:    order.customer_name,
        orderId: order.id,
        total:   order.total,
        items:   order.order_items.map((item: any) => ({
          name:     item.products.name,
          color:    item.product_variants.color,
          size:     item.product_variants.size,
          quantity: item.quantity,
          price:    item.unit_price,
        })),
      });
    }

    return { received: true };
  }
}