const newDate = (): string => new Date().toISOString();
export default {
	warn: (message: string) => {
		console.warn(`[${newDate()}] ${message}`);
	},
	error: (message: string) => {
		console.error(`[${newDate()}] ❌ ${message}`);
	},
	log: (message: string) => {
		console.log(`[${newDate()}] ${message}`);
	},
	success: (message: string) => {
		console.log(`[${newDate()}] ✅ ${message}`);
	},
};
