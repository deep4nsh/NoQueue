import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { FirebaseAuthDto } from './dto/firebase-auth.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserDocument } from '../user/user.schema';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LoginDto })
  async loginStaff(@CurrentUser() user: UserDocument) {
    return this.authService.loginStaff(user);
  }

  @Public()
  @Post('firebase')
  @ApiBody({ type: FirebaseAuthDto })
  async loginWithFirebase(@Body() dto: FirebaseAuthDto) {
    return this.authService.loginWithFirebase(dto.idToken);
  }
}
