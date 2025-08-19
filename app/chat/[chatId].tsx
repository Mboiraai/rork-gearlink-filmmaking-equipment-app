import React, { useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Send, Paperclip, ChevronLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";

interface ChatMessage {
  id: string;
  threadId: string;
  text?: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  read?: boolean;
  attachments?: { uri: string; type: 'image' | 'file'; name?: string }[];
}

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const [text, setText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const threadId = useMemo(() => (Array.isArray(chatId) ? chatId[0] : chatId ?? ''), [chatId]);

  const messagesQuery = trpc.messages.byThread.useQuery({ threadId }, { enabled: !!threadId, refetchInterval: 2500 });
  const sendMutation = trpc.messages.send.useMutation();
  const markReadMutation = trpc.messages.markRead.useMutation();
  const typingSetMutation = trpc.messages.typingSet.useMutation();
  const typingStatusQuery = trpc.messages.typingStatus.useQuery({ threadId }, { enabled: !!threadId, refetchInterval: 1500 });

  const chatUser = useMemo(() => {
    return { userName: `Chat ${threadId}`, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces" };
  }, [threadId]);

  const onSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await sendMutation.mutateAsync({ threadId, text: trimmed });
    setText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const onFocus = () => {
    if (isTyping) return;
    setIsTyping(true);
    typingSetMutation.mutate({ threadId, isTyping: true });
  };
  const onBlur = () => {
    if (!isTyping) return;
    setIsTyping(false);
    typingSetMutation.mutate({ threadId, isTyping: false });
  };

  React.useEffect(() => {
    if (threadId) {
      markReadMutation.mutate({ threadId });
    }
  }, [threadId]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const mine = item.senderId === 'me';
    const ts = new Date(item.timestamp);
    const hh = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <View style={[styles.messageContainer, mine ? styles.myMessage : styles.otherMessage]}>
        <View style={[styles.messageBubble, mine ? styles.myBubble : styles.otherBubble]}>
          {item.text && <Text style={[styles.messageText, mine ? styles.myText : styles.otherText]}>{item.text}</Text>}
          {item.attachments?.map((a, idx) => (
            <Image key={`${item.id}-att-${idx}`} source={{ uri: a.uri }} style={{ width: 180, height: 180, borderRadius: 12, marginTop: item.text ? 8 : 0 }} />
          ))}
          <Text style={[styles.timestamp, mine ? styles.myTimestamp : styles.otherTimestamp]}>{hh}</Text>
        </View>
      </View>
    );
  };

  const typingUsers = Object.values(typingStatusQuery.data ?? {}).filter((u) => u.isTyping);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Image source={{ uri: chatUser.avatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{chatUser.userName}</Text>
          <Text style={styles.equipmentName}>Thread {threadId}</Text>
        </View>
      </SafeAreaView>

      <FlatList
        ref={flatListRef}
        data={messagesQuery.data ?? []}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {typingUsers.length > 0 && (
        <View style={styles.typingBar} testID="typing-indicator">
          <Text style={{ color: '#8E8E93', fontSize: 12 }}>{typingUsers.map((u) => u.userName).join(', ')} is typing…</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Paperclip size={20} color="#8E8E93" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#8E8E93"
          value={text}
          onChangeText={setText}
          onFocus={onFocus}
          onBlur={onBlur}
          multiline
          testID="message-input"
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={onSend}
          disabled={!text.trim()}
          testID="send-button"
        >
          <Send size={20} color={text.trim() ? "#FF6B35" : "#8E8E93"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E27' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1C1C2E', backgroundColor: '#0A0E27' },
  backButton: { marginRight: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  equipmentName: { fontSize: 12, color: '#FF6B35', marginTop: 2 },
  messagesList: { padding: 16, flexGrow: 1 },
  messageContainer: { marginBottom: 12 },
  myMessage: { alignItems: 'flex-end' },
  otherMessage: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  myBubble: { backgroundColor: '#FF6B35', borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: '#1C1C2E', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 20, color: '#FFFFFF' },
  myText: { color: '#FFFFFF' },
  otherText: { color: '#FFFFFF' },
  timestamp: { fontSize: 11, marginTop: 4 },
  myTimestamp: { color: 'rgba(255, 255, 255, 0.7)' },
  otherTimestamp: { color: '#8E8E93' },
  typingBar: { paddingHorizontal: 16, paddingBottom: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 16, borderTopWidth: 1, borderTopColor: '#1C1C2E' },
  attachButton: { padding: 8, marginRight: 8 },
  input: { flex: 1, backgroundColor: '#1C1C2E', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, color: '#FFFFFF', fontSize: 14 },
  sendButton: { padding: 8, marginLeft: 8 },
  sendButtonDisabled: { opacity: 0.5 },
});