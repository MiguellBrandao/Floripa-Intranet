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
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QuotesService } from './quotes.service';

@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  private requesterFrom(request: Request) {
    const user = request.user as { id: string; role: 'admin' | 'employee' };
    return { id: user.id, role: user.role };
  }

  @Get()
  findAll(@Req() request: Request) {
    return this.quotesService.findAll(this.requesterFrom(request));
  }

  @Post()
  create(@Req() request: Request, @Body() dto: CreateQuoteDto) {
    return this.quotesService.create(dto, this.requesterFrom(request));
  }

  @Patch(':id')
  async update(
    @Req() request: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateQuoteDto,
  ) {
    const updated = await this.quotesService.update(
      id,
      dto,
      this.requesterFrom(request),
    );
    if (!updated) {
      throw new NotFoundException('Quote not found');
    }
    return updated;
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Req() request: Request,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const removed = await this.quotesService.remove(
      id,
      this.requesterFrom(request),
    );
    if (!removed) {
      throw new NotFoundException('Quote not found');
    }
  }
}

