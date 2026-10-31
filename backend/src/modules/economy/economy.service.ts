import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

export interface Wallet {
  userId: string;
  coins: number;
  diamonds: number;
  tomanBalance: number;
  updatedAt: string;
}

export interface StoreItem {
  id: string;
  name: string;
  category: 'skin' | 'sound' | 'theme' | 'keyboard' | 'badge';
  priceCoins: number;
  priceDiamonds: number;
  description: string;
  previewUrl?: string;
  isPopular?: boolean;
}

export interface FreelancerOrder {
  id: string;
  clientId: string;
  freelancerId: string;
  title: string;
  description: string;
  amountToman: number;
  escrowStatus: 'HELD_IN_ESCROW' | 'RELEASED' | 'DISPUTED' | 'REFUNDED';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

@Injectable()
export class EconomyService {
  private wallets: Map<string, Wallet> = new Map([
    [
      'user-me-01',
      {
        userId: 'user-me-01',
        coins: 0,
        diamonds: 0,
        tomanBalance: 0,
        updatedAt: new Date().toISOString(),
      },
    ],
  ]);

  private userInventories: Map<string, string[]> = new Map([
    ['user-me-01', ['skin-pride', 'sound-cherry-blue']],
  ]);

  private storeCatalog: StoreItem[] = [
    {
      id: 'skin-dena-plus',
      name: 'پوسته دنا پلاس توربو شارژ',
      category: 'skin',
      priceCoins: 500,
      priceDiamonds: 10,
      description: 'طراحی ویژه اختصاصی با هود آیرودینامیک و افکت دود هنگام رسیدن به ۱۰۰ کلمه در دقیقه',
      isPopular: true,
    },
    {
      id: 'skin-cyber-phantom',
      name: 'پوسته سایبر فانتوم نئونی',
      category: 'skin',
      priceCoins: 1200,
      priceDiamonds: 30,
      description: 'ماشین مسابقه فوق‌مدرن آینده‌نگر با چرخ‌های نئونی آبی و بنفش',
      isPopular: true,
    },
    {
      id: 'sound-holy-panda',
      name: 'پک صوتی سویچ‌های مکانیکی Holy Panda',
      category: 'sound',
      priceCoins: 300,
      priceDiamonds: 5,
      description: 'صدای کوبش عمیق، رضایت‌بخش و لمسی (Tactile Thock)',
      isPopular: true,
    },
    {
      id: 'sound-box-jade',
      name: 'پک صوتی سویچ‌های کلیکی Kailh Box Jade',
      category: 'sound',
      priceCoins: 250,
      priceDiamonds: 4,
      description: 'صدای کلیک مضاعف کریستالی و فوق‌العاده تیز',
    },
    {
      id: 'theme-nordic-frost',
      name: 'تم کیبورد Nordic Frost',
      category: 'theme',
      priceCoins: 400,
      priceDiamonds: 8,
      description: 'طیف رنگی ملایم سفید یخی، نوک‌مدادی و دکمه‌های راهنمای نوردیک',
    },
  ];

  private orders: FreelancerOrder[] = [
    {
      id: 'ord-8401',
      clientId: 'client-user-9',
      freelancerId: 'user-me-01',
      title: 'پیاده‌سازی و تایپ ۳۰ صفحه کتاب دست‌نویس فقهی',
      description: 'تایپ دقیق با اعراب کامل کلمات و استخراج فهرست منابع با رعایت استانداردهای رسم‌الخط مصوب',
      amountToman: 450000,
      escrowStatus: 'HELD_IN_ESCROW',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
    },
  ];

  getWallet(userId: string): Wallet {
    let wallet = this.wallets.get(userId);
    if (!wallet) {
      wallet = {
        userId,
        coins: 0,
        diamonds: 0,
        tomanBalance: 0,
        updatedAt: new Date().toISOString(),
      };
      this.wallets.set(userId, wallet);
    }
    return wallet;
  }

  getStoreCatalog(): StoreItem[] {
    return this.storeCatalog;
  }

  getUserInventory(userId: string): string[] {
    return this.userInventories.get(userId) || [];
  }

  purchaseItem(userId: string, itemId: string, currency: 'coins' | 'diamonds') {
    const item = this.storeCatalog.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('کالای مورد نظر در فروشگاه یافت نشد.');
    }

    const inventory = this.getUserInventory(userId);
    if (inventory.includes(itemId)) {
      throw new BadRequestException('شما قبلاً این آیتم را خریداری کرده‌اید.');
    }

    const wallet = this.getWallet(userId);
    if (currency === 'coins') {
      if (wallet.coins < item.priceCoins) {
        throw new BadRequestException('سکه کافی برای خرید این آیتم موجود نیست.');
      }
      wallet.coins -= item.priceCoins;
    } else {
      if (wallet.diamonds < item.priceDiamonds) {
        throw new BadRequestException('الماس کافی برای خرید این آیتم موجود نیست.');
      }
      wallet.diamonds -= item.priceDiamonds;
    }

    wallet.updatedAt = new Date().toISOString();
    inventory.push(itemId);
    this.userInventories.set(userId, inventory);

    return {
      success: true,
      message: `آیتم «${item.name}» با موفقیت خریداری شد و به دارایی‌های شما افزوده شد.`,
      wallet,
      inventory,
    };
  }

  createFreelancerOrder(dto: {
    clientId: string;
    freelancerId: string;
    title: string;
    description: string;
    amountToman: number;
  }): FreelancerOrder {
    const order: FreelancerOrder = {
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: dto.clientId,
      freelancerId: dto.freelancerId,
      title: dto.title,
      description: dto.description,
      amountToman: dto.amountToman,
      escrowStatus: 'HELD_IN_ESCROW', // Section 126 Escrow Guarantee
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(order);
    return order;
  }

  releaseEscrow(orderId: string, clientId: string): FreelancerOrder {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new NotFoundException('سفارش یافت نشد.');
    }
    if (order.clientId !== clientId) {
      throw new BadRequestException('تنها کارفرما مجاز به آزادسازی مبلغ امانی است.');
    }

    order.escrowStatus = 'RELEASED';
    order.status = 'COMPLETED';

    // Credit freelancer wallet
    const freelancerWallet = this.getWallet(order.freelancerId);
    freelancerWallet.tomanBalance += order.amountToman;

    return order;
  }

  getUserOrders(userId: string): FreelancerOrder[] {
    return this.orders.filter((o) => o.clientId === userId || o.freelancerId === userId);
  }
}
