import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { employees, employeeTeams, teams, users } from '../db/schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

type Requester = {
  id: string;
  role: 'admin' | 'employee';
};

type EmployeeBaseRow = {
  id: string;
  user_id: string | null;
  email: string | null;
  name: string;
  phone: string | null;
  active: boolean;
  created_at: Date;
};

@Injectable()
export class EmployeesService {
  async findAll(requester: Requester) {
    const rows = await db
      .select({
        id: employees.id,
        user_id: employees.userId,
        email: users.email,
        name: employees.name,
        phone: employees.phone,
        active: employees.active,
        created_at: employees.createdAt,
        role: users.role,
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(users.role, 'employee'))
      .orderBy(desc(employees.createdAt));

    const withTeams = await this.attachTeamIds(
      rows.map(({ role, ...employee }) => employee),
    );

    if (requester.role === 'admin') {
      return withTeams;
    }

    return withTeams.map(({ user_id, email, active, created_at, ...employee }) => ({
      ...employee,
    }));
  }

  async findById(id: string, requester: Requester) {
    const rows = await db
      .select({
        id: employees.id,
        user_id: employees.userId,
        email: users.email,
        name: employees.name,
        phone: employees.phone,
        active: employees.active,
        created_at: employees.createdAt,
        role: users.role,
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(employees.id, id))
      .limit(1);

    const employee = rows[0];
    if (!employee || employee.role !== 'employee') {
      return null;
    }

    const [withTeams] = await this.attachTeamIds([
      {
        id: employee.id,
        user_id: employee.user_id,
        email: employee.email,
        name: employee.name,
        phone: employee.phone,
        active: employee.active,
        created_at: employee.created_at,
      },
    ]);

    if (requester.role === 'admin') {
      return withTeams;
    }

    if (employee.user_id === requester.id) {
      return withTeams;
    }

    const { user_id, email, active, created_at, ...baseEmployee } = withTeams;
    return baseEmployee;
  }

  async create(dto: CreateEmployeeDto, requester: Requester) {
    if (requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can create employees');
    }

    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedTeamIds = this.normalizeTeamIds(dto.team_ids);
    await this.assertValidTeamIds(normalizedTeamIds);

    return db.transaction(async (tx) => {
      const existing = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (existing[0]) {
        throw new ConflictException('Email already exists');
      }

      const passwordHash = await hash(dto.password, 10);

      const insertedUsers = await tx
        .insert(users)
        .values({
          email: normalizedEmail,
          passwordHash,
          role: dto.role,
        })
        .returning({ id: users.id });

      const userId = insertedUsers[0]?.id;
      if (!userId) {
        throw new BadRequestException('Failed to create user');
      }

      const insertedEmployees = await tx
        .insert(employees)
        .values({
          userId,
          name: dto.name,
          phone: dto.phone,
          active: dto.active ?? true,
        })
        .returning({
          id: employees.id,
          user_id: employees.userId,
          name: employees.name,
          phone: employees.phone,
          active: employees.active,
          created_at: employees.createdAt,
        });

      const employee = insertedEmployees[0];
      if (!employee) {
        throw new BadRequestException('Failed to create employee');
      }

      if (normalizedTeamIds.length > 0) {
        await tx.insert(employeeTeams).values(
          normalizedTeamIds.map((teamId) => ({
            employeeId: employee.id,
            teamId,
          })),
        );
      }

      return {
        ...employee,
        email: normalizedEmail,
        role: dto.role,
        team_ids: normalizedTeamIds,
      };
    });
  }

  async update(id: string, dto: UpdateEmployeeDto, requester: Requester) {
    const rows = await db
      .select({
        id: employees.id,
        user_id: employees.userId,
        role: users.role,
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(employees.id, id))
      .limit(1);

    const target = rows[0];
    if (!target || target.role !== 'employee') {
      return null;
    }

    if (requester.role !== 'admin') {
      if (target.user_id !== requester.id) {
        throw new ForbiddenException('You can only update your own profile');
      }

      if (
        dto.user_id !== undefined ||
        dto.team_ids !== undefined ||
        dto.active !== undefined
      ) {
        throw new ForbiddenException(
          'Employees can only update their name and phone',
        );
      }
    }

    const setPayload: {
      userId?: string;
      name?: string;
      phone?: string;
      active?: boolean;
    } = {};
    const responsePayload: Record<string, unknown> = { id };

    if (dto.user_id !== undefined) {
      setPayload.userId = dto.user_id;
      responsePayload.user_id = dto.user_id;
    }
    if (dto.name !== undefined) {
      setPayload.name = dto.name;
      responsePayload.name = dto.name;
    }
    if (dto.phone !== undefined) {
      setPayload.phone = dto.phone;
      responsePayload.phone = dto.phone;
    }
    if (dto.active !== undefined) {
      setPayload.active = dto.active;
      responsePayload.active = dto.active;
    }
    if (dto.team_ids !== undefined) {
      responsePayload.team_ids = this.normalizeTeamIds(dto.team_ids);
    }

    if (Object.keys(setPayload).length === 0 && dto.team_ids === undefined) {
      throw new BadRequestException('No fields provided for update');
    }

    if (dto.team_ids !== undefined) {
      await this.assertValidTeamIds(this.normalizeTeamIds(dto.team_ids));
    }

    return db.transaction(async (tx) => {
      if (Object.keys(setPayload).length > 0) {
        const updatedRows = await tx
          .update(employees)
          .set(setPayload)
          .where(eq(employees.id, id))
          .returning({ id: employees.id });

        if (updatedRows.length === 0) {
          return null;
        }
      }

      if (dto.team_ids !== undefined) {
        const teamIds = this.normalizeTeamIds(dto.team_ids);
        await tx.delete(employeeTeams).where(eq(employeeTeams.employeeId, id));
        if (teamIds.length > 0) {
          await tx.insert(employeeTeams).values(
            teamIds.map((teamId) => ({
              employeeId: id,
              teamId,
            })),
          );
        }
      }

      return responsePayload;
    });
  }

  async remove(id: string, requester: Requester) {
    if (requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete employees');
    }

    const targetRows = await db
      .select({
        id: employees.id,
        role: users.role,
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .where(eq(employees.id, id))
      .limit(1);

    const target = targetRows[0];
    if (!target || target.role !== 'employee') {
      return false;
    }

    return db.transaction(async (tx) => {
      const deletedEmployees = await tx
        .delete(employees)
        .where(eq(employees.id, id))
        .returning({ id: employees.id, user_id: employees.userId });

      if (deletedEmployees.length === 0) {
        return false;
      }

      const userId = deletedEmployees[0]?.user_id;
      if (userId) {
        await tx.delete(users).where(eq(users.id, userId));
      }

      return true;
    });
  }

  private normalizeTeamIds(teamIds?: string[]): string[] {
    if (!teamIds) {
      return [];
    }
    return [...new Set(teamIds.map((id) => id.trim()).filter(Boolean))];
  }

  private async assertValidTeamIds(teamIds: string[]) {
    if (teamIds.length === 0) {
      return;
    }

    const existing = await db
      .select({ id: teams.id })
      .from(teams)
      .where(inArray(teams.id, teamIds));

    const existingIds = new Set(existing.map((row) => row.id));
    const invalidTeamIds = teamIds.filter((id) => !existingIds.has(id));

    if (invalidTeamIds.length > 0) {
      throw new BadRequestException({
        message: 'Invalid team_ids',
        invalid_team_ids: invalidTeamIds,
      });
    }
  }

  private async attachTeamIds(rows: EmployeeBaseRow[]) {
    if (rows.length === 0) {
      return [];
    }

    const memberships = await db
      .select({
        employee_id: employeeTeams.employeeId,
        team_id: employeeTeams.teamId,
      })
      .from(employeeTeams)
      .where(
        inArray(
          employeeTeams.employeeId,
          rows.map((row) => row.id),
        ),
      );

    const map = new Map<string, string[]>();
    for (const membership of memberships) {
      const current = map.get(membership.employee_id) ?? [];
      current.push(membership.team_id);
      map.set(membership.employee_id, current);
    }

    return rows.map((row) => ({
      ...row,
      team_ids: map.get(row.id) ?? [],
    }));
  }
}
