import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private config: ConfigService) {
    this.resend = new Resend(this.config.get('RESEND_API_KEY')!);
  }

  async sendOrderConfirmation(payload: {
    email: string;
    name: string;
    orderId: string;
    items: {
      name: string;
      color: string;
      size: string;
      quantity: number;
      price: number;
    }[];
    total: number;
  }) {
    const itemRows = payload.items
      .map(
        (item) => `
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#374151">${item.name}</td>
        <td style="padding:8px 0;font-size:14px;color:#6B7280">${item.color} / ${item.size}</td>
        <td style="padding:8px 0;font-size:14px;color:#6B7280;text-align:center">${item.quantity}</td>
        <td style="padding:8px 0;font-size:14px;color:#111827;text-align:right">£${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'keshavarun1220@gmail.com',
      subject: `Order confirmed — #${payload.orderId.slice(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
          <h1 style="font-size:22px;font-weight:600;color:#111827;margin-bottom:8px">
            Thanks for your order, ${payload.name}!
          </h1>
          <p style="font-size:14px;color:#6B7280;margin-bottom:32px">
            Your order has been confirmed and will be on its way soon.
          </p>

          <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF;margin-bottom:12px">
              Order #${payload.orderId.slice(0, 8).toUpperCase()}
            </p>
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="border-bottom:1px solid #E5E7EB">
                  <th style="padding:0 0 8px;font-size:11px;color:#9CA3AF;text-align:left;font-weight:500">Item</th>
                  <th style="padding:0 0 8px;font-size:11px;color:#9CA3AF;text-align:left;font-weight:500">Variant</th>
                  <th style="padding:0 0 8px;font-size:11px;color:#9CA3AF;text-align:center;font-weight:500">Qty</th>
                  <th style="padding:0 0 8px;font-size:11px;color:#9CA3AF;text-align:right;font-weight:500">Price</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
            <div style="border-top:1px solid #E5E7EB;margin-top:12px;padding-top:12px;display:flex;justify-content:space-between">
              <span style="font-size:14px;font-weight:600;color:#111827">Total</span>
              <span style="font-size:14px;font-weight:600;color:#111827">£${payload.total.toFixed(2)}</span>
            </div>
          </div>

          <p style="font-size:13px;color:#9CA3AF;text-align:center">
            Questions? Reply to this email and we will get back to you.
          </p>
        </div>
      `,
    });
  }

  async sendShippingNotification(payload: {
    email: string;
    name: string;
    orderId: string;
    trackingUrl: string;
    carrier: string;
  }) {
    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'keshavarun1220@gmail.com',
      subject: `Your order #${payload.orderId.slice(0, 8).toUpperCase()} has shipped!`,
      html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h1 style="font-size:22px;font-weight:600;color:#111827;margin-bottom:8px">
          Your order is on its way, ${payload.name}!
        </h1>
        <p style="font-size:14px;color:#6B7280;margin-bottom:32px">
          Your order #${payload.orderId.slice(0, 8).toUpperCase()} has been shipped via ${payload.carrier}.
        </p>

        <a href="${payload.trackingUrl}"
          style="display:inline-block;padding:12px 24px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;margin-bottom:32px">
          Track your order
        </a>

        <p style="font-size:13px;color:#9CA3AF">
          Questions? Reply to this email and we will get back to you.
        </p>
      </div>
    `,
    });
  }

  async sendDeliveryNotification(payload: {
    email: string;
    name: string;
    orderId: string;
  }) {
    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'keshavarun1220@gmail.com',
      subject: `Your order #${payload.orderId.slice(0, 8).toUpperCase()} has been delivered!`,
      html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h1 style="font-size:22px;font-weight:600;color:#111827;margin-bottom:8px">
          Your order has arrived, ${payload.name}!
        </h1>
        <p style="font-size:14px;color:#6B7280;margin-bottom:32px">
          Your order #${payload.orderId.slice(0, 8).toUpperCase()} has been delivered. 
          We hope you love it!
        </p>

        <a href="http://localhost:3000/"
          style="display:inline-block;padding:12px 24px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;margin-bottom:32px">
          Shop again
        </a>

        <p style="font-size:13px;color:#9CA3AF">
          Questions? Reply to this email and we will get back to you.
        </p>
      </div>
    `,
    });
  }
}
