import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Send, Loader2, MessageCircle, Sparkles } from 'lucide-react';

export default function SquadChat({ squadId }) {
  const { session } = useAuth();
  const { messages, sendMessage } = useSquadStore();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name) => {
    if (!name) return 'M';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-[550px] bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl">
      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-[#6e7681]">
            <MessageCircle className="w-10 h-10 mb-2 text-[#30363d]" />
            <p className="text-sm font-bold text-white">No messages yet</p>
            <p className="text-xs">Start the conversation with your squad!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.user_id === session?.user?.id;
            const isSystem = msg.message_type === 'system';

            if (isSystem) {
              return (
                <div key={msg.id || idx} className="text-center my-2">
                  <span className="text-[10px] text-[#22c55e] bg-[#22c55e]/10 px-3 py-1 rounded-full border border-[#22c55e]/20 font-bold">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id || idx} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22c55e] to-teal-600 flex items-center justify-center text-white text-[10px] font-bold shadow flex-shrink-0">
                  {getInitials(msg.author_name)}
                </div>

                <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end text-right' : ''}`}>
                  <div className="flex items-center gap-2 text-[10px] text-[#8b949e]">
                    <span className="font-bold text-white">{msg.author_name || 'Member'}</span>
                    <span>{formatTime(msg.created_at)}</span>
                  </div>

                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#22c55e] text-white rounded-tr-none font-medium'
                      : 'bg-[#161b22] text-[#e6edf3] border border-[#30363d] rounded-tl-none'
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

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-[#161b22] border-t border-[#30363d] flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Send a message to your squad..."
          className="flex-1 px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white placeholder-[#6e7681] focus:outline-none focus:border-[#22c55e]"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="p-2.5 bg-[#22c55e] hover:bg-[#1ea34d] text-white rounded-xl disabled:opacity-40 transition-all shadow-lg shadow-[#22c55e]/20"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
