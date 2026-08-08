import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { sheetsData } from '../lib/dataFallback';
import { useAuth } from '../context/AuthContext';
import { useTrackStore } from '../store/useTrackStore';
import NotesModal from '../components/NotesModal';
import YouTubeModal from '../components/YouTubeModal';
import {
  ArrowLeft, CheckSquare, Square, ExternalLink, FileText,
  Youtube, ChevronDown, ChevronUp, Search, CheckCircle,
  RotateCcw, User, Sparkles, Check, Flame
} from 'lucide-react';

function ProgressRing({ percentage, size = 80, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2C2C2C"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#emerald-glow)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="emerald-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA5D3A" />
            <stop offset="100%" stopColor="#F2704E" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-sm font-bold text-white font-mono">
        {percentage}%
      </span>
    </div>
  );
}

export function SheetDetail() {
  const { sheetSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sheet, setSheet] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCategories, setOpenCategories] = useState({});

  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  const [activeNotesProblem, setActiveNotesProblem] = useState(null);
  const [activeYouTubeVideo, setActiveYouTubeVideo] = useState(null);

  const { progressMap, setProgressMap, getProblemProgress, toggleStatusOptimistic, incrementSolveCount, saveNotesOptimistic } = useTrackStore();

  useEffect(() => {
    async function fetchSheetDetails() {
      try {
        setLoading(true);

        const { data: sheetData, error: sheetErr } = await supabase
          .from('sheets')
          .select('*')
          .eq('slug', sheetSlug)
          .single();

        if (!sheetErr && sheetData) {
          setSheet(sheetData);

          const { data: problemsData } = await supabase
            .from('problems')
            .select('*')
            .eq('source_id', sheetData.id)
            .eq('source_type', 'sheet')
            .order('id');

          setProblems(problemsData || []);

          // Collapse all categories by default so topics are closed initially
          const initialOpen = {};
          setOpenCategories(initialOpen);
        } else {
          // Fallback to local dataset
          console.warn('Supabase sheet query failed or empty. Loading local sheet fallback.');
          const sObj = sheetsData.find(s => s.slug === sheetSlug) || sheetsData[0];
          setSheet({
            id: `local-sheet-${sObj.slug}`,
            name: sObj.sheet_name,
            creator: sObj.creator_name,
            slug: sObj.slug,
            total_problems: sObj.total_problems_count || 0
          });

          const localProbs = [];
          const initialOpen = {};
          (sObj.steps || []).forEach((step, sIdx) => {
            (step.problems || []).forEach((p, pIdx) => {
              localProbs.push({
                id: `local-prob-${sObj.slug}-${sIdx}-${p.leetcode_slug}`,
                title: p.title,
                leetcode_url: p.leetcode_url,
                leetcode_slug: p.leetcode_slug,
                difficulty: p.difficulty || "Medium",
                youtube_tutorial_url: p.youtube_tutorial_url,
                topic_tags: p.topic_tags || [],
                step_name: step.step_name
              });
            });
          });

          setProblems(localProbs);
          setOpenCategories(initialOpen);
        }
      } catch (err) {
        console.warn('Error connecting to Supabase. Loading local sheet fallback.', err);
        const sObj = sheetsData.find(s => s.slug === sheetSlug) || sheetsData[0];
        setSheet({
          id: `local-sheet-${sObj.slug}`,
          name: sObj.sheet_name,
          creator: sObj.creator_name,
          slug: sObj.slug,
          total_problems: sObj.total_problems_count || 0
        });

        const localProbs = [];
        const initialOpen = {};
        (sObj.steps || []).forEach((step, sIdx) => {
          initialOpen[step.step_name] = true;
          (step.problems || []).forEach((p, pIdx) => {
            localProbs.push({
              id: `local-prob-${sObj.slug}-${sIdx}-${p.leetcode_slug}`,
              title: p.title,
              leetcode_url: p.leetcode_url,
              leetcode_slug: p.leetcode_slug,
              difficulty: p.difficulty || "Medium",
              youtube_tutorial_url: p.youtube_tutorial_url,
              topic_tags: p.topic_tags || [],
              step_name: step.step_name
            });
          });
        });

        setProblems(localProbs);
        setOpenCategories(initialOpen);
      } finally {
        setLoading(false);
      }
    }

    if (sheetSlug) {
      fetchSheetDetails();
    }
  }, [sheetSlug, user, setProgressMap]);

  // Master step & problem ordering maps matching source JSON
  const sourceSheetObj = useMemo(() => {
    return sheetsData.find(s => s.slug === sheetSlug) || null;
  }, [sheetSlug]);

  const stepOrderMap = useMemo(() => {
    const map = new Map();
    if (sourceSheetObj && sourceSheetObj.steps) {
      sourceSheetObj.steps.forEach((st, idx) => {
        map.set((st.step_name || '').trim().toLowerCase(), idx);
      });
    }
    return map;
  }, [sourceSheetObj]);

  const problemOrderMap = useMemo(() => {
    const map = new Map();
    if (sourceSheetObj && sourceSheetObj.steps) {
      let idx = 0;
      sourceSheetObj.steps.forEach(st => {
        (st.problems || []).forEach(p => {
          if (p.leetcode_slug) {
            map.set(p.leetcode_slug.trim().toLowerCase(), idx++);
          }
        });
      });
    }
    return map;
  }, [sourceSheetObj]);

  // Sort raw problems according to master problemOrderMap
  const sortedProblems = useMemo(() => {
    if (!problems || problems.length === 0) return [];
    return [...problems].sort((a, b) => {
      const keyA = (a.leetcode_slug || '').trim().toLowerCase();
      const keyB = (b.leetcode_slug || '').trim().toLowerCase();
      const posA = problemOrderMap.has(keyA) ? problemOrderMap.get(keyA) : 99999;
      const posB = problemOrderMap.has(keyB) ? problemOrderMap.get(keyB) : 99999;
      return posA - posB;
    });
  }, [problems, problemOrderMap]);

  // Derived Overall Statistics
  const totalProblems = sortedProblems.length;
  const solvedCount = useMemo(() => {
    return sortedProblems.filter(p => getProblemProgress(p).status === 'solved').length;
  }, [sortedProblems, progressMap, getProblemProgress]);

  const revisionCount = useMemo(() => {
    return sortedProblems.filter(p => getProblemProgress(p).status === 'revision_needed').length;
  }, [sortedProblems, progressMap, getProblemProgress]);

  const completionPercentage = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  // Group Problems by Category / Step
  const groupedProblems = useMemo(() => {
    const map = {};
    sortedProblems.forEach(p => {
      const cat = p.step_name || 'General Category';
      if (!map[cat]) map[cat] = [];

      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.leetcode_slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiff = difficultyFilter === 'ALL' || p.difficulty.toUpperCase() === difficultyFilter.toUpperCase();

      if (matchesSearch && matchesDiff) {
        map[cat].push(p);
      }
    });
    return map;
  }, [sortedProblems, searchQuery, difficultyFilter]);

  // Category names sorted in exact sequential source order (Step 1, Step 2, Step 3...)
  const sortedCategoryNames = useMemo(() => {
    const cats = Object.keys(groupedProblems);
    return cats.sort((a, b) => {
      const keyA = (a || '').trim().toLowerCase();
      const keyB = (b || '').trim().toLowerCase();
      
      const idxA = stepOrderMap.has(keyA) ? stepOrderMap.get(keyA) : 99999;
      const idxB = stepOrderMap.has(keyB) ? stepOrderMap.get(keyB) : 99999;
      if (idxA !== idxB) return idxA - idxB;

      // Numerical Step X extraction fallback ("Step 1", "Step 2", etc.)
      const numA = parseInt((a.match(/Step\s*(\d+)/i) || [])[1] || '999', 10);
      const numB = parseInt((b.match(/Step\s*(\d+)/i) || [])[1] || '999', 10);
      if (numA !== numB) return numA - numB;

      return a.localeCompare(b);
    });
  }, [groupedProblems, stepOrderMap]);

  const toggleCategory = (catName) => {
    setOpenCategories(prev => ({
      ...prev,
      [catName]: !(prev[catName] ?? false)
    }));
  };

  const toggleExpandAll = () => {
    const currentlyAnyOpen = sortedCategoryNames.some(cat => openCategories[cat] === true);
    const newOpen = {};
    sortedCategoryNames.forEach(cat => {
      newOpen[cat] = !currentlyAnyOpen;
    });
    setOpenCategories(newOpen);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
          {/* Back Navigation */}
          <button
            onClick={() => navigate('/sheets')}
            className="flex items-center gap-2 text-xs font-semibold text-[#A3A3A3] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All DSA Sheets</span>
          </button>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-44 bg-[#1E1E1E]/50 border border-[#333333] rounded-3xl" />
              <div className="h-96 bg-[#1E1E1E]/50 border border-[#333333] rounded-3xl" />
            </div>
          ) : (
            <>
              {/* TOP HEADER */}
              <div className="relative bg-[#141414]/90 backdrop-blur border border-[#333333] rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Curated Creator Sheet</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {sheet?.name}
                  </h1>
                  <p className="text-xs text-[#A3A3A3] flex items-center justify-center md:justify-start gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-[#737373]" />
                    <span>Created by <strong className="text-[#F4F4F5]">{sheet?.creator}</strong></span>
                  </p>
                </div>

                {/* Progress Ring & Stats */}
                <div className="flex items-center gap-6 bg-[#1E1E1E] border border-[#333333] rounded-2xl p-5 shadow-xl">
                  <ProgressRing percentage={completionPercentage} size={84} strokeWidth={8} />

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white">{solvedCount} / {totalProblems} Solved</span>
                    </div>
                    {revisionCount > 0 && (
                      <div className="flex items-center gap-2 text-amber-400">
                        <RotateCcw className="w-4 h-4" />
                        <span className="font-semibold">{revisionCount} Needs Revision</span>
                      </div>
                    )}
                    <p className="text-[11px] text-[#A3A3A3]">
                      {totalProblems - solvedCount} remaining
                    </p>
                  </div>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141414] border border-[#333333] rounded-2xl p-4 shadow-lg">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search problems in sheet..."
                    className="w-full pl-10 pr-4 py-2 bg-[#1E1E1E] border border-[#333333] rounded-xl text-xs text-[#F4F4F5] placeholder-[#737373] focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Expand / Collapse All Toggle */}
                  <button
                    onClick={toggleExpandAll}
                    className="px-3 py-1.5 rounded-xl bg-[#1E1E1E] hover:bg-[#2C2C2C] border border-[#333333] text-xs font-semibold text-[#A3A3A3] hover:text-white transition-all flex items-center gap-1.5"
                  >
                    {sortedCategoryNames.some(cat => openCategories[cat] === true) ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Collapse All</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 text-[#A3A3A3]" />
                        <span>Expand All</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5 bg-[#1E1E1E] p-1 rounded-xl border border-[#333333]">
                    {['ALL', 'Easy', 'Medium', 'Hard'].map(diff => (
                      <button
                        key={diff}
                        onClick={() => setDifficultyFilter(diff)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          difficultyFilter === diff
                            ? 'bg-emerald-600 text-white shadow'
                            : 'text-[#A3A3A3] hover:text-white'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACCORDION CATEGORY LIST — CLOSED BY DEFAULT, SEQUENTIALLY ORDERED */}
              <div className="space-y-4">
                {sortedCategoryNames.length === 0 ? (
                  <div className="p-12 text-center bg-[#141414] border border-[#333333] rounded-3xl text-[#737373]">
                    <p className="text-sm font-medium">No matching problems found.</p>
                  </div>
                ) : (
                  sortedCategoryNames.map((catName) => {
                    const catProblems = groupedProblems[catName];
                    const isOpen = openCategories[catName] ?? false; // CLOSED BY DEFAULT
                    const catTotal = catProblems.length;
                    const catSolved = catProblems.filter(p => progressMap[p.id]?.status === 'solved').length;
                    const catPercentage = catTotal > 0 ? Math.round((catSolved / catTotal) * 100) : 0;

                    return (
                      <div
                        key={catName}
                        className="bg-[#141414] border border-[#333333] rounded-2xl overflow-hidden shadow-lg transition-all"
                      >
                        {/* Accordion Header */}
                        <div
                          onClick={() => toggleCategory(catName)}
                          className="px-6 py-4 bg-[#1E1E1E]/70 hover:bg-[#1E1E1E] border-b border-[#2C2C2C] flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#A3A3A3]" />
                            )}
                            <h3 className="text-sm font-bold text-white tracking-wide">
                              {catName}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#141414] border border-[#333333] text-[11px] font-mono text-[#A3A3A3]">
                              {catSolved}/{catTotal} Solved
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-[#141414] h-2 rounded-full overflow-hidden border border-[#333333] hidden sm:block">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${catPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-emerald-400 font-mono">
                              {catPercentage}%
                            </span>
                          </div>
                        </div>

                        {/* Accordion Body */}
                        {isOpen && (
                          <div className="divide-y divide-[#2C2C2C]">
                            {catProblems.map((prob) => {
                              const userState = getProblemProgress(prob);
                              const status = userState.status || 'not_started';
                              const solveCount = userState.solve_count || (status === 'solved' ? 1 : 0);
                              const isSolved = status === 'solved';
                              const isRevision = status === 'revision_needed';
                              const hasNotes = Boolean(userState.personal_notes && userState.personal_notes.trim());
                              const leetcodeUrl = prob.leetcode_url || `https://leetcode.com/problems/${prob.leetcode_slug}/`;

                              return (
                                <div
                                  key={prob.id}
                                  className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-colors hover:bg-[#1E1E1E]/50 ${
                                    isSolved ? 'bg-emerald-950/10' : isRevision ? 'bg-amber-950/10' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-4 min-w-0">
                                    <button
                                      onClick={() => toggleStatusOptimistic(user?.id, prob)}
                                      className="focus:outline-none flex-shrink-0 transition-transform active:scale-90"
                                      title="Toggle status: Solved -> Revision Needed -> Not Started"
                                    >
                                      <AnimatePresence mode="wait">
                                        {isSolved ? (
                                          <motion.div
                                            key="solved"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                            className="w-5 h-5 rounded-md bg-emerald-500 text-black flex items-center justify-center font-bold"
                                          >
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                          </motion.div>
                                        ) : isRevision ? (
                                          <motion.div
                                            key="revision"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                            className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center"
                                          >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                          </motion.div>
                                        ) : (
                                          <motion.div
                                            key="unsolved"
                                            className="w-5 h-5 rounded-md border-2 border-[#444444] hover:border-white transition-colors"
                                          />
                                        )}
                                      </AnimatePresence>
                                    </button>

                                    <div className="min-w-0">
                                      <a
                                        href={leetcodeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`text-sm font-semibold hover:underline flex items-center gap-2 truncate transition-colors ${
                                          isSolved
                                            ? 'text-emerald-400 line-through opacity-85'
                                            : isRevision
                                            ? 'text-amber-300'
                                            : 'text-white'
                                        }`}
                                      >
                                        <span>{prob.title}</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-[#737373] hover:text-emerald-400 transition-colors flex-shrink-0" />
                                      </a>

                                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        {prob.topic_tags?.map(tag => (
                                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-[#1E1E1E] border border-[#333333] text-[#A3A3A3]">
                                            #{tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <button
                                      onClick={() => incrementSolveCount(user?.id, prob)}
                                      className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 border transition-all cursor-pointer ${
                                        solveCount > 0
                                          ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border-amber-500/40 text-amber-300 hover:scale-105 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                                          : 'bg-[#141414] border-[#333333] text-zinc-400 hover:text-white'
                                      }`}
                                      title="Click to log a solve / revision iteration"
                                    >
                                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                      <span>{solveCount > 0 ? `${solveCount}x Solved` : '+ Solve'}</span>
                                    </button>

                                    {prob.youtube_tutorial_url && (
                                      <button
                                        onClick={() => setActiveYouTubeVideo({ url: prob.youtube_tutorial_url, title: prob.title })}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-all shadow-sm"
                                        title="Watch Video Tutorial"
                                      >
                                        <Youtube className="w-3.5 h-3.5 text-red-500" />
                                        <span className="hidden sm:inline">Watch Concept</span>
                                      </button>
                                    )}

                                    <span className="inline-flex items-center gap-1.5 text-xs text-[#A3A3A3] font-medium">
                                       <span className={`w-2 h-2 rounded-full inline-block ${
                                         prob.difficulty === 'Easy' ? 'bg-[#22c55e]' : prob.difficulty === 'Medium' ? 'bg-[#eab308]' : 'bg-[#ef4444]'
                                       }`} />
                                       {prob.difficulty}
                                     </span>

                                    <button
                                      onClick={() => setActiveNotesProblem(prob)}
                                      className={`p-2 rounded-xl border transition-all ${
                                        hasNotes
                                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                          : 'bg-[#1E1E1E] border-[#333333] text-[#A3A3A3] hover:text-white'
                                      }`}
                                      title={hasNotes ? 'View/Edit Notes' : 'Add Personal Notes'}
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
      {/* Notes Modal */}
      {activeNotesProblem && (
        <NotesModal
          isOpen={Boolean(activeNotesProblem)}
          onClose={() => setActiveNotesProblem(null)}
          problemTitle={activeNotesProblem.title}
          initialNotes={progressMap[activeNotesProblem.id]?.personal_notes || ''}
          onSave={(notes) => saveNotesOptimistic(user?.id, activeNotesProblem.id, notes)}
        />
      )}

      {/* YouTube Modal */}
      {activeYouTubeVideo && (
        <YouTubeModal
          isOpen={Boolean(activeYouTubeVideo)}
          onClose={() => setActiveYouTubeVideo(null)}
          videoUrl={activeYouTubeVideo.url}
          problemTitle={activeYouTubeVideo.title}
        />
      )}
    </div>
  );
}

export default SheetDetail;
