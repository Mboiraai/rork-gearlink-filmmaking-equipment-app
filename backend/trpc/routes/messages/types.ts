import { z } from "zod";

export const MessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  text: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  timestamp: z.number(),
  read: z.boolean().optional().default(false),
});
export type Message = z.infer<typeof MessageSchema>;

export const ThreadSchema = z.object({
  id: z.string(),
  userName: z.string(),
  avatar: z.string().url(),
  lastMessage: z.string().optional().default(""),
  timestamp: z.number(),
  equipmentName: z.string(),
  unread: z.number().optional().default(0),
});
export type Thread = z.infer<typeof ThreadSchema>;

export const SendMessageInput = z.object({
  threadId: z.string(),
  text: z.string().min(1).max(500),
  senderId: z.string().default("me"),
  senderName: z.string().default("Me"),
});

export const GetThreadInput = z.object({ threadId: z.string() });
export const MarkReadInput = z.object({ threadId: z.string() });
