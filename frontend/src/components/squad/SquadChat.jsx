import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { Send, Smile, Code, Target, Loader2, MessageCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function SquadChat({ squadId }) {
  const { session, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showStandupPrompt, setShowStandupPrompt] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

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
    } catch (err) {
      console.error('Failed to post standup:', err);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getMessageColor = (type) => {
    if (type === 'system') return 'text-indigo-400 italic';
    if (type === 'standup') return 'text-amber-300';
    if (type === 'code') return 'text-emerald-400';
    return 'text-[#e6edf3]';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  // Group messages by date
  let lastDate = '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden">
      {/* Daily Standup Bot Prompt */}
      {showStandupPrompt && (
        <div className="p-4 bg-gradient-to-r from-amber-900/30 to-[#0d1117] border-b border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <Target className="w-4 h-4" />
            <span>🌅 Daily Standup: What are you solving today?</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Two Sum, Binary Search..."
              className="px-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-white placeholder-[#6e7681] w-48 md:w-64 focus:outline-none focus:border-amber-500/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleStandup(`🎯 Today I'm solving: ${e.target.value.trim()}`);
                  e.target.value = '';
                }
              }}
            />
            <button
              onClick={() => setShowStandupPrompt(false)}
              className="text-xs text-[#8b949e] hover:text-white"
            >Skip</button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
        {messages.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <MessageCircle className="w-12 h-12 text-[#30363d] mx-auto" />
            <p className="text-sm text-[#8b949e]">No messages yet. Say hello to your squad! 👋</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const msgDate = formatDate(msg.created_at);
            const showDateHeader = msgDate !== lastDate;
            lastDate = msgDate;
            const isMe = msg.user_id === profile?.id;
            const authorName = msg.profile?.name || (isMe ? profile?.name : 'Squad Member');

            return (
              <React.Fragment key={msg.id || idx}>
                {showDateHeader && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-[#21262d]" />
                    <span className="text-[10px] text-[#6e7681] font-bold uppercase tracking-wider">{msgDate}</span>
                    <div className="flex-1 h-px bg-[#21262d]" />
                  </div>
                )}

                {msg.message_type === 'system' ? (
                  <div className="text-center py-1">
                    <span className="text-[11px] text-indigo-400 italic bg-indigo-500/10 px-3 py-1 rounded-full">
                      {msg.content}
                    </span>
                  </div>
                ) : (
                  <div className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {getInitials(authorName)}
                    </div>
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-bold text-[#8b949e]">{isMe ? 'You' : authorName}</span>
                        <span className="text-[10px] text-[#484f58]">{formatTime(msg.created_at)}</span>
                        {msg.message_type === 'standup' && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">STANDUP</span>
                        )}
                      </div>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-indigo-600/30 border border-indigo-500/30 text-white rounded-tr-md'
                          : 'bg-[#161b22] border border-[#30363d] text-[#e6edf3] rounded-tl-md'
                      } ${getMessageColor(msg.message_type)}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#21262d] bg-[#161b22]/50 flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white placeholder-[#6e7681] focus:outline-none focus:border-indigo-500/50"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
