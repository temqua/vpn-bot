import { VpnUser } from "@prisma/client";
import { sendMessage } from "../utils";
import { adminUserId } from "./consts";
import prisma from "./prisma";

export const isAdmin = (msg): boolean => {
  if (msg.from.id !== adminUserId) {
    sendMessage(msg, "forbidden");
    sendMessage(msg, "else");
  }
  return msg.from.id === adminUserId;
};

export const isAdded = async (msg): Promise<boolean> => {
  const user: VpnUser = await prisma.vpnUser.findFirst({
    where: {
      telegramId: msg.from.id,
    },
  });

  return !!user;
};
