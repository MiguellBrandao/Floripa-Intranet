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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { CreatePlatformCompanyMembershipDto } from './dto/create-platform-company-membership.dto';
import { CreatePlatformCompanyDto } from './dto/create-platform-company.dto';
import { UpdatePlatformCompanyDto } from './dto/update-platform-company.dto';
import { PlatformService } from './platform.service';

@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('platform/companies')
export class PlatformCompaniesController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  findAll() {
    return this.platformService.listCompanies();
  }

  @Post()
  create(@Body() dto: CreatePlatformCompanyDto) {
    return this.platformService.createCompany(dto);
  }

  @Get(':companyId')
  async findOne(@Param('companyId', new ParseUUIDPipe()) companyId: string) {
    const company = await this.platformService.findCompanyById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  @Patch(':companyId')
  async update(
    @Param('companyId', new ParseUUIDPipe()) companyId: string,
    @Body() dto: UpdatePlatformCompanyDto,
  ) {
    const company = await this.platformService.updateCompany(companyId, dto);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  @Delete(':companyId')
  @HttpCode(204)
  async remove(@Param('companyId', new ParseUUIDPipe()) companyId: string) {
    const removed = await this.platformService.deleteCompany(companyId);
    if (!removed) {
      throw new NotFoundException('Company not found');
    }
  }

  @Get(':companyId/teams')
  listTeams(@Param('companyId', new ParseUUIDPipe()) companyId: string) {
    return this.platformService.listTeamsByCompany(companyId);
  }

  @Get(':companyId/memberships')
  listMemberships(@Param('companyId', new ParseUUIDPipe()) companyId: string) {
    return this.platformService.listCompanyMemberships(companyId);
  }

  @Post(':companyId/memberships')
  createMembership(
    @Param('companyId', new ParseUUIDPipe()) companyId: string,
    @Body() dto: CreatePlatformCompanyMembershipDto,
  ) {
    return this.platformService.createCompanyMembership(companyId, dto);
  }
}
