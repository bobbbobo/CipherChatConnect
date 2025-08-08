import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Hash, 
  Users, 
  UserPlus, 
  Settings, 
  ChevronDown,
  MessageCircle
} from "lucide-react";
import type { ChatRoom } from "@shared/schema";

interface ChatSidebarProps {
  currentRoomId?: string;
  onRoomSelect: (roomId: string, roomName: string) => void;
}

export function ChatSidebar({ currentRoomId, onRoomSelect }: ChatSidebarProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);

  const { data: chatRooms = [] } = useQuery<ChatRoom[]>({
    queryKey: ["/api/chat/rooms"],
  });

  const createRoomMutation = useMutation({
    mutationFn: async (roomData: { name: string; description?: string; isPrivate: boolean }) => {
      const response = await apiRequest("POST", "/api/chat/rooms", roomData);
      return response.json();
    },
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
      setIsCreateRoomOpen(false);
      setNewRoomName("");
      setNewRoomDescription("");
      setIsPrivateRoom(false);
      onRoomSelect(newRoom.id, newRoom.name);
      toast({
        title: "Room Created",
        description: `${newRoom.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create room",
        variant: "destructive",
      });
    },
  });

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      toast({
        title: "Error",
        description: "Room name is required",
        variant: "destructive",
      });
      return;
    }

    createRoomMutation.mutate({
      name: newRoomName.trim(),
      description: newRoomDescription.trim() || undefined,
      isPrivate: isPrivateRoom,
    });
  };

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publicRooms = filteredRooms.filter(room => !room.isPrivate);
  const privateRooms = filteredRooms.filter(room => room.isPrivate);

  // Auto-select general chat if no room is selected
  useEffect(() => {
    if (!currentRoomId && publicRooms.length > 0) {
      const generalRoom = publicRooms.find(room => 
        room.name.toLowerCase().includes('general') || room.name.toLowerCase().includes('main')
      ) || publicRooms[0];
      onRoomSelect(generalRoom.id, generalRoom.name);
    }
  }, [publicRooms, currentRoomId, onRoomSelect]);

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Conversations</h2>
          {isAuthenticated && (
            <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Room Name</label>
                    <Input
                      placeholder="Enter room name..."
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description (optional)</label>
                    <Input
                      placeholder="Enter room description..."
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="private"
                      checked={isPrivateRoom}
                      onChange={(e) => setIsPrivateRoom(e.target.checked)}
                      className="rounded border-border"
                    />
                    <label htmlFor="private" className="text-sm">Private room</label>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateRoomOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateRoom}
                      disabled={createRoomMutation.isPending}
                    >
                      {createRoomMutation.isPending ? "Creating..." : "Create Room"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Room Lists */}
      <ScrollArea className="flex-1">
        {/* Public Channels */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Public Channels
            </h3>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-1">
            {publicRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onRoomSelect(room.id, room.name)}
                className={`w-full flex items-center p-2 rounded-lg hover:bg-accent transition-colors ${
                  currentRoomId === room.id ? 'bg-accent border-l-2 border-primary' : ''
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-secondary to-green-600 rounded-lg flex items-center justify-center mr-3">
                  <Hash className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground truncate">{room.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.floor(Math.random() * 50) + 1}
                    </Badge>
                  </div>
                  {room.description && (
                    <p className="text-xs text-muted-foreground truncate">{room.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Private Rooms (for authenticated users) */}
        {isAuthenticated && privateRooms.length > 0 && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Private Rooms
              </h3>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="space-y-1">
              {privateRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onRoomSelect(room.id, room.name)}
                  className={`w-full flex items-center p-2 rounded-lg hover:bg-accent transition-colors ${
                    currentRoomId === room.id ? 'bg-accent border-l-2 border-primary' : ''
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate">{room.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.floor(Math.random() * 10) + 1}
                      </Badge>
                    </div>
                    {room.description && (
                      <p className="text-xs text-muted-foreground truncate">{room.description}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Direct Messages section placeholder */}
        {isAuthenticated && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Direct Messages
              </h3>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <UserPlus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="text-center py-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No direct messages yet</p>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* User Status */}
      {user && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.firstName?.[0] || user.username?.[0] || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.firstName || user.username}
              </p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
