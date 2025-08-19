import { randomUUID } from "node:crypto";
import { createTRPCRouter, publicProcedure } from "../../create-context";
import { z } from "zod";
import { messages, threads } from "./data";
import { GetThreadInput, MessageSchema, SendMessageInput } from "./types";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = 60 * 1000;
  const h = 60 * m;
  const d = 24 * h;
  if (diff < m) return "just now";
  if (diff < h) return `${Math.floor(diff / m)} min ago`;
  if (diff < d) return `${Math.floor(diff / h)} hours ago`;
  return `${Math.floor(diff / d)} days ago`;
}

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
    });
    messages.push(newMsg);

    const t = threads.find((t) => t.id === input.threadId);
    if (t) {
      t.lastMessage = input.text;
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
});
