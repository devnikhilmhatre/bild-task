import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { type RequestWithUser } from '../auth/guards/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findOne(@Req() req: RequestWithUser) {
    return this.usersService.findByEmail(req.user.email);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(@Req() req: RequestWithUser, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.email, dto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: RequestWithUser) {
    await this.usersService.remove(req.user.email);
    return { message: `User deleted successfully` };
  }
}
