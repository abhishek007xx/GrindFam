import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Plus, Smile, Send, Hash, Copy, Heart, Reply, Trash2, Loader2, AlertCircle } from 'lucide-react';

export default function SquadChat() {
  const { session } = useAuth();
  const {
    activeSquad, messages, sendMessage, deleteMessage, sendTypingEvent,
    typingUsers, activeChannel, fetchSquadData, subscribeRealtime, unsubscribeRealtime
  } = useSquadStore();

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [errorToast, setErrorToast] = useState(null);
  const [reactions, setReactions] = useState({});

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);

  const squadId = activeSquad?.id;
  const currentRolesArray = activeSquad?.roles || [activeSquad?.role || 'member'];
  const canDeleteAnyMessage = currentRolesArray.includes('admin') || currentRolesArray.includes('moderator');

  useEffect(() => {
    if (!squadId) return;
    fetchSquadData(squadId);
    subscribeRealtime(squadId);
    return () => {
      unsubscribeRealtime();
    };
  }, [squadId, fetchSquadData, subscribeRealtime, unsubscribeRealtime]);

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
    setErrorToast(null);
    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send:', err);
      setErrorToast(err.message || 'Message failed to send. Please check your network.');
      setTimeout(() => setErrorToast(null), 4000);
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

  // Group consecutive messages from same user
  const groupedMessages = useMemo(() => {
    const groups = [];
    messages.forEach((msg) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.user_id === msg.user_id) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({
          user_id: msg.user_id,
          author_name: msg.author_name,
          messages: [msg]
        });
      }
    });
    return groups;
  }, [messages]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitial = (name) => (name || 'M')[0].toUpperCase();

  const getAvatarColor = (name) => {
    const colors = ['#22c55e', '#22d3ee', '#ff8b7c', '#a78bfa', '#f472b6', '#fbbf24'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const channelName = activeChannel || 'general';

  return (
    <div className="flex flex-col h-full bg-[#0a0e17] dark:bg-[#0a0e17] light:bg-slate-50 relative">
      {/* Toast Notification */}
      {errorToast && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Message Feed */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-[#30363d]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center pt-20">
            <div className="w-14 h-14 rounded-2xl bg-[#EA5D3A]/20 border border-[#EA5D3A]/40 flex items-center justify-center mb-4 text-[#EA5D3A]">
              <Hash className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#e6edf3] dark:text-[#e6edf3] light:text-slate-900 mb-2">Welcome to #{channelName}!</h3>
            <p className="text-[#8b949e] dark:text-[#8b949e] light:text-slate-500 text-xs max-w-md">
              This is the start of the #{channelName} channel. Start the conversation with your community!
            </p>
          </div>
        ) : (
          groupedMessages.map((group, gIdx) => (
            <div key={gIdx} className="group relative flex gap-3 py-2 px-3 -mx-2 hover:bg-[#161b22]/70 dark:hover:bg-[#161b22]/70 light:hover:bg-slate-100/80 rounded-xl transition-colors mt-2">
              <div className="flex-shrink-0 w-9 pt-0.5">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: getAvatarColor(group.author_name) }}>
                  {getInitial(group.author_name)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-[#e6edf3] dark:text-[#e6edf3] light:text-slate-900 hover:underline cursor-pointer">
                    {group.author_name}
                  </span>
                  <span className="text-[11px] text-[#8b949e] dark:text-[#8b949e] light:text-slate-500 font-medium">
                    {formatTime(group.messages[0]?.created_at)}
                  </span>
                </div>

                <div className="space-y-1">
                  {group.messages.map((msg) => {
                    const isAuthor = msg.user_id === session?.user?.id;
                    const canDeleteThis = canDeleteAnyMessage || isAuthor;
                    const hasHeart = reactions[msg.id];

                    return (
                      <div key={msg.id || msg.created_at} className="relative group/msg">
                        <div className="text-sm text-[#e6edf3] dark:text-[#e6edf3] light:text-slate-900 leading-relaxed break-words whitespace-pre-wrap flex items-center justify-between">
                          <span>{msg.content}</span>
                          
                          <div className="opacity-0 group-hover/msg:opacity-100 flex items-center gap-1 bg-[#161b22] dark:bg-[#161b22] light:bg-white border border-[#30363d] dark:border-[#30363d] light:border-slate-200 rounded-lg px-1.5 py-0.5 shadow transition-opacity">
                            <button onClick={() => handleCopyMessage(msg.content)} className="p-1 text-[#8b949e] dark:text-[#8b949e] light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 rounded" title="Copy">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleToggleHeart(msg.id)} className={`p-1 rounded ${hasHeart ? 'text-[#ff8b7c]' : 'text-[#8b949e] dark:text-[#8b949e] light:text-slate-600 hover:text-white'}`} title="React">
                              <Heart className={`w-3.5 h-3.5 ${hasHeart ? 'fill-current' : ''}`} />
                            </button>
                            <button onClick={() => handleReplyUser(group.author_name)} className="p-1 text-[#8b949e] dark:text-[#8b949e] light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 rounded" title="Reply">
                              <Reply className="w-3.5 h-3.5" />
                            </button>
                            {canDeleteThis && (
                              <button onClick={() => handleDelete(msg.id)} className="p-1 text-red-400 hover:text-red-300 rounded" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {hasHeart && (
                          <div className="inline-flex items-center gap-1 bg-[#161b22] dark:bg-[#161b22] light:bg-slate-100 border border-[#ff8b7c]/40 px-2 py-0.5 rounded-full text-xs text-[#ff8b7c] mt-1">
                            ❤️ 1
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="px-4 pb-4 pt-2 bg-[#0a0e17] dark:bg-[#0a0e17] light:bg-slate-50 border-t border-[#21262d]/50 dark:border-[#21262d]/50 light:border-slate-200 flex-shrink-0">
        {typingUsers.length > 0 && (
          <div className="text-[11px] text-[#8b949e] dark:text-[#8b949e] light:text-slate-500 mb-1 h-4 flex items-center gap-1.5 px-1">
            <span className="inline-flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-[#EA5D3A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-[#EA5D3A] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="w-1.5 h-1.5 bg-[#EA5D3A] rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </span>
            <span className="font-semibold text-white dark:text-white light:text-slate-900">{typingUsers.join(', ')}</span>
            <span>{typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
        <form onSubmit={handleSend} className="relative">
          <div className="flex items-center bg-[#161b22] dark:bg-[#161b22] light:bg-white border border-[#30363d] dark:border-[#30363d] light:border-slate-200 rounded-xl focus-within:border-[#EA5D3A] transition-colors shadow-sm">
            <button type="button" className="p-3 text-[#8b949e] dark:text-[#8b949e] light:text-slate-500 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors flex-shrink-0">
              <Plus className="w-4 h-4" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
              placeholder={`Message #${channelName}`}
              className="flex-1 bg-transparent text-sm text-[#e6edf3] dark:text-[#e6edf3] light:text-slate-900 placeholder-[#8b949e] dark:placeholder-[#8b949e] light:placeholder-slate-400 outline-none py-2.5 px-1"
            />
            <button type="button" className="p-3 text-[#8b949e] dark:text-[#8b949e] light:text-slate-500 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors flex-shrink-0">
              <Smile className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-3 text-[#EA5D3A] hover:text-[#F2704E] disabled:opacity-30 transition-colors flex-shrink-0"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
