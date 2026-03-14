import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { gardens, payments } from '../db/schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

type Requester = {
  id: string;
  role: 'admin' | 'employee';
};

@Injectable()
export class PaymentsService {
  async findAll(requester: Requester) {
    this.ensureAdmin(requester);
    return this.findAllFull();
  }

  async create(dto: CreatePaymentDto, requester: Requester) {
    this.ensureAdmin(requester);
    await this.assertGardenExists(dto.garden_id);

    const rows = await db
      .insert(payments)
      .values({
        gardenId: dto.garden_id,
        month: dto.month,
        year: dto.year,
        amount: dto.amount.toString(),
        paidAt: dto.paid_at ? new Date(dto.paid_at) : null,
        notes: dto.notes,
      })
      .returning({
        id: payments.id,
        garden_id: payments.gardenId,
        amount: payments.amount,
      });

    return rows[0];
  }

  async update(id: string, dto: UpdatePaymentDto, requester: Requester) {
    this.ensureAdmin(requester);

    if (dto.garden_id !== undefined) {
      await this.assertGardenExists(dto.garden_id);
    }

    const setPayload: {
      gardenId?: string;
      month?: number;
      year?: number;
      amount?: string;
      paidAt?: Date | null;
      notes?: string;
    } = {};
    const responsePayload: Record<string, unknown> = { id };

    if (dto.garden_id !== undefined) {
      setPayload.gardenId = dto.garden_id;
      responsePayload.garden_id = dto.garden_id;
    }
    if (dto.month !== undefined) {
      setPayload.month = dto.month;
      responsePayload.month = dto.month;
    }
    if (dto.year !== undefined) {
      setPayload.year = dto.year;
      responsePayload.year = dto.year;
    }
    if (dto.amount !== undefined) {
      setPayload.amount = dto.amount.toString();
      responsePayload.amount = dto.amount.toFixed(2);
    }
    if (dto.paid_at !== undefined) {
      setPayload.paidAt = dto.paid_at ? new Date(dto.paid_at) : null;
      responsePayload.paid_at = dto.paid_at;
    }
    if (dto.notes !== undefined) {
      setPayload.notes = dto.notes;
      responsePayload.notes = dto.notes;
    }

    if (Object.keys(setPayload).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const updated = await db
      .update(payments)
      .set(setPayload)
      .where(eq(payments.id, id))
      .returning({ id: payments.id });

    return updated.length > 0 ? responsePayload : null;
  }

  async findById(id: string, requester: Requester) {
    this.ensureAdmin(requester);

    const rows = await db
      .select({
        id: payments.id,
        garden_id: payments.gardenId,
        month: payments.month,
        year: payments.year,
        amount: payments.amount,
        paid_at: payments.paidAt,
        notes: payments.notes,
      })
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);

    const payment = rows[0];
    return payment ?? null;
  }

  async remove(id: string, requester: Requester) {
    this.ensureAdmin(requester);

    const deleted = await db
      .delete(payments)
      .where(eq(payments.id, id))
      .returning({ id: payments.id });

    return deleted.length > 0;
  }

  private async findAllFull() {
    return db
      .select({
        id: payments.id,
        garden_id: payments.gardenId,
        month: payments.month,
        year: payments.year,
        amount: payments.amount,
        paid_at: payments.paidAt,
        notes: payments.notes,
      })
      .from(payments)
      .orderBy(desc(payments.year), desc(payments.month), desc(payments.id));
  }

  private ensureAdmin(requester: Requester) {
    if (requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can manage payments');
    }
  }

  private async assertGardenExists(gardenId: string) {
    const rows = await db
      .select({ id: gardens.id })
      .from(gardens)
      .where(eq(gardens.id, gardenId))
      .limit(1);
    if (!rows[0]) {
      throw new NotFoundException('Garden not found');
    }
  }

}
