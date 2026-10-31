import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { OrdersService, OrderItem } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getAllOrders(): OrderItem[] {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  getOrderById(@Param('id') id: string): OrderItem | undefined {
    return this.ordersService.getOrderById(id);
  }

  @Post()
  createOrder(@Body() dto: Partial<OrderItem>): OrderItem {
    return this.ordersService.createOrder(dto);
  }

  @Put(':id')
  updateOrder(@Param('id') id: string, @Body() updates: Partial<OrderItem>): OrderItem | null {
    return this.ordersService.updateOrder(id, updates);
  }

  @Delete(':id')
  deleteOrder(@Param('id') id: string): { success: boolean } {
    const deleted = this.ordersService.deleteOrder(id);
    return { success: deleted };
  }
}
