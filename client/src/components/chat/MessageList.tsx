import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Lock, Eye, Reply, Copy, Shield } from "lucide-react";
import type { ChatMessageWithUser } from "@shared/schema";

interface MessageListProps {
  roomId: string;
  newMessages: ChatMessageWithUser[];
  typingUsers: string[];
}

export function MessageList({ roomId, newMessages, typingUsers }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<ChatMessageWithUser[]>({
    queryKey: ["/api/chat/rooms", roomId, "messages"],
    enabled: !!roomId,
  });

  // Combine fetched messages with new real-time messages
  const allMessages = [...messages, ...newMessages];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages]);

  const formatTime = (date: Date | string) => {
    const messageDate = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(messageDate, { addSuffix: true });
  };

  const getUserInitials = (user: any) => {
    const firstName = user.firstName || user.username || 'U';
    const lastName = user.lastName || '';
    return (firstName[0] + (lastName[0] || '')).toUpperCase();
  };

  const getUserColor = (userId: string) => {
    // Generate consistent color based on user ID
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-green-500 to-teal-600',
      'from-purple-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-red-500 to-pink-600',
      'from-indigo-500 to-purple-600',
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (!roomId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Select a Channel</h3>
          <p className="text-muted-foreground">Choose a channel from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4">
        {/* Welcome Message */}
        {allMessages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to the chat!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This is the beginning of your secure conversation. All messages are encrypted with RSA.
            </p>
          </div>
        )}

        {/* Messages */}
        {allMessages.map((message, index) => (
          <div key={`${message.id}-${index}`} className="flex items-start space-x-3 animate-in slide-in-from-bottom-2">
            <div className={`w-8 h-8 bg-gradient-to-br ${getUserColor(message.userId)} rounded-full flex items-center justify-center flex-shrink-0`}>
              <span className="text-xs font-medium text-white">
                {getUserInitials(message.user)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-foreground text-sm">
                  {message.user.firstName || message.user.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(message.createdAt!)}
                </span>
                {message.encryptedMessage && (
                  <div className="flex items-center space-x-1">
                    <Lock className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">Encrypted</span>
                  </div>
                )}
              </div>
              <div className="bg-card rounded-lg p-3 max-w-2xl border">
                <p className="text-foreground leading-relaxed">
                  {message.message}
                </p>
                
                {/* Message Actions */}
                <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                  {message.encryptedMessage && (
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Show Math
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-start space-x-3 animate-pulse">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-white">...</span>
            </div>
            <div className="bg-card rounded-lg p-3 border">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
