import { Module } from '@nestjs/common';
import { PlatformCompaniesController } from './platform-companies.controller';
import { PlatformCompanyMembershipsController } from './platform-company-memberships.controller';
import { PlatformService } from './platform.service';
import { PlatformUsersController } from './platform-users.controller';

@Module({
  controllers: [
    PlatformCompaniesController,
    PlatformCompanyMembershipsController,
    PlatformUsersController,
  ],
  providers: [PlatformService],
})
export class PlatformModule {}
