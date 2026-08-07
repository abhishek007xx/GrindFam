import React from 'react';
import { Rocket } from 'lucide-react';

const ProgressChart = ({ yourTodayCount = 0, dailyTarget = 5, weeklyData = [] }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = new Date().getDay() - 1;
  const adjustedTodayIndex = todayIndex < 0 ? 6 : todayIndex;

  // Use real weeklyData if provided, otherwise fallback to today's count
  const weekData = (Array.isArray(weeklyData) && weeklyData.length === 7)
    ? weeklyData
    : days.map((_, i) => (i === adjustedTodayIndex ? yourTodayCount : 0));
  const maxVal = Math.max(...weekData, dailyTarget, 1);

  const solved = yourTodayCount;
  const remaining = Math.max(0, dailyTarget - yourTodayCount);
  const donutPercent = dailyTarget > 0 ? Math.min(100, Math.round((solved / dailyTarget) * 100)) : 0;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - donutPercent / 100);

  return (
    <div className="dash-card overflow-hidden">
      <div className="px-5 py-4 border-b border-[#21262d]">
        <h3 className="text-sm font-bold text-white">Your Progress This Week</h3>
      </div>

      <div className="p-5 flex flex-col sm:flex-row gap-6">
        {/* Bar Chart Area */}
        <div className="flex-1 min-w-0">
          <div className="relative h-36">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-5 flex flex-col justify-between text-[10px] text-[#6e7681] font-medium w-8">
              <span>{maxVal}</span><span>{Math.round(maxVal / 2)}</span><span>0</span>
            </div>
            {/* Chart Area */}
            <div className="ml-10 h-full flex items-end justify-between gap-1.5">
              {days.map((day, i) => {
                const val = weekData[i];
                const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
                const isToday = i === adjustedTodayIndex;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-bold text-[#8b949e]">{val}</span>
                    <div className="w-full flex items-end relative" style={{ height: '75%' }}>
                      <div
                        className="w-full rounded-t-md transition-all duration-500"
                        style={{
                          height: val > 0 ? `${Math.max(height, 8)}%` : '3px',
                          background: val > 0
                            ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                            : '#21262d',
                          opacity: isToday ? 1 : 0.4
                        }}
                      ></div>
                      {val > 0 && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-[#161b22]"
                          style={{ bottom: `${height}%`, transform: 'translate(-50%, 50%)' }}
                        ></div>
                      )}
                    </div>
                    <span className={`text-[10px] ${isToday ? 'text-[#22c55e] font-bold' : 'text-[#6e7681]'}`}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Donut + Stats */}
        <div className="flex flex-row sm:flex-col items-center justify-center gap-4 sm:gap-3 sm:w-40 flex-shrink-0">
          {/* Donut */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#21262d" strokeWidth="8" />
              <circle
                cx="50" cy="50" r={radius}
                fill="none" stroke="#22c55e" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl sm:text-2xl font-black text-white leading-tight">{solved}</span>
              <span className="text-[10px] text-[#8b949e] font-medium">Today</span>
            </div>
          </div>
          {/* Legend */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] flex-shrink-0"></span>
              <span className="text-[#e6edf3] font-medium">{solved} Solved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#21262d] flex-shrink-0"></span>
              <span className="text-[#8b949e] font-medium">{remaining} Remaining</span>
            </div>
            <p className="text-[10px] text-[#6e7681] pt-1">Daily Target: {dailyTarget}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Motivational Card
export const MotivationalCard = ({ yourTodayCount = 0, dailyTarget = 5 }) => {
  let msg = 'Start solving to light up the board!';
  if (yourTodayCount > 0 && yourTodayCount < dailyTarget) {
    msg = `${dailyTarget - yourTodayCount} more to hit today's target. Keep pushing!`;
  } else if (yourTodayCount >= dailyTarget) {
    msg = 'Target smashed! You\'re leading by example today.';
  }

  return (
    <div className="dash-card p-5 h-full flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base font-bold text-white">
          {yourTodayCount >= dailyTarget ? 'Target achieved!' : 'Keep the momentum!'}
        </span>
        <Rocket className="w-4 h-4 text-[#EA5D3A]" />
      </div>
      <p className="text-xs text-[#9CA3AF] leading-relaxed">
        {msg}
      </p>
    </div>
  );
};

export default ProgressChart;
