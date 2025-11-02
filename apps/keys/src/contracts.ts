import type { Message } from 'node-telegram-bot-api';
import type { CommandContext } from './global.handler';

export interface FileInfo {
	path: string;
	extension: string;
}

export interface ICertificatesService {
	getFileInfo(username: string): FileInfo;
	getQRCodePath?(username: string): string;
}

export interface ICommandHandler {
	handle(context: CommandContext, message: Message, start?: boolean): void;
}
