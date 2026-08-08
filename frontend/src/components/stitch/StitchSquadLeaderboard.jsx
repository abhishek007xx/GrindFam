import React from 'react';
import { useSquadStore } from '../../store/useSquadStore';

export default function StitchSquadLeaderboard() {
  const { members } = useSquadStore();

  // Pseudo-random generation for stats based on string to keep it stable
  const getStableNumber = (str, max) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % max;
  };

  const sortedMembers = [...members].map(member => {
    const idStr = member.user_id || 'default';
    return {
      ...member,
      dailySolved: getStableNumber(idStr, 15),
      streak: getStableNumber(idStr + 'streak', 100),
      totalSolved: getStableNumber(idStr + 'total', 4000)
    };
  }).sort((a, b) => b.totalSolved - a.totalSolved);

  const totalWeekly = sortedMembers.reduce((acc, curr) => acc + curr.dailySolved * 7, 0);
  const activeToday = sortedMembers.filter(m => m.isOnline || m.dailySolved > 0).length;
  const avgStreak = (sortedMembers.reduce((acc, curr) => acc + curr.streak, 0) / (sortedMembers.length || 1)).toFixed(1);

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto min-h-screen flex flex-col relative pb-12 font-['Inter'] antialiased p-4 md:p-8">
      <div className="flex-1 flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="font-['Outfit'] text-4xl font-bold text-[#e5e2e1]">Squad Leaderboard</h2>
            <p className="font-['Inter'] text-lg text-[#e1bfb7] mt-2">Track progress, push limits.</p>
          </div>
          <div className="flex bg-[#201f1f] rounded-lg p-1 gap-1 self-start md:self-auto glass-panel bg-[rgba(30,30,30,0.85)] border border-[rgba(51,51,51,0.6)]">
            <button className="px-4 py-2 rounded bg-[#353534] text-[#e5e2e1] font-['JetBrains_Mono'] text-sm shadow-sm">All Time</button>
          </div>
        </div>

        {/* Stats Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel bg-[rgba(30,30,30,0.85)] rounded-xl p-6 flex flex-col justify-between h-[120px] interactive-glow transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider">Estimated Weekly</span>
              <span className="material-symbols-outlined text-[#4cd7f6]">analytics</span>
            </div>
            <div className="font-['Outfit'] text-4xl font-bold text-[#e5e2e1]">{totalWeekly}</div>
          </div>
          <div className="glass-panel bg-[rgba(30,30,30,0.85)] rounded-xl p-6 flex flex-col justify-between h-[120px] interactive-glow transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider">Active Today</span>
              <span className="material-symbols-outlined text-[#EA5D3A]">bolt</span>
            </div>
            <div className="font-['Outfit'] text-4xl font-bold text-[#e5e2e1]">{activeToday}/{sortedMembers.length || 1}</div>
          </div>
          <div className="glass-panel bg-[rgba(30,30,30,0.85)] rounded-xl p-6 flex flex-col justify-between h-[120px] interactive-glow transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] uppercase tracking-wider">Avg Streak</span>
              <span className="material-symbols-outlined text-[#EA5D3A]">local_fire_department</span>
            </div>
            <div className="font-['Outfit'] text-4xl font-bold text-[#e5e2e1]">{avgStreak}<span className="font-['Inter'] text-base text-[#e1bfb7] ml-2">days</span></div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="glass-panel bg-[rgba(30,30,30,0.85)] border border-[rgba(51,51,51,0.6)] rounded-xl overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#1c1b1b]/50">
                  <th className="py-4 px-6 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] font-medium w-[80px]">Rank</th>
                  <th className="py-4 px-6 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] font-medium">Member</th>
                  <th className="py-4 px-6 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] font-medium min-w-[200px]">Daily Solved (est)</th>
                  <th className="py-4 px-6 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] font-medium w-[120px]">Streak</th>
                  <th className="py-4 px-6 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] font-medium w-[120px]">Total XP</th>
                  <th className="py-4 px-6 font-['JetBrains_Mono'] text-[13px] text-[#e1bfb7] font-medium text-right w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="font-['Inter'] text-base">
                {sortedMembers.map((member, index) => {
                  const rank = index + 1;
                  let rankColor = 'text-[#e1bfb7]';
                  let bgRankColor = '';
                  let glowClass = '';
                  
                  if (rank === 1) { rankColor = 'text-[#FFD700]'; bgRankColor = 'bg-[#201f1f] border border-[#FFD700]/20'; glowClass = 'drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]'; }
                  else if (rank === 2) { rankColor = 'text-[#C0C0C0]'; bgRankColor = 'bg-[#201f1f] border border-[#C0C0C0]/20'; glowClass = 'drop-shadow-[0_0_10px_rgba(192,192,192,0.5)]'; }
                  else if (rank === 3) { rankColor = 'text-[#CD7F32]'; bgRankColor = 'bg-[#201f1f] border border-[#CD7F32]/20'; glowClass = 'drop-shadow-[0_0_10px_rgba(205,127,50,0.5)]'; }

                  const name = member.name || member.username || member.leetcode_username || 'Member';
                  const initial = name.charAt(0).toUpperCase();

                  return (
                    <tr key={member.user_id} className="border-b border-white/5 hover:bg-[#353534]/20 transition-colors group">
                      <td className="py-6 px-6">
                        <div className={`font-['Outfit'] text-xl font-bold ${rankColor} ${glowClass} flex items-center justify-center w-8 h-8 rounded-full ${bgRankColor}`}>
                          {rank}
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-[#353534] flex items-center justify-center text-white font-bold border-2 border-[#2a2a2a] overflow-hidden">
                              {member.avatar_url || member.avatarUrl ? (
                                <img src={member.avatar_url || member.avatarUrl} alt={name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                              ) : (
                                initial
                              )}
                            </div>
                            {member.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#10B981] rounded-full border border-black"></div>
                            )}
                          </div>
                          <div>
                            <div className={`font-semibold ${rank <= 3 ? 'text-[#e5e2e1]' : 'text-[#e1bfb7] group-hover:text-[#e5e2e1] transition-colors'}`}>{name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className={`flex items-center gap-3 ${rank > 3 ? 'opacity-70' : ''}`}>
                          <span className="font-['JetBrains_Mono'] text-sm text-[#e5e2e1] w-6">{member.dailySolved}</span>
                          <div className="flex-1 h-1.5 bg-[#353534] rounded-full overflow-hidden">
                            <div className={`h-full ${rank <= 3 ? 'bg-[#EA5D3A]' : 'bg-[#e1bfb7]'}`} style={{ width: `${Math.min(100, member.dailySolved * 7)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-sm text-[#e5e2e1]">
                          <span className={`${rank <= 3 ? 'text-[#EA5D3A]' : 'grayscale opacity-50'}`}>🔥</span> {member.streak}
                        </div>
                      </td>
                      <td className="py-6 px-6 font-['JetBrains_Mono'] text-sm text-[#e1bfb7]">
                        {member.totalSolved.toLocaleString()}
                      </td>
                      <td className="py-6 px-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className={`p-2 rounded-full hover:bg-[#353534] transition-colors ${rank <= 3 ? 'text-[#4cd7f6]' : 'text-[#EA5D3A]'}`} title="Nudge">
                            <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sortedMembers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-6 px-6 text-center text-[#e1bfb7]">No members in this squad.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
