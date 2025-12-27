import { VpnServer } from '@prisma/client';
import { prisma } from '../../prisma';

export class ServersRepository {
	async getAll(): Promise<VpnServer[]> {
		return await prisma.vpnServer.findMany();
	}

	async create(name: string, url: string) {
		return await prisma.vpnServer.create({
			data: {
				name,
				url,
			},
		});
	}

	async delete(id: number) {
		return await prisma.vpnServer.delete({
			where: {
				id,
			},
		});
	}

	async getUsers(id: number) {
		return await prisma.serversUsers.findMany({
			where: {
				serverId: id,
			},
			include: {
				user: {},
			},
		});
	}
}
