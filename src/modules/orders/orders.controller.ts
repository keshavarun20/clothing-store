import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orders.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orders.findOne(id);
  }

  @Patch(':id/ship')
  async markShipped(
    @Param('id') id: string,
    @Body() body: { trackingUrl: string; carrier: string },
  ) {
    return this.orders.markShipped(id, body.trackingUrl, body.carrier);
  }

  @Patch(':id/deliver')
  async markDelivered(@Param('id') id: string) {
    return this.orders.markDelivered(id);
  }

  @Get()
  findAll() {
    return this.orders.findAll();
  }
}
