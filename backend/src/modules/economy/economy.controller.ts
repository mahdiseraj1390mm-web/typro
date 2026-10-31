import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { EconomyService } from './economy.service';

@Controller('api/economy')
export class EconomyController {
  constructor(private readonly economyService: EconomyService) {}

  @Get('wallet/:userId')
  getWallet(@Param('userId') userId: string) {
    return this.economyService.getWallet(userId);
  }

  @Get('store')
  getStoreCatalog() {
    return this.economyService.getStoreCatalog();
  }

  @Get('inventory/:userId')
  getUserInventory(@Param('userId') userId: string) {
    return this.economyService.getUserInventory(userId);
  }

  @Post('purchase')
  purchaseItem(
    @Body() body: { userId: string; itemId: string; currency: 'coins' | 'diamonds' }
  ) {
    return this.economyService.purchaseItem(body.userId, body.itemId, body.currency);
  }

  @Post('orders')
  createOrder(
    @Body()
    body: {
      clientId: string;
      freelancerId: string;
      title: string;
      description: string;
      amountToman: number;
    }
  ) {
    return this.economyService.createFreelancerOrder(body);
  }

  @Post('orders/:id/release-escrow')
  releaseEscrow(@Param('id') id: string, @Body() body: { clientId: string }) {
    return this.economyService.releaseEscrow(id, body.clientId);
  }

  @Get('orders/:userId')
  getUserOrders(@Param('userId') userId: string) {
    return this.economyService.getUserOrders(userId);
  }
}
