import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { quotes } from '../db/schema';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

type Requester = {
  id: string;
  role: 'admin' | 'employee';
};

@Injectable()
export class QuotesService {
  async findAll(requester: Requester) {
    this.ensureAdmin(requester);

    return db
      .select({
        id: quotes.id,
        client_name: quotes.clientName,
        address: quotes.address,
        description: quotes.description,
        price: quotes.price,
        status: quotes.status,
        created_at: quotes.createdAt,
      })
      .from(quotes)
      .orderBy(desc(quotes.createdAt));
  }

  async create(dto: CreateQuoteDto, requester: Requester) {
    this.ensureAdmin(requester);

    const clientName = dto.client_name.trim();
    const address = dto.address.trim();
    const description = dto.description.trim();

    if (!clientName || !address || !description) {
      throw new BadRequestException(
        'client_name, address and description are required',
      );
    }

    const rows = await db
      .insert(quotes)
      .values({
        clientName,
        address,
        description,
        price: dto.price.toString(),
        status: dto.status ?? 'draft',
      })
      .returning({
        id: quotes.id,
        status: quotes.status,
      });

    return rows[0];
  }

  async update(id: string, dto: UpdateQuoteDto, requester: Requester) {
    this.ensureAdmin(requester);

    const setPayload: {
      clientName?: string;
      address?: string;
      description?: string;
      price?: string;
      status?: 'draft' | 'sent';
    } = {};
    const responsePayload: Record<string, unknown> = { id };

    if (dto.client_name !== undefined) {
      const value = dto.client_name.trim();
      if (!value) {
        throw new BadRequestException('client_name cannot be empty');
      }
      setPayload.clientName = value;
      responsePayload.client_name = value;
    }
    if (dto.address !== undefined) {
      const value = dto.address.trim();
      if (!value) {
        throw new BadRequestException('address cannot be empty');
      }
      setPayload.address = value;
      responsePayload.address = value;
    }
    if (dto.description !== undefined) {
      const value = dto.description.trim();
      if (!value) {
        throw new BadRequestException('description cannot be empty');
      }
      setPayload.description = value;
      responsePayload.description = value;
    }
    if (dto.price !== undefined) {
      setPayload.price = dto.price.toString();
      responsePayload.price = dto.price.toFixed(2);
    }
    if (dto.status !== undefined) {
      setPayload.status = dto.status;
      responsePayload.status = dto.status;
    }

    if (Object.keys(setPayload).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const updated = await db
      .update(quotes)
      .set(setPayload)
      .where(eq(quotes.id, id))
      .returning({ id: quotes.id });

    return updated.length > 0 ? responsePayload : null;
  }

  async remove(id: string, requester: Requester) {
    this.ensureAdmin(requester);

    const deleted = await db
      .delete(quotes)
      .where(eq(quotes.id, id))
      .returning({ id: quotes.id });

    return deleted.length > 0;
  }

  private ensureAdmin(requester: Requester) {
    if (requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can manage quotes');
    }
  }
}

