import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TokenService } from './token.service';
import { JoinTokenDto } from './dto/join-token.dto';
import { EmergencyTokenDto } from './dto/emergency-token.dto';
import { UpdateChargeDto } from './dto/update-charge.dto';
import { TokenStatus } from './token.schema';

@ApiTags('token')
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('join')
  @ApiOperation({ summary: 'Customer joins a queue (normal token)' })
  join(@Body() dto: JoinTokenDto) {
    return this.tokenService.join(dto);
  }

  @Post('emergency')
  @ApiOperation({ summary: 'Receptionist issues an emergency token (jumps queue)' })
  createEmergency(@Body() dto: EmergencyTokenDto) {
    return this.tokenService.createEmergency(dto);
  }

  @Get('queue/:queueId')
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a token by ID' })
  findOne(@Param('id') id: string) {
    return this.tokenService.findById(id);
  }

  @Patch(':id/call')
  @ApiOperation({ summary: 'Call a WAITING token — set status to CALLED, notify customer' })
  call(@Param('id') id: string) {
    return this.tokenService.call(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark a token as completed' })
  complete(@Param('id') id: string) {
    return this.tokenService.complete(id);
  }

  @Patch(':id/skip')
  @ApiOperation({ summary: 'Skip current token — move it to SKIPPED, recalculate queue' })
  skip(@Param('id') id: string) {
    return this.tokenService.skip(id);
  }

  @Patch(':id/recall')
  @ApiOperation({ summary: 'Re-notify customer that their token is called (no status change)' })
  recall(@Param('id') id: string) {
    return this.tokenService.recall(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a token' })
  cancel(@Param('id') id: string) {
    return this.tokenService.cancel(id);
  }

  @Patch(':id/charge')
  @ApiOperation({ summary: 'Set or update the charge for a token (Confirmed or Waived)' })
  updateCharge(@Param('id') id: string, @Body() dto: UpdateChargeDto) {
    return this.tokenService.updateCharge(id, dto);
  }
}
