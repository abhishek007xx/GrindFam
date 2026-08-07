import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { Send, Code, Target, Loader2, MessageCircle, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function SquadChat({ squadId }) {
  const { session, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showStandupPrompt, setShowStandupPrompt] = useState(false);
  const messagesEndRef = useRef(null);

  const token = session?.access_token;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/squads/messages?limit=80`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check daily standup
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 6 && hour < 12) {
      const todayStr = now.toISOString().split('T')[0];
      const myStandup = messages.find(
        m => m.message_type === 'standup' && m.user_id === profile?.id && m.created_at?.startsWith(todayStr)
      );
      if (!myStandup) setShowStandupPrompt(true);
      else setShowStandupPrompt(false);
    }
  }, [messages, profile]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!squadId) return;
    const channel = supabase
      .channel(`squad-chat-${squadId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'squad_messages', filter: `squad_id=eq.${squadId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [squadId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`${API_BASE}/api/squads/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newMessage.trim(), message_type: 'text' })
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleStandup = async (text) => {
    try {
      await fetch(`${API_BASE}/api/squads/standup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: text })
      });
      setShowStandupPrompt(false);
      fetchMessages();
    } catch (err) {
      console.error('Failed to post standup:', err);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl">
      {/* Daily Standup Prompt Banner */}
      {showStandupPrompt && (
        <div className="p-3 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Good morning! Post your daily LeetCode goal for today:</span>
          </div>
          <button
            onClick={() => handleStandup('Today goal: Solve 3 LeetCode problems & review DP')}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all shadow"
          >
            Post Goal
          </button>
        </div>
      )}

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
            const isMe = msg.user_id === profile?.id;
            const isSystem = msg.message_type === 'system';
            const isStandup = msg.message_type === 'standup';
            const isCode = msg.message_type === 'code';

            if (isSystem) {
              return (
                <div key={msg.id || idx} className="text-center my-2">
                  <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id || idx} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold shadow flex-shrink-0">
                  {getInitials(msg.profile?.name || msg.author_name)}
                </div>

                <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end text-right' : ''}`}>
                  <div className="flex items-center gap-2 text-[10px] text-[#8b949e]">
                    <span className="font-bold text-white">{msg.profile?.name || 'Squad Member'}</span>
                    <span>{formatTime(msg.created_at)}</span>
                  </div>

                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : isStandup
                      ? 'bg-amber-950/40 text-amber-200 border border-amber-500/30 rounded-tl-none'
                      : isCode
                      ? 'bg-teal-950/40 text-teal-200 border border-teal-500/30 font-mono text-[11px] rounded-tl-none'
                      : 'bg-[#161b22] text-[#c9d1d9] border border-[#30363d] rounded-tl-none'
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
          className="flex-1 px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white placeholder-[#6e7681] focus:outline-none focus:border-emerald-500/50"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-40 transition-all shadow-lg shadow-emerald-600/20"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
