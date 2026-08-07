import React from 'react';

export default function ChannelButton({ icon, label, isActive, onClick, isMuted, unreadCount }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2 py-[6px] rounded text-[15px] transition-colors duration-100 group ${
        isActive
          ? 'bg-[#242c24] text-[#dce5d9] font-medium'
          : 'text-[#bccbb9] hover:bg-[#1a221a] hover:text-[#dce5d9]'
      } ${isMuted ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[#869585] group-hover:text-[#dce5d9] text-lg flex-shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      {unreadCount > 0 && !isActive && (
        <span className="bg-[#22c55e] text-[#0e150e] text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
