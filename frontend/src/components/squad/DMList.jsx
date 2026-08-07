import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { useSquadStore } from '../../store/useSquadStore';

export default function DMList({ onOpenNewDM }) {
  const { dmThreads, activeDM, openDM } = useSquadStore();

  const getInitial = (name) => (name || 'G')[0].toUpperCase();

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between px-1 mb-1 group">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#869585]">
          DIRECT MESSAGES
        </span>
        <button
          onClick={onOpenNewDM}
          className="p-1 text-[#869585] hover:text-[#dce5d9] rounded hover:bg-[#1a221a] transition-colors"
          title="New Direct Message"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {dmThreads.length === 0 ? (
        <p className="text-[11px] text-[#869585] px-2 italic py-1">No direct messages yet</p>
      ) : (
        <div className="space-y-0.5">
          {dmThreads.map((thread) => {
            const isActive = activeDM?.id === thread.id;
            return (
              <button
                key={thread.id}
                onClick={() => openDM(thread.partnerId)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-all text-left ${
                  isActive
                    ? 'bg-[#242c24] text-white font-semibold'
                    : 'text-[#bccbb9] hover:bg-[#1a221a] hover:text-[#dce5d9]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#22c55e] flex items-center justify-center text-[#0e150e] text-[10px] font-bold flex-shrink-0">
                    {getInitial(thread.partnerName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs truncate font-medium">{thread.partnerName}</p>
                    <p className="text-[10px] text-[#869585] truncate leading-none mt-0.5">{thread.lastMessage}</p>
                  </div>
                </div>

                {thread.unreadCount > 0 && !isActive && (
                  <span className="bg-[#22c55e] text-[#0e150e] text-[10px] font-bold px-1.5 py-0.2 rounded-full flex-shrink-0">
                    {thread.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
