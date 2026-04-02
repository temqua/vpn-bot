import { VPNProtocol } from '@prisma/client';
import { IsNumber, IsString } from 'class-validator';

export class CreateUsersServerDto {
  @IsNumber()
  serverId: number;
  @IsNumber()
  userId: number;
  @IsString()
  protocol: VPNProtocol;
  @IsString()
  username: string;
}
