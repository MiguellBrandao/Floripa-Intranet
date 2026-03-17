import {
  Body,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { UpdatePlatformCompanyMembershipDto } from './dto/update-platform-company-membership.dto';
import { PlatformService } from './platform.service';

@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('platform/company-memberships')
export class PlatformCompanyMembershipsController {
  constructor(private readonly platformService: PlatformService) {}

  @Patch(':membershipId')
  async update(
    @Param('membershipId', new ParseUUIDPipe()) membershipId: string,
    @Body() dto: UpdatePlatformCompanyMembershipDto,
  ) {
    const membership = await this.platformService.updateCompanyMembership(
      membershipId,
      dto,
    );

    if (!membership) {
      throw new NotFoundException('Company membership not found');
    }

    return membership;
  }

  @Delete(':membershipId')
  @HttpCode(204)
  async remove(
    @Param('membershipId', new ParseUUIDPipe()) membershipId: string,
  ) {
    const removed = await this.platformService.deleteCompanyMembership(
      membershipId,
    );

    if (!removed) {
      throw new NotFoundException('Company membership not found');
    }
  }
}
