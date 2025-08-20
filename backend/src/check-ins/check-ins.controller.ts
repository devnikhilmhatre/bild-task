import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UpdateCheckInDto } from './dto/update-check-in.dto';


@Controller('check-ins')
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) { }

  @Post()
  async create(@Body() createCheckInDto: CreateCheckInDto) {
    return await this.checkInsService.create(createCheckInDto);
  }

  @Get()
  async findAll(@Query('limit') limit = 10,
    @Query('lastKey') lastKey?: string,) {
    return await this.checkInsService.findAll(Number(limit), lastKey);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.checkInsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCheckInDto: UpdateCheckInDto) {
    return await this.checkInsService.update(id, updateCheckInDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.checkInsService.remove(id);
  }
}
