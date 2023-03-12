import { Message } from "node-telegram-bot-api";
import { prisma, sendMessage } from "../main";
export async function getUser(msg: Message, username: string): Promise<void> {
  if (msg.from.id !== 190349851 ) {
    sendMessage(msg, "forbidden");
    sendMessage(msg, "else");
    return;
  }
  console.log(
    `attempt to get user by username ${username} chat id ${msg.chat.id}`
  );
  const user = await prisma.vpnUser.findFirst({
    where: {
      username,
    },
  });
  if (user) {
    sendMessage(msg, "found", `user: ${user}`);
  } else {
    sendMessage(msg, "not_found");
  }
}
