import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTrackStore } from '../store/useTrackStore';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NotesModal from '../components/NotesModal';
import {
  ArrowLeft, CheckSquare, Square, ExternalLink, FileText,
  AlertTriangle, Target, MessageSquare, Award, Flame, Search,
  Filter, CheckCircle2, RotateCcw, Clock, Sparkles, BookOpen
} from 'lucide-react';

export function TrackDetail() {
  const { companySlug, trackId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [companyTrack, setCompanyTrack] = useState(null);
  const [company, setCompany] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Notes Modal State
  const [activeNotesProblem, setActiveNotesProblem] = useState(null);

  // Zustand Store
  const { progressMap, setProgressMap, toggleStatusOptimistic, saveNotesOptimistic } = useTrackStore();

  useEffect(() => {
    async function fetchTrackAndProblems() {
      try {
        setLoading(true);

        // 1. Fetch Track details
        const { data: trackData, error: trackErr } = await supabase
          .from('company_tracks')
          .select('*, companies(*)')
          .eq('id', trackId)
          .single();

        if (trackErr) throw trackErr;

        setCompanyTrack(trackData);
        setCompany(trackData.companies);

        // 2. Fetch Problems for this track
        const { data: problemsData, error: probErr } = await supabase
          .from('problems')
          .select('*')
          .eq('source_id', trackId)
          .eq('source_type', 'company')
          .order('frequency_score', { ascending: false });

        if (probErr) throw probErr;
        setProblems(problemsData || []);

        // 3. Fetch User Progress from Supabase
        if (user && problemsData && problemsData.length > 0) {
          const problemIds = problemsData.map(p => p.id);
          const { data: userProgress, error: progErr } = await supabase
            .from('user_progress')
            .select('problem_id, status, solved_at, personal_notes')
            .eq('user_id', user.id)
            .in('problem_id', problemIds);

          if (progErr) throw progErr;

          const map = {};
          userProgress?.forEach(item => {
            map[item.problem_id] = {
              status: item.status,
              solved_at: item.solved_at,
              personal_notes: item.personal_notes
            };
          });
          setProgressMap(map);
        }
      } catch (err) {
        console.error('Error fetching track detail:', err);
      } finally {
        setLoading(false);
      }
    }

    if (trackId) {
      fetchTrackAndProblems();
    }
  }, [trackId, user, setProgressMap]);

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

  const guidelines = companyTrack?.guidelines || {};

  return (
    <div className="min-h-screen bg-[#090d11] text-[#e6edf3] font-sans pb-16">
      <Sidebar activeSection="companies" />

      <div className="pl-[240px]">
        <Navbar />

        <main className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Back Navigation */}
          <button
            onClick={() => navigate('/companies')}
            className="flex items-center gap-2 text-xs font-semibold text-[#8b949e] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Companies</span>
          </button>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-48 bg-[#161b22]/50 border border-[#30363d] rounded-3xl" />
              <div className="h-64 bg-[#161b22]/50 border border-[#30363d] rounded-3xl" />
            </div>
          ) : (
            <>
              {/* TOP SECTION: Requirement Card */}
              <div className="relative bg-[#0d1117]/90 backdrop-blur border border-[#30363d] rounded-3xl p-8 shadow-2xl space-y-8">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#21262d]">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#161b22] border border-[#30363d] p-3 flex items-center justify-center flex-shrink-0">
                      {company?.logo_url ? (
                        <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="font-bold text-indigo-400 text-xl">{company?.name?.slice(0, 2)}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white">{company?.name}</h1>
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                          {companyTrack?.role}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-[#8b949e] text-xs font-medium">
                          Level: {companyTrack?.level}
                        </span>
                      </div>
                      <p className="text-xs text-[#8b949e] mt-1">Official Interview Guidelines & DSA Frequency Roadmap</p>
                    </div>
                  </div>

                  {/* Progress Summary Card */}
                  <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 min-w-[240px] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">Track Progress</span>
                      <span className="font-mono font-bold text-emerald-400">{completionPercentage}%</span>
                    </div>

                    <div className="w-full bg-[#0d1117] h-2.5 rounded-full overflow-hidden border border-[#30363d]">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
                      <span>{solvedCount} / {totalProblems} Solved</span>
                      {revisionCount > 0 && (
                        <span className="text-amber-400 font-semibold">{revisionCount} Needs Revision</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Guidelines Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Interview Format */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Target className="w-4 h-4 text-indigo-400" />
                      <span>Interview Format</span>
                    </div>
                    <div className="space-y-2">
                      {guidelines.interview_format && guidelines.interview_format.length > 0 ? (
                        guidelines.interview_format.map((step, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-[#161b22]/70 border border-[#21262d] flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-[#e6edf3] leading-relaxed">{step}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#6e7681]">Standard DSA & System Design rounds.</p>
                      )}
                    </div>
                  </div>

                  {/* Key Topics Weightage */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span>Key Topics Weightage</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {guidelines.key_topics_weightage && Object.keys(guidelines.key_topics_weightage).length > 0 ? (
                        Object.entries(guidelines.key_topics_weightage).map(([topic, weight]) => (
                          <div
                            key={topic}
                            className="px-3.5 py-2 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center gap-2 text-xs font-medium text-[#e6edf3]"
                          >
                            <span>{topic}</span>
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold text-[11px]">
                              {weight}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#6e7681]">Arrays, Trees, Graphs, DP, System Design.</p>
                      )}
                    </div>

                    {/* Behavioral Focus */}
                    {guidelines.behavioral_focus && (
                      <div className="pt-4 border-t border-[#21262d] space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Behavioral & Culture Focus</span>
                        </div>
                        <p className="text-xs text-[#8b949e] italic leading-relaxed bg-[#161b22]/50 p-3 rounded-xl border border-[#21262d]">
                          "{guidelines.behavioral_focus}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Common Rejection Reasons */}
                {guidelines.common_rejection_reasons && guidelines.common_rejection_reasons.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Common Rejection Points</span>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#8b949e]">
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

              {/* MIDDLE SECTION: Filters & Search Controls */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0d1117] border border-[#30363d] rounded-2xl p-4 shadow-lg">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter problems by title..."
                    className="w-full pl-10 pr-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl text-xs text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  {/* Difficulty Filters */}
                  <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-xl border border-[#30363d]">
                    {['ALL', 'Easy', 'Medium', 'Hard'].map(diff => (
                      <button
                        key={diff}
                        onClick={() => setDifficultyFilter(diff)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          difficultyFilter === diff
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-[#8b949e] hover:text-white'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>

                  {/* Status Filters */}
                  <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-xl border border-[#30363d]">
                    {['ALL', 'SOLVED', 'REVISION', 'UNSOLVED'].map(st => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          statusFilter === st
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-[#8b949e] hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION: Problem Checklist */}
              <div className="bg-[#0d1117] border border-[#30363d] rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-[#21262d] bg-[#161b22]/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Problem Set Checklist</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#30363d] text-xs font-semibold text-[#8b949e]">
                      {filteredProblems.length} Problems
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-[#21262d]">
                  {filteredProblems.length === 0 ? (
                    <div className="p-12 text-center text-[#6e7681]">
                      <p className="text-sm font-medium">No matching problems found for your filters.</p>
                    </div>
                  ) : (
                    filteredProblems.map((prob) => {
                      const userState = progressMap[prob.id] || {};
                      const status = userState.status || 'not_started';
                      const isSolved = status === 'solved';
                      const isRevision = status === 'revision_needed';
                      const hasNotes = Boolean(userState.personal_notes && userState.personal_notes.trim());

                      const leetcodeUrl = `https://leetcode.com/problems/${prob.leetcode_slug}/`;

                      return (
                        <div
                          key={prob.id}
                          className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-colors hover:bg-[#161b22]/60 ${
                            isSolved ? 'bg-emerald-950/10' : isRevision ? 'bg-amber-950/10' : ''
                          }`}
                        >
                          {/* Left: Checkbox & Problem Title */}
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
                                <Square className="w-5 h-5 text-[#484f58] hover:text-white" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <a
                                href={leetcodeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm font-semibold hover:underline flex items-center gap-2 truncate ${
                                  isSolved ? 'text-emerald-400 line-through' : isRevision ? 'text-amber-300' : 'text-white'
                                }`}
                              >
                                <span>{prob.title}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-[#6e7681] opacity-0 group-hover:opacity-100 hover:text-indigo-400 transition-opacity flex-shrink-0" />
                              </a>

                              {/* Topic Tags */}
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                {prob.topic_tags?.map(tag => (
                                  <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-[#161b22] border border-[#30363d] text-[#8b949e]">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right: Badges & Actions */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Frequency Pill */}
                            {prob.frequency_score && (
                              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-[11px] font-bold text-amber-400" title="Frequency Score (1-10)">
                                <Flame className="w-3 h-3 text-amber-500" />
                                <span>{prob.frequency_score}/10</span>
                              </div>
                            )}

                            {/* Difficulty Badge */}
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

                            {/* Notes Button */}
                            <button
                              onClick={() => setActiveNotesProblem(prob)}
                              className={`p-2 rounded-xl border transition-all ${
                                hasNotes
                                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                  : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#484f58]'
                              }`}
                              title={hasNotes ? 'View/Edit Notes' : 'Add Personal Notes'}
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
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
    </div>
  );
}

export default TrackDetail;
