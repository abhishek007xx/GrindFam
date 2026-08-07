import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Send, MessageSquare, ExternalLink, Smile, Plus } from 'lucide-react';

export default function DMChat() {
  const { session } = useAuth();
  const { activeDM, dmMessages, sendDM } = useSquadStore();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dmMessages]);

  if (!activeDM) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await sendDM(newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send DM:', err);
    } finally {
      setSending(false);
    }
  };

  const getInitial = (name) => (name || 'U')[0].toUpperCase();
  const partnerName = activeDM.partnerName || 'User';

  return (
    <div className="flex flex-col h-full bg-[#111315]">
      {/* Header Bar */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#3d4a3d] bg-[#161d16] shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#22c55e] flex items-center justify-center text-[#0e150e] text-xs font-bold flex-shrink-0">
            {getInitial(partnerName)}
          </div>
          <span className="text-[15px] font-bold text-white truncate">{partnerName}</span>
          <span className="text-xs text-[#869585] font-mono">Direct Message</span>
        </div>

        {activeDM.leetcode_username && (
          <a
            href={`https://leetcode.com/u/${activeDM.leetcode_username}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#22c55e] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>LeetCode</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-[#3d4a3d]">
        {dmMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] mb-3">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">This is the start of your direct messages with {partnerName}</h3>
            <p className="text-xs text-[#869585] max-w-sm mt-1">Send a message to start chatting 1-on-1.</p>
          </div>
        ) : (
          dmMessages.map((msg, idx) => {
            const isMe = msg.sender_id === session?.user?.id;
            return (
              <div key={msg.id || idx} className={`flex gap-3 px-2 py-1 rounded-lg hover:bg-[#1a1d21] ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-[#0e150e] text-xs font-bold flex-shrink-0">
                  {getInitial(isMe ? 'You' : partnerName)}
                </div>
                <div className={`max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-0.5 justify-start">
                    <span className="text-xs font-bold text-white">{isMe ? 'You' : partnerName}</span>
                    <span className="text-[10px] text-[#869585]">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`text-xs px-3.5 py-2 rounded-2xl inline-block text-left whitespace-pre-wrap break-words ${
                    isMe ? 'bg-[#22c55e] text-[#0e150e] font-medium' : 'bg-[#23272b] text-[#dce5d9] border border-[#30363d]'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-0 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center bg-[#23272b] border border-[#30363d] rounded-xl focus-within:border-[#22c55e]">
          <button type="button" className="p-3 text-[#869585] hover:text-white">
            <Plus className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message @${partnerName}`}
            className="flex-1 bg-transparent text-xs text-[#dce5d9] placeholder-[#869585] outline-none py-2.5"
          />
          <button type="button" className="p-3 text-[#869585] hover:text-white">
            <Smile className="w-5 h-5" />
          </button>
          <button type="submit" disabled={!newMessage.trim() || sending} className="p-3 text-[#22c55e] disabled:opacity-30">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
