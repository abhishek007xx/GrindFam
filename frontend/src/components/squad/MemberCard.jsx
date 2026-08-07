import React from 'react';

export default function MemberCard({ member, isCurrentUser, onClick }) {
  const roles = member.roles || [member.role || 'member'];
  const isAdmin = roles.includes('admin');
  const isModerator = roles.includes('moderator');
  const isMentor = roles.includes('mentor');

  const initial = (member.name || 'G')[0].toUpperCase();
  const isOnline = member.isOnline;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-[#1a221a] cursor-pointer transition-colors group"
    >
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-[#0e150e] text-xs font-bold">
          {initial}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#161d16] ${
          isOnline ? 'bg-[#22c55e]' : 'bg-[#869585]'
        }`} />
      </div>

      <div className="flex items-center gap-1 min-w-0">
        <span className={`text-sm truncate ${isCurrentUser ? 'text-white font-medium' : 'text-[#bccbb9] group-hover:text-[#dce5d9]'}`}>
          {member.name}
        </span>
        {isAdmin && <span className="text-[11px] flex-shrink-0" title="Admin">👑</span>}
        {isModerator && <span className="text-[11px] flex-shrink-0" title="Moderator">🛡️</span>}
        {isMentor && <span className="text-[11px] flex-shrink-0" title="Mentor">🎓</span>}
      </div>
    </div>
  );
}
