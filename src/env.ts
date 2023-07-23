const dotenv = require("dotenv");
dotenv.config();
export const ADMIN_USER_ID = 190349851;
export const VPN_SERVER_IP = process.env.VPN_SERVER_IP;
export const TOKEN = process.env.SERVICE_TOKEN;
export const RECEIVER_PORT = process.env.RECEIVER_PORT;
export const IKE_HOME = process.env.IKE_HOME;
export const PORT = process.env.RECEIVER_PORT || 5010;
