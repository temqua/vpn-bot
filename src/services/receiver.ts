import querystring from 'node:querystring';
import { IncomingMessage, ServerResponse } from 'http';
import { PORT, TOKEN } from '../env';
import path from 'node:path';
import util from 'node:util';
import http from 'node:http';
import { homedir } from 'node:os';
import { access, constants } from 'node:fs/promises';
import { createReadStream } from 'fs';
import logger from '../core/logger';

const exec = util.promisify(require('node:child_process').exec);
let url: URL;
const server = http.createServer(async (request: IncomingMessage, res: ServerResponse) => {
	url = new URL(request.url, `http://${request.headers.host}`);
	if (request.headers.authorization !== `Bearer ${TOKEN}` && url.hostname !== 'localhost') {
		res.writeHead(401, 'Unauthorized', { 'Content-Type': 'text/plan' });
		res.end();
		return;
	}
	if (url.pathname === '/ping') {
		console.log('pong');
		res.writeHead(200, 'OK', { 'Content-Type': 'text/plain' });
		res.end('pong');
		return;
	}
	if (url.pathname === '/users') {
		const { stdout, stderr } = await exec(`ikev2.sh --listclients`);
		if (!!stderr) {
			res.writeHead(500, 'Server error', { 'Content-Type': 'application/json' });
			res.end(
				JSON.stringify({
					error: `Error occurred while loading users list: ${stderr}`,
				}),
			);
			return;
		}
		res.writeHead(200, 'OK', { 'Content-Type': 'text/plain' });
		res.end(stdout);
		return;
	}
	if (url.pathname.includes('/user')) {
		await handleUsers(request, res);
		return;
	}
	res.writeHead(200, 'OK', { 'Content-Type': 'text/plain' });
	res.end(`OK`);
});
server.listen(PORT);

const handleUsers = async (request: IncomingMessage, res: ServerResponse) => {
	if (!url) {
		url = new URL(request.url, `http://${request.headers.host}`);
	}
	const { username } = querystring.decode(url.search.replace('?', ''));
	if (!username) {
		res.writeHead(400, 'Client error', { 'Content-Type': 'application/json' });
		res.end(
			JSON.stringify({
				error: 'No username described',
			}),
		);
		return;
	}
	if (url.pathname === '/user/create') {
		await createUser(request, res, username as string);
	}
	if (url.pathname === '/user/file') {
		await getUserArchive(request, res, username as string);
	}
};

const createUser = async (request: IncomingMessage, res: ServerResponse, username: string) => {
	const { stdout, stderr } = await exec(`cd ~ && ./create-client.sh ${username.toString()}`);
	console.log(stdout.toString());
	if (!!stderr) {
		res.writeHead(500, 'Server error', { 'Content-Type': 'application/json' });
		res.end(
			JSON.stringify({
				error: `Error occurred while creating vpn user: ${stderr}`,
			}),
		);
		return;
	}
	res.writeHead(200, 'OK', { 'Content-Type': 'text/plain' });
	res.end(`username: ${username}. ${stdout}`);
	return;
};

const getUserArchive = async (request: IncomingMessage, res: ServerResponse, username: string) => {
	const filePath = path.resolve(homedir(), process.env.IKE_HOME, `${username}/`, `${username}.zip`);
	logger.log(`generated file path: ${filePath}`);
	const mimeType: string = 'application/octet-stream';
	try {
		await access(filePath, constants.F_OK);
		res.writeHead(200, 'OK', { 'Content-Type': mimeType });
		createReadStream(filePath).pipe(res);
	} catch (error) {
		res.writeHead(500, 'Server error', { 'Content-Type': 'application/json' });
		res.end(
			JSON.stringify({
				error: `Error occurred while getting file: cannot access file ${filePath}. Stack: ${error.stack}`,
			}),
		);
		logger.error(`Cannot access file ${filePath}. ${error.stack}`);
	}
};
