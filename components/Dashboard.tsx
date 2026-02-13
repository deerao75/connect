import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { User, ChatRoom } from '../types';
import { supabase } from '../services/supabaseClient';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [colleagues, setColleagues] = useState<User[]>([]); // State for real employees
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // --- FETCH REAL EMPLOYEES FROM SUPABASE ---
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('profiles') // Ensure your table name is 'profiles' in Supabase
        .select('*')
        .neq('id', user.id); // Exclude the current logged-in user

      if (error) {
        console.error('Error fetching employees:', error);
      } else if (data) {
        // Map Supabase data to our User type
        const formattedUsers: User[] = data.map(profile => ({
          id: profile.id,
          name: profile.name || 'Anonymous',
          email: profile.email || '',
          avatar: profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&background=random`,
          status: profile.status || 'online'
        }));
        setColleagues(formattedUsers);
      }
    };

    fetchEmployees();
  }, [user.id]);

  // Handle clicking a member in the sidebar
  const handleSelectMember = (targetUser: User) => {
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
        colleagues={colleagues} 
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
            allUsers={[user, ...colleagues]}
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
            <h3 className="text-xl font-semibold text-slate-600 mb-2 font-black tracking-tight">Welcome to Acertax Connect</h3>
            <p className="max-w-xs text-xs font-medium uppercase tracking-widest leading-relaxed">Select a colleague to start a secure conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;