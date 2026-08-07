import React from 'react';

export default function ChannelButton({ icon, label, isActive, onClick, isMuted, unreadCount }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2 py-[6px] rounded-lg text-sm transition-colors duration-100 group ${
        isActive
          ? 'bg-slate-200 dark:bg-[#242c24] text-slate-900 dark:text-[#dce5d9] font-semibold shadow-sm'
          : 'text-slate-600 dark:text-[#bccbb9] hover:bg-slate-100 dark:hover:bg-[#1a221a] hover:text-slate-900 dark:hover:text-[#dce5d9]'
      } ${isMuted ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-slate-500 dark:text-[#869585] group-hover:text-slate-900 dark:group-hover:text-[#dce5d9] text-base flex-shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      {unreadCount > 0 && !isActive && (
        <span className="bg-[#EA5D3A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
