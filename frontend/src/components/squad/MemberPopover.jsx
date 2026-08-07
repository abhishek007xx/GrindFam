import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Flame, Trophy, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabase';

export default function MemberPopover({ member, onClose }) {
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
        // Compute streak days from dates
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm bg-[#1a221a] border border-[#3d4a3d] rounded-2xl p-5 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-[#22c55e] flex items-center justify-center text-[#0e150e] text-lg font-bold">
                {initial}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#1a221a] ${
                member.isOnline ? 'bg-[#22c55e]' : 'bg-[#869585]'
              }`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#dce5d9] flex items-center gap-1.5">
                {member.name}
                {member.role === 'admin' && <span title="Admin">👑</span>}
              </h3>
              <p className="text-xs text-[#869585]">@{leetcodeUser || 'grinder'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-[#869585] hover:text-[#dce5d9] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#091009] border border-[#3d4a3d] rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
            <div>
              <span className="text-sm font-bold text-[#dce5d9]">{loading ? '...' : stats.solved}</span>
              <p className="text-[10px] text-[#869585] uppercase font-semibold">Solved</p>
            </div>
          </div>
          <div className="p-3 bg-[#091009] border border-[#3d4a3d] rounded-xl flex items-center gap-3">
            <Flame className="w-5 h-5 text-[#ff8b7c]" />
            <div>
              <span className="text-sm font-bold text-[#dce5d9]">{loading ? '...' : `${stats.streak}d`}</span>
              <p className="text-[10px] text-[#869585] uppercase font-semibold">Streak</p>
            </div>
          </div>
        </div>

        {/* LeetCode Button */}
        {leetcodeUser && (
          <a
            href={`https://leetcode.com/u/${leetcodeUser}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 bg-[#22c55e] hover:bg-[#1ea34d] text-[#0e150e] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <span>View LeetCode Profile</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
