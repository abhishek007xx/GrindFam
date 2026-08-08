import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { companiesData } from '../lib/dataFallback';
import { useAuth } from '../context/AuthContext';
import { useTrackStore } from '../store/useTrackStore';
import NotesModal from '../components/NotesModal';
import InterviewTimelineTracker from '../components/InterviewTimelineTracker';
import {
  ArrowLeft, CheckSquare, Square, ExternalLink, FileText,
  AlertTriangle, Target, MessageSquare, Award, Search,
  CheckCircle, RotateCcw, BookOpen, Flame, Sparkles, ChevronDown, ChevronUp, Youtube,
  GraduationCap, Briefcase, Layers
} from 'lucide-react';

function ProgressRing({ percentage = 0, size = 80, strokeWidth = 8 }) {
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
          stroke="url(#comp-emerald-glow)" strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="comp-emerald-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-sm font-bold text-white font-mono">
        {percentage}%
      </span>
    </div>
  );
}

export function TrackDetail() {
  const { companySlug, trackId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [companyTrack, setCompanyTrack] = useState(null);
  const [company, setCompany] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoleIdx, setActiveRoleIdx] = useState(1);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Notes Modal State
  const [activeNotesProblem, setActiveNotesProblem] = useState(null);

  // Accordion State
  const [openCategories, setOpenCategories] = useState({});

  // Zustand Store
  const { progressMap, getProblemProgress, toggleStatusOptimistic, incrementSolveCount, saveNotesOptimistic } = useTrackStore();

  useEffect(() => {
    async function fetchTrackAndProblems() {
      try {
        setLoading(true);

        const { data: trackData, error: trackErr } = await supabase
          .from('company_tracks')
          .select('*, companies(*)')
          .eq('id', trackId)
          .single();

        if (!trackErr && trackData) {
          setCompanyTrack(trackData);
          setCompany(trackData.companies);

          const { data: problemsData } = await supabase
            .from('problems')
            .select('*')
            .eq('source_id', trackId)
            .eq('source_type', 'company')
            .order('frequency_score', { ascending: false });

          setProblems(problemsData || []);

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
          const compObj = companiesData.find(c => c.slug === companySlug) || companiesData[0];
          setCompany({
            id: `local-${compObj.slug}`,
            name: compObj.company_name === 'Meta / Facebook' ? 'Meta' : compObj.company_name,
            slug: compObj.slug,
            logo_url: compObj.logo_url
          });

          const roleObj = compObj.roles.find(r => trackId.includes(r.role_name) || trackId.includes(compObj.slug)) || compObj.roles[0];
          setCompanyTrack({
            id: trackId,
            role: roleObj.role_name,
            level: roleObj.level,
            guidelines: roleObj.guidelines || {}
          });

          const localProbs = (roleObj.problems || []).map((p, idx) => ({
            id: `local-prob-${compObj.slug}-${idx}-${p.leetcode_slug}`,
            title: p.title,
            leetcode_slug: p.leetcode_slug,
            difficulty: p.difficulty || "Medium",
            frequency_score: p.frequency_score || 5,
            topic_tags: p.topic_tags || [],
            step_name: roleObj.role_name
          }));
          setProblems(localProbs);
        }
      } catch (err) {
        console.warn('Error fetching track details.', err);
      } finally {
        setLoading(false);
      }
    }

    if (trackId) {
      fetchTrackAndProblems();
    }
  }, [trackId, companySlug, user, setProgressMap]);

  // Derived Statistics
  const totalProblems = problems.length;
  const solvedCount = useMemo(() => {
    return problems.filter(p => getProblemProgress(p).status === 'solved').length;
  }, [problems, progressMap, getProblemProgress]);

  const revisionCount = useMemo(() => {
    return problems.filter(p => getProblemProgress(p).status === 'revision_needed').length;
  }, [problems, progressMap, getProblemProgress]);

  const completionPercentage = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  // Filtered Problems
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.leetcode_slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty = difficultyFilter === 'ALL' || p.difficulty.toUpperCase() === difficultyFilter.toUpperCase();

      const userStatus = getProblemProgress(p).status || 'not_started';
      let matchesStatus = true;
      if (statusFilter === 'SOLVED') matchesStatus = userStatus === 'solved';
      if (statusFilter === 'REVISION') matchesStatus = userStatus === 'revision_needed';
      if (statusFilter === 'UNSOLVED') matchesStatus = userStatus === 'not_started';

      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [problems, searchQuery, difficultyFilter, statusFilter, progressMap, getProblemProgress]);

  const sourceCompanyObj = useMemo(() => {
    return companiesData.find(c => c.slug === companySlug) || null;
  }, [companySlug]);

  const activeRoleObj = useMemo(() => {
    if (!sourceCompanyObj || !sourceCompanyObj.roles) return null;
    return sourceCompanyObj.roles[activeRoleIdx] || sourceCompanyObj.roles[0];
  }, [sourceCompanyObj, activeRoleIdx]);

  const topicOrderMap = useMemo(() => {
    const map = new Map();
    if (activeRoleObj && activeRoleObj.problems) {
      let idx = 0;
      activeRoleObj.problems.forEach(p => {
        const cat = (p.topic_tags && p.topic_tags.length > 0) ? p.topic_tags[0] : 'General Category';
        if (!map.has(cat)) map.set(cat, idx++);
      });
    }
    return map;
  }, [activeRoleObj]);

  const problemOrderMap = useMemo(() => {
    const map = new Map();
    if (activeRoleObj && activeRoleObj.problems) {
      activeRoleObj.problems.forEach((p, idx) => {
        if (!map.has(p.leetcode_slug)) map.set(p.leetcode_slug, idx);
      });
    }
    return map;
  }, [activeRoleObj]);

  // Sort filtered problems by master map
  const sortedFilteredProblems = useMemo(() => {
    return [...filteredProblems].sort((a, b) => {
      const posA = problemOrderMap.has(a.leetcode_slug) ? problemOrderMap.get(a.leetcode_slug) : 99999;
      const posB = problemOrderMap.has(b.leetcode_slug) ? problemOrderMap.get(b.leetcode_slug) : 99999;
      return posA - posB;
    });
  }, [filteredProblems, problemOrderMap]);

  // Group by topic_tags[0]
  const groupedProblems = useMemo(() => {
    const map = {};
    sortedFilteredProblems.forEach(p => {
      const cat = (p.topic_tags && p.topic_tags.length > 0) ? p.topic_tags[0] : 'General Category';
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return map;
  }, [sortedFilteredProblems]);

  const sortedCategoryNames = useMemo(() => {
    const cats = Object.keys(groupedProblems);
    return cats.sort((a, b) => {
      const idxA = topicOrderMap.has(a) ? topicOrderMap.get(a) : 99999;
      const idxB = topicOrderMap.has(b) ? topicOrderMap.get(b) : 99999;
      if (idxA !== idxB) return idxA - idxB;
      return a.localeCompare(b);
    });
  }, [groupedProblems, topicOrderMap]);

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

  const guidelines = companyTrack?.guidelines || {};

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Back Navigation identical to SheetDetail */}
      <button
        onClick={() => navigate('/companies')}
        className="flex items-center gap-2 text-xs font-semibold text-[#A3A3A3] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Company Tracks</span>
      </button>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-48 bg-[#1E1E1E]/50 border border-[#333333] rounded-lg" />
          <div className="h-64 bg-[#1E1E1E]/50 border border-[#333333] rounded-lg" />
        </div>
      ) : (
        <>
          {/* Hero Banner Card identical to SheetDetail */}
          <div className="bg-[#1E1E1E] border border-[#333333] rounded-lg p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-[#262626] border border-[#333333] text-[#9CA3AF] text-xs font-medium">
                  {companyTrack?.role || 'DSA Track'}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-[#1E1E1E] border border-[#333333] text-[#A3A3A3] text-xs font-medium">
                  Level: {companyTrack?.level || 'All Levels'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#262626] border border-[#333333] p-2 flex items-center justify-center flex-shrink-0">
                  {company?.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextSibling) {
                          e.currentTarget.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <span className="font-bold text-white text-base hidden">{company?.name?.slice(0, 2).toUpperCase()}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#F4F4F5] tracking-tight">
                  {company?.name} Track
                </h1>
              </div>

              <p className="text-xs md:text-sm text-[#9CA3AF]">
                Official interview guidelines & frequency-tagged DSA problem checklist for {company?.name}.
              </p>
            </div>

            <div className="flex items-center gap-6 flex-shrink-0 self-start md:self-center bg-[#262626]/50 border border-[#333333] p-4 rounded-lg">
              <ProgressRing percentage={completionPercentage} size={76} strokeWidth={7} />
              <div className="space-y-1">
                <div className="text-xs font-medium text-[#9CA3AF]">Solved Progress</div>
                <div className="text-sm font-bold text-white font-mono">{solvedCount} / {totalProblems}</div>
                <div className="text-[11px] text-[#10B981] font-semibold">{totalProblems - solvedCount} Remaining</div>
              </div>
            </div>
          </div>

          {/* Role Track Switcher Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { title: 'Intern Track', icon: GraduationCap },
              { title: 'Campus Placement', icon: Flame },
              { title: 'Senior Level Track', icon: Briefcase }
            ].map((trackOpt, rIdx) => {
              const isActive = activeRoleIdx === rIdx;
              const IconComp = trackOpt.icon;
              const compObj = companiesData.find(c => c.slug === companySlug) || companiesData[0];
              const roleObj = compObj.roles[rIdx] || compObj.roles[0];
              const pCount = roleObj.problems ? roleObj.problems.length : 0;

              return (
                <button
                  key={trackOpt.title}
                  onClick={() => {
                    setActiveRoleIdx(rIdx);
                    setCompanyTrack({
                      id: trackId,
                      role: roleObj.role_name,
                      level: roleObj.level,
                      guidelines: roleObj.guidelines || {}
                    });
                    const localProbs = (roleObj.problems || []).map((p, idx) => ({
                      id: `local-prob-${compObj.slug}-${rIdx}-${idx}-${p.leetcode_slug}`,
                      title: p.title,
                      leetcode_slug: p.leetcode_slug,
                      difficulty: p.difficulty || "Medium",
                      frequency_score: p.frequency_score || 5,
                      topic_tags: p.topic_tags || [],
                      step_name: roleObj.role_name
                    }));
                    setProblems(localProbs);
                  }}
                  className={`px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap border flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#262626] text-white border-[#EA5D3A] shadow-sm font-semibold'
                      : 'bg-[#1E1E1E] text-[#9CA3AF] border-[#333333] hover:text-white hover:border-[#4B5563]'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#EA5D3A]'}`} />
                  <span>{trackOpt.title}</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#111827] text-[#9CA3AF] text-[10px] font-mono">
                    {pCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* MIDDLE SECTION: Filters & Search Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#121110] border border-zinc-800/80 rounded-2xl p-4 shadow-lg">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter problems by title..."
                className="w-full pl-10 pr-4 py-2 bg-[#1b1817] border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#EA5D3A]"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={toggleExpandAll}
                className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-[#181514] hover:bg-[#211d1c] border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                {sortedCategoryNames.some(cat => openCategories[cat] === true) ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-[#EA5D3A]" />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Expand All</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1 bg-[#181514] p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
                {['ALL', 'Easy', 'Medium', 'Hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex-1 sm:flex-none ${
                      difficultyFilter === diff
                        ? 'bg-[#EA5D3A] text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-[#181514] p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
                {['ALL', 'SOLVED', 'REVISION', 'UNSOLVED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex-1 sm:flex-none ${
                      statusFilter === st
                        ? 'bg-gradient-to-r from-[#EA5D3A] to-[#F97316] text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Problem Checklist */}
          <div className="space-y-4">
            {sortedCategoryNames.length === 0 ? (
              <div className="p-12 text-center bg-[#121110] border border-zinc-800/80 rounded-3xl text-zinc-500">
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
                    className="bg-[#121110] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-lg transition-all"
                  >
                    {/* Accordion Header */}
                    <div
                      onClick={() => toggleCategory(catName)}
                      className="px-6 py-4 bg-[#171514]/70 hover:bg-[#1a1716] border-b border-zinc-800/80 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#EA5D3A]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        )}
                        <h3 className="text-sm font-extrabold text-white tracking-wide">
                          {catName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#0e0d0d] border border-zinc-800 text-[11px] font-mono text-zinc-400">
                          {catSolved}/{catTotal} Solved
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-[#0e0d0d] h-2 rounded-full overflow-hidden border border-zinc-800 hidden sm:block">
                          <div
                            className="bg-gradient-to-r from-[#EA5D3A] to-[#FF5722] h-full rounded-full transition-all duration-500"
                            style={{ width: `${catPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-extrabold text-[#EA5D3A] font-mono">
                          {catPercentage}%
                      </span>
                      </div>
                    </div>

                    {/* Accordion Body */}
                    {isOpen && (
                      <div className="divide-y divide-zinc-800/70">
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
                              className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-colors hover:bg-[#181514] ${
                                isSolved ? 'bg-emerald-950/15' : isRevision ? 'bg-amber-950/15' : ''
                              }`}
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <button
                                  onClick={() => toggleStatusOptimistic(user?.id, prob)}
                                  className="focus:outline-none flex-shrink-0 transition-transform active:scale-95"
                                  title="Click to toggle status: Solved -> Needs Revision -> Not Started"
                                >
                                  {isSolved ? (
                                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                                  ) : isRevision ? (
                                    <RotateCcw className="w-5 h-5 text-amber-400" />
                                  ) : (
                                    <Square className="w-5 h-5 text-zinc-600 hover:text-zinc-300" />
                                  )}
                                </button>

                                <div className="min-w-0">
                                  <a
                                    href={leetcodeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-sm font-semibold hover:underline flex items-center gap-2 truncate ${
                                      isSolved ? 'text-emerald-400 line-through' : isRevision ? 'text-amber-300' : 'text-zinc-100 hover:text-[#EA5D3A]'
                                    }`}
                                  >
                                    <span>{prob.title}</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-[#EA5D3A] transition-opacity flex-shrink-0" />
                                  </a>

                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    {prob.topic_tags?.map(tag => (
                                      <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-[#181514] border border-zinc-800 text-zinc-400">
                                        {tag}
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
                                {prob.frequency_score && (
                                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#181514] border border-zinc-800 text-[11px] font-bold text-[#EA5D3A]">
                                    <Flame className="w-3 h-3 text-[#EA5D3A]" />
                                    <span>{prob.frequency_score}/10</span>
                                  </div>
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
                                      ? 'bg-[#EA5D3A]/20 border-[#EA5D3A]/40 text-[#EA5D3A]'
                                      : 'bg-[#181514] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
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
    </div>
  );
}

export default TrackDetail;

