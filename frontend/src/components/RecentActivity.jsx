import React from 'react';

const avatarColors = [
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
  'from-rose-500 to-red-600',
];
const getAvatarGradient = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};
const getInitials = (name = '') => {
  if (!name) return 'G';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const RecentActivity = ({ leaderboard = [] }) => {
  // Real activity strictly built from live leaderboard: only show users who solved >= 1 problem today
  const activities = leaderboard
    .filter((u) => u.todayCount > 0 && !u.error)
    .map((user) => ({
      name: user.name,
      initials: getInitials(user.name),
      gradient: getAvatarGradient(user.name || user.id),
      count: user.todayCount,
      text: `Solved ${user.todayCount} problem${user.todayCount > 1 ? 's' : ''} today`
    }));

  return (
    <div className="dash-card p-5 h-full" id="activity-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Recent Activity</h3>
        {activities.length > 0 && (
          <span className="text-[11px] font-semibold text-[#CC785C] hover:underline cursor-pointer">View all</span>
        )}
      </div>

      {/* Activity Feed */}
      <div className="space-y-3.5">
        {activities.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-2xl mb-2">😴</p>
            <p className="text-xs text-[#6e7681] font-medium">No one has solved anything today yet</p>
            <p className="text-[10px] text-[#484f58] mt-1">Be the first to start grinding!</p>
          </div>
        ) : (
          activities.map((act, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${act.gradient} flex items-center justify-center text-white font-bold text-[10px] border border-white/15 flex-shrink-0 mt-0.5`}>
                {act.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#e6edf3]">{act.name}</p>
                <p className="text-[11px] text-[#8b949e] truncate">{act.text}</p>
              </div>
              <span className="text-[10px] text-[#6e7681] flex-shrink-0 mt-0.5">Today</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
