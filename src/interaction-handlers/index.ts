import { keysCommandsHandler } from '../entities/keys/keys.handler';
import { userCommandsHandler } from '../entities/users/users.handler';

export type CommandContext = object;
export default {
	keys: keysCommandsHandler,
	users: userCommandsHandler,
};
