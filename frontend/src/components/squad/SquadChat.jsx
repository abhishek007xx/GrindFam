import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Plus, Smile, Send, Hash, Copy, Reply, Trash2, Loader2, AlertCircle } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export default function SquadChat() {
  const { session } = useAuth();
  const {
    activeSquad, messages, sendMessage, deleteMessage, sendTypingEvent, addReaction,
    typingUsers, activeChannel, fetchSquadData, subscribeRealtime, unsubscribeRealtime
  } = useSquadStore();

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [errorToast, setErrorToast] = useState(null);
  const [showEmojiPickerForMsg, setShowEmojiPickerForMsg] = useState(null);

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

  const handleToggleReaction = async (msgId, emoji) => {
    try {
      await addReaction(msgId, emoji);
      setShowEmojiPickerForMsg(null);
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
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
    <div className="flex flex-col h-full bg-[#141414] dark:bg-[#141414] light:bg-slate-50 relative">
      {/* Toast Notification */}
      {errorToast && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Message Feed */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-[#333333]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center pt-20">
            <div className="w-14 h-14 rounded-2xl bg-[#EA5D3A]/20 border border-[#EA5D3A]/40 flex items-center justify-center mb-4 text-[#EA5D3A]">
              <Hash className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[#F4F4F5] dark:text-[#F4F4F5] light:text-slate-900 mb-2">Welcome to #{channelName}!</h3>
            <p className="text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500 text-xs max-w-md">
              This is the start of the #{channelName} channel. Start the conversation with your community!
            </p>
          </div>
        ) : (
          groupedMessages.map((group, gIdx) => (
            <div key={gIdx} className="group relative flex gap-3 py-2 px-3 -mx-2 hover:bg-[#1E1E1E]/70 dark:hover:bg-[#1E1E1E]/70 light:hover:bg-slate-100/80 rounded-xl transition-colors mt-2">
              <div className="flex-shrink-0 w-9 pt-0.5">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: getAvatarColor(group.author_name) }}>
                  {getInitial(group.author_name)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-[#F4F4F5] dark:text-[#F4F4F5] light:text-slate-900 hover:underline cursor-pointer">
                    {group.author_name}
                  </span>
                  <span className="text-[11px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500 font-medium">
                    {formatTime(group.messages[0]?.created_at)}
                  </span>
                </div>

                <div className="space-y-1">
                  {group.messages.map((msg) => {
                    const isAuthor = msg.user_id === session?.user?.id;
                    const canDeleteThis = canDeleteAnyMessage || isAuthor;

                    return (
                      <div key={msg.id || msg.created_at} className="relative group/msg">
                        <div className="text-sm text-[#F4F4F5] dark:text-[#F4F4F5] light:text-slate-900 leading-relaxed break-words whitespace-pre-wrap flex flex-col">
                          <span>{msg.content}</span>
                          
                          {/* Render Actual Reactions from DB */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(msg.reactions).map(([emoji, users]) => {
                                const hasReacted = users.includes(session?.user?.id);
                                return (
                                  <button
                                    key={emoji}
                                    onClick={() => handleToggleReaction(msg.id, emoji)}
                                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                                      hasReacted
                                        ? 'bg-[#EA5D3A]/20 border-[#EA5D3A]/40 text-[#EA5D3A]'
                                        : 'bg-[#262626]/50 border-[#333333] text-[#9CA3AF] hover:text-[#F4F4F5] hover:bg-[#252D3B]'
                                    }`}
                                  >
                                    <span>{emoji}</span>
                                    <span>{users.length}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="opacity-0 group-hover/msg:opacity-100 flex items-center gap-1 absolute right-full top-0 pr-2 transition-opacity">
                          <button
                            onClick={() => setShowEmojiPickerForMsg(showEmojiPickerForMsg === msg.id ? null : msg.id)}
                            className="p-1.5 rounded-lg text-[#6b7280] dark:text-[#6b7280] light:text-slate-400 hover:bg-[#262626] dark:hover:bg-[#262626] light:hover:bg-slate-200 hover:text-[#F4F4F5] transition-colors"
                            title="React"
                          >
                            <Smile className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCopyMessage(msg.content)}
                            className="p-1.5 rounded-lg text-[#6b7280] dark:text-[#6b7280] light:text-slate-400 hover:bg-[#262626] dark:hover:bg-[#262626] light:hover:bg-slate-200 hover:text-[#F4F4F5] transition-colors"
                            title="Copy text"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReplyUser(group.author_name)}
                            className="p-1.5 rounded-lg text-[#6b7280] dark:text-[#6b7280] light:text-slate-400 hover:bg-[#262626] dark:hover:bg-[#262626] light:hover:bg-slate-200 hover:text-[#F4F4F5] transition-colors"
                            title="Reply"
                          >
                            <Reply className="w-3.5 h-3.5" />
                          </button>
                          {(canDeleteAnyMessage || msg.user_id === session?.user?.id) && (
                            <button
                              onClick={() => handleDelete(msg.id)}
                              className="p-1.5 rounded-lg text-[#6b7280] dark:text-[#6b7280] light:text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                              title="Delete message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {showEmojiPickerForMsg === msg.id && (
                          <div className="absolute right-full top-8 z-50">
                            <EmojiPicker
                              theme="dark"
                              onEmojiClick={(emojiData) => handleToggleReaction(msg.id, emojiData.emoji)}
                            />
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
      <div className="px-4 pb-4 pt-2 bg-[#141414] dark:bg-[#141414] light:bg-slate-50 border-t border-[#2C2C2C]/50 dark:border-[#2C2C2C]/50 light:border-slate-200 flex-shrink-0">
        {typingUsers.length > 0 && (
          <div className="text-[11px] text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500 mb-1 h-4 flex items-center gap-1.5 px-1">
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
          <div className="flex items-center bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl focus-within:border-[#EA5D3A] transition-colors shadow-sm">
            <button type="button" className="p-3 text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors flex-shrink-0">
              <Plus className="w-4 h-4" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
              placeholder={`Message #${channelName}`}
              className="flex-1 bg-transparent text-sm text-[#F4F4F5] dark:text-[#F4F4F5] light:text-slate-900 placeholder-[#A3A3A3] dark:placeholder-[#A3A3A3] light:placeholder-slate-400 outline-none py-2.5 px-1"
            />
            <button type="button" className="p-3 text-[#A3A3A3] dark:text-[#A3A3A3] light:text-slate-500 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors flex-shrink-0">
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
