"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/providers/socket-provider";
import { Message } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { sendMessage, getChatRoomMessages } from "@/lib/actions/chat";

// Helper to transform server message to client format
const transformMessage = (message: any): Message => ({
  id: message.id,
  roomId: message.chatRoomId,
  content: message.content,
  senderId: message.senderId,
  senderName: message.sender.name,
  senderImage: message.sender.image || undefined,
  timestamp: message.createdAt,
});

export function useChat(roomId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();

  const isMounted = useRef(true);
  const messagesRef = useRef<Message[]>([]);
  const toastRef = useRef(toast);

  // Keep messagesRef in sync with messages
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Keep toastRef updated
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Effect to fetch messages when roomId changes
  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      messagesRef.current = [];
      setIsLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const result = await getChatRoomMessages(roomId);
        if ("error" in result) throw new Error(result.error);
        if (isMounted.current) {
          const transformed = result.messages.map(transformMessage);
          setMessages(transformed);
          messagesRef.current = transformed;
        }
      } catch (error) {
        if (isMounted.current) {
          toastRef.current({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchMessages();
  }, [roomId]);

  // Handle incoming socket message
  const handleNewMessage = useCallback((message: any) => {
    if (!isMounted.current) return;
    setMessages((prev) => [...prev, transformMessage(message)]);
  }, []);

  // Setup socket listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.on(`message:${roomId}`, handleNewMessage);

    return () => {
      socket.off(`message:${roomId}`, handleNewMessage);
    };
  }, [socket, roomId, handleNewMessage]);

  // Send message handler
  const sendMessageHandler = useCallback(
    async (content: string) => {
      if (!session?.user || !roomId) {
        toastRef.current({
          title: "Error",
          description: !session?.user
            ? "You must be logged in to send messages"
            : "No chat room selected",
          variant: "destructive",
        });
        return;
      }

      try {
        const result = await sendMessage({
          content,
          chatRoomId: roomId,
        });

        if ("error" in result) {
          toastRef.current({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
          return;
        }

        const transformed = transformMessage(result.message);
        setMessages((prev) => [...prev, transformed]);

        if (socket && isConnected) {
          socket.emit("send-message", result.message);
        }

        return transformed;
      } catch {
        toastRef.current({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      }
    },
    [roomId, socket, isConnected, session?.user]
  );

  return {
    messages,
    isLoading,
    sendMessage: sendMessageHandler,
  };
}
