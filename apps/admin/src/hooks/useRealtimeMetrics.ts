"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface RealtimeMetrics {
  totalMessages: number;
  totalConversations: number;
  activeConversations: number;
  lastUpdate: Date;
}

export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    totalMessages: 0,
    totalConversations: 0,
    activeConversations: 0,
    lastUpdate: new Date(),
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();

    console.log("🔌 Setting up real-time subscriptions...");

    // Subscribe to messages table changes
    const messagesChannel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("📨 New message event:", payload);

          // Increment counter on INSERT
          if (payload.eventType === "INSERT") {
            setMetrics((prev) => ({
              ...prev,
              totalMessages: prev.totalMessages + 1,
              lastUpdate: new Date(),
            }));
          }
        },
      )
      .subscribe((status) => {
        console.log("📡 Messages channel status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    // Subscribe to conversations table changes
    const conversationsChannel = supabase
      .channel("conversations-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          console.log("💬 New conversation event:", payload);

          if (payload.eventType === "INSERT") {
            setMetrics((prev) => ({
              ...prev,
              totalConversations: prev.totalConversations + 1,
              lastUpdate: new Date(),
            }));
          }
        },
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      console.log("🔌 Cleaning up real-time subscriptions...");
      messagesChannel.unsubscribe();
      conversationsChannel.unsubscribe();
    };
  }, []);

  return { metrics, isConnected };
}
