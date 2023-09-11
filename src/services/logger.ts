const getDate = (): string => new Date().toISOString();
export default {
    warn: (message: string) => {
        console.warn(`[${getDate()}] ${message}`)
    },
    error: (message: string) => {
        console.error(`[${getDate()}] ❌${message}`)
    },
    log: (message: string) => {
        console.log(`[${getDate()}] ${message}`)
    },
    success: (message: string) => {
        console.log(`[${getDate()}] ✅${message}`)
    }
}