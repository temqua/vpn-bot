import querystring from "node:querystring";
import { IncomingMessage, ServerResponse } from "http";
import { TOKEN } from "../env";

const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const http = require("node:http");

const server = http.createServer(async (request: IncomingMessage, res: ServerResponse) => {
	const url = new URL(request.url, `http://${request.headers.host}`);
	if (request.headers.authorization !== `Bearer ${TOKEN}` && url.hostname !== "localhost") {
		res.writeHead(401, "Unauthorized", { "Content-Type": "text/plan" });
		res.end();
		return;
	}
	if (url.pathname.includes("/user")) {
		const { username } = querystring.decode(url.search.replace("?", ""));
		if (!username) {
			res.writeHead(400, "Client error", { "Content-Type": "text/plan" });
			res.end("No username described");
			return;
		}
		if (url.pathname === "/user/create") {
			const { stdout, stderr } = await exec(`cd ~ && ./create-client.sh ${username.toString()}`);
			console.log(stdout.toString());
			if (!!stderr) {
				res.writeHead(500, "Server error", { "Content-Type": "text/plain" });
				res.end(`Error occurred while creating vpn user: ${stderr}`);
			}
			res.writeHead(200, "OK", { "Content-Type": "text/plain" });
			res.end(`username: ${username}. ${stdout}`);
			return;
		}
	}
	res.writeHead(200, "OK", { "Content-Type": "text/plain" });
	res.end(`OK`);
});
server.listen(5010);
