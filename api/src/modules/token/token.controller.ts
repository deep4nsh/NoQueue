import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TokenService } from './token.service';
import { JoinTokenDto } from './dto/join-token.dto';
import { EmergencyTokenDto } from './dto/emergency-token.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { TokenStatus } from './token.schema';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { UserDocument } from '../user/user.schema';

@ApiTags('token')
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('join')
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Customer joins a queue (normal token)' })
  join(@Body() dto: JoinTokenDto, @CurrentUser() user?: UserDocument) {
    const userId = user?._id?.toString();
    return this.tokenService.join(dto, userId);
  }

  @Post('emergency')
  @Roles(Role.RECEPTIONIST, Role.OWNER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Receptionist issues an emergency token (jumps queue)' })
  createEmergency(@Body() dto: EmergencyTokenDto) {
    return this.tokenService.createEmergency(dto);
  }

  @Get('queue/:queueId')
  @Roles(Role.RECEPTIONIST, Role.OWNER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tokens for a queue, optionally filtered by status' })
  @ApiQuery({ name: 'status', required: false, isArray: true, enum: TokenStatus })
  getQueueTokens(
    @Param('queueId') queueId: string,
    @Query('status') status?: TokenStatus | TokenStatus[],
  ) {
    const statusArray = status
      ? Array.isArray(status) ? status : [status]
      : undefined;
    return this.tokenService.getQueueTokens(queueId, statusArray);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a token by ID' })
  findOne(@Param('id') id: string) {
    return this.tokenService.findById(id);
  }

  @Patch(':id/call')
  @Roles(Role.RECEPTIONIST, Role.OWNER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Call a WAITING token — set status to CALLED, notify customer' })
  call(@Param('id') id: string) {
    return this.tokenService.call(id);
  }

  @Patch(':id/complete')
  @Roles(Role.RECEPTIONIST, Role.OWNER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a token as completed' })
  complete(@Param('id') id: string) {
    return this.tokenService.complete(id);
  }

  @Patch(':id/skip')
  @Roles(Role.RECEPTIONIST, Role.OWNER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Skip current token — move it to SKIPPED, recalculate queue' })
  skip(@Param('id') id: string) {
    return this.tokenService.skip(id);
  }

  @Patch(':id/recall')
  @Roles(Role.RECEPTIONIST, Role.OWNER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Re-notify customer that their token is called (no status change)' })
  recall(@Param('id') id: string) {
    return this.tokenService.recall(id);
  }

  @Public()
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a token' })
  cancel(@Param('id') id: string) {
    return this.tokenService.cancel(id);
  }

  @Patch(':id/charge')
  @Roles(Role.RECEPTIONIST, Role.OWNER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set or update the charge for a token (Confirmed or Waived)' })
  updateCharge(@Param('id') id: string, @Body() dto: UpdateChargeDto) {
    return this.tokenService.updateCharge(id, dto);
  }
}
