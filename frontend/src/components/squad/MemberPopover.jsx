import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Flame, CheckCircle2, MessageSquare, Crown, Shield, GraduationCap } from 'lucide-react';
import { supabase } from '../../supabase';
import { useSquadStore } from '../../store/useSquadStore';

export default function MemberPopover({ member, onClose }) {
  const { openDM } = useSquadStore();
  const [stats, setStats] = useState({ solved: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!member?.user_id) return;
    const fetchMemberStats = async () => {
      setLoading(true);
      try {
        const { data: progress } = await supabase
          .from('user_progress')
          .select('solved_at, status')
          .eq('user_id', member.user_id)
          .eq('status', 'solved');

        const solved = (progress || []).length;
        const dates = [...new Set((progress || []).map(p => p.solved_at ? p.solved_at.split('T')[0] : null).filter(Boolean))].sort();
        let streak = 0;
        if (dates.length > 0) {
          streak = 1;
          for (let i = dates.length - 1; i > 0; i--) {
            const curr = new Date(dates[i]);
            const prev = new Date(dates[i - 1]);
            const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) streak++;
            else break;
          }
        }
        setStats({ solved, streak });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemberStats();
  }, [member]);

  if (!member) return null;

  const leetcodeUser = member.leetcode_username || member.username || '';
  const initial = (member.name || 'G')[0].toUpperCase();
  const roles = member.roles || [member.role || 'member'];

  const handleMessage = () => {
    openDM(member.user_id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm bg-[#1E1E1E] border border-[#333333] rounded-2xl p-5 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-[#EA5D3A] flex items-center justify-center text-white text-lg font-bold">
                {initial}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#1E1E1E] ${
                member.isOnline ? 'bg-emerald-400' : 'bg-zinc-600'
              }`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F4F4F5] flex items-center gap-1.5">
                {member.name}
                {roles.includes('admin') && <Crown className="w-4 h-4 text-amber-400" title="Admin" />}
                {roles.includes('moderator') && <Shield className="w-4 h-4 text-blue-400" title="Moderator" />}
                {roles.includes('mentor') && <GraduationCap className="w-4 h-4 text-purple-400" title="Mentor" />}
              </h3>
              <p className="text-xs text-zinc-400">@{leetcodeUser || 'grinder'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#141414] border border-[#333333] rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#EA5D3A]" />
            <div>
              <span className="text-sm font-bold text-white">{loading ? '...' : stats.solved}</span>
              <p className="text-[10px] text-zinc-400 uppercase font-semibold">Solved</p>
            </div>
          </div>
          <div className="p-3 bg-[#141414] border border-[#333333] rounded-xl flex items-center gap-3">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-sm font-bold text-white">{loading ? '...' : `${stats.streak}d`}</span>
              <p className="text-[10px] text-zinc-400 uppercase font-semibold">Streak</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleMessage}
            className="flex-1 py-2.5 bg-[#EA5D3A] hover:bg-[#f2704e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Message</span>
          </button>
          {leetcodeUser && (
            <a
              href={`https://leetcode.com/u/${leetcodeUser}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 bg-[#262626] hover:bg-[#333333] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all border border-[#333333]"
            >
              <span>LeetCode</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
