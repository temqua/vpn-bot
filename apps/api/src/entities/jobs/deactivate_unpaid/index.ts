import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VPNProtocol } from '@prisma/client';
import { subDays } from 'date-fns';
import { DatabaseService } from '../../../database.service';
import env from '../../../env';
import { TelegramService } from '../../telegram/telegram.service';
import { Job } from '../jobs.definitions';

@Injectable()
export class DeactivateUnpaidJob implements Job {
  private readonly logger = new Logger(DeactivateUnpaidJob.name);

  constructor(
    private databaseService: DatabaseService,
    private telegramService: TelegramService,
  ) {}

  private portMap = {
    [VPNProtocol.IKEv2]: env.IKE_RECEIVER_PORT,
    [VPNProtocol.OpenVPN]: env.OVPN_RECEIVER_PORT,
    [VPNProtocol.WireGuard]: env.WG_RECEIVER_PORT,
  };

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async execute() {
    const usersWithKeys = await this.databaseService.client.user.findMany({
      where: {
        free: false,
        active: false,
        servers: {
          some: {},
        },
      },
      include: {
        servers: {
          include: {
            server: {},
          },
        },
      },
    });

    const updated = await this.databaseService.client.user.updateManyAndReturn({
      where: {
        free: false,
        active: true,
        payerId: null,
        payments: {
          none: {
            expiresOn: {
              gt: subDays(new Date(), 10),
            },
          },
        },
        createdAt: {
          lt: subDays(new Date(), 3),
        },
      },
      data: {
        active: false,
      },
    });

    const deactivatedChildren =
      await this.databaseService.client.user.updateManyAndReturn({
        where: {
          payerId: {
            not: null,
          },
          payer: {
            active: false,
          },
          active: true,
          free: false,
        },
        data: {
          active: false,
        },
      });

    for (const user of updated) {
      const deactivatedMsg = `User ${user.username} has been deactivated`;
      this.logger.log(deactivatedMsg);
      this.telegramService.send(deactivatedMsg);
    }
    for (const user of deactivatedChildren) {
      const deactivatedMsg = `User ${user.username} has been deactivated`;
      this.logger.log(deactivatedMsg);
      this.telegramService.send(deactivatedMsg);
    }
    for (const user of usersWithKeys) {
      for (const key of user.servers) {
        if (env.APP_ENV !== 'local') {
          if (key.username) {
            const response = await this.request(
              key.server.url,
              this.portMap[key.protocol],
              key.username,
            );
            const result = await response.text();
            if (response.ok) {
              const okMessage = `${result}: ${key.protocol} key ${key.username} on server ${key.server.url} port ${this.portMap[key.protocol]} for user ${user.username} has been successfully deleted ${response.status} ${response.statusText}`;
              this.logger.log(okMessage);
              this.telegramService.send(okMessage);
            } else {
              const errMessage = `${key.protocol} key ${key.username} on ${key.server.url} for user ${user.username} deletion failed. Response: ${result}. Status: ${response.status} ${response.statusText}`;
              this.logger.error(errMessage);
              this.telegramService.send(errMessage);
            }
          }
          await this.databaseService.client.serversUsers.delete({
            where: {
              id: key.id,
            },
          });
        } else {
          this.logger.log(
            `Attemption to delete key ${key.username} on server ${key.server.url} port ${this.portMap[key.protocol]} for user ${user.username}`,
          );
        }
      }
    }
    this.telegramService.send('DeactivateUnpaidJob executed');
    this.logger.log('DeactivateUnpaidJob executed');
  }

  private async request(
    host: string,
    port: number,
    username: string,
    command = 'delete',
  ) {
    const qs = username
      ? `?${new URLSearchParams({
          username,
        }).toString()}`
      : '';
    return await fetch(`${host}:${port}/${command}${qs}`, {
      headers: {
        Authorization: env.SERVICE_TOKEN,
      },
    });
  }
}
