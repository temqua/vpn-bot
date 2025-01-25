import { keysCommandsHandler } from '../entities/keys/keys.commands-handler';
import { userCommandsHandler } from '../entities/users/users.commands-handler';

export type CommandContext = object;
export default {
	keys: keysCommandsHandler,
	users: userCommandsHandler,
};
