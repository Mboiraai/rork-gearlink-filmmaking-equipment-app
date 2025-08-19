import type { Message, Thread } from "./types";

const now = () => Date.now();

export const threads: Thread[] = [
  {
    id: "1",
    userName: "Alex Johnson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    lastMessage: "Yes, the RED Komodo is available for those dates",
    timestamp: now() - 1000 * 60 * 2,
    equipmentName: "RED Komodo 6K",
    unread: 2,
  },
  {
    id: "2",
    userName: "Sarah Miller",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    lastMessage: "I can offer a discount for weekly rental",
    timestamp: now() - 1000 * 60 * 60,
    equipmentName: "Canon RF 24-70mm",
    unread: 0,
  },
  {
    id: "3",
    userName: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    lastMessage: "The light comes with all modifiers",
    timestamp: now() - 1000 * 60 * 60 * 24,
    equipmentName: "Aputure 600d Pro",
    unread: 0,
  },
];

export const messages: Message[] = [
  { id: "m1", threadId: "1", text: "Hi! Is the RED Komodo still available for rent?", senderId: "u2", senderName: "Alex Johnson", timestamp: now() - 1000 * 60 * 5, read: true },
  { id: "m2", threadId: "1", text: "Yes, it is! When do you need it?", senderId: "me", senderName: "Me", timestamp: now() - 1000 * 60 * 4, read: true },
  { id: "m3", threadId: "1", text: "Great! I need it for a 3-day shoot starting Friday.", senderId: "u2", senderName: "Alex Johnson", timestamp: now() - 1000 * 60 * 3, read: false },

  { id: "m4", threadId: "2", text: "Is your 24-70 available this weekend?", senderId: "me", senderName: "Me", timestamp: now() - 1000 * 60 * 120, read: true },
  { id: "m5", threadId: "2", text: "Yes, I can do Saturday to Monday.", senderId: "u3", senderName: "Sarah Miller", timestamp: now() - 1000 * 60 * 110, read: true },
];
