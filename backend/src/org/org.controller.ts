import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgGuard } from '../auth/guards/org.guard';
import { type RequestWithUser } from '../auth/guards/types';

@Controller('orgs')
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrg(@Body() dto: CreateOrgDto, @Req() req: any) {
    const userId = req.user.sub;
    return this.orgService.createOrg(dto, userId);
  }

  @Post('members')
  @UseGuards(JwtAuthGuard, OrgGuard)
  async addMember(@Req() req: RequestWithUser, @Body() dto: AddMemberDto) {
    return this.orgService.addMember(req.user.orgId, dto);
  }

  @UseGuards(JwtAuthGuard, OrgGuard)
  @Get('members')
  async getMembers(
    @Req() req: RequestWithUser,
    @Query('limit') limit = 10,
    @Query('lastKey') lastKey?: string,
  ) {
    return this.orgService.getMembers(req.user.orgId, Number(limit), lastKey);
  }
}
