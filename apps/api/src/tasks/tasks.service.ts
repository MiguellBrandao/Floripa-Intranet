import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, gte, inArray, lte, type SQL } from 'drizzle-orm';
import { db } from '../db';
import { employeeTeams, employees, gardens, tasks, teams } from '../db/schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import type { TaskType } from './tasks.constants';

type Requester = {
  id: string;
  role: 'admin' | 'employee';
};

@Injectable()
export class TasksService {
  async findAll(requester: Requester, query: ListTasksQueryDto) {
    const employee = requester.role === 'employee'
      ? await this.findEmployeeByUserId(requester.id)
      : null;

    if (requester.role === 'employee' && !employee) {
      return [];
    }

    const visibleTeamIds =
      requester.role === 'employee'
        ? await this.getVisibleTeamIdsForEmployee(employee!.id)
        : [];

    if (requester.role === 'employee' && visibleTeamIds.length === 0) {
      return [];
    }

    const filters = this.buildFilters(query);

    if (requester.role === 'employee') {
      filters.push(inArray(tasks.teamId, visibleTeamIds));
    }

    return db
      .select({
        id: tasks.id,
        garden_id: tasks.gardenId,
        team_id: tasks.teamId,
        date: tasks.date,
        start_time: tasks.startTime,
        end_time: tasks.endTime,
        task_type: tasks.taskType,
        description: tasks.description,
        created_at: tasks.createdAt,
      })
      .from(tasks)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(tasks.date), desc(tasks.startTime), desc(tasks.createdAt));
  }

  async findById(id: string, requester: Requester) {
    const employee = requester.role === 'employee'
      ? await this.findEmployeeByUserId(requester.id)
      : null;

    if (requester.role === 'employee' && !employee) {
      return null;
    }

    const visibleTeamIds =
      requester.role === 'employee'
        ? await this.getVisibleTeamIdsForEmployee(employee!.id)
        : [];

    const filters = [eq(tasks.id, id)];
    if (requester.role === 'employee') {
      if (visibleTeamIds.length === 0) {
        return null;
      }
      filters.push(inArray(tasks.teamId, visibleTeamIds));
    }

    const rows = await db
      .select({
        id: tasks.id,
        garden_id: tasks.gardenId,
        team_id: tasks.teamId,
        date: tasks.date,
        start_time: tasks.startTime,
        end_time: tasks.endTime,
        task_type: tasks.taskType,
        description: tasks.description,
        created_at: tasks.createdAt,
      })
      .from(tasks)
      .where(and(...filters))
      .limit(1);

    return rows[0] ?? null;
  }

  async create(dto: CreateTaskDto, requester: Requester) {
    this.ensureAdmin(requester);
    await this.assertGardenExists(dto.garden_id);
    await this.assertTeamExists(dto.team_id);

    const rows = await db
      .insert(tasks)
      .values({
        gardenId: dto.garden_id,
        teamId: dto.team_id,
        date: dto.date,
        startTime: dto.start_time,
        endTime: dto.end_time,
        taskType: dto.task_type,
        description: dto.description,
      })
      .returning({
        id: tasks.id,
        garden_id: tasks.gardenId,
        team_id: tasks.teamId,
        date: tasks.date,
        start_time: tasks.startTime,
        end_time: tasks.endTime,
        task_type: tasks.taskType,
        description: tasks.description,
        created_at: tasks.createdAt,
      });

    return rows[0];
  }

  async update(id: string, dto: UpdateTaskDto, requester: Requester) {
    this.ensureAdmin(requester);

    if (dto.garden_id !== undefined) {
      await this.assertGardenExists(dto.garden_id);
    }
    if (dto.team_id !== undefined) {
      await this.assertTeamExists(dto.team_id);
    }

    const setPayload: {
      gardenId?: string;
      teamId?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      taskType?: TaskType;
      description?: string;
    } = {};
    const responsePayload: Record<string, unknown> = { id };

    if (dto.garden_id !== undefined) {
      setPayload.gardenId = dto.garden_id;
      responsePayload.garden_id = dto.garden_id;
    }
    if (dto.team_id !== undefined) {
      setPayload.teamId = dto.team_id;
      responsePayload.team_id = dto.team_id;
    }
    if (dto.date !== undefined) {
      setPayload.date = dto.date;
      responsePayload.date = dto.date;
    }
    if (dto.start_time !== undefined) {
      setPayload.startTime = dto.start_time;
      responsePayload.start_time = dto.start_time;
    }
    if (dto.end_time !== undefined) {
      setPayload.endTime = dto.end_time;
      responsePayload.end_time = dto.end_time;
    }
    if (dto.task_type !== undefined) {
      setPayload.taskType = dto.task_type;
      responsePayload.task_type = dto.task_type;
    }
    if (dto.description !== undefined) {
      setPayload.description = dto.description;
      responsePayload.description = dto.description;
    }

    if (Object.keys(setPayload).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const updated = await db
      .update(tasks)
      .set(setPayload)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });

    return updated.length > 0 ? responsePayload : null;
  }

  async remove(id: string, requester: Requester) {
    this.ensureAdmin(requester);

    const deleted = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });

    return deleted.length > 0;
  }

  private buildFilters(query: ListTasksQueryDto) {
    const filters: SQL<unknown>[] = [];
    if (query.garden_id) filters.push(eq(tasks.gardenId, query.garden_id));
    if (query.team_id) filters.push(eq(tasks.teamId, query.team_id));
    if (query.date_from) filters.push(gte(tasks.date, query.date_from));
    if (query.date_to) filters.push(lte(tasks.date, query.date_to));
    return filters;
  }

  private ensureAdmin(requester: Requester) {
    if (requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can manage tasks');
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

  private async assertTeamExists(teamId: string) {
    const rows = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);
    if (!rows[0]) {
      throw new NotFoundException('Team not found');
    }
  }

  private async findEmployeeByUserId(userId: string) {
    const rows = await db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  }

  private async getVisibleTeamIdsForEmployee(employeeId: string) {
    const rows = await db
      .select({ team_id: employeeTeams.teamId })
      .from(employeeTeams)
      .where(eq(employeeTeams.employeeId, employeeId));

    return rows.map((row) => row.team_id);
  }
}
