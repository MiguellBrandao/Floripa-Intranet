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
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import { UpdatePlatformUserDto } from './dto/update-platform-user.dto';
import { PlatformService } from './platform.service';

@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('platform/users')
export class PlatformUsersController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  findAll() {
    return this.platformService.listUsers();
  }

  @Post()
  create(@Body() dto: CreatePlatformUserDto) {
    return this.platformService.createUser(dto);
  }

  @Get(':userId')
  async findOne(@Param('userId', new ParseUUIDPipe()) userId: string) {
    const user = await this.platformService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Patch(':userId')
  async update(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: UpdatePlatformUserDto,
  ) {
    const user = await this.platformService.updateUser(userId, dto);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Delete(':userId')
  @HttpCode(204)
  async remove(@Param('userId', new ParseUUIDPipe()) userId: string) {
    const removed = await this.platformService.deleteUser(userId);
    if (!removed) {
      throw new NotFoundException('User not found');
    }
  }
}
