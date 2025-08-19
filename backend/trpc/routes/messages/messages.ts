import { randomUUID } from "node:crypto";
import { createTRPCRouter, publicProcedure } from "../../create-context";
import { z } from "zod";
import { messages, threads } from "./data";
import { GetThreadInput, MessageSchema, SendMessageInput, TypingSetInput, TypingStatusInput } from "./types";

const typingStatus = new Map<string, { [userId: string]: { userName: string; isTyping: boolean; updatedAt: number } }>();

export default createTRPCRouter({
  byThread: publicProcedure.input(GetThreadInput).query(({ input }) => {
    const list = messages
      .filter((m) => m.threadId === input.threadId)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((m) => MessageSchema.parse(m));
    return list;
  }),

  send: publicProcedure.input(SendMessageInput).mutation(({ input }) => {
    const id = randomUUID();
    const newMsg = MessageSchema.parse({
      id,
      threadId: input.threadId,
      text: input.text,
      senderId: input.senderId,
      senderName: input.senderName,
      timestamp: Date.now(),
      read: false,
      attachments: input.attachments ?? [],
    });
    messages.push(newMsg);

    const t = threads.find((t) => t.id === input.threadId);
    if (t) {
      t.lastMessage = input.text && input.text.length > 0 ? input.text : (newMsg.attachments?.length ? `${newMsg.attachments.length} attachment${newMsg.attachments.length>1?'s':''}` : "");
      t.timestamp = Date.now();
      t.unread = (t.unread ?? 0) + 1;
    }

    return newMsg;
  }),

  markRead: publicProcedure.input(z.object({ threadId: z.string() })).mutation(({ input }) => {
    messages.forEach((m) => {
      if (m.threadId === input.threadId) m.read = true;
    });
    const t = threads.find((t) => t.id === input.threadId);
    if (t) t.unread = 0;
    return { ok: true } as const;
  }),

  typingSet: publicProcedure.input(TypingSetInput).mutation(({ input }) => {
    const entry = typingStatus.get(input.threadId) ?? {};
    entry[input.userId] = { userName: input.userName, isTyping: input.isTyping, updatedAt: Date.now() };
    typingStatus.set(input.threadId, entry);
    return { ok: true } as const;
  }),

  typingStatus: publicProcedure.input(TypingStatusInput).query(({ input }) => {
    const entry = typingStatus.get(input.threadId) ?? {};
    return entry;
  }),
});
