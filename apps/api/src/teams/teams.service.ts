import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { employees, employeeTeams, teams } from '../db/schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

type Requester = {
  id: string;
  role: 'admin' | 'employee';
};

@Injectable()
export class TeamsService {
  async findAll(requester: Requester) {
    if (requester.role === 'admin') {
      return db
        .select({
          id: teams.id,
          name: teams.name,
          created_at: teams.createdAt,
        })
        .from(teams)
        .orderBy(desc(teams.createdAt));
    }

    const employee = await this.findEmployeeByUserId(requester.id);
    if (!employee) {
      return [];
    }

    return db
      .select({
        id: teams.id,
        name: teams.name,
        created_at: teams.createdAt,
      })
      .from(employeeTeams)
      .innerJoin(teams, eq(employeeTeams.teamId, teams.id))
      .where(eq(employeeTeams.employeeId, employee.id))
      .orderBy(desc(teams.createdAt));
  }

  async findById(id: string, requester: Requester) {
    if (requester.role === 'admin') {
      return this.findTeamById(id);
    }

    const employee = await this.findEmployeeByUserId(requester.id);
    if (!employee) {
      return null;
    }

    const rows = await db
      .select({
        id: teams.id,
        name: teams.name,
        created_at: teams.createdAt,
      })
      .from(employeeTeams)
      .innerJoin(teams, eq(employeeTeams.teamId, teams.id))
      .where(
        and(eq(employeeTeams.employeeId, employee.id), eq(teams.id, id)),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  async create(dto: CreateTeamDto, requester: Requester) {
    this.ensureAdmin(requester);

    const name = dto.name.trim();
    const existing = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.name, name))
      .limit(1);

    if (existing[0]) {
      throw new ConflictException('Team name already exists');
    }

    const rows = await db
      .insert(teams)
      .values({ name })
      .returning({
        id: teams.id,
        name: teams.name,
        created_at: teams.createdAt,
      });

    return rows[0];
  }

  async update(id: string, dto: UpdateTeamDto, requester: Requester) {
    this.ensureAdmin(requester);

    const setPayload: { name?: string } = {};
    const responsePayload: Record<string, unknown> = { id };

    if (dto.name !== undefined) {
      const trimmed = dto.name.trim();
      if (!trimmed) {
        throw new BadRequestException('Team name cannot be empty');
      }
      setPayload.name = trimmed;
      responsePayload.name = trimmed;
    }

    if (Object.keys(setPayload).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    if (setPayload.name) {
      const existing = await db
        .select({ id: teams.id })
        .from(teams)
        .where(eq(teams.name, setPayload.name))
        .limit(1);

      if (existing[0] && existing[0].id !== id) {
        throw new ConflictException('Team name already exists');
      }
    }

    const updated = await db
      .update(teams)
      .set(setPayload)
      .where(eq(teams.id, id))
      .returning({ id: teams.id });

    return updated.length > 0 ? responsePayload : null;
  }

  async remove(id: string, requester: Requester) {
    this.ensureAdmin(requester);

    const deleted = await db
      .delete(teams)
      .where(eq(teams.id, id))
      .returning({ id: teams.id });

    return deleted.length > 0;
  }

  private ensureAdmin(requester: Requester) {
    if (requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can manage teams');
    }
  }

  private async findTeamById(id: string) {
    const rows = await db
      .select({
        id: teams.id,
        name: teams.name,
        created_at: teams.createdAt,
      })
      .from(teams)
      .where(eq(teams.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  private async findEmployeeByUserId(userId: string) {
    const rows = await db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  }
}
