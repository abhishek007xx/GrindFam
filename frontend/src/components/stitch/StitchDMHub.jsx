import React, { useState, useEffect, useRef } from 'react';
import { useSquadStore } from '../../store/useSquadStore';
import { useAuth } from '../../context/AuthContext';

export default function StitchDMHub() {
  const { session } = useAuth();
  const { dmThreads, dmMessages, loadDMThreads, loadDMMessages, sendDM, activeSquad } = useSquadStore();
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (session?.user?.id && activeSquad?.id) {
      loadDMThreads(session.user.id);
    }
  }, [session?.user?.id, activeSquad?.id, loadDMThreads]);

  useEffect(() => {
    if (activeThreadId && session?.user?.id) {
      loadDMMessages(activeThreadId, session.user.id);
    }
  }, [activeThreadId, session?.user?.id, loadDMMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dmMessages]);

  const activeThread = dmThreads.find(t => t.other_user_id === activeThreadId);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThreadId) return;
    try {
      await sendDM(activeThreadId, session.user.id, newMessage);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex w-full h-[85vh] max-h-[800px] border border-white/10 rounded-xl overflow-hidden mt-6 bg-[#121212] font-['Inter'] antialiased max-w-[1440px] mx-auto shadow-2xl">
      {/* Left Sidebar: Conversations */}
      <aside className="w-full md:w-[380px] h-full flex flex-col bg-[#0e0e0e] border-r border-[#59413b]/30 shrink-0 z-10">
        <div className="p-4 border-b border-[#59413b]/30 bg-[#131313]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="font-['Outfit'] text-[24px] font-bold text-[#EA5D3A]">Messages</span>
            <button className="w-10 h-10 rounded-full bg-[#201f1f] hover:bg-[#2a2a2a] flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-[#e5e2e1]">edit_square</span>
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#e1bfb7]">search</span>
            <input className="w-full bg-[#201f1f] text-[#e5e2e1] rounded-xl pl-10 pr-4 py-2 border-none focus:ring-1 focus:ring-[#EA5D3A] placeholder-[#e1bfb7]/60 font-['Inter'] text-sm transition-shadow" placeholder="Search conversations..." type="text"/>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide p-3 flex flex-col gap-1">
          {dmThreads.length === 0 && (
            <p className="text-[#e1bfb7] text-center mt-4 text-sm">No conversations yet.</p>
          )}
          {dmThreads.map(thread => {
            const isActive = thread.other_user_id === activeThreadId;
            return (
              <div 
                key={thread.other_user_id}
                onClick={() => setActiveThreadId(thread.other_user_id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isActive ? 'bg-[#EA5D3A]/10 border border-[#EA5D3A]/20' : 'hover:bg-[#1c1b1b] border border-transparent'}`}
              >
                <div className="relative shrink-0">
                  <div className="w-[48px] h-[48px] rounded-full bg-[#353534] flex items-center justify-center text-[#e5e2e1] font-bold text-lg">
                    {(thread.other_user_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  {thread.unread_count > 0 && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#EA5D3A] rounded-full border-2 border-[#121212]"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-['Inter'] text-base font-semibold truncate ${isActive ? 'text-[#e5e2e1]' : 'text-[#e5e2e1]'}`}>{thread.other_user_name}</span>
                    <span className={`text-[12px] ${isActive ? 'text-[#EA5D3A]' : 'text-[#e1bfb7]'}`}>
                      {thread.last_message_at ? new Date(thread.last_message_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className={`font-['Inter'] text-sm truncate ${isActive ? 'text-[#EA5D3A]' : 'text-[#e1bfb7]'}`}>{thread.last_message || 'Start chatting'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
      
      {/* Main Chat Area */}
      {activeThreadId ? (
        <main className="hidden md:flex flex-1 flex-col bg-[#121212] relative z-0">
          <header className="h-20 flex items-center justify-between px-6 border-b border-[#59413b]/30 bg-[#131313]/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-[48px] h-[48px] rounded-full bg-[#353534] flex items-center justify-center text-[#e5e2e1] font-bold text-lg border-2 border-transparent group-hover:border-[#EA5D3A] transition-colors">
                  {(activeThread?.other_user_name || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-['Outfit'] text-xl font-bold text-[#e5e2e1] leading-tight">{activeThread?.other_user_name}</span>
              </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 chat-scroll">
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-3">
              {dmMessages.length === 0 && (
                 <p className="text-[#e1bfb7] text-center mt-4">This is the beginning of your direct message history with {activeThread?.other_user_name}.</p>
              )}
              {dmMessages.map(msg => {
                const isMine = msg.sender_id === session?.user?.id;
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[75%] ${isMine ? 'self-end items-end' : 'self-start'}`}>
                    <div className={`font-['Inter'] text-base px-5 py-3 shadow-sm ${isMine ? 'bg-[#EA5D3A] text-white rounded-2xl rounded-tr-sm' : 'bg-[#1c1b1b] text-[#e5e2e1] rounded-2xl rounded-tl-sm border border-[#59413b]/20'}`}>
                      {msg.content}
                    </div>
                    <span className={`text-[12px] text-[#e1bfb7] mt-1 font-medium ${isMine ? 'mr-2' : 'ml-2'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="px-6 pb-6 pt-4 bg-[#121212] shrink-0">
            <form onSubmit={handleSend} className="max-w-4xl mx-auto w-full">
              <div className="flex items-end gap-3 p-2 bg-[#1c1b1b] border border-[#59413b]/40 rounded-3xl focus-within:border-[#EA5D3A]/50 focus-within:shadow-[0_0_15px_rgba(234,93,58,0.1)] transition-all">
                <div className="flex-1 min-h-[44px] flex items-center py-1 pl-4">
                  <input 
                    value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full bg-transparent border-none text-[#e5e2e1] font-['Inter'] placeholder-[#e1bfb7]/60 focus:ring-0 resize-none max-h-[150px] outline-none" 
                    placeholder={`Message ${activeThread?.other_user_name}...`} 
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
                  <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 ml-1 rounded-full bg-[#EA5D3A] text-white flex items-center justify-center hover:brightness-110 shadow-lg hover:shadow-[0_0_15px_rgba(234,93,58,0.4)] transition-all disabled:opacity-50">
                    <span className="material-symbols-outlined ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      ) : (
        <main className="hidden md:flex flex-1 items-center justify-center bg-[#121212]">
          <p className="text-[#e1bfb7]">Select a conversation to start messaging</p>
        </main>
      )}
    </div>
  );
}
