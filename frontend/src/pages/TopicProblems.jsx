import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { companiesData, sheetsData } from '../lib/dataFallback';
import { useAuth } from '../context/AuthContext';
import { useTrackStore } from '../store/useTrackStore';
import {
  ArrowLeft, ExternalLink, Search, Hash, CheckCircle, Check,
  RotateCcw, Building2, FileCode2, Sparkles, Filter
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
          stroke="#21262d" strokeWidth={strokeWidth} fill="transparent"
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

  const { progressMap, setProgressMap, toggleStatusOptimistic } = useTrackStore();

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

        // Fetch user progress
        if (user && allProblems.length > 0) {
          const problemIds = allProblems.filter(p => !String(p.id).startsWith('local-')).map(p => p.id);
          if (problemIds.length > 0) {
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('problem_id, status, solved_at, personal_notes')
              .eq('user_id', user.id)
              .in('problem_id', problemIds);

            if (progressData) {
              const map = {};
              progressData.forEach(item => {
                map[item.problem_id] = {
                  status: item.status,
                  solved_at: item.solved_at,
                  personal_notes: item.personal_notes
                };
              });
              setProgressMap(map);
            }
          }
        }
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
  const solvedCount = problems.filter(p => progressMap[p.id]?.status === 'solved').length;
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
    <div className="space-y-8 animate-fadeIn">
          {/* Back Navigation */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-semibold text-[#8b949e] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/40 via-indigo-900/20 to-[#0d1117] border border-[#30363d] p-8 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Hash className="w-64 h-64 text-violet-400" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Topic Explorer</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  <Hash className="w-8 h-8 text-violet-400" />
                  {decodedTag}
                </h1>
                <p className="text-sm text-[#8b949e] leading-relaxed">
                  All problems tagged with <strong className="text-violet-400">#{decodedTag}</strong> across company tracks and creator sheets.
                </p>

                {/* Difficulty Breakdown Badges */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    {difficultyBreakdown.Easy} Easy
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                    {difficultyBreakdown.Medium} Medium
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                    {difficultyBreakdown.Hard} Hard
                  </span>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="flex items-center gap-5 bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-xl">
                <ProgressRing percentage={percentage} size={72} strokeWidth={6} />
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-400" />
                    <span className="font-bold text-white">{solvedCount} / {totalProblems}</span>
                  </div>
                  <p className="text-[11px] text-[#8b949e]">{totalProblems - solvedCount} remaining</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Topics */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-[#6e7681] uppercase tracking-widest mr-1">Browse Topics:</span>
            {POPULAR_TOPICS.filter(t => t !== decodedTag).slice(0, 12).map(topic => (
              <button
                key={topic}
                onClick={() => navigate(`/topics/${encodeURIComponent(topic)}`)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                  topic === decodedTag
                    ? 'bg-violet-600 text-white border-violet-500/30'
                    : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-white hover:border-violet-500/30'
                }`}
              >
                #{topic}
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 shadow-lg">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search within topic..."
                className="w-full pl-10 pr-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl text-xs text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Difficulty Filter */}
              <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-xl border border-[#30363d]">
                {['ALL', 'Easy', 'Medium', 'Hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      difficultyFilter === diff
                        ? 'bg-violet-600 text-white shadow'
                        : 'text-[#8b949e] hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Source Filter */}
              <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-xl border border-[#30363d]">
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'sheet', label: 'Sheets' },
                  { key: 'company', label: 'Companies' }
                ].map(src => (
                  <button
                    key={src.key}
                    onClick={() => setSourceFilter(src.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      sourceFilter === src.key
                        ? 'bg-violet-600 text-white shadow'
                        : 'text-[#8b949e] hover:text-white'
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Problems List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-16 rounded-xl bg-[#161b22]/50 border border-[#30363d] animate-pulse" />
              ))}
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="text-center py-16 bg-[#161b22]/30 border border-[#30363d] rounded-2xl p-8 space-y-3">
              <Hash className="w-12 h-12 text-[#6e7681] mx-auto" />
              <h3 className="text-base font-semibold text-white">No Problems Found</h3>
              <p className="text-xs text-[#8b949e]">No problems match your current filters for #{decodedTag}.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden shadow-lg"
            >
              {/* Table Header */}
              <div className="grid grid-cols-[40px_1fr_100px_80px_40px] sm:grid-cols-[40px_1fr_120px_100px_80px_40px] gap-3 px-4 sm:px-5 py-3 bg-[#161b22]/70 border-b border-[#21262d] text-[10px] font-bold text-[#6e7681] uppercase tracking-widest">
                <span></span>
                <span>Problem</span>
                <span className="hidden sm:block">Source</span>
                <span>Difficulty</span>
                <span>Status</span>
                <span></span>
              </div>

              {/* Problem Rows */}
              <div className="divide-y divide-[#21262d]">
                {filteredProblems.map((prob) => {
                  const userState = progressMap[prob.id] || {};
                  const status = userState.status || 'not_started';
                  const isSolved = status === 'solved';
                  const isRevision = status === 'revision_needed';
                  const leetcodeUrl = prob.leetcode_url || `https://leetcode.com/problems/${prob.leetcode_slug}/`;

                  return (
                    <motion.div
                      key={prob.id}
                      variants={rowVariants}
                      className={`grid grid-cols-[40px_1fr_100px_80px_40px] sm:grid-cols-[40px_1fr_120px_100px_80px_40px] gap-3 px-4 sm:px-5 py-3.5 items-center transition-colors hover:bg-[#161b22]/50 ${
                        isSolved ? 'bg-emerald-950/5' : isRevision ? 'bg-amber-950/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleStatusOptimistic(user?.id, prob.id)}
                        className="focus:outline-none transition-transform active:scale-90"
                        title="Toggle status"
                      >
                        <AnimatePresence mode="wait">
                          {isSolved ? (
                            <motion.div
                              key="solved"
                              initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}
                              className="w-5 h-5 rounded-md bg-emerald-500 text-black flex items-center justify-center"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </motion.div>
                          ) : isRevision ? (
                            <motion.div
                              key="revision"
                              initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}
                              className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="unsolved"
                              className="w-5 h-5 rounded-md border-2 border-[#484f58] hover:border-white transition-colors"
                            />
                          )}
                        </AnimatePresence>
                      </button>

                      {/* Title */}
                      <a
                        href={leetcodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm font-semibold hover:underline flex items-center gap-2 truncate transition-colors ${
                          isSolved ? 'text-emerald-400 line-through opacity-85' : isRevision ? 'text-amber-300' : 'text-white'
                        }`}
                      >
                        <span className="truncate">{prob.title}</span>
                        <ExternalLink className="w-3 h-3 text-[#6e7681] flex-shrink-0" />
                      </a>

                      {/* Source — hidden on mobile */}
                      <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                        {prob.source_type === 'company'
                          ? <Building2 className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          : <FileCode2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        }
                        <span className="text-[10px] text-[#8b949e] truncate">{prob.source_name || prob.source_type}</span>
                      </div>

                      {/* Difficulty */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                        prob.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : prob.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {prob.difficulty}
                      </span>

                      {/* Status Badge */}
                      <span className={`text-[10px] font-semibold ${
                        isSolved ? 'text-emerald-400' : isRevision ? 'text-amber-400' : 'text-[#6e7681]'
                      }`}>
                        {isSolved ? 'Solved' : isRevision ? 'Revision' : '—'}
                      </span>

                      {/* LeetCode Link */}
                      <a
                        href={leetcodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-white/5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#6e7681] hover:text-white" />
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
