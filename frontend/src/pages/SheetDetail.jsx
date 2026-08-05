import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { sheetsData } from '../lib/dataFallback';
import { useAuth } from '../context/AuthContext';
import { useTrackStore } from '../store/useTrackStore';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NotesModal from '../components/NotesModal';
import YouTubeModal from '../components/YouTubeModal';
import {
  ArrowLeft, CheckSquare, Square, ExternalLink, FileText,
  Youtube, ChevronDown, ChevronUp, Search, CheckCircle,
  RotateCcw, User, Sparkles, Check
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
          stroke="#21262d"
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
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
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

  const { progressMap, setProgressMap, toggleStatusOptimistic, saveNotesOptimistic } = useTrackStore();

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

          if (user && problemsData && problemsData.length > 0) {
            const problemIds = problemsData.map(p => p.id);
            const { data: userProgress } = await supabase
              .from('user_progress')
              .select('problem_id, status, solved_at, personal_notes')
              .eq('user_id', user.id)
              .in('problem_id', problemIds);

            if (userProgress) {
              const map = {};
              userProgress.forEach(item => {
                map[item.problem_id] = {
                  status: item.status,
                  solved_at: item.solved_at,
                  personal_notes: item.personal_notes
                };
              });
              setProgressMap(map);
            }
          }
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
    return sortedProblems.filter(p => progressMap[p.id]?.status === 'solved').length;
  }, [sortedProblems, progressMap]);

  const revisionCount = useMemo(() => {
    return sortedProblems.filter(p => progressMap[p.id]?.status === 'revision_needed').length;
  }, [sortedProblems, progressMap]);

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
    <div className="page-shell pb-16">
      <Sidebar activeSection="sheets" />

      <div className="page-content">
        <Navbar />

        <main className="page-main-constrained space-y-8 animate-fadeIn">
          {/* Back Navigation */}
          <button
            onClick={() => navigate('/sheets')}
            className="flex items-center gap-2 text-xs font-semibold text-[#8b949e] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All DSA Sheets</span>
          </button>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-44 bg-[#161b22]/50 border border-[#30363d] rounded-3xl" />
              <div className="h-96 bg-[#161b22]/50 border border-[#30363d] rounded-3xl" />
            </div>
          ) : (
            <>
              {/* TOP HEADER */}
              <div className="relative bg-[#0d1117]/90 backdrop-blur border border-[#30363d] rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Curated Creator Sheet</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {sheet?.name}
                  </h1>
                  <p className="text-xs text-[#8b949e] flex items-center justify-center md:justify-start gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-[#6e7681]" />
                    <span>Created by <strong className="text-[#e6edf3]">{sheet?.creator}</strong></span>
                  </p>
                </div>

                {/* Progress Ring & Stats */}
                <div className="flex items-center gap-6 bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-xl">
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
                    <p className="text-[11px] text-[#8b949e]">
                      {totalProblems - solvedCount} remaining
                    </p>
                  </div>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 shadow-lg">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search problems in sheet..."
                    className="w-full pl-10 pr-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl text-xs text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Expand / Collapse All Toggle */}
                  <button
                    onClick={toggleExpandAll}
                    className="px-3 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-xs font-semibold text-[#8b949e] hover:text-white transition-all flex items-center gap-1.5"
                  >
                    {sortedCategoryNames.some(cat => openCategories[cat] === true) ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Collapse All</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 text-[#8b949e]" />
                        <span>Expand All</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5 bg-[#161b22] p-1 rounded-xl border border-[#30363d]">
                    {['ALL', 'Easy', 'Medium', 'Hard'].map(diff => (
                      <button
                        key={diff}
                        onClick={() => setDifficultyFilter(diff)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          difficultyFilter === diff
                            ? 'bg-emerald-600 text-white shadow'
                            : 'text-[#8b949e] hover:text-white'
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
                  <div className="p-12 text-center bg-[#0d1117] border border-[#30363d] rounded-3xl text-[#6e7681]">
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
                        className="bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden shadow-lg transition-all"
                      >
                        {/* Accordion Header */}
                        <div
                          onClick={() => toggleCategory(catName)}
                          className="px-6 py-4 bg-[#161b22]/70 hover:bg-[#161b22] border-b border-[#21262d] flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#8b949e]" />
                            )}
                            <h3 className="text-sm font-bold text-white tracking-wide">
                              {catName}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#0d1117] border border-[#30363d] text-[11px] font-mono text-[#8b949e]">
                              {catSolved}/{catTotal} Solved
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-[#0d1117] h-2 rounded-full overflow-hidden border border-[#30363d] hidden sm:block">
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
                          <div className="divide-y divide-[#21262d]">
                            {catProblems.map((prob) => {
                              const userState = progressMap[prob.id] || {};
                              const status = userState.status || 'not_started';
                              const isSolved = status === 'solved';
                              const isRevision = status === 'revision_needed';
                              const hasNotes = Boolean(userState.personal_notes && userState.personal_notes.trim());
                              const leetcodeUrl = prob.leetcode_url || `https://leetcode.com/problems/${prob.leetcode_slug}/`;

                              return (
                                <div
                                  key={prob.id}
                                  className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-colors hover:bg-[#161b22]/50 ${
                                    isSolved ? 'bg-emerald-950/10' : isRevision ? 'bg-amber-950/10' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-4 min-w-0">
                                    <button
                                      onClick={() => toggleStatusOptimistic(user?.id, prob.id)}
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
                                            className="w-5 h-5 rounded-md border-2 border-[#484f58] hover:border-white transition-colors"
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
                                        <ExternalLink className="w-3.5 h-3.5 text-[#6e7681] hover:text-emerald-400 transition-colors flex-shrink-0" />
                                      </a>

                                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        {prob.topic_tags?.map(tag => (
                                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-[#161b22] border border-[#30363d] text-[#8b949e]">
                                            #{tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 flex-shrink-0">
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

                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        prob.difficulty === 'Easy'
                                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                          : prob.difficulty === 'Medium'
                                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                      }`}
                                    >
                                      {prob.difficulty}
                                    </span>

                                    <button
                                      onClick={() => setActiveNotesProblem(prob)}
                                      className={`p-2 rounded-xl border transition-all ${
                                        hasNotes
                                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                          : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:text-white'
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
        </main>
      </div>

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
