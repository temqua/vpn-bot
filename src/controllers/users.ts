import { VpnUser } from "@prisma/client";
import { Message } from "node-telegram-bot-api";
import { adminChatId, prisma } from "../main";
import { sendMessage } from "../utils";
export async function getUser(msg: Message, username: string): Promise<void> {
  if (msg.from.id !== adminChatId) {
    sendMessage(msg, "forbidden");
    sendMessage(msg, "else");
    return;
  }
  console.log(
    `attempt to get user by username ${username} chat id ${msg.chat.id}`
  );
  const user: VpnUser = await prisma.vpnUser.findFirst({
    where: {
      username: username,
    },
  });
  if (user) {
    sendMessage(msg, "found", `\`\`\`${JSON.stringify(user)}\`\`\``, {
      parse_mode: "MarkdownV2",
    });
  } else {
    sendMessage(msg, "not_found");
  }
}

export async function getUserById(msg: Message, userId: number): Promise<void> {
  if (msg.from.id !== adminChatId) {
    sendMessage(msg, "forbidden");
    sendMessage(msg, "else");
    return;
  }
  console.log(`attempt to get user by id ${userId} chat id ${msg.chat.id}`);
  const user: VpnUser = await prisma.vpnUser.findFirst({
    where: {
      id: userId,
    },
  });
  if (user) {
    sendMessage(msg, "found", `\`\`\`${JSON.stringify(user)}\`\`\``, {
      parse_mode: "MarkdownV2",
    });
  } else {
    sendMessage(msg, "not_found");
  }
}

export async function getAllUsers(msg: Message): Promise<void> {
  if (msg.from.id !== adminChatId) {
    sendMessage(msg, "forbidden");
    sendMessage(msg, "else");
    return;
  }
  console.log(`attempt to get all users chat id ${msg.chat.id}`);
  const users: VpnUser[] = await prisma.vpnUser.findMany();
  if (users && users.length) {
    console.log("attempt to load users :>> ", users);
    let chunksCount = users.length / 10;
    if (chunksCount === 0) {
      sendMessage(msg, "found", `\`\`\`${JSON.stringify(users)}\`\`\``, {
        parse_mode: "MarkdownV2",
      });
    }
    for (let index = 0; index < chunksCount; index++) {
      let chunk: VpnUser[] = users.slice(index * 10, 10);
      if (index === chunksCount - 1) {
        chunk = users.slice(index * 10);
      }
      sendMessage(msg, "found", `\`\`\`${JSON.stringify(chunk)}\`\`\``, {
        parse_mode: "MarkdownV2",
      });
    }

  } else {
    sendMessage(msg, "not_found");
  }
}

export async function createUser(msg: Message, username: string): Promise<void> {

}

export async function deleteUser(msg: Message, username: string): Promise<void> {
  
}
