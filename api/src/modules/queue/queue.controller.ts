import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { UpdateQueueSettingsDto } from './dto/update-queue-settings.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/user.schema';

@ApiTags('queue')
@ApiBearerAuth()
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  @Roles(Role.RECEPTIONIST, Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: "Create today's queue for a branch (idempotent)" })
  create(@Body() dto: CreateQueueDto) {
    return this.queueService.create(dto);
  }

  // NOTE: 'branch/:branchId' must come before ':id' so Express doesn't
  // treat the literal 'branch' as a queue ObjectId.
  @Public()
  @Get('branch/:branchId')
  @ApiOperation({ summary: "Get today's active queue for a branch" })
  findByBranch(@Param('branchId') branchId: string) {
    return this.queueService.findByBranch(branchId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get queue by ID with live waiting/called counts' })
  findOne(@Param('id') id: string) {
    return this.queueService.findById(id);
  }

  @Patch(':id/open')
  @Roles(Role.RECEPTIONIST, Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Open (or resume from pause) the queue' })
  open(@Param('id') id: string) {
    return this.queueService.open(id);
  }

  @Patch(':id/pause')
  @Roles(Role.RECEPTIONIST, Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Pause the queue — no new tokens, existing tokens still served' })
  pause(@Param('id') id: string) {
    return this.queueService.pause(id);
  }

  @Patch(':id/close')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Close the queue for the day' })
  close(@Param('id') id: string) {
    return this.queueService.close(id);
  }

  @Patch(':id/settings')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Update queue settings (avg time, emergency tokens, etc.)' })
  updateSettings(@Param('id') id: string, @Body() dto: UpdateQueueSettingsDto) {
    return this.queueService.updateSettings(id, dto);
  }
}
