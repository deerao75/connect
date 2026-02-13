
import React from 'react';
import { User, ChatRoom } from '../types';

interface SidebarProps {
  user: User;
  colleagues: User[];
  rooms: ChatRoom[];
  activeRoomId: string | null;
  onSelectMember: (user: User) => void;
  onSelectRoom: (id: string) => void;
  onDeleteRoom: (id: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, colleagues, rooms, activeRoomId, onSelectMember, onSelectRoom, onDeleteRoom, onLogout }) => {
  const confirmAndDelete = (e: React.MouseEvent, roomId: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the chat with ${name}? All messages in this local session will be removed.`)) {
      onDeleteRoom(roomId);
    }
  };

  return (
    <div className="w-72 flex flex-col border-r border-slate-200 bg-white">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-orange-600 p-1.5 rounded-lg text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-slate-900 tracking-tight">Acertax</span>
        </div>
      </div>

      {/* Directory Search */}
      <div className="p-4">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search colleagues..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
          />
          <svg className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="flex items-center justify-between px-2 mb-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Colleagues</h3>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold">
            {colleagues.filter(c => c.status === 'online').length} ONLINE
          </span>
        </div>
        
        <div className="space-y-0.5">
          {colleagues.map(colleague => {
            const associatedRoom = rooms.find(r => 
              r.type === 'direct' && r.participants.includes(colleague.id) && r.participants.length === 2
            );
            const isActive = associatedRoom && activeRoomId === associatedRoom.id;

            return (
              <div key={colleague.id} className="relative group">
                <button
                  onClick={() => onSelectMember(colleague)}
                  className={`w-full flex items-center p-2.5 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-orange-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative mr-3">
                    <img 
                      src={colleague.avatar} 
                      className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
                      alt=""
                    />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                      colleague.status === 'online' ? 'bg-green-500' : 'bg-amber-400'
                    }`}></span>
                  </div>
                  <div className="flex-1 text-left min-w-0 pr-6">
                    <div className={`font-semibold truncate text-sm ${isActive ? 'text-orange-700' : 'text-slate-700'}`}>
                      {colleague.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {colleague.status === 'online' ? 'Available' : 'Away'}
                    </div>
                  </div>
                </button>
                {associatedRoom && (
                  <button
                    onClick={(e) => confirmAndDelete(e, associatedRoom.id, colleague.name)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Group Chats */}
        {rooms.some(r => r.participants.length > 2) && (
          <>
            <div className="flex items-center justify-between px-2 mt-6 mb-3">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Group Chats</h3>
            </div>
            <div className="space-y-0.5">
              {rooms.filter(r => r.participants.length > 2).map(room => (
                <div key={room.id} className="relative group">
                  <button
                    onClick={() => onSelectRoom(room.id)}
                    className={`w-full flex items-center p-2.5 rounded-xl transition-all duration-200 ${
                      activeRoomId === room.id ? 'bg-orange-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center mr-3 text-orange-600 font-bold text-xs shadow-sm">
                      {room.participants.length}
                    </div>
                    <div className="flex-1 text-left min-w-0 pr-6">
                      <div className={`font-semibold truncate text-sm ${activeRoomId === room.id ? 'text-orange-700' : 'text-slate-700'}`}>
                        {room.name || 'Multi-person Chat'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {room.participants.length} participants
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => confirmAndDelete(e, room.id, room.name || 'Group Chat')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete group chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* User Account */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-md" alt={user.name} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900 truncate text-xs">{user.name}</div>
            <div className="text-[10px] text-slate-400 truncate tracking-tight">{user.email}</div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
