import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/user.schema';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('log/:tokenId')
  @ApiBearerAuth()
  @Roles(Role.RECEPTIONIST, Role.OWNER, Role.CUSTOMER, Role.ADMIN)
  @ApiOperation({ summary: 'Get notification delivery audit trail for a token' })
  async getLog(@Param('tokenId') tokenId: string) {
    return this.notificationService.getTokenNotifications(tokenId);
  }

  @Post('webhook/whatsapp')
  @Public()
  @ApiOperation({ summary: 'Meta WhatsApp webhook receiver (not yet implemented)' })
  async whatsappWebhook(@Body() payload: any) {
    return { success: true };
  }
}
