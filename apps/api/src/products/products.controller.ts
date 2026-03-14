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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  private requesterFrom(request: Request) {
    const user = request.user as { id: string; role: 'admin' | 'employee' };
    return { id: user.id, role: user.role };
  }

  @Get()
  findAll(@Query() query: ListProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Post()
  create(@Req() request: Request, @Body() dto: CreateProductDto) {
    return this.productsService.create(dto, this.requesterFrom(request));
  }

  @Patch(':id')
  async update(
    @Req() request: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    const updated = await this.productsService.update(
      id,
      dto,
      this.requesterFrom(request),
    );
    if (!updated) {
      throw new NotFoundException('Product not found');
    }
    return updated;
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Req() request: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const removed = await this.productsService.remove(
      id,
      this.requesterFrom(request),
    );
    if (!removed) {
      throw new NotFoundException('Product not found');
    }
  }
}

