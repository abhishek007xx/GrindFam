import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Flame, Calendar, TrendingUp, Award, Loader2, GitCommit } from 'lucide-react';

import { API_BASE_URL } from '../config/api';


const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getLevel = (count, maxCount) => {
  if (count === 0) return 0;
  if (maxCount === 0) return 1;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
};

const levelColorsDark = {
  0: '#121215',   // empty dark
  1: '#0e4429',   // low green
  2: '#006d32',   // medium green
  3: '#26a641',   // high green
  4: '#39d353',   // max green
};

const levelColorsLight = {
  0: '#e2e8f0',   // empty light slate
  1: '#9be9a8',   // low green
  2: '#40c463',   // medium green
  3: '#30a14e',   // high green
  4: '#216e39',   // max green
};

// Fallback generator for 365 days if API is loading or offline
const generateFallbackDays = () => {
  const days = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 364);

  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    days.push({
      date: cursor.toISOString().split('T')[0],
      count: 0
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

const ContributionHeatmap = ({ onWeeklyDataLoaded }) => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const activeLevelColors = theme === 'light' ? levelColorsLight : levelColorsDark;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setData({ days: generateFallbackDays(), stats: { totalSolved: 0, activeDays: 0, maxInDay: 0, currentStreak: 0, longestStreak: 0 } });
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/activity/heatmap`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
        if (res.data?.weeklyData) {
          onWeeklyDataLoaded?.(res.data.weeklyData);
        }
      } catch (err) {
        console.warn('Backend activity heatmap fetch error, using fallback:', err);
        setData({ days: generateFallbackDays(), stats: { totalSolved: 0, activeDays: 0, maxInDay: 0, currentStreak: 0, longestStreak: 0 } });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, onWeeklyDataLoaded]);

  const days = data?.days || generateFallbackDays();
  const stats = data?.stats || { totalSolved: 0, activeDays: 0, maxInDay: 0, currentStreak: 0, longestStreak: 0 };
  const maxCount = stats.maxInDay || 1;

  // ── Build the grid: columns = weeks, rows = 7 days (Sun→Sat) ──
  const firstDay = days.length > 0 ? new Date(days[0].date) : new Date();
  const startDow = firstDay.getDay(); // 0=Sun

  const paddedDays = [];
  for (let i = 0; i < startDow; i++) paddedDays.push(null);
  paddedDays.push(...days);

  const weeks = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }
  const lastWeek = weeks[weeks.length - 1];
  while (lastWeek && lastWeek.length < 7) lastWeek.push(null);

  // ── Month labels ──
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    for (const d of week) {
      if (!d) continue;
      const m = new Date(d.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ weekIndex: wi, label: MONTHS[m] });
        lastMonth = m;
        break;
      }
    }
  });

  const handleMouseEnter = (day, e) => {
    if (!day) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay(day);
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
  };

  const cellSize = 12;
  const cellGap = 3;

  return (
    <div className="dash-card p-4 sm:p-6 border border-[#27272A] dark:border-[#27272A] light:border-slate-200 bg-[#121215] dark:bg-[#121215] light:bg-white rounded-2xl shadow-sm" id="activity-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[#10B981] flex-shrink-0">
            <GitCommit className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2 flex-wrap">
              <span>All-Time Contribution Progress</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#10B981] border border-emerald-500/30 font-semibold">
                GitHub Green
              </span>
            </h3>
            <p className="text-[11px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500">
              {stats.totalSolved || 0} problem{stats.totalSolved !== 1 ? 's' : ''} solved in the last 365 days
            </p>
          </div>
        </div>

        {loading && <Loader2 className="w-4 h-4 animate-spin text-[#10B981] flex-shrink-0" />}
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="min-w-[750px]">
          {/* Month labels row */}
          <div className="flex ml-8 mb-1.5" style={{ gap: `${cellGap}px` }}>
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.weekIndex === wi);
              return (
                <div key={wi} style={{ width: `${cellSize}px`, flexShrink: 0 }}>
                  {label && (
                    <span className="text-[10px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 font-medium">{label.label}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid: day labels + cells */}
          <div className="flex">
            {/* Day-of-week labels */}
            <div className="flex flex-col mr-1.5" style={{ gap: `${cellGap}px` }}>
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((label, i) => (
                <div key={i} className="flex items-center justify-end" style={{ height: `${cellSize}px` }}>
                  <span className="text-[10px] text-[#A1A1AA] dark:text-[#A1A1AA] light:text-slate-500 font-medium pr-1">{label}</span>
                </div>
              ))}
            </div>

            {/* Columns = weeks */}
            <div className="flex" style={{ gap: `${cellGap}px` }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: `${cellGap}px` }}>
                  {week.map((day, di) => {
                    if (!day) {
                      return <div key={di} style={{ width: cellSize, height: cellSize }} />;
                    }
                    const level = getLevel(day.count, maxCount);
                    return (
                      <div
                        key={di}
                        className="rounded-sm cursor-pointer transition-all duration-100 hover:ring-1 hover:ring-emerald-400"
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: activeLevelColors[level],
                        }}
                        onMouseEnter={(e) => handleMouseEnter(day, e)}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end mt-3 gap-1.5">
            <span className="text-[10px] text-slate-500 dark:text-[#A1A1AA] font-medium mr-1">Less</span>
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div
                key={lvl}
                className="rounded-sm"
                style={{ width: cellSize, height: cellSize, backgroundColor: activeLevelColors[lvl] }}
              />
            ))}
            <span className="text-[10px] text-slate-500 dark:text-[#A1A1AA] font-medium ml-1">More</span>
          </div>
        </div>
      </div>

      {/* Stats Row — Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#222225] dark:border-[#222225] light:border-slate-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#EA5D3A]" />
          </div>
          <p className="text-lg font-extrabold text-white dark:text-white light:text-slate-900">{stats.totalSolved || 0}</p>
          <p className="text-[10px] text-slate-500 dark:text-[#A1A1AA]">Total Solved</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-lg font-extrabold text-white dark:text-white light:text-slate-900">{stats.activeDays || 0}</p>
          <p className="text-[10px] text-slate-500 dark:text-[#A1A1AA]">Active Days</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-lg font-extrabold text-white dark:text-white light:text-slate-900">{stats.currentStreak || 0}</p>
          <p className="text-[10px] text-slate-500 dark:text-[#A1A1AA]">Current Streak</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Award className="w-3.5 h-3.5 text-yellow-500" />
          </div>
          <p className="text-lg font-extrabold text-white dark:text-white light:text-slate-900">{stats.longestStreak || 0}</p>
          <p className="text-[10px] text-slate-500 dark:text-[#A1A1AA]">Longest Streak</p>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg bg-slate-900 dark:bg-[#18181B] border border-slate-700 dark:border-[#27272A] shadow-xl pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="text-xs font-bold text-white">
            {hoveredDay.count} problem{hoveredDay.count !== 1 ? 's' : ''} solved
          </p>
          <p className="text-[10px] text-slate-300 dark:text-[#A1A1AA]">
            {new Date(hoveredDay.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContributionHeatmap;
