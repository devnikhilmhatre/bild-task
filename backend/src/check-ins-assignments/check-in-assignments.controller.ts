import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { CheckInAssignmentsService } from './check-in-assignments.service';
import { AssignCheckInDto } from './dto/assign-check-in.dto';
import { SubmitCheckInResponseDto } from './dto/submit-check-in-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgGuard } from '../auth/guards/org.guard';
import { type RequestWithUser } from '../auth/guards/types';

@Controller('check-in-assignments')
@UseGuards(JwtAuthGuard)
export class CheckInAssignmentsController {
  constructor(private readonly assignmentsService: CheckInAssignmentsService) {}

  @Post(':checkInId/assign')
  @UseGuards(OrgGuard)
  async assignCheckIn(
    @Param('checkInId') checkInId: string,
    @Body() dto: AssignCheckInDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.role !== 'manager')
      throw new UnauthorizedException('Only manager can assign check-ins');
    return this.assignmentsService.assignCheckIn(checkInId, dto);
  }

  @Get('')
  async getMyAssignments(
    @Req() req: RequestWithUser,
    @Query('limit') limit?: number,
    @Query('lastKey') lastKey?: string,
  ) {
    const numericLimit = limit ? parseInt(limit as any, 10) : 10;
    return this.assignmentsService.getAssignmentsForMember(
      req.user.email,
      numericLimit,
      lastKey,
    );
  }

  @Post(':checkInId/submit')
  async submitResponse(
    @Param('checkInId') checkInId: string,
    @Req() req: RequestWithUser,
    @Body() dto: SubmitCheckInResponseDto,
  ) {
    return this.assignmentsService.submitResponse(
      checkInId,
      req.user.email,
      dto,
    );
  }
}
