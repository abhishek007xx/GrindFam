import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  FileCode2, Search, ArrowRight, CheckCircle2, User,
  Sparkles, Layers, BookOpen, Trophy
} from 'lucide-react';

// SVG Circular Progress Ring Component
function ProgressRing({ percentage, size = 64, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#21262d"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#emerald-gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-xs font-bold text-white font-mono">
        {percentage}%
      </span>
    </div>
  );
}

export function SheetsExplorer() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sheets, setSheets] = useState([]);
  const [sheetStats, setSheetStats] = useState({}); // { [sheetId]: { total: int, solved: int, percentage: int } }
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('ALL');

  useEffect(() => {
    async function fetchSheetsAndProgress() {
      try {
        setLoading(true);

        // 1. Fetch all sheets
        const { data: sheetsData, error: sheetsErr } = await supabase
          .from('sheets')
          .select('*')
          .order('name');

        if (sheetsErr) throw sheetsErr;

        setSheets(sheetsData || []);

        // 2. Fetch problems and user progress for progress ring calculation
        if (sheetsData && sheetsData.length > 0) {
          const sheetIds = sheetsData.map(s => s.id);

          const { data: problemsData, error: probErr } = await supabase
            .from('problems')
            .select('id, source_id')
            .eq('source_type', 'sheet')
            .in('source_id', sheetIds);

          if (probErr) throw probErr;

          let userProgressMap = new Set();
          if (user && problemsData && problemsData.length > 0) {
            const problemIds = problemsData.map(p => p.id);
            const { data: progressData, error: progErr } = await supabase
              .from('user_progress')
              .select('problem_id')
              .eq('user_id', user.id)
              .eq('status', 'solved')
              .in('problem_id', problemIds);

            if (!progErr && progressData) {
              userProgressMap = new Set(progressData.map(p => p.problem_id));
            }
          }

          // Calculate stats per sheet
          const stats = {};
          sheetsData.forEach(s => {
            const sheetProblems = problemsData?.filter(p => p.source_id === s.id) || [];
            const total = sheetProblems.length || s.total_problems || 0;
            const solved = sheetProblems.filter(p => userProgressMap.has(p.id)).length;
            const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

            stats[s.id] = { total, solved, percentage };
          });

          setSheetStats(stats);
        }
      } catch (err) {
        console.error('Error fetching sheets explorer:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSheetsAndProgress();
  }, [user]);

  const filteredSheets = sheets.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.creator.toLowerCase().includes(searchQuery.toLowerCase());
    if (creatorFilter === 'ALL') return matchesSearch;
    return matchesSearch && s.creator.toLowerCase().includes(creatorFilter.toLowerCase());
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-[#090d11] text-[#e6edf3] font-sans">
      <Sidebar activeSection="sheets" />

      <div className="pl-[240px]">
        <Navbar />

        <main className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-900/20 to-[#0d1117] border border-[#30363d] p-8 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <FileCode2 className="w-64 h-64 text-emerald-400" />
            </div>
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Popular Community DSA Roadmaps</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Creator DSA Sheets
              </h1>
              <p className="text-sm text-[#8b949e] leading-relaxed">
                Explore curated problem sheets created by Striver, Love Babbar, NeetCode, and Apna College. Track your category progress, watch video tutorials, and master DSA topic by topic.
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sheets by name or creator..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#161b22] border border-[#30363d] rounded-xl text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {['ALL', 'Striver', 'Love Babbar', 'NeetCode', 'Apna College'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setCreatorFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    creatorFilter === filter
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500/30'
                      : 'bg-[#161b22] text-[#8b949e] border border-[#30363d] hover:text-white hover:border-[#484f58]'
                  }`}
                >
                  {filter === 'ALL' ? 'All Creators' : filter}
                </button>
              ))}
            </div>
          </div>

          {/* Grid View */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-56 rounded-2xl bg-[#161b22]/50 border border-[#30363d] animate-pulse p-6 space-y-4" />
              ))}
            </div>
          ) : filteredSheets.length === 0 ? (
            <div className="text-center py-16 bg-[#161b22]/30 border border-[#30363d] rounded-2xl p-8 space-y-3">
              <FileCode2 className="w-12 h-12 text-[#6e7681] mx-auto" />
              <h3 className="text-base font-semibold text-white">No Sheets Found</h3>
              <p className="text-xs text-[#8b949e]">Try adjusting your search query or creator filter.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredSheets.map(s => {
                const stats = sheetStats[s.id] || { total: s.total_problems || 0, solved: 0, percentage: 0 };

                return (
                  <motion.div
                    key={s.id}
                    variants={cardVariants}
                    onClick={() => navigate(`/sheet/${s.slug}`)}
                    className="group relative bg-[#0d1117]/80 backdrop-blur border border-[#30363d] hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 pr-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            Curated Sheet
                          </span>
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                            {s.name}
                          </h3>
                          <p className="text-xs text-[#8b949e] flex items-center gap-1">
                            <User className="w-3 h-3 text-[#6e7681]" />
                            <span>{s.creator}</span>
                          </p>
                        </div>

                        {/* Progress Ring */}
                        <div className="flex-shrink-0 group-hover:scale-105 transition-transform">
                          <ProgressRing percentage={stats.percentage} size={68} strokeWidth={6} />
                        </div>
                      </div>

                      {/* Stats Footer */}
                      <div className="pt-4 border-t border-[#21262d] flex items-center justify-between text-xs text-[#8b949e]">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{stats.total} Problems</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{stats.solved} Solved</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>Open Sheet Checklist</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

export default SheetsExplorer;
