import React from 'react';
import { Crown, Shield, GraduationCap } from 'lucide-react';

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
      className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-[#1A221A] cursor-pointer transition-colors group"
    >
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white text-xs font-bold">
          {initial}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#121215] ${
          isOnline ? 'bg-[#10B981]' : 'bg-[#6B7280]'
        }`} />
      </div>

      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`text-sm truncate ${isCurrentUser ? 'text-white font-medium' : 'text-[#9CA3AF] group-hover:text-white'}`}>
          {member.name}
        </span>
        {isAdmin && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" title="Admin" />}
        {isModerator && <Shield className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" title="Moderator" />}
        {isMentor && <GraduationCap className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" title="Mentor" />}
      </div>
    </div>
  );
}
