import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Plus, Smile, Send, Hash } from 'lucide-react';

export default function SquadChat() {
  const { session } = useAuth();
  const { messages, sendMessage, sendTypingEvent, typingUsers, activeChannel } = useSquadStore();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    const colors = ['#5865f2', '#3ba55d', '#faa61a', '#ed4245', '#9b59b6', '#e91e63', '#1abc9c'];
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-[#202225] scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center pt-20">
            <div className="w-16 h-16 rounded-full bg-[#5865f2] flex items-center justify-center mb-4">
              <Hash className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Welcome to #{channelName}!</h3>
            <p className="text-[#96989d] text-sm max-w-md">
              This is the start of the #{channelName} channel. Send a message to kick things off!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const showDate = shouldShowDateSeparator(msg, idx);
            const showHeader = shouldShowHeader(msg, idx);
            const isSystem = msg.message_type === 'system';

            return (
              <React.Fragment key={msg.id || idx}>
                {showDate && (
                  <div className="flex items-center gap-2 my-4">
                    <div className="flex-1 h-px bg-[#42464d]" />
                    <span className="text-[11px] font-semibold text-[#96989d] px-1">
                      {formatDateSeparator(msg.created_at)}
                    </span>
                    <div className="flex-1 h-px bg-[#42464d]" />
                  </div>
                )}

                {isSystem ? (
                  <div className="flex items-center gap-2 py-1 px-4">
                    <span className="text-sm text-[#96989d] italic">{msg.content}</span>
                  </div>
                ) : (
                  <div className={`group relative flex gap-4 py-0.5 px-4 -mx-4 hover:bg-[#32353b] ${showHeader ? 'mt-4' : ''}`}>
                    {showHeader ? (
                      <div className="flex-shrink-0 w-10 pt-0.5">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: getAvatarColor(msg.author_name) }}>
                          {getInitial(msg.author_name)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-10 flex items-center justify-center">
                        <span className="text-[10px] text-[#72767d] opacity-0 group-hover:opacity-100 transition-opacity">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {showHeader && (
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[15px] font-medium text-white hover:underline cursor-pointer">
                            {msg.author_name}
                          </span>
                          <span className="text-[11px] text-[#72767d]">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div className="text-[15px] text-[#dcddde] leading-[1.375rem] break-words whitespace-pre-wrap">
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

      <div className="px-4 pb-6 pt-0 flex-shrink-0">
        {typingUsers.length > 0 && (
          <div className="text-[11px] text-[#96989d] mb-1 h-4 flex items-center gap-1.5 px-1">
            <span className="inline-flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </span>
            <span className="font-semibold text-white">{typingUsers.join(', ')}</span>
            <span>{typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
        <form onSubmit={handleSend} className="relative">
          <div className="flex items-center bg-[#40444b] rounded-lg">
            <button type="button" className="p-3 text-[#b9bbbe] hover:text-[#dcddde] transition-colors flex-shrink-0">
              <Plus className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
              placeholder={`Message #${channelName}`}
              className="flex-1 bg-transparent text-[15px] text-[#dcddde] placeholder-[#72767d] outline-none py-2.5"
            />
            <button type="button" className="p-3 text-[#b9bbbe] hover:text-[#dcddde] transition-colors flex-shrink-0">
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-3 text-[#b9bbbe] hover:text-[#dcddde] disabled:opacity-30 transition-colors flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
