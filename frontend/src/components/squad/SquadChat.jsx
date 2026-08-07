import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Plus, Smile, Send, Hash, Copy, Heart, Reply, Trash2 } from 'lucide-react';

export default function SquadChat() {
  const { session } = useAuth();
  const { messages, sendMessage, deleteMessage, sendTypingEvent, typingUsers, activeChannel, activeSquad } = useSquadStore();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [reactions, setReactions] = useState({});
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);

  const currentUserRole = activeSquad?.role || 'member';
  const currentRolesArray = activeSquad?.roles || [currentUserRole];
  const canDeleteAnyMessage = currentRolesArray.includes('admin') || currentRolesArray.includes('moderator');

  const scrollToBottomIfNear = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottomIfNear();
  }, [messages, scrollToBottomIfNear]);

  const handleTyping = useCallback(() => {
    if (typingTimeout.current) return;
    sendTypingEvent();
    typingTimeout.current = setTimeout(() => {
      typingTimeout.current = null;
    }, 2000);
  }, [sendTypingEvent]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (msgId) => {
    try {
      await deleteMessage(msgId);
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleToggleHeart = (msgId) => {
    setReactions(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleReplyUser = (authorName) => {
    setNewMessage(prev => `@${authorName} ${prev}`);
    inputRef.current?.focus();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today at ${time}`;
    return `${d.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: '2-digit' })} ${time}`;
  };

  const formatDateSeparator = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getInitial = (name) => (name || 'M')[0].toUpperCase();

  const getAvatarColor = (name) => {
    const colors = ['#22c55e', '#22d3ee', '#ff8b7c', '#a78bfa', '#f472b6', '#fbbf24'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const shouldShowHeader = (msg, idx) => {
    if (idx === 0) return true;
    const prev = messages[idx - 1];
    if (prev.user_id !== msg.user_id) return true;
    const prevTime = new Date(prev.created_at);
    const currTime = new Date(msg.created_at);
    return (currTime - prevTime) > 5 * 60 * 1000;
  };

  const shouldShowDateSeparator = (msg, idx) => {
    if (idx === 0) return true;
    const prev = messages[idx - 1];
    const prevDate = new Date(prev.created_at).toDateString();
    const currDate = new Date(msg.created_at).toDateString();
    return prevDate !== currDate;
  };

  const channelName = activeChannel || 'general';

  return (
    <div className="flex flex-col h-full bg-[#111315]">
      {/* Message Feed */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-[#30363d]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center pt-20">
            <div className="w-16 h-16 rounded-2xl bg-[#22c55e] flex items-center justify-center mb-4 text-[#0e150e]">
              <Hash className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#dce5d9] mb-2">Welcome to #{channelName}!</h3>
            <p className="text-[#869585] text-sm max-w-md">
              This is the start of the #{channelName} channel. Start the conversation with your community!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const showDate = shouldShowDateSeparator(msg, idx);
            const showHeader = shouldShowHeader(msg, idx);
            const isSystem = msg.message_type === 'system';
            const msgId = msg.id || idx;
            const hasHeart = reactions[msgId];
            const isAuthor = msg.user_id === session?.user?.id;
            const canDeleteThis = canDeleteAnyMessage || isAuthor;

            return (
              <React.Fragment key={msgId}>
                {showDate && (
                  <div className="flex items-center gap-2 my-4">
                    <div className="flex-1 h-px bg-[#30363d]" />
                    <span className="text-[11px] font-semibold text-[#869585] px-1">
                      {formatDateSeparator(msg.created_at)}
                    </span>
                    <div className="flex-1 h-px bg-[#30363d]" />
                  </div>
                )}

                {isSystem ? (
                  <div className="flex items-center gap-2 py-1 px-4 my-1">
                    <span className="text-xs text-[#22c55e] bg-[#22c55e]/10 px-3 py-1 rounded-full border border-[#22c55e]/20 font-semibold">
                      {msg.content}
                    </span>
                  </div>
                ) : (
                  <div className={`group relative flex gap-4 py-1 px-4 -mx-4 hover:bg-[#1a1d21] rounded-lg transition-colors ${showHeader ? 'mt-3' : ''}`}>
                    {/* Hover toolbar */}
                    <div className="absolute right-4 -top-3 hidden group-hover:flex items-center gap-1 bg-[#23272b] border border-[#30363d] rounded-lg px-1.5 py-1 shadow-lg z-10">
                      <button onClick={() => handleCopyMessage(msg.content)} className="p-1 text-[#869585] hover:text-white rounded" title="Copy Text">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleToggleHeart(msgId)} className={`p-1 rounded ${hasHeart ? 'text-[#ff8b7c]' : 'text-[#869585] hover:text-white'}`} title="React">
                        <Heart className={`w-3.5 h-3.5 ${hasHeart ? 'fill-current' : ''}`} />
                      </button>
                      <button onClick={() => handleReplyUser(msg.author_name)} className="p-1 text-[#869585] hover:text-white rounded" title="Reply">
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                      {canDeleteThis && (
                        <button onClick={() => handleDelete(msg.id)} className="p-1 text-red-400 hover:text-red-300 rounded" title="Delete Message">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {showHeader ? (
                      <div className="flex-shrink-0 w-10 pt-0.5">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#0e150e] text-sm font-bold shadow"
                          style={{ backgroundColor: getAvatarColor(msg.author_name) }}>
                          {getInitial(msg.author_name)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-10 flex items-center justify-center">
                        <span className="text-[10px] text-[#869585] opacity-0 group-hover:opacity-100 transition-opacity">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {showHeader && (
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[15px] font-semibold text-[#dce5d9] hover:underline cursor-pointer">
                            {msg.author_name}
                          </span>
                          <span className="text-[11px] text-[#869585]">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div className="text-[15px] text-[#dce5d9] leading-relaxed break-words whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      {hasHeart && (
                        <div className="inline-flex items-center gap-1 bg-[#23272b] border border-[#ff8b7c]/40 px-2 py-0.5 rounded-full text-xs text-[#ff8b7c] mt-1">
                          ❤️ 1
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="px-4 pb-6 pt-0 flex-shrink-0">
        {typingUsers.length > 0 && (
          <div className="text-[11px] text-[#869585] mb-1 h-4 flex items-center gap-1.5 px-1">
            <span className="inline-flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </span>
            <span className="font-semibold text-white">{typingUsers.join(', ')}</span>
            <span>{typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
        <form onSubmit={handleSend} className="relative">
          <div className="flex items-center bg-[#23272b] border border-[#30363d] rounded-xl focus-within:border-[#22d3ee] transition-colors">
            <button type="button" className="p-3 text-[#869585] hover:text-white transition-colors flex-shrink-0">
              <Plus className="w-5 h-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
              placeholder={`Message #${channelName}`}
              className="flex-1 bg-transparent text-[15px] text-[#dce5d9] placeholder-[#869585] outline-none py-2.5"
            />
            <button type="button" className="p-3 text-[#869585] hover:text-white transition-colors flex-shrink-0">
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-3 text-[#22c55e] hover:text-[#4be277] disabled:opacity-30 transition-colors flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
