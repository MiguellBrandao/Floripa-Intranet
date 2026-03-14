import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { GardensModule } from './gardens/gardens.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductUsageModule } from './product-usage/product-usage.module';
import { ProductsModule } from './products/products.module';
import { QuotesModule } from './quotes/quotes.module';
import { TasksModule } from './tasks/tasks.module';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';
import { WorkLogsModule } from './worklogs/worklogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    EmployeesModule,
    GardensModule,
    PaymentsModule,
    ProductsModule,
    ProductUsageModule,
    QuotesModule,
    TasksModule,
    TeamsModule,
    WorkLogsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
