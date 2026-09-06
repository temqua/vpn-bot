import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsPublic } from '../../decorators/is-public';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Post('/')
  signIn(@Body() dto: Record<string, string>) {
    return this.authService.signIn(dto.username, dto.password);
  }

  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Post('/tg')
  signInViaTg(@Body() dto: Record<string, string>) {
    return this.authService.signInViaTelegram(dto.tgToken, dto.telegramId);
  }
}
