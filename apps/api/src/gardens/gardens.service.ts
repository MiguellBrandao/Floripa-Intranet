import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { employeeTeams, employees, gardens, tasks } from '../db/schema';
import { CreateGardenDto } from './dto/create-garden.dto';
import { UpdateGardenDto } from './dto/update-garden.dto';

type Requester = {
  id: string;
  role: 'admin' | 'employee';
};

@Injectable()
export class GardensService {
  async findAll(requester: Requester) {
    if (requester.role === 'admin') {
      return this.findAllFull();
    }

    const employee = await this.findEmployeeByUserId(requester.id);
    if (!employee) {
      return [];
    }

    const accessibleGardenIds = await this.getAccessibleGardenIdsForEmployee(
      employee.id,
    );
    if (accessibleGardenIds.length === 0) {
      return [];
    }

    const rows = await db
      .select({
        id: gardens.id,
        client_name: gardens.clientName,
        address: gardens.address,
        phone: gardens.phone,
        monthly_price: gardens.monthlyPrice,
        maintenance_frequency: gardens.maintenanceFrequency,
        start_date: gardens.startDate,
        billing_day: gardens.billingDay,
        status: gardens.status,
        notes: gardens.notes,
        created_at: gardens.createdAt,
      })
      .from(gardens)
      .where(inArray(gardens.id, accessibleGardenIds))
      .orderBy(desc(gardens.createdAt));

    return rows.map((row) => this.toEmployeeGardenView(row));
  }

  async findById(id: string, requester: Requester) {
    if (requester.role === 'admin') {
      return this.findByIdFull(id);
    }

    const employee = await this.findEmployeeByUserId(requester.id);
    if (!employee) {
      return null;
    }

    const accessibleGardenIds = await this.getAccessibleGardenIdsForEmployee(
      employee.id,
    );
    if (!accessibleGardenIds.includes(id)) {
      return null;
    }

    const row = await this.findByIdFull(id);
    if (!row) {
      return null;
    }

    return this.toEmployeeGardenView(row);
  }

  async create(dto: CreateGardenDto, requester: Requester) {
    this.ensureAdmin(requester);

    const rows = await db
      .insert(gardens)
      .values({
        clientName: dto.client_name,
        address: dto.address,
        phone: dto.phone,
        monthlyPrice: dto.monthly_price?.toString(),
        maintenanceFrequency: dto.maintenance_frequency,
        startDate: dto.start_date,
        billingDay: dto.billing_day,
        status: dto.status ?? 'active',
        notes: dto.notes,
      })
      .returning({
        id: gardens.id,
        client_name: gardens.clientName,
        address: gardens.address,
        phone: gardens.phone,
        monthly_price: gardens.monthlyPrice,
        maintenance_frequency: gardens.maintenanceFrequency,
        start_date: gardens.startDate,
        billing_day: gardens.billingDay,
        status: gardens.status,
        notes: gardens.notes,
        created_at: gardens.createdAt,
      });

    return rows[0];
  }

  async update(id: string, dto: UpdateGardenDto, requester: Requester) {
    this.ensureAdmin(requester);

    const setPayload: {
      clientName?: string;
      address?: string;
      phone?: string;
      monthlyPrice?: string;
      maintenanceFrequency?: 'weekly' | 'biweekly' | 'monthly';
      startDate?: string;
      billingDay?: number;
      status?: 'active' | 'paused' | 'cancelled';
      notes?: string;
    } = {};

    const responsePayload: Record<string, unknown> = { id };

    if (dto.client_name !== undefined) {
      setPayload.clientName = dto.client_name;
      responsePayload.client_name = dto.client_name;
    }
    if (dto.address !== undefined) {
      setPayload.address = dto.address;
      responsePayload.address = dto.address;
    }
    if (dto.phone !== undefined) {
      setPayload.phone = dto.phone;
      responsePayload.phone = dto.phone;
    }
    if (dto.monthly_price !== undefined) {
      setPayload.monthlyPrice = dto.monthly_price.toString();
      responsePayload.monthly_price = dto.monthly_price;
    }
    if (dto.maintenance_frequency !== undefined) {
      setPayload.maintenanceFrequency = dto.maintenance_frequency;
      responsePayload.maintenance_frequency = dto.maintenance_frequency;
    }
    if (dto.start_date !== undefined) {
      setPayload.startDate = dto.start_date;
      responsePayload.start_date = dto.start_date;
    }
    if (dto.billing_day !== undefined) {
      setPayload.billingDay = dto.billing_day;
      responsePayload.billing_day = dto.billing_day;
    }
    if (dto.status !== undefined) {
      setPayload.status = dto.status;
      responsePayload.status = dto.status;
    }
    if (dto.notes !== undefined) {
      setPayload.notes = dto.notes;
      responsePayload.notes = dto.notes;
    }

    if (Object.keys(setPayload).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const updated = await db
      .update(gardens)
      .set(setPayload)
      .where(eq(gardens.id, id))
      .returning({ id: gardens.id });

    return updated.length > 0 ? responsePayload : null;
  }

  async remove(id: string, requester: Requester) {
    this.ensureAdmin(requester);

    const deleted = await db
      .delete(gardens)
      .where(eq(gardens.id, id))
      .returning({ id: gardens.id });

    return deleted.length > 0;
  }

  private async findAllFull() {
    return db
      .select({
        id: gardens.id,
        client_name: gardens.clientName,
        address: gardens.address,
        phone: gardens.phone,
        monthly_price: gardens.monthlyPrice,
        maintenance_frequency: gardens.maintenanceFrequency,
        start_date: gardens.startDate,
        billing_day: gardens.billingDay,
        status: gardens.status,
        notes: gardens.notes,
        created_at: gardens.createdAt,
      })
      .from(gardens)
      .orderBy(desc(gardens.createdAt));
  }

  private async findByIdFull(id: string) {
    const rows = await db
      .select({
        id: gardens.id,
        client_name: gardens.clientName,
        address: gardens.address,
        phone: gardens.phone,
        monthly_price: gardens.monthlyPrice,
        maintenance_frequency: gardens.maintenanceFrequency,
        start_date: gardens.startDate,
        billing_day: gardens.billingDay,
        status: gardens.status,
        notes: gardens.notes,
        created_at: gardens.createdAt,
      })
      .from(gardens)
      .where(eq(gardens.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  private toEmployeeGardenView(row: {
    id: string;
    client_name: string;
    address: string;
    phone: string | null;
    monthly_price: string | null;
    maintenance_frequency: string | null;
    start_date: string | null;
    billing_day: number | null;
    status: string;
    notes: string | null;
    created_at: Date;
  }) {
    const { monthly_price, start_date, billing_day, ...safe } = row;
    return safe;
  }

  private async findEmployeeByUserId(userId: string) {
    const rows = await db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  }

  private async getAccessibleGardenIdsForEmployee(employeeId: string) {
    const rows = await db
      .select({ garden_id: tasks.gardenId })
      .from(tasks)
      .innerJoin(
        employeeTeams,
        and(
          eq(employeeTeams.teamId, tasks.teamId),
          eq(employeeTeams.employeeId, employeeId),
        ),
      );

    return [
      ...new Set(
        rows
          .map((item) => item.garden_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
  }

  private ensureAdmin(requester: Requester) {
    if (requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can manage gardens');
    }
  }
}
