import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { companiesData, sheetsData } from '../lib/dataFallback';
import { useAuth } from '../context/AuthContext';
import { useTrackStore } from '../store/useTrackStore';
import {
  ArrowLeft, ExternalLink, Search, Hash, CheckCircle, Check,
  RotateCcw, Building2, FileCode2, Sparkles, Filter, Flame
} from 'lucide-react';

function ProgressRing({ percentage, size = 64, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#2C2C2C" strokeWidth={strokeWidth} fill="transparent"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="url(#topic-grad)" strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="topic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-xs font-bold text-white font-mono">
        {percentage}%
      </span>
    </div>
  );
}

// Common DSA topics for browsing
const POPULAR_TOPICS = [
  'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
  'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search',
  'Breadth-First Search', 'Tree', 'Graph', 'Linked List', 'Stack',
  'Queue', 'Heap', 'Two Pointers', 'Sliding Window', 'Recursion',
  'Backtracking', 'Bit Manipulation', 'Matrix', 'Trie', 'Union Find',
  'Divide and Conquer', 'Segment Tree', 'Binary Indexed Tree'
];

export function TopicProblems() {
  const { tagName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const decodedTag = decodeURIComponent(tagName || '');

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  const { progressMap, setProgressMap, getProblemProgress, toggleStatusOptimistic, incrementSolveCount } = useTrackStore();

  useEffect(() => {
    async function fetchTopicProblems() {
      try {
        setLoading(true);

        // Search Supabase for problems containing this tag
        const { data: supaProblems } = await supabase
          .from('problems')
          .select('id, title, difficulty, leetcode_slug, leetcode_url, source_type, source_id, topic_tags, step_name, frequency_score')
          .contains('topic_tags', [decodedTag])
          .order('frequency_score', { ascending: false });

        let allProblems = supaProblems || [];

        // If no Supabase results, search local fallback
        if (allProblems.length === 0) {
          const localProbs = [];

          sheetsData.forEach(sheet => {
            (sheet.steps || []).forEach(step => {
              (step.problems || []).forEach(prob => {
                if ((prob.topic_tags || []).some(t => t.toLowerCase().includes(decodedTag.toLowerCase()))) {
                  localProbs.push({
                    id: `local-${sheet.slug}-${prob.leetcode_slug}`,
                    title: prob.title,
                    difficulty: prob.difficulty || 'Medium',
                    leetcode_slug: prob.leetcode_slug,
                    leetcode_url: prob.leetcode_url,
                    source_type: 'sheet',
                    source_name: sheet.sheet_name,
                    topic_tags: prob.topic_tags || [],
                    frequency_score: 5
                  });
                }
              });
            });
          });

          companiesData.forEach(company => {
            (company.roles || []).forEach(role => {
              (role.problems || []).forEach(prob => {
                if ((prob.topic_tags || []).some(t => t.toLowerCase().includes(decodedTag.toLowerCase()))) {
                  localProbs.push({
                    id: `local-${company.slug}-${prob.leetcode_slug}`,
                    title: prob.title,
                    difficulty: prob.difficulty || 'Medium',
                    leetcode_slug: prob.leetcode_slug,
                    leetcode_url: prob.leetcode_url,
                    source_type: 'company',
                    source_name: company.company_name,
                    topic_tags: prob.topic_tags || [],
                    frequency_score: prob.frequency_score || 5
                  });
                }
              });
            });
          });

          // Deduplicate by leetcode_slug
          const seen = new Set();
          allProblems = localProbs.filter(p => {
            if (seen.has(p.leetcode_slug)) return false;
            seen.add(p.leetcode_slug);
            return true;
          });
        }

        // Resolve source names from Supabase if needed
        if (supaProblems && supaProblems.length > 0) {
          const sourceIds = [...new Set(supaProblems.map(p => p.source_id))];

          // Fetch sheet names
          const { data: sheetSources } = await supabase
            .from('sheets')
            .select('id, name')
            .in('id', sourceIds);

          // Fetch company track names
          const { data: trackSources } = await supabase
            .from('company_tracks')
            .select('id, role, companies(name)')
            .in('id', sourceIds);

          const sourceMap = {};
          (sheetSources || []).forEach(s => { sourceMap[s.id] = s.name; });
          (trackSources || []).forEach(t => { sourceMap[t.id] = `${t.companies?.name} - ${t.role}`; });

          allProblems = allProblems.map(p => ({
            ...p,
            source_name: sourceMap[p.source_id] || (p.source_type === 'sheet' ? 'DSA Sheet' : 'Company Track')
          }));
        }

        setProblems(allProblems);

        // Progress is handled centrally via useTrackStore
      } catch (err) {
        console.warn('Error fetching topic problems:', err);
      } finally {
        setLoading(false);
      }
    }

    if (decodedTag) fetchTopicProblems();
  }, [decodedTag, user, setProgressMap]);

  // Filtered Problems
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiff = difficultyFilter === 'ALL' || p.difficulty === difficultyFilter;
      const matchesSource = sourceFilter === 'ALL' || p.source_type === sourceFilter;
      return matchesSearch && matchesDiff && matchesSource;
    });
  }, [problems, searchQuery, difficultyFilter, sourceFilter]);

  // Stats
  const totalProblems = problems.length;
  const solvedCount = problems.filter(p => getProblemProgress(p).status === 'solved').length;
  const percentage = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  const difficultyBreakdown = useMemo(() => {
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    problems.forEach(p => { if (counts[p.difficulty] !== undefined) counts[p.difficulty]++; });
    return counts;
  }, [problems]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* Back Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-lg bg-[#1E1E1E] border border-[#333333] p-6 md:p-8">
        <img
          src="/logo.png"
          alt="GrindFam Mascot"
          className="absolute -bottom-8 -right-8 w-44 h-44 object-contain opacity-[0.05] grayscale pointer-events-none select-none"
        />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#262626] border border-[#333333] text-[#9CA3AF] text-xs font-medium">
              <Hash className="w-3.5 h-3.5 text-[#EA5D3A]" />
              <span>Topic Explorer</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#F4F4F5] tracking-tight flex items-center gap-2">
              <Hash className="w-6 h-6 text-[#EA5D3A]" />
              {decodedTag}
            </h1>
            <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed">
              All problems tagged with <strong className="text-[#EA5D3A]">#{decodedTag}</strong> across company tracks and creator sheets.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">{difficultyBreakdown.Easy} Easy</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">{difficultyBreakdown.Medium} Medium</span>
              <span className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">{difficultyBreakdown.Hard} Hard</span>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[#141414] border border-[#333333] rounded-lg p-4 shadow-md flex-shrink-0">
            <ProgressRing percentage={percentage} size={64} strokeWidth={6} />
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#EA5D3A]" />
                <span className="font-bold text-white">{solvedCount} / {totalProblems}</span>
              </div>
              <p className="text-[11px] text-[#6B7280]">{totalProblems - solvedCount} remaining</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Topics */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mr-1">Browse Topics:</span>
        {POPULAR_TOPICS.filter(t => t !== decodedTag).slice(0, 12).map(topic => (
          <button key={topic} onClick={() => navigate(`/topics/${encodeURIComponent(topic)}`)}
            className="px-3 py-1 rounded-md text-[10px] font-semibold transition-all border bg-[#1E1E1E] text-[#9CA3AF] border-[#333333] hover:text-white hover:border-[#EA5D3A]/40">
            #{topic}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within topic..."
            className="w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#333333] rounded-md text-xs text-[#F4F4F5] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {['ALL', 'Easy', 'Medium', 'Hard'].map(diff => (
            <button key={diff} onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${difficultyFilter === diff ? 'bg-[#262626] text-white border-[#EA5D3A] font-semibold' : 'bg-[#1E1E1E] text-[#9CA3AF] border-[#333333] hover:text-white hover:border-[#4B5563]'}`}>
              {diff}
            </button>
          ))}
          <div className="w-px h-4 bg-[#333333] mx-1" />
          {[{ key: 'ALL', label: 'All' }, { key: 'sheet', label: 'Sheets' }, { key: 'company', label: 'Companies' }].map(src => (
            <button key={src.key} onClick={() => setSourceFilter(src.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${sourceFilter === src.key ? 'bg-[#262626] text-white border-[#EA5D3A] font-semibold' : 'bg-[#1E1E1E] text-[#9CA3AF] border-[#333333] hover:text-white hover:border-[#4B5563]'}`}>
              {src.label}
            </button>
          ))}
        </div>
      </div>

      {/* Problems List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-14 rounded-md bg-[#1E1E1E] border border-[#333333] animate-pulse" />
          ))}
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="text-center py-12 bg-[#1E1E1E] border border-[#333333] rounded-lg space-y-3">
          <Hash className="w-10 h-10 text-[#4B5563] mx-auto" />
          <h3 className="text-sm font-semibold text-[#F4F4F5]">No Problems Found</h3>
          <p className="text-xs text-[#9CA3AF]">No problems match your current filters for #{decodedTag}.</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="bg-[#1E1E1E] border border-[#333333] rounded-lg overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_100px_80px_40px] sm:grid-cols-[40px_1fr_120px_100px_80px_40px] gap-3 px-4 sm:px-5 py-3 bg-[#141414] border-b border-[#333333] text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
            <span></span><span>Problem</span><span className="hidden sm:block">Source</span><span>Difficulty</span><span>Status</span><span></span>
          </div>
          <div className="divide-y divide-[#2C2C2C]">
            {filteredProblems.map((prob) => {
              const userState = getProblemProgress(prob);
              const status = userState.status || 'not_started';
              const solveCount = userState.solve_count || (status === 'solved' ? 1 : 0);
              const isSolved = status === 'solved';
              const isRevision = status === 'revision_needed';
              const leetcodeUrl = prob.leetcode_url || `https://leetcode.com/problems/${prob.leetcode_slug}/`;
              return (
                <motion.div key={prob.id} variants={rowVariants}
                  className={`grid grid-cols-[40px_1fr_100px_80px_70px_40px] sm:grid-cols-[40px_1fr_120px_100px_110px_40px] gap-3 px-4 sm:px-5 py-3.5 items-center transition-colors hover:bg-[#262626]/40 ${isSolved ? 'bg-emerald-950/5' : isRevision ? 'bg-amber-950/5' : ''}`}>
                  <button onClick={() => toggleStatusOptimistic(user?.id, prob)} className="focus:outline-none transition-transform active:scale-90" title="Toggle status">
                    <AnimatePresence mode="wait">
                      {isSolved ? (
                        <motion.div key="solved" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} className="w-5 h-5 rounded-md bg-emerald-500 text-black flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </motion.div>
                      ) : isRevision ? (
                        <motion.div key="revision" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </motion.div>
                      ) : (
                        <motion.div key="unsolved" className="w-5 h-5 rounded-md border-2 border-[#4B5563] hover:border-[#EA5D3A] transition-colors" />
                      )}
                    </AnimatePresence>
                  </button>
                  <a href={leetcodeUrl} target="_blank" rel="noopener noreferrer"
                    className={`text-sm font-semibold hover:underline flex items-center gap-2 truncate transition-colors ${isSolved ? 'text-emerald-400 line-through opacity-85' : isRevision ? 'text-amber-300' : 'text-[#F4F4F5]'}`}>
                    <span className="truncate">{prob.title}</span>
                    <ExternalLink className="w-3 h-3 text-[#6B7280] flex-shrink-0" />
                  </a>
                  <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                    {prob.source_type === 'company' ? <Building2 className="w-3 h-3 text-[#EA5D3A] flex-shrink-0" /> : <FileCode2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                    <span className="text-[10px] text-[#9CA3AF] truncate">{prob.source_name || prob.source_type}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] font-medium">
                    <span className={`w-2 h-2 rounded-full inline-block ${prob.difficulty === 'Easy' ? 'bg-emerald-500' : prob.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                    {prob.difficulty}
                  </span>
                  <button
                    onClick={() => incrementSolveCount(user?.id, prob)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                      solveCount > 0
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:scale-105 shadow-xs'
                        : 'bg-[#141414] border-[#333333] text-zinc-400 hover:text-white'
                    }`}
                    title="Click to log solve / revision count"
                  >
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{solveCount > 0 ? `${solveCount}x` : '+ Solve'}</span>
                  </button>
                  <a href={leetcodeUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-[#333333] transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 text-[#6B7280] hover:text-[#EA5D3A] transition-colors" />
                  </a>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default TopicProblems;
