import { Injectable } from '@nestjs/common';

export interface OrderItem {
  id: string;
  title: string;
  category: 'typing_fa' | 'typing_en' | 'math_formula' | 'audio_transcription' | 'rewriting';
  categoryFa: string;
  employerId: string;
  employerName: string;
  freelancerId?: string;
  freelancerName?: string;
  amountToman: number;
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Submitted' | 'Revision' | 'Completed' | 'Disputed' | 'Cancelled';
  statusFa: string;
  createdAt: string;
  deadlineDays: number;
  deadlineDate: string;
  wordCountOrDuration: string;
  description?: string;
  files: { name: string; size: string; type: string; url?: string }[];
  escrowRef: string;
  escrowStatus: 'Held' | 'Released' | 'Refunded' | 'Disputed';
  rating?: number;
  reviewComment?: string;
  revisionNotes?: string;
  disputeReason?: string;
}

@Injectable()
export class OrdersService {
  // Real orders store - starting empty with 0 fake data
  private orders: OrderItem[] = [];

  getAllOrders(): OrderItem[] {
    return this.orders;
  }

  getOrderById(id: string): OrderItem | undefined {
    return this.orders.find((o) => o.id === id);
  }

  createOrder(dto: Partial<OrderItem>): OrderItem {
    const id = dto.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const escrowRef = dto.escrowRef || `ESC-${Math.floor(1000000 + Math.random() * 9000000)}`;
    
    const newOrder: OrderItem = {
      id,
      title: dto.title || 'سفارش تایپ جدید',
      category: dto.category || 'typing_fa',
      categoryFa: dto.categoryFa || 'تایپ متنی فارسی',
      employerId: dto.employerId || 'user-emp-01',
      employerName: dto.employerName || 'کارفرمای محترم',
      freelancerId: dto.freelancerId || '',
      freelancerName: dto.freelancerName || 'در انتظار تخصیص مجری',
      amountToman: Number(dto.amountToman) || 150000,
      status: dto.status || 'Pending',
      statusFa: dto.statusFa || 'در انتظار تایید و تخصیص',
      createdAt: dto.createdAt || new Date().toLocaleDateString('fa-IR'),
      deadlineDays: Number(dto.deadlineDays) || 3,
      deadlineDate: dto.deadlineDate || '۳ روز پس از تایید',
      wordCountOrDuration: dto.wordCountOrDuration || '۲,۵۰۰ کلمه',
      description: dto.description || '',
      files: dto.files || [],
      escrowRef,
      escrowStatus: 'Held',
      rating: dto.rating,
      reviewComment: dto.reviewComment,
      revisionNotes: dto.revisionNotes,
      disputeReason: dto.disputeReason,
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  updateOrder(id: string, updates: Partial<OrderItem>): OrderItem | null {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) return null;

    const existing = this.orders[index];
    const updated: OrderItem = {
      ...existing,
      ...updates,
    };

    if (updates.status) {
      if (updates.status === 'Completed' && !updates.escrowStatus) {
        updated.escrowStatus = 'Released';
      }
      if (updates.status === 'Cancelled' && !updates.escrowStatus) {
        updated.escrowStatus = 'Refunded';
      }
      if (updates.status === 'Disputed' && !updates.escrowStatus) {
        updated.escrowStatus = 'Disputed';
      }
    }

    this.orders[index] = updated;
    return updated;
  }

  deleteOrder(id: string): boolean {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) return false;
    this.orders.splice(index, 1);
    return true;
  }
}
