
import React, { useState, useMemo } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { User, ChatRoom } from '../types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

// Mock of employees currently "logged in" to the workspace
const COLLEAGUES: User[] = [
  { id: 'u2', name: 'Alex Rivera', email: 'alex.rivera@acertax.com', avatar: 'https://i.pravatar.cc/150?u=u2', status: 'online' },
  { id: 'u3', name: 'Jessica Park', email: 'jessica.park@acertax.com', avatar: 'https://i.pravatar.cc/150?u=u3', status: 'online' },
  { id: 'u4', name: 'Marcus Chen', email: 'marcus.chen@acertax.com', avatar: 'https://i.pravatar.cc/150?u=u4', status: 'online' },
  { id: 'u5', name: 'Sarah Miller', email: 'sarah.miller@acertax.com', avatar: 'https://i.pravatar.cc/150?u=u5', status: 'away' },
  { id: 'u6', name: 'David Wilson', email: 'david.wilson@acertax.com', avatar: 'https://i.pravatar.cc/150?u=u6', status: 'online' },
  { id: 'u7', name: 'Elena Rodriguez', email: 'elena.rodriguez@acertax.com', avatar: 'https://i.pravatar.cc/150?u=u7', status: 'online' },
];

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Handle clicking a member in the sidebar
  const handleSelectMember = (targetUser: User) => {
    // Check if a direct chat already exists with exactly this person
    const existingRoom = rooms.find(r => 
      r.type === 'direct' && 
      r.participants.length === 2 && 
      r.participants.includes(targetUser.id) &&
      r.participants.includes(user.id)
    );

    if (existingRoom) {
      setActiveRoomId(existingRoom.id);
    } else {
      const newRoom: ChatRoom = {
        id: `room_${Date.now()}`,
        name: targetUser.name,
        type: 'direct',
        participants: [user.id, targetUser.id],
        unreadCount: 0,
      };
      setRooms(prev => [...prev, newRoom]);
      setActiveRoomId(newRoom.id);
    }
  };

  const handleAddParticipant = (roomId: string, userId: string) => {
    setRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        const updatedParticipants = [...new Set([...room.participants, userId])];
        return {
          ...room,
          participants: updatedParticipants,
          type: updatedParticipants.length > 2 ? 'group' : room.type,
        };
      }
      return room;
    }));
  };

  const handleDeleteRoom = (roomId: string) => {
    if (activeRoomId === roomId) {
      setActiveRoomId(null);
    }
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  const activeRoom = useMemo(() => 
    rooms.find(r => r.id === activeRoomId), 
    [rooms, activeRoomId]
  );

  return (
    <div className="flex w-full h-full overflow-hidden bg-white shadow-2xl rounded-xl border border-slate-200 max-w-[1600px] mx-auto">
      <Sidebar 
        user={user} 
        colleagues={COLLEAGUES} 
        rooms={rooms}
        activeRoomId={activeRoomId} 
        onSelectMember={handleSelectMember} 
        onSelectRoom={setActiveRoomId}
        onDeleteRoom={handleDeleteRoom}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {activeRoom ? (
          <ChatWindow 
            user={user} 
            room={activeRoom} 
            allUsers={[user, ...COLLEAGUES]}
            onUpdateRoom={(updatedRoom) => {
              setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
            }}
            onInviteParticipant={(userId) => handleAddParticipant(activeRoom.id, userId)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-5.062A8.935 8.935 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Welcome to Acertax Connect</h3>
            <p className="max-w-xs">Select a colleague from the sidebar to start a secure conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
