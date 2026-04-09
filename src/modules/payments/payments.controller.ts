import {
  Controller, Post, Body, Headers,
  Req, HttpCode, BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { RawBodyRequest } from '@nestjs/common'; 
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('create-intent')
  createIntent(@Body() body: { orderId: string }) {
    if (!body.orderId) throw new BadRequestException('orderId is required');
    return this.payments.createPaymentIntent(body.orderId);
  }

  @Post('webhook')
  @HttpCode(200)
  handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.payments.handleWebhook(req.rawBody!, signature);
  }
}