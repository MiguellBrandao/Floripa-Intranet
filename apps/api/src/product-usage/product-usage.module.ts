import { Module } from '@nestjs/common';
import { ProductUsageController } from './product-usage.controller';
import { ProductUsageService } from './product-usage.service';

@Module({
  controllers: [ProductUsageController],
  providers: [ProductUsageService],
  exports: [ProductUsageService],
})
export class ProductUsageModule {}

