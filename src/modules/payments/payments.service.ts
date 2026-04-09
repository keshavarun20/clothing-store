import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '../orders/orders.service';


@Injectable()
export class PaymentsService {
  private stripe: any;  // ← any here

  constructor(
    private config: ConfigService,
    private orders: OrdersService,
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

    let event: any;  // ← any here

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch {
      throw new Error('Invalid webhook signature');
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;  // ← no type cast needed
      const orderId = intent.metadata?.orderId;
        if (!orderId) {
    console.log('No orderId in metadata, skipping...');
    return { received: true };  // ← just return, don't crash
  }
      await this.orders.updateStatus(orderId, 'paid');
    }

    return { received: true };
  }
}