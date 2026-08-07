import React from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import { useSquadStore } from '../../store/useSquadStore';
import { useAuth } from '../../context/AuthContext';

export default function DMList({ onOpenNewDM }) {
  const { dmThreads, openDM } = useSquadStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-wider">
          Direct Messages
        </h3>
        <button
          onClick={onOpenNewDM}
          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all shadow-sm flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> New Message
        </button>
      </div>

      <div className="space-y-1.5">
        {dmThreads.length === 0 ? (
          <div className="text-center py-6 text-[#6e7681] dark:text-[#6e7681] light:text-slate-500 bg-[#161b22] dark:bg-[#161b22] light:bg-slate-50 border border-[#30363d] dark:border-[#30363d] light:border-slate-200 rounded-xl p-4">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-400" />
            <p className="font-bold text-white dark:text-white light:text-slate-900 text-xs">No messages yet</p>
            <p className="text-[11px] mt-0.5 text-[#8b949e] dark:text-[#8b949e] light:text-slate-500">Start chatting with squad mates</p>
          </div>
        ) : (
          dmThreads.map(thread => {
            const partnerName = thread.partnerName || 'User';
            const partnerInitial = (partnerName[0] || 'U').toUpperCase();

            return (
              <button
                key={thread.id}
                onClick={() => openDM(thread.partnerId)}
                className="w-full p-2.5 bg-[#161b22] dark:bg-[#161b22] light:bg-slate-50 hover:bg-[#21262d] dark:hover:bg-[#21262d] light:hover:bg-slate-100 border border-[#30363d] dark:border-[#30363d] light:border-slate-200 rounded-xl text-left transition-all group flex items-center justify-between gap-2 shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                    {partnerInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-white dark:text-white light:text-slate-900 truncate group-hover:text-emerald-400 transition-colors">
                      {partnerName}
                    </div>
                    <div className="text-[10px] text-[#8b949e] dark:text-[#8b949e] light:text-slate-500 truncate">
                      {thread.lastMessage || 'No messages yet'}
                    </div>
                  </div>
                </div>

                {thread.unreadCount > 0 && (
                  <div className="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0 shadow">
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
