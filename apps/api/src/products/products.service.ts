import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { and, desc, eq, ilike, type SQL } from 'drizzle-orm';
import { db } from '../db';
import { products } from '../db/schema';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { PRODUCT_UNITS, type ProductUnit } from './products.constants';
import { UpdateProductDto } from './dto/update-product.dto';

type Requester = {
  id: string;
  role: 'admin' | 'employee';
};

@Injectable()
export class ProductsService {
  async findAll(query: ListProductsQueryDto) {
    const filters: SQL<unknown>[] = [];
    if (query.search) {
      filters.push(ilike(products.name, `%${query.search.trim()}%`));
    }

    return db
      .select({
        id: products.id,
        name: products.name,
        unit: products.unit,
        stock_quantity: products.stockQuantity,
        created_at: products.createdAt,
      })
      .from(products)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(products.createdAt));
  }

  async findById(id: string) {
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        unit: products.unit,
        stock_quantity: products.stockQuantity,
        created_at: products.createdAt,
      })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async create(dto: CreateProductDto, requester: Requester) {
    this.ensureAdmin(requester);

    const name = dto.name.trim();
    const unit = this.normalizeUnit(dto.unit);
    if (!name || !unit) {
      throw new BadRequestException('name and unit are required');
    }

    const rows = await db
      .insert(products)
      .values({
        name,
        unit,
        stockQuantity: (dto.stock_quantity ?? 0).toString(),
      })
      .returning({
        id: products.id,
        name: products.name,
        unit: products.unit,
        stock_quantity: products.stockQuantity,
        created_at: products.createdAt,
      });

    return rows[0];
  }

  async update(id: string, dto: UpdateProductDto, requester: Requester) {
    this.ensureAdmin(requester);

    const setPayload: {
      name?: string;
      unit?: ProductUnit;
      stockQuantity?: string;
    } = {};
    const responsePayload: Record<string, unknown> = { id };

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (!name) {
        throw new BadRequestException('name cannot be empty');
      }
      setPayload.name = name;
      responsePayload.name = name;
    }
    if (dto.unit !== undefined) {
      const unit = this.normalizeUnit(dto.unit);
      setPayload.unit = unit;
      responsePayload.unit = unit;
    }
    if (dto.stock_quantity !== undefined) {
      setPayload.stockQuantity = dto.stock_quantity.toString();
      responsePayload.stock_quantity = dto.stock_quantity;
    }

    if (Object.keys(setPayload).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const updated = await db
      .update(products)
      .set(setPayload)
      .where(eq(products.id, id))
      .returning({ id: products.id });

    return updated.length > 0 ? responsePayload : null;
  }

  async remove(id: string, requester: Requester) {
    this.ensureAdmin(requester);

    const deleted = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });

    return deleted.length > 0;
  }

  private ensureAdmin(requester: Requester) {
    if (requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can manage products');
    }
  }

  private normalizeUnit(unit: string): ProductUnit {
    const normalized = unit.trim().toLowerCase();
    if (!PRODUCT_UNITS.includes(normalized as ProductUnit)) {
      throw new BadRequestException(
        `Invalid unit. Allowed: ${PRODUCT_UNITS.join(', ')}`,
      );
    }
    return normalized as ProductUnit;
  }
}
