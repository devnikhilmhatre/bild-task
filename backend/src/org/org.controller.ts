import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Controller('orgs')
export class OrgsController {
  constructor(private readonly orgService: OrgService) {}

  @Post()
  async createOrg(@Body() dto: CreateOrgDto, @Req() req: any) {
    const userId = req.user.sub;
    return this.orgService.createOrg(dto, userId);
  }

  @Post(':orgId/members')
  async addMember(@Param('orgId') orgId: string, @Body() dto: AddMemberDto) {
    return this.orgService.addMember(orgId, dto);
  }

  @Get(':orgId/members')
  async getMembers(@Param('orgId') orgId: string) {
    return this.orgService.getMembers(orgId);
  }

  // @Get('user/:userId')
  // async getOrgsOfUser(@Param('userId') userId: string) {
  //   return this.orgService.getOrgsOfUser(userId);
  // }
}
