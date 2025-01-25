import { keysCommandsHandler } from './keys';
import { userCommandsHandler } from './users';

export type CommandContext = object;
export default {
	keys: keysCommandsHandler,
	users: userCommandsHandler,
};
