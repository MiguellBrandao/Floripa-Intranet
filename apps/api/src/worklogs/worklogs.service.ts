import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, gte, inArray, lte, type SQL } from 'drizzle-orm';
import { db } from '../db';
import { employeeTeams, employees, tasks, workLogs } from '../db/schema';
import { CreateWorkLogDto } from './dto/create-worklog.dto';
import { ListWorkLogsQueryDto } from './dto/list-worklogs-query.dto';
import { UpdateWorkLogDto } from './dto/update-worklog.dto';

type Requester = {
  id: string;
  role: 'admin' | 'employee';
};

@Injectable()
export class WorkLogsService {
  async findAll(requester: Requester, query: ListWorkLogsQueryDto) {
    const visibleTeamIds = await this.getVisibleTeamIdsForRequester(requester);
    if (requester.role === 'employee' && visibleTeamIds.length === 0) {
      return [];
    }

    const filters = this.buildFilters(query);
    if (requester.role === 'employee') {
      filters.push(inArray(workLogs.teamId, visibleTeamIds));
    }

    return db
      .select({
        id: workLogs.id,
        task_id: workLogs.taskId,
        team_id: workLogs.teamId,
        garden_id: tasks.gardenId,
        start_time: workLogs.startTime,
        end_time: workLogs.endTime,
        description: workLogs.notes,
        created_at: workLogs.createdAt,
      })
      .from(workLogs)
      .innerJoin(tasks, eq(workLogs.taskId, tasks.id))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(workLogs.createdAt));
  }

  async findById(id: string, requester: Requester) {
    const visibleTeamIds = await this.getVisibleTeamIdsForRequester(requester);
    if (requester.role === 'employee' && visibleTeamIds.length === 0) {
      return null;
    }

    const filters: SQL<unknown>[] = [eq(workLogs.id, id)];
    if (requester.role === 'employee') {
      filters.push(inArray(workLogs.teamId, visibleTeamIds));
    }

    const rows = await db
      .select({
        id: workLogs.id,
        task_id: workLogs.taskId,
        team_id: workLogs.teamId,
        garden_id: tasks.gardenId,
        start_time: workLogs.startTime,
        end_time: workLogs.endTime,
        description: workLogs.notes,
        created_at: workLogs.createdAt,
      })
      .from(workLogs)
      .innerJoin(tasks, eq(workLogs.taskId, tasks.id))
      .where(and(...filters))
      .limit(1);

    return rows[0] ?? null;
  }

  async create(dto: CreateWorkLogDto, requester: Requester) {
    this.assertStartBeforeEnd(dto.start_time, dto.end_time);

    const task = await this.findTask(dto.task_id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.team_id) {
      throw new BadRequestException('Task has no team assigned');
    }
    if (task.team_id !== dto.team_id) {
      throw new BadRequestException('team_id must match task team_id');
    }

    if (requester.role === 'employee') {
      const ownEmployeeId = await this.resolveEmployeeIdFromUser(requester.id);
      if (!ownEmployeeId) {
        throw new ForbiddenException('Employee profile not found');
      }
      await this.assertEmployeeInTeam(ownEmployeeId, dto.team_id);
    }

    const rows = await db
      .insert(workLogs)
      .values({
        taskId: dto.task_id,
        teamId: dto.team_id,
        startTime: new Date(dto.start_time),
        endTime: dto.end_time ? new Date(dto.end_time) : null,
        notes: dto.description,
      })
      .returning({
        id: workLogs.id,
        task_id: workLogs.taskId,
        team_id: workLogs.teamId,
        start_time: workLogs.startTime,
        end_time: workLogs.endTime,
        description: workLogs.notes,
        created_at: workLogs.createdAt,
      });

    return rows[0];
  }

  async update(id: string, dto: UpdateWorkLogDto, requester: Requester) {
    const existing = await db
      .select({
        id: workLogs.id,
        task_id: workLogs.taskId,
        team_id: workLogs.teamId,
        start_time: workLogs.startTime,
        end_time: workLogs.endTime,
      })
      .from(workLogs)
      .where(eq(workLogs.id, id))
      .limit(1);

    const current = existing[0];
    if (!current) {
      return null;
    }

    if (requester.role === 'employee') {
      const ownEmployeeId = await this.resolveEmployeeIdFromUser(requester.id);
      if (!ownEmployeeId) {
        throw new ForbiddenException('Employee profile not found');
      }
      await this.assertEmployeeInTeam(ownEmployeeId, current.team_id);
    }

    const startTime = dto.start_time ?? (current.start_time?.toISOString() ?? undefined);
    const endTime = dto.end_time ?? (current.end_time?.toISOString() ?? undefined);
    this.assertStartBeforeEnd(startTime, endTime);

    const setPayload: {
      startTime?: Date;
      endTime?: Date | null;
      notes?: string;
    } = {};
    const responsePayload: Record<string, unknown> = { id };

    if (dto.start_time !== undefined) {
      setPayload.startTime = new Date(dto.start_time);
      responsePayload.start_time = dto.start_time;
    }
    if (dto.end_time !== undefined) {
      setPayload.endTime = new Date(dto.end_time);
      responsePayload.end_time = dto.end_time;
    }
    if (dto.description !== undefined) {
      setPayload.notes = dto.description;
      responsePayload.description = dto.description;
    }

    if (Object.keys(setPayload).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const updated = await db
      .update(workLogs)
      .set(setPayload)
      .where(eq(workLogs.id, id))
      .returning({ id: workLogs.id });

    return updated.length > 0 ? responsePayload : null;
  }

  async remove(id: string, requester: Requester) {
    if (requester.role === 'employee') {
      throw new ForbiddenException('Employees cannot delete work logs');
    }

    const deleted = await db
      .delete(workLogs)
      .where(eq(workLogs.id, id))
      .returning({ id: workLogs.id });
    return deleted.length > 0;
  }

  private buildFilters(query: ListWorkLogsQueryDto) {
    const filters: SQL<unknown>[] = [];
    if (query.task_id) filters.push(eq(workLogs.taskId, query.task_id));
    if (query.team_id) filters.push(eq(workLogs.teamId, query.team_id));
    if (query.garden_id) filters.push(eq(tasks.gardenId, query.garden_id));
    if (query.start_from) filters.push(gte(workLogs.startTime, new Date(query.start_from)));
    if (query.start_to) filters.push(lte(workLogs.startTime, new Date(query.start_to)));
    return filters;
  }

  private assertStartBeforeEnd(start?: string, end?: string) {
    if (!start || !end) return;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid start_time or end_time');
    }
    if (endDate < startDate) {
      throw new BadRequestException('end_time must be after start_time');
    }
  }

  private async findTask(taskId: string) {
    const rows = await db
      .select({ id: tasks.id, team_id: tasks.teamId })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);
    return rows[0] ?? null;
  }

  private async resolveEmployeeIdFromUser(userId: string) {
    const rows = await db
      .select({ id: employees.id })
      .from(employees)
      .where(eq(employees.userId, userId))
      .limit(1);
    return rows[0]?.id ?? null;
  }

  private async assertEmployeeInTeam(employeeId: string, teamId: string) {
    const teamMembership = await db
      .select({ team_id: employeeTeams.teamId })
      .from(employeeTeams)
      .where(
        and(eq(employeeTeams.employeeId, employeeId), eq(employeeTeams.teamId, teamId)),
      )
      .limit(1);

    if (!teamMembership[0]) {
      throw new ForbiddenException('You cannot access work logs for this team');
    }
  }

  private async getVisibleTeamIdsForRequester(requester: Requester) {
    if (requester.role !== 'employee') {
      return [];
    }

    const ownEmployeeId = await this.resolveEmployeeIdFromUser(requester.id);
    if (!ownEmployeeId) {
      return [];
    }

    const rows = await db
      .select({ team_id: employeeTeams.teamId })
      .from(employeeTeams)
      .where(eq(employeeTeams.employeeId, ownEmployeeId));

    return rows.map((row) => row.team_id);
  }
}
