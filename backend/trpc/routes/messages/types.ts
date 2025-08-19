import { z } from "zod";

export const AttachmentSchema = z.object({
  uri: z.string(),
  type: z.union([z.literal('image'), z.literal('file')]),
  name: z.string().optional(),
  mime: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  text: z.string().optional().default(""),
  senderId: z.string(),
  senderName: z.string(),
  timestamp: z.number(),
  read: z.boolean().optional().default(false),
  attachments: z.array(AttachmentSchema).optional().default([]),
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
  text: z.string().max(500).optional().default(""),
  attachments: z.array(AttachmentSchema).optional().default([]),
  senderId: z.string().default("me"),
  senderName: z.string().default("Me"),
});

export const GetThreadInput = z.object({ threadId: z.string() });
export const MarkReadInput = z.object({ threadId: z.string() });

export const TypingSetInput = z.object({ threadId: z.string(), userId: z.string().default('me'), userName: z.string().default('Me'), isTyping: z.boolean() });
export const TypingStatusInput = z.object({ threadId: z.string() });
