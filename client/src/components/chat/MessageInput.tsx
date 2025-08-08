import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, Smile, Eye, Send, Shield } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string, encrypted?: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [showEncryption, setShowEncryption] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
    }
  }, [message]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please create a username or sign in to send messages.",
        variant: "destructive",
      });
      return;
    }

    onSendMessage(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="p-4 border-t border-border bg-card">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Join the conversation</p>
          <Button size="sm">Create Username</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex items-end space-x-3">
        {/* Attachment Button */}
        <Button variant="ghost" size="sm" className="h-11 w-11 p-0" disabled={disabled}>
          <Paperclip className="h-4 w-4" />
        </Button>
        
        {/* Message Input */}
        <div className="flex-1">
          <div className="bg-background border border-border rounded-lg focus-within:border-primary transition-colors">
            <Textarea
              ref={textareaRef}
              placeholder="Type your message... (will be RSA encrypted)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-32 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={disabled}
            />
            
            {/* Message Options Bar */}
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  <Smile className="h-3 w-3 mr-1" />
                  Emoji
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => setShowEncryption(!showEncryption)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Show Encryption
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                {message.length}/2000
              </div>
            </div>
          </div>
        </div>
        
        {/* Send Button */}
        <Button 
          onClick={handleSendMessage}
          disabled={disabled || !message.trim()}
          className="h-11 w-11 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Encryption Status */}
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Shield className="h-3 w-3 text-green-500" />
          <span>Messages encrypted with RSA-2048</span>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-xs">
            Mode: Educational RSA
          </Badge>
          <Button variant="ghost" size="sm" className="h-5 text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
