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
  const { progressMap, setProgressMap, toggleStatusOptimistic, saveNotesOptimistic } = useTrackStore();

  useEffect(() => {
    async function fetchTrackAndProblems() {
      try {
        setLoading(true);

        // 1. Try fetching from Supabase
        const { data: trackData, error: trackErr } = await supabase
          .from('company_tracks')
          .select('*, companies(*)')
          .eq('id', trackId)
          .single();

        if (!trackErr && trackData) {
          setCompanyTrack(trackData);
          setCompany(trackData.companies);

          const { data: problemsData, error: probErr } = await supabase
            .from('problems')
            .select('*')
            .eq('source_id', trackId)
            .eq('source_type', 'company')
            .order('frequency_score', { ascending: false });

          if (!probErr) setProblems(problemsData || []);

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
          console.warn('Supabase track query failed or empty. Loading local track fallback.');
          const compObj = companiesData.find(c => c.slug === companySlug) || companiesData[0];
          setCompany({
            id: `local-${compObj.slug}`,
            name: compObj.company_name === 'Meta / Facebook' ? 'Meta' : compObj.company_name,
            slug: compObj.slug,
            logo_url: compObj.logo_url
          });

          // Match role or first role
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
        console.warn('Error connecting to Supabase. Loading local track fallback.', err);
        const compObj = companiesData.find(c => c.slug === companySlug) || companiesData[0];
        setCompany({
          id: `local-${compObj.slug}`,
          name: compObj.company_name === 'Meta / Facebook' ? 'Meta' : compObj.company_name,
          slug: compObj.slug,
          logo_url: compObj.logo_url
        });
        const roleObj = compObj.roles[0];
        setCompanyTrack({
          id: trackId,
          role: roleObj.role_name,
          level: roleObj.level,
          guidelines: roleObj.guidelines || {}
        });
        setProblems((roleObj.problems || []).map((p, idx) => ({
          id: `local-prob-${compObj.slug}-${idx}-${p.leetcode_slug}`,
          title: p.title,
          leetcode_slug: p.leetcode_slug,
          difficulty: p.difficulty || "Medium",
          frequency_score: p.frequency_score || 5,
          topic_tags: p.topic_tags || []
        })));
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
    return problems.filter(p => progressMap[p.id]?.status === 'solved').length;
  }, [problems, progressMap]);

  const revisionCount = useMemo(() => {
    return problems.filter(p => progressMap[p.id]?.status === 'revision_needed').length;
  }, [problems, progressMap]);

  const completionPercentage = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  // Filtered Problems
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.leetcode_slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty = difficultyFilter === 'ALL' || p.difficulty.toUpperCase() === difficultyFilter.toUpperCase();

      const userStatus = progressMap[p.id]?.status || 'not_started';
      let matchesStatus = true;
      if (statusFilter === 'SOLVED') matchesStatus = userStatus === 'solved';
      if (statusFilter === 'REVISION') matchesStatus = userStatus === 'revision_needed';
      if (statusFilter === 'UNSOLVED') matchesStatus = userStatus === 'not_started';

      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [problems, searchQuery, difficultyFilter, statusFilter, progressMap]);

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
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Back Navigation */}
      <button
        onClick={() => navigate('/companies')}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#181514] border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white hover:border-[#EA5D3A]/50 hover:bg-[#EA5D3A]/10 transition-all"
      >
        <ArrowLeft className="w-4 h-4 text-[#EA5D3A]" />
        <span>Back to Company Tracks</span>
      </button>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-56 bg-[#141211]/60 border border-zinc-800/80 rounded-3xl" />
          <div className="h-64 bg-[#141211]/60 border border-zinc-800/80 rounded-3xl" />
        </div>
      ) : (
        <>
          {/* TOP SECTION: Requirement Card with Warm Orangish Theme */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1b1715] via-[#141211] to-[#0d0c0c] border border-[#EA5D3A]/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8">
            {/* Glow Orbs */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#EA5D3A]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800/90">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#1b1817] border border-[#EA5D3A]/30 p-3 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg shadow-black/50">
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
                  <span className="font-extrabold text-[#EA5D3A] text-xl hidden">{company?.name?.slice(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{company?.name}</h1>
                    <span className="px-3 py-1 rounded-full bg-[#EA5D3A]/15 border border-[#EA5D3A]/40 text-[#EA5D3A] text-xs font-bold">
                      {companyTrack?.role}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium">
                      Level: {companyTrack?.level}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#EA5D3A]" />
                    <span>Official Interview Guidelines & DSA Frequency Roadmap</span>
                  </p>
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="bg-[#0e0c0c]/80 border border-[#EA5D3A]/25 rounded-2xl p-4 min-w-[260px] space-y-2 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Track Progress</span>
                  <span className="font-mono font-extrabold text-[#EA5D3A]">{completionPercentage}%</span>
                </div>

                <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="bg-gradient-to-r from-[#EA5D3A] via-[#F97316] to-[#FF5722] h-full rounded-full transition-all duration-500 shadow-sm shadow-[#EA5D3A]/50"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{solvedCount} / {totalProblems} Solved</span>
                  {revisionCount > 0 && (
                    <span className="text-amber-400 font-semibold">{revisionCount} Needs Revision</span>
                  )}
                </div>
              </div>
            </div>

            {/* PROMINENT TRACK SELECTION OPTIONS SECTION */}
            <div className="relative z-10 space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#EA5D3A]" />
                  <span>Select Role Track Options:</span>
                </span>
                <span className="text-[11px] text-[#EA5D3A] font-semibold">3 Specialized Hiring Kits</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Intern Track',
                    badge: 'Internship & Entry Level',
                    desc: 'OA Speed Prep, Foundational DSA & CS Fundamentals',
                    icon: GraduationCap,
                    color: 'from-[#EA5D3A]/20 via-[#F97316]/10 to-transparent border-[#EA5D3A]/50 text-[#EA5D3A]'
                  },
                  {
                    title: 'Campus Placement',
                    badge: '3-Month Placement Sprint',
                    desc: 'Company OA Patterns, Top Frequency 50 & Technical Rounds',
                    icon: Flame,
                    color: 'from-[#F97316]/20 via-[#FF5722]/10 to-transparent border-[#F97316]/50 text-[#F97316]'
                  },
                  {
                    title: 'Senior Level Track',
                    badge: 'System Design & Lateral',
                    desc: 'HLD, LLD, Leadership Principles & Compensation Prep',
                    icon: Briefcase,
                    color: 'from-[#FF5722]/20 via-[#EA5D3A]/10 to-transparent border-[#FF5722]/50 text-[#FF5722]'
                  }
                ].map((trackOpt, rIdx) => {
                  const isActive = activeRoleIdx === rIdx;
                  const IconComp = trackOpt.icon;
                  const compObj = companiesData.find(c => c.slug === companySlug) || companiesData[0];
                  const roleObj = compObj.roles[rIdx] || compObj.roles[0];
                  const pCount = roleObj.problems ? roleObj.problems.length : 0;

                  return (
                    <div
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
                      className={`p-4.5 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${
                        isActive
                          ? `bg-gradient-to-br ${trackOpt.color} shadow-xl ring-2 ring-[#EA5D3A]/50 scale-[1.02]`
                          : 'bg-[#151312]/80 hover:bg-[#1b1817] border-zinc-800 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0d0c0c]/80 border border-zinc-800 ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                            {trackOpt.badge}
                          </span>
                          <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                        </div>

                        <div>
                          <h4 className={`text-sm font-extrabold ${isActive ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>
                            {trackOpt.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                            {trackOpt.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-mono text-[11px]">{pCount} Curated Problems</span>
                        <span className={`font-bold flex items-center gap-1 ${isActive ? 'text-white' : 'text-[#EA5D3A] group-hover:translate-x-0.5 transition-transform'}`}>
                          {isActive ? 'Active Track' : 'Select Track'} →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guidelines Breakdown */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-zinc-800/90">
              {/* Interview Format */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Target className="w-4 h-4 text-[#EA5D3A]" />
                  <span>Interview Format</span>
                </div>
                <div className="space-y-2">
                  {guidelines.interview_format && guidelines.interview_format.length > 0 ? (
                    guidelines.interview_format.map((step, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#161413] border border-zinc-800/80 flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#EA5D3A]/20 text-[#EA5D3A] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-zinc-200 leading-relaxed">{step}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500">Standard DSA & System Design rounds.</p>
                  )}
                </div>
              </div>

              {/* Key Topics Weightage */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Award className="w-4 h-4 text-[#F97316]" />
                  <span>Key Topics Weightage</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {guidelines.key_topics_weightage && Object.keys(guidelines.key_topics_weightage).length > 0 ? (
                    Object.entries(guidelines.key_topics_weightage).map(([topic, weight]) => (
                      <div
                        key={topic}
                        className="px-3.5 py-2 rounded-xl bg-[#161413] border border-zinc-800 flex items-center gap-2 text-xs font-medium text-zinc-200"
                      >
                        <span>{topic}</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#EA5D3A]/20 text-[#EA5D3A] font-bold text-[11px]">
                          {weight}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500">Arrays, Trees, Graphs, DP, System Design.</p>
                  )}
                </div>

                {/* Behavioral Focus */}
                {guidelines.behavioral_focus && (
                  <div className="pt-4 border-t border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Behavioral & Culture Focus</span>
                    </div>
                    <p className="text-xs text-zinc-300 italic leading-relaxed bg-[#161413] p-3 rounded-xl border border-zinc-800/80">
                      "{guidelines.behavioral_focus}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Common Rejection Reasons */}
            {guidelines.common_rejection_reasons && guidelines.common_rejection_reasons.length > 0 && (
              <div className="relative z-10 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Common Rejection Points</span>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-300">
                  {guidelines.common_rejection_reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 🎯 Interview Timeline Tracker for Company */}
          <InterviewTimelineTracker
            totalTrackProblems={problems.length || 50}
            solvedCount={solvedCount}
            companyName={company?.name}
          />

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
                          const userState = progressMap[prob.id] || {};
                          const status = userState.status || 'not_started';
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
                                  onClick={() => toggleStatusOptimistic(user?.id, prob.id)}
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

