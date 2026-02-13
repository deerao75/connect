
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isAi?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants: string[]; // User IDs
  lastMessage?: string;
  unreadCount: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
