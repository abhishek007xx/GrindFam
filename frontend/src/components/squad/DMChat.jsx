import React, { useState, useEffect, useRef } from 'react';
import { Send, ExternalLink, ArrowLeft } from 'lucide-react';
import { useSquadStore } from '../../store/useSquadStore';
import { useAuth } from '../../context/AuthContext';

export default function DMChat({ threadId, otherUser }) {
  const { session } = useAuth();
  const { activeDMThread, dmMessages, sendDM, markDMRead } = useSquadStore();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const targetThreadId = threadId || activeDMThread?.id;
  const partner = otherUser || {
    username: activeDMThread?.partnerName || 'User',
    leetcode_username: activeDMThread?.leetcode_username || ''
  };

  useEffect(() => {
    if (targetThreadId) {
      markDMRead(targetThreadId);
    }
  }, [targetThreadId, dmMessages, markDMRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dmMessages]);

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

  const partnerInitial = (partner.username || partner.partnerName || 'U')[0].toUpperCase();

  return (
    <div className="flex flex-col h-[600px] bg-[#141414] border border-[#333333] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#333333] bg-[#1E1E1E] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => useSquadStore.setState({ activeDMThread: null })}
            className="p-1.5 text-[#A3A3A3] hover:text-white rounded-lg transition-colors md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-sm shadow">
            {partnerInitial}
          </div>
          <div>
            <div className="font-semibold text-white">{partner.username || partner.partnerName}</div>
            <div className="text-xs text-[#A3A3A3]">Direct Message</div>
          </div>
        </div>

        {partner.leetcode_username && (
          <a
            href={`https://leetcode.com/u/${partner.leetcode_username}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#EA5D3A] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>LeetCode</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#333333]">
        {dmMessages.map(msg => {
          const isMe = msg.sender_id === session?.user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                isMe ? 'bg-[#EA5D3A] text-white font-medium shadow-md shadow-[#EA5D3A]/20' : 'bg-[#1E1E1E] border border-[#333333] text-[#F4F4F5]'
              }`}>
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <div className="text-[10px] opacity-70 mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-[#333333] bg-[#1E1E1E] flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${partner.username || partner.partnerName}...`}
            className="flex-1 px-4 py-2.5 bg-[#141414] border border-[#333333] rounded-xl text-sm text-white placeholder-[#A3A3A3] focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center shadow-md shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
