import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDocument } from './user.schema';
import { UserService } from './user.service';

@ApiTags('user')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: UserDocument) {
    return {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      photoUrl: user.photoUrl,
      role: user.role,
      firebaseUid: user.firebaseUid,
      businessId: user.businessId,
      isActive: user.isActive,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/fcm-token')
  async updateFcmToken(@CurrentUser() user: UserDocument, @Body() dto: { fcmToken: string }) {
    await this.userService.updateFcmToken(user._id.toString(), dto.fcmToken);
    return { success: true };
  }
}
