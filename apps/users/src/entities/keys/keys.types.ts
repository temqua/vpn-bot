export interface FileInfo {
	path: string;
	extension: string;
}

export interface ICertificatesService {
	port: number;
	getFileInfo?(username: string): FileInfo;
	getQRCodePath?(username: string): string;
}
