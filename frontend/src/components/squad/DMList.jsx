import React from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import { useSquadStore } from '../../store/useSquadStore';
import { useAuth } from '../../context/AuthContext';

export default function DMList({ onOpenNewDM }) {
  const { dmThreads, openDM } = useSquadStore();
  const { session } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Direct Messages</h3>
        <button
          onClick={onOpenNewDM}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition-all shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" /> New Message
        </button>
      </div>

      <div className="space-y-2">
        {dmThreads.length === 0 ? (
          <div className="text-center py-8 text-[#6e7681] bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50 text-emerald-400" />
            <p className="font-bold text-white">No conversations yet</p>
            <p className="text-sm mt-1 text-[#8b949e]">Start chatting with a community member</p>
          </div>
        ) : (
          dmThreads.map(thread => {
            const partnerName = thread.partnerName || 'User';
            const partnerInitial = (partnerName[0] || 'U').toUpperCase();

            return (
              <button
                key={thread.id}
                onClick={() => openDM(thread.partnerId)}
                className="w-full p-3.5 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-xl text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                    {partnerInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                      {partnerName}
                    </div>
                    <div className="text-xs text-[#8b949e] truncate">
                      {thread.lastMessage || 'No messages yet'}
                    </div>
                  </div>
                </div>

                {thread.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0 shadow">
                    {thread.unreadCount}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
