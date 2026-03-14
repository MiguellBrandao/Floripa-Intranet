import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  private requesterFrom(request: Request) {
    const user = request.user as { id: string; role: 'admin' | 'employee' };
    return { id: user.id, role: user.role };
  }

  @Get()
  findAll(@Req() request: Request) {
    return this.employeesService.findAll(this.requesterFrom(request));
  }

  @Post()
  create(@Body() dto: CreateEmployeeDto, @Req() request: Request) {
    return this.employeesService.create(dto, this.requesterFrom(request));
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: Request,
  ) {
    const employee = await this.employeesService.findById(
      id,
      this.requesterFrom(request),
    );
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEmployeeDto,
    @Req() request: Request,
  ) {
    const employee = await this.employeesService.update(
      id,
      dto,
      this.requesterFrom(request),
    );
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: Request,
  ) {
    const removed = await this.employeesService.remove(
      id,
      this.requesterFrom(request),
    );
    if (!removed) {
      throw new NotFoundException('Employee not found');
    }
  }
}
