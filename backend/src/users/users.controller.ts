import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get(':email')
  async findOne(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Put(':email')
  async update(@Param('email') email: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(email, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: `User ${id} deleted successfully` };
  }
}
