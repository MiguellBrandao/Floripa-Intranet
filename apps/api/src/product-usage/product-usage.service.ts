import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, gte, lte, type SQL } from 'drizzle-orm';
import { db } from '../db';
import {
  employeeTeams,
  employees,
  gardens,
  productUsage,
  products,
  tasks,
} from '../db/schema';
import { CreateProductUsageDto } from './dto/create-product-usage.dto';
import { ListProductUsageQueryDto } from './dto/list-product-usage-query.dto';
import { UpdateProductUsageDto } from './dto/update-product-usage.dto';

type Requester = {
  id: string;
  role: 'admin' | 'employee';
};

@Injectable()
export class ProductUsageService {
  async findAll(requester: Requester, query: ListProductUsageQueryDto) {
    const employeeId =
      requester.role === 'employee'
        ? await this.resolveEmployeeIdFromUser(requester.id)
        : null;

    if (requester.role === 'employee' && !employeeId) {
      return [];
    }

    const filters = this.buildFilters(query);
    if (requester.role === 'employee') {
      filters.push(eq(productUsage.employeeId, employeeId!));
    }

    return db
      .select({
        id: productUsage.id,
        product_id: productUsage.productId,
        product_name: products.name,
        garden_id: productUsage.gardenId,
        employee_id: productUsage.employeeId,
        quantity: productUsage.quantity,
        date: productUsage.date,
        notes: productUsage.notes,
      })
      .from(productUsage)
      .innerJoin(products, eq(productUsage.productId, products.id))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(productUsage.date), desc(productUsage.id));
  }

  async findById(id: string, requester: Requester) {
    const employeeId =
      requester.role === 'employee'
        ? await this.resolveEmployeeIdFromUser(requester.id)
        : null;

    if (requester.role === 'employee' && !employeeId) {
      return null;
    }

    const filters: SQL<unknown>[] = [eq(productUsage.id, id)];
    if (requester.role === 'employee') {
      filters.push(eq(productUsage.employeeId, employeeId!));
    }

    const rows = await db
      .select({
        id: productUsage.id,
        product_id: productUsage.productId,
        product_name: products.name,
        garden_id: productUsage.gardenId,
        employee_id: productUsage.employeeId,
        quantity: productUsage.quantity,
        date: productUsage.date,
        notes: productUsage.notes,
      })
      .from(productUsage)
      .innerJoin(products, eq(productUsage.productId, products.id))
      .where(and(...filters))
      .limit(1);

    return rows[0] ?? null;
  }

  async create(dto: CreateProductUsageDto, requester: Requester) {
    let targetEmployeeId: string;

    if (requester.role === 'admin') {
      if (!dto.employee_id) {
        throw new BadRequestException(
          'employee_id is required when admin creates product usage',
        );
      }
      targetEmployeeId = dto.employee_id;
    } else {
      if (dto.employee_id !== undefined) {
        throw new ForbiddenException('Employees cannot set employee_id');
      }
      const ownEmployeeId = await this.resolveEmployeeIdFromUser(requester.id);
      if (!ownEmployeeId) {
        throw new ForbiddenException('Employee profile not found');
      }
      targetEmployeeId = ownEmployeeId;
      await this.assertEmployeeCanAccessGarden(ownEmployeeId, dto.garden_id);
    }

    await this.assertEmployeeExists(targetEmployeeId);
    await this.assertGardenExists(dto.garden_id);
    await this.assertProductExists(dto.product_id);

    return db.transaction(async (tx) => {
      await this.adjustProductStock(tx, dto.product_id, -dto.quantity);

      const rows = await tx
        .insert(productUsage)
        .values({
          productId: dto.product_id,
          gardenId: dto.garden_id,
          employeeId: targetEmployeeId,
          quantity: dto.quantity.toString(),
          date: dto.date,
          notes: dto.notes,
        })
        .returning({
          id: productUsage.id,
          product_id: productUsage.productId,
          garden_id: productUsage.gardenId,
          employee_id: productUsage.employeeId,
          quantity: productUsage.quantity,
          date: productUsage.date,
          notes: productUsage.notes,
        });

      return rows[0];
    });
  }

  async update(id: string, dto: UpdateProductUsageDto, requester: Requester) {
    const rows = await db
      .select({
        id: productUsage.id,
        product_id: productUsage.productId,
        garden_id: productUsage.gardenId,
        employee_id: productUsage.employeeId,
        quantity: productUsage.quantity,
        date: productUsage.date,
        notes: productUsage.notes,
      })
      .from(productUsage)
      .where(eq(productUsage.id, id))
      .limit(1);

    const current = rows[0];
    if (!current) {
      return null;
    }

    if (requester.role === 'employee') {
      const ownEmployeeId = await this.resolveEmployeeIdFromUser(requester.id);
      if (!ownEmployeeId || current.employee_id !== ownEmployeeId) {
        throw new ForbiddenException(
          'You can only update your own product usage logs',
        );
      }
      if (dto.employee_id !== undefined) {
        throw new ForbiddenException('Employees cannot update employee_id');
      }
    }

    const targetProductId = dto.product_id ?? current.product_id;
    const targetGardenId = dto.garden_id ?? current.garden_id;
    const targetEmployeeId = dto.employee_id ?? current.employee_id;
    const targetQuantity = dto.quantity ?? Number(current.quantity);

    if (requester.role === 'employee') {
      await this.assertEmployeeCanAccessGarden(current.employee_id!, targetGardenId);
    }

    await this.assertProductExists(targetProductId);
    await this.assertGardenExists(targetGardenId);
    if (targetEmployeeId) {
      await this.assertEmployeeExists(targetEmployeeId);
    }

    const setPayload: {
      productId?: string;
      gardenId?: string;
      employeeId?: string;
      quantity?: string;
      date?: string;
      notes?: string;
    } = {};
    const responsePayload: Record<string, unknown> = { id };

    if (dto.product_id !== undefined) {
      setPayload.productId = dto.product_id;
      responsePayload.product_id = dto.product_id;
    }
    if (dto.garden_id !== undefined) {
      setPayload.gardenId = dto.garden_id;
      responsePayload.garden_id = dto.garden_id;
    }
    if (dto.employee_id !== undefined) {
      setPayload.employeeId = dto.employee_id;
      responsePayload.employee_id = dto.employee_id;
    }
    if (dto.quantity !== undefined) {
      setPayload.quantity = dto.quantity.toString();
      responsePayload.quantity = dto.quantity;
    }
    if (dto.date !== undefined) {
      setPayload.date = dto.date;
      responsePayload.date = dto.date;
    }
    if (dto.notes !== undefined) {
      setPayload.notes = dto.notes;
      responsePayload.notes = dto.notes;
    }

    if (Object.keys(setPayload).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    return db.transaction(async (tx) => {
      const currentQuantity = Number(current.quantity);
      if (targetProductId === current.product_id) {
        const stockDelta = currentQuantity - targetQuantity;
        await this.adjustProductStock(tx, targetProductId, stockDelta);
      } else {
        await this.adjustProductStock(tx, current.product_id, currentQuantity);
        await this.adjustProductStock(tx, targetProductId, -targetQuantity);
      }

      const updated = await tx
        .update(productUsage)
        .set(setPayload)
        .where(eq(productUsage.id, id))
        .returning({ id: productUsage.id });

      return updated.length > 0 ? responsePayload : null;
    });
  }

  async remove(id: string, requester: Requester) {
    if (requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete product usage logs');
    }

    const rows = await db
      .select({
        id: productUsage.id,
        product_id: productUsage.productId,
        quantity: productUsage.quantity,
      })
      .from(productUsage)
      .where(eq(productUsage.id, id))
      .limit(1);

    const current = rows[0];
    if (!current) {
      return false;
    }

    return db.transaction(async (tx) => {
      await this.adjustProductStock(tx, current.product_id, Number(current.quantity));

      const deleted = await tx
        .delete(productUsage)
        .where(eq(productUsage.id, id))
        .returning({ id: productUsage.id });

      return deleted.length > 0;
    });
  }

  private buildFilters(query: ListProductUsageQueryDto) {
    const filters: SQL<unknown>[] = [];
    if (query.product_id) filters.push(eq(productUsage.productId, query.product_id));
    if (query.garden_id) filters.push(eq(productUsage.gardenId, query.garden_id));
    if (query.employee_id) filters.push(eq(productUsage.employeeId, query.employee_id));
    if (query.date_from) filters.push(gte(productUsage.date, query.date_from));
    if (query.date_to) filters.push(lte(productUsage.date, query.date_to));
    return filters;
  }

  private async adjustProductStock(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    productId: string,
    delta: number,
  ) {
    const rows = await tx
      .select({
        id: products.id,
        stock_quantity: products.stockQuantity,
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    const product = rows[0];
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const currentStock = Number(product.stock_quantity);
    const newStock = currentStock + delta;
    if (newStock < 0) {
      throw new BadRequestException('Insufficient product stock');
    }

    await tx
      .update(products)
      .set({ stockQuantity: newStock.toString() })
      .where(eq(products.id, productId));
  }

  private async assertEmployeeExists(employeeId: string) {
    const rows = await db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1);
    if (!rows[0]) {
      throw new NotFoundException('Employee not found');
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

  private async assertProductExists(productId: string) {
    const rows = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!rows[0]) {
      throw new NotFoundException('Product not found');
    }
  }

  private async resolveEmployeeIdFromUser(userId: string) {
    const rows = await db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.userId, userId))
      .limit(1);
    return rows[0]?.id ?? null;
  }

  private async assertEmployeeCanAccessGarden(employeeId: string, gardenId: string) {
    const rows = await db
      .select({ garden_id: gardens.id })
      .from(employeeTeams)
      .innerJoin(tasks, eq(employeeTeams.teamId, tasks.teamId))
      .innerJoin(gardens, eq(tasks.gardenId, gardens.id))
      .where(eq(employeeTeams.employeeId, employeeId));

    const accessibleGardenIds = [
      ...new Set(rows.map((row) => row.garden_id).filter(Boolean)),
    ];

    if (!accessibleGardenIds.includes(gardenId)) {
      throw new ForbiddenException(
        'You can only register product usage for your gardens',
      );
    }
  }
}
