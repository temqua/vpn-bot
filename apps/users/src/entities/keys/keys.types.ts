export interface FileInfo {
	path: string;
	extension: string;
}

export interface ICertificatesService {
	port: number;
	getExtension(): string;
}
