import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Users, Lock } from 'lucide-react';
import { WebSocketClient, ChatMessage } from '@/lib/websocket';
import { useAuth } from '@/hooks/useAuth';
import { encryptMessage, RSAKeyPair } from '@/lib/rsa';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';

interface SecureChatProps {
  keyPair: RSAKeyPair | null;
}

export default function SecureChat({ keyPair }: SecureChatProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set<string>());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const ROOM_ID = 'general'; // Default room for now

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !wsClient) {
      const client = new WebSocketClient();
      setWsClient(client);

      // Connection handlers
      const removeConnectedHandler = client.onConnected(() => {
        setIsConnected(true);
        client.joinRoom(ROOM_ID, (user as any).id, (user as any).username || 'User');
        toast({
          title: 'Connected',
          description: 'Connected to secure chat',
        });
      });

      const removeDisconnectedHandler = client.onDisconnected(() => {
        setIsConnected(false);
        toast({
          title: 'Disconnected',
          description: 'Lost connection to chat server',
          variant: 'destructive',
        });
      });

      // Message handler
      const removeMessageHandler = client.onMessage((message) => {
        setMessages(prev => [...prev, message]);
        
        // Update online users
        if (message.type === 'user_joined') {
          setOnlineUsers(prev => new Set(prev).add(message.username));
        } else if (message.type === 'user_left') {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(message.username);
            return newSet;
          });
        }
      });

      // Error handler
      const removeErrorHandler = client.onError((error) => {
        if (isUnauthorizedError(new Error(error))) {
          toast({
            title: 'Unauthorized',
            description: 'You are logged out. Logging in again...',
            variant: 'destructive',
          });
          setTimeout(() => {
            window.location.href = '/api/login';
          }, 500);
          return;
        }

        toast({
          title: 'Chat Error',
          description: error,
          variant: 'destructive',
        });
      });

      // Cleanup function
      return () => {
        removeConnectedHandler();
        removeDisconnectedHandler();
        removeMessageHandler();
        removeErrorHandler();
        client.leaveRoom(ROOM_ID);
        client.disconnect();
      };
    }
  }, [isAuthenticated, user, wsClient, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsClient) {
        wsClient.leaveRoom(ROOM_ID);
        wsClient.disconnect();
      }
    };
  }, [wsClient]);

  const handleSendMessage = () => {
    if (!wsClient || !newMessage.trim() || !user) {
      return;
    }

    let encryptedMsg: string | undefined;
    let rsaPublicKey: string | undefined;
    let rsaModulus: string | undefined;

    // Encrypt message if RSA keys are available
    if (keyPair) {
      try {
        const encrypted = encryptMessage(newMessage, keyPair.publicKey);
        encryptedMsg = encrypted.join(' ');
        rsaPublicKey = keyPair.publicKey.e.toString();
        rsaModulus = keyPair.publicKey.n.toString();
      } catch (error) {
        console.error('Encryption error:', error);
        toast({
          title: 'Encryption Error',
          description: 'Failed to encrypt message. Sending unencrypted.',
          variant: 'destructive',
        });
      }
    }

    wsClient.sendMessage(ROOM_ID, newMessage, encryptedMsg, rsaPublicKey, rsaModulus);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Show authentication required if not logged in
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="text-center py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-8 pb-8">
            <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in to access the secure chat feature
            </p>
            <Button
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-chat-login"
            >
              Login to Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading chat...</p>
      </div>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Secure Chat Room
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              <Users className="h-3 w-3 mr-1" />
              {onlineUsers.size + 1} online
            </Badge>
          </div>
        </div>
        {keyPair && (
          <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Messages are RSA encrypted
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4" data-testid="chat-messages">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <MessageCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type !== 'message' ? 'justify-center' : ''
                }`}
              >
                {message.type === 'message' && (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.username}`} />
                      <AvatarFallback>
                        {message.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {message.username}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.encryptedMessage && (
                          <Lock className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 text-sm">
                        {message.message}
                      </div>
                      {message.encryptedMessage && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Encrypted: {message.encryptedMessage.split(' ').slice(0, 5).join(' ')}
                          {message.encryptedMessage.split(' ').length > 5 && '...'}
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {message.type !== 'message' && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                    {message.message}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!isConnected || !newMessage.trim()}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
            Not connected to chat server
          </p>
        )}
      </div>
    </Card>
  );
}
