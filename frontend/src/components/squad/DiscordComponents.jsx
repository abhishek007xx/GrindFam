import React from 'react';

export function SquadIcon({ squad, isActive, onClick }) {
  const letter = (squad?.name || 'S')[0].toUpperCase();
  return (
    <div className="relative group flex items-center justify-center mb-2">
      <div className="absolute left-0 w-1 rounded-r-full bg-white transition-all duration-200"
        style={{ height: isActive ? '40px' : '0px', opacity: isActive ? 1 : 0 }} />
      <button
        onClick={onClick}
        className={`w-12 h-12 flex items-center justify-center text-base font-bold transition-all duration-300 ${
          isActive
            ? 'rounded-2xl bg-[#5865f2] text-white'
            : 'rounded-[24px] bg-[#36393f] text-[#dcddde] hover:rounded-2xl hover:bg-[#5865f2] hover:text-white'
        }`}
      >
        {letter}
      </button>
      <div className="absolute left-16 bg-[#18191c] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
        {squad?.name}
        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#18191c] rotate-45" />
      </div>
    </div>
  );
}

export function ChannelButton({ icon, label, isActive, onClick, isMuted }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-1.5 px-2 py-[6px] rounded text-[15px] transition-colors duration-100 group ${
        isActive
          ? 'bg-[#42464d] text-white font-medium'
          : 'text-[#96989d] hover:bg-[#36393f] hover:text-[#dcddde]'
      } ${isMuted ? 'opacity-50' : ''}`}
    >
      <span className="text-[#96989d] group-hover:text-[#dcddde] text-lg flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

export function MemberCard({ member, isCurrentUser }) {
  const isAdmin = member.role === 'admin';
  const initial = (member.name || 'G')[0].toUpperCase();

  return (
    <div className={`flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#36393f] cursor-pointer transition-colors group ${
      isCurrentUser ? '' : ''
    }`}>
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-xs font-bold">
          {initial}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#2f3136] bg-[#3ba55d]" />
      </div>
      <div className="flex items-center gap-1 min-w-0">
        <span className={`text-sm truncate ${isCurrentUser ? 'text-white font-medium' : 'text-[#96989d] group-hover:text-[#dcddde]'}`}>
          {member.name}
        </span>
        {isAdmin && (
          <span className="text-[10px] flex-shrink-0" title="Admin">👑</span>
        )}
      </div>
    </div>
  );
}
