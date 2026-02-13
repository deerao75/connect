
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatRoom, Message } from '../types';
import { getAiResponse, summarizeChat } from '../services/geminiService';

interface ChatWindowProps {
  user: User;
  room: ChatRoom;
  allUsers: User[];
  onUpdateRoom: (room: ChatRoom) => void;
  onInviteParticipant: (userId: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user, room, allUsers, onUpdateRoom, onInviteParticipant }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const participants = allUsers.filter(u => room.participants.includes(u.id));
  const otherParticipants = participants.filter(p => p.id !== user.id);
  
  const roomDisplayName = room.participants.length > 2 
    ? otherParticipants.map(p => p.name.split(' ')[0]).join(', ')
    : otherParticipants[0]?.name || 'Chat';

  // Available people to invite (who are not already in this room)
  const inviteCandidates = allUsers.filter(u => !room.participants.includes(u.id));

  useEffect(() => {
    // Mock fetch messages for this room
    const dummyMessages: Message[] = [
      { id: 'm1', senderId: 'system', senderName: 'Acertax System', text: `Secure end-to-end communication established.`, timestamp: new Date(Date.now() - 3600000) },
      ... (room.lastMessage ? [{ id: 'm_last', senderId: 'u2', senderName: otherParticipants[0]?.name || 'User', text: room.lastMessage, timestamp: new Date(Date.now() - 60000) }] : [])
    ];
    setMessages(dummyMessages);
    setSummary('');
    setShowSummary(false);
    setShowInviteModal(false);
  }, [room.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    onUpdateRoom({ ...room, lastMessage: inputText });

    if (inputText.toLowerCase().includes('@ai')) {
      setIsTyping(true);
      const chatHistory = messages.slice(-5).map(m => ({
        role: m.senderId === user.id ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      const responseText = await getAiResponse(inputText, chatHistory);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'ai',
        senderName: 'Assistant',
        text: responseText || "I'm on standby.",
        timestamp: new Date(),
        isAi: true,
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }
  };

  const handleSummarize = async () => {
    setIsTyping(true);
    const mTexts = messages.map(m => `${m.senderName}: ${m.text}`);
    const sum = await summarizeChat(mTexts);
    setSummary(sum || "Summary generated based on recent context.");
    setShowSummary(true);
    setIsTyping(false);
  };

  const handleInvite = (userId: string) => {
    onInviteParticipant(userId);
    setShowInviteModal(false);
    const invitedUser = allUsers.find(u => u.id === userId);
    setMessages(prev => [...prev, {
      id: `sys_${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      text: `${user.name} added ${invitedUser?.name} to the conversation.`,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex -space-x-3 overflow-hidden">
            {otherParticipants.slice(0, 3).map(p => (
              <img key={p.id} src={p.avatar} className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" alt="" />
            ))}
            {otherParticipants.length > 3 && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white text-[10px] font-bold text-slate-500">
                +{otherParticipants.length - 3}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 text-base leading-tight truncate">
              {roomDisplayName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                {room.participants.length} Active Participants
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowInviteModal(!showInviteModal)}
            className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
            title="Invite People"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            ADD PEOPLE
          </button>
          <button 
            onClick={handleSummarize}
            className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all"
          >
            SUMMARIZE
          </button>
        </div>

        {/* Invite Dropdown */}
        {showInviteModal && (
          <div className="absolute top-16 right-6 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 p-2 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">Invite Colleagues</h4>
            <div className="max-h-60 overflow-y-auto">
              {inviteCandidates.length > 0 ? inviteCandidates.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleInvite(u.id)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
                >
                  <img src={u.avatar} className="w-8 h-8 rounded-full" alt="" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-700 truncate">{u.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                  </div>
                </button>
              )) : (
                <div className="p-4 text-center text-xs text-slate-400 italic">No one else available to invite</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Area */}
      {showSummary && (
        <div className="px-6 py-4 bg-orange-50/50 border-b border-orange-100">
          <div className="flex items-start gap-3">
            <div className="mt-1 bg-orange-600 rounded-md p-1">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-orange-900 mb-1 tracking-tight">AI THOUGHTS</h4>
              <p className="text-xs text-orange-800 leading-relaxed italic opacity-90">{summary}</p>
            </div>
            <button onClick={() => setShowSummary(false)} className="text-orange-400 hover:text-orange-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8"
      >
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === user.id;
          const isSystem = msg.senderId === 'system';
          const showName = idx === 0 || messages[idx-1].senderId !== msg.senderId;

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100/50 px-3 py-1 rounded-full uppercase tracking-widest">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {showName && !isMe && (
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{msg.senderName}</span>
                  <span className="text-[9px] text-slate-300 font-medium">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              <div className="flex items-end gap-3 max-w-[85%] group">
                {!isMe && (
                  <img 
                    src={msg.isAi ? 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d473530465115985961a.svg' : (allUsers.find(u => u.id === msg.senderId)?.avatar || `https://i.pravatar.cc/100?u=${msg.senderId}`)} 
                    className={`w-8 h-8 rounded-xl object-cover shadow-sm ${msg.isAi ? 'p-1.5 bg-orange-600' : ''}`} 
                    alt="" 
                  />
                )}
                <div 
                  className={`relative p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-200 ${
                    isMe 
                      ? 'bg-orange-600 text-white rounded-tr-none' 
                      : msg.isAi 
                        ? 'bg-slate-900 text-slate-100 rounded-tl-none font-medium' 
                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="flex gap-1.5 p-3.5 bg-white border border-slate-100 rounded-2xl rounded-tl-none">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center gap-4">
          <button type="button" className="p-2.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message to colleagues...`}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-2 top-2 p-2.5 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 hover:scale-105 active:scale-95 disabled:bg-slate-200 disabled:shadow-none transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </form>
        <div className="mt-3 flex items-center justify-center gap-4">
           <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
             Secure Acertax Channel
           </span>
           <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
             AI Assistant Ready
           </span>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
