import { User, VPNProtocol, VpnServer } from '@prisma/client';

export class UsersServers {
  username: string | null;
  id: number;
  userId: number;
  serverId: number;
  protocol: VPNProtocol;
  assignedAt: Date;
  user: User;
  server: VpnServer;
}
