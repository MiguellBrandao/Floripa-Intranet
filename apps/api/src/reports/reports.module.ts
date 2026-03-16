import { Module } from '@nestjs/common';
import { CompaniesModule } from '../companies/companies.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [CompaniesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
