import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UpdateCheckInDto } from './dto/update-check-in.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgGuard } from '../auth/guards/org.guard';
import { type RequestWithUser } from '../auth/guards/types';

@Controller('check-ins')
@UseGuards(JwtAuthGuard, OrgGuard)
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createCheckInDto: CreateCheckInDto,
  ) {
    return await this.checkInsService.create(
      req.user.orgId,
      createCheckInDto,
      req.user.email,
    );
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query('limit') limit = 10,
    @Query('lastKey') lastKey?: string,
  ) {
    return await this.checkInsService.findAll(
      req.user.orgId,
      Number(limit),
      lastKey,
    );
  }

  @Get('')
  async findOne(@Req() req: RequestWithUser) {
    return await this.checkInsService.findOne(req.user.orgId);
  }

  @Patch('')
  async update(
    @Req() req: RequestWithUser,
    @Body() updateCheckInDto: UpdateCheckInDto,
  ) {
    return await this.checkInsService.update(
      req.user.orgId,
      updateCheckInDto,
      req.user.email,
    );
  }

  @Delete('')
  async remove(@Req() req: RequestWithUser) {
    return await this.checkInsService.remove(req.user.orgId);
  }
}
