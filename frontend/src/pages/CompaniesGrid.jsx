import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { companiesData } from '../lib/dataFallback';
import InterviewTimelineTracker from '../components/InterviewTimelineTracker';
import {
  Building2, Search, ArrowRight, GraduationCap, Award, Briefcase,
  Flame, Sparkles, X, CheckCircle2, TrendingUp, Target, Zap, ChevronRight, Layers, Star,
  ChevronDown, ArrowUpDown, Filter, Layers2, Code2
} from 'lucide-react';

const sanitizeSlug = (s) => (s || '').toLowerCase().replace(/--+/g, '-').trim();

// Category filter tabs matching reference UI
const FILTER_TABS = [
  { id: 'ALL', label: 'All Companies' },
  { id: 'Intern', label: 'Intern' },
  { id: 'SDE-1', label: 'SDE-1' },
  { id: 'SDE-2', label: 'SDE-2' },
  { id: 'Senior', label: 'Senior' },
  { id: 'DIVIDER', label: '|' },
  { id: 'Frontend', label: 'Frontend' },
  { id: 'Backend', label: 'Backend' },
  { id: 'Full Stack', label: 'Full Stack' },
  { id: 'ML / Data', label: 'ML / Data' },
  { id: 'Android', label: 'Android' },
  { id: 'Product', label: 'Product' }
];

export function CompaniesGrid() {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('companies')
          .select(`
            *,
            company_tracks (
              id,
              role,
              level,
              roadmap
            )
          `)
          .order('name');

        let rawCompanies = data;
        if (error || !data || data.length === 0) {
          rawCompanies = companiesData.map((c, cIdx) => ({
            id: `local-comp-${c.slug}`,
            name: c.company_name === 'Meta / Facebook' ? 'Meta' : c.company_name,
            slug: c.slug,
            logo_url: c.logo_url,
            popularity_rank: c.popularity_rank ?? cIdx,
            company_tracks: c.roles.map((r, rIdx) => ({
              id: `${c.slug}-track-${rIdx}`,
              role: r.role_name,
              level: r.level,
              roadmap: { problems_count: r.problems ? r.problems.length : 0 }
            }))
          }));
        } else {
          const localMap = new Map(companiesData.map(c => [c.slug, c.popularity_rank]));
          rawCompanies = rawCompanies.map(c => ({
            ...c,
            popularity_rank: localMap.get(c.slug) ?? 999
          }));
        }

        // Deduplicate companies array by normalized slug
        const uniqueMap = new Map();
        rawCompanies.forEach(c => {
          const normSlug = sanitizeSlug(c.slug);
          if (!uniqueMap.has(normSlug)) {
            uniqueMap.set(normSlug, {
              ...c,
              slug: normSlug,
              name: c.name === 'Meta / Facebook' ? 'Meta' : c.name
            });
          }
        });

        const activeCompanies = Array.from(uniqueMap.values());
        activeCompanies.sort((a, b) => (a.popularity_rank ?? 999) - (b.popularity_rank ?? 999));
        setCompanies(activeCompanies);
      } catch (err) {
        console.warn('Error fetching companies. Loading fallback dataset.', err);
        const uniqueMap = new Map();
        companiesData.forEach((c, cIdx) => {
          const normSlug = sanitizeSlug(c.slug);
          if (!uniqueMap.has(normSlug)) {
            uniqueMap.set(normSlug, {
              id: `local-comp-${normSlug}`,
              name: c.company_name === 'Meta / Facebook' ? 'Meta' : c.company_name,
              slug: normSlug,
              logo_url: c.logo_url,
              popularity_rank: c.popularity_rank ?? cIdx,
              company_tracks: c.roles.map((r, rIdx) => ({
                id: `${normSlug}-track-${rIdx}`,
                role: r.role_name,
                level: r.level,
                roadmap: { problems_count: r.problems ? r.problems.length : 0 }
              }))
            });
          }
        });

        const fallbackList = Array.from(uniqueMap.values()).sort((a, b) => (a.popularity_rank ?? 999) - (b.popularity_rank ?? 999));
        setCompanies(fallbackList);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute total problem & track counts
  const totalStats = useMemo(() => {
    let probs = 0;
    let tracks = 0;
    companies.forEach(comp => {
      tracks += comp.company_tracks?.length || 3;
      (comp.company_tracks || []).forEach(t => {
        probs += t.roadmap?.problems_count || 15;
      });
    });
    return {
      companies: companies.length || 101,
      tracks: tracks || 757,
      problems: probs || 18226
    };
  }, [companies]);

  // Filtering & Sorting
  const processedCompanies = useMemo(() => {
    let list = companies.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.slug.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedTab === 'ALL') return matchesSearch;
      const hasRole = c.company_tracks?.some(t =>
        t.role.toLowerCase().includes(selectedTab.toLowerCase()) ||
        t.level?.toLowerCase().includes(selectedTab.toLowerCase())
      );
      return matchesSearch && (hasRole || selectedTab === 'ALL');
    });

    if (sortBy === 'popularity') {
      list.sort((a, b) => (a.popularity_rank ?? 999) - (b.popularity_rank ?? 999));
    } else if (sortBy === 'problems') {
      list.sort((a, b) => {
        const countA = (a.company_tracks || []).reduce((acc, t) => acc + (t.roadmap?.problems_count || 15), 0);
        const countB = (b.company_tracks || []).reduce((acc, t) => acc + (t.roadmap?.problems_count || 15), 0);
        return countB - countA;
      });
    } else if (sortBy === 'tracks') {
      list.sort((a, b) => (b.company_tracks?.length || 0) - (a.company_tracks?.length || 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [companies, searchQuery, selectedTab, sortBy]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ── 1. Hero Banner matching Reference Image ── */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0E0E0E] border border-[#1F1F1F] p-8 md:p-10 shadow-2xl">
        {/* Glowing Ember background effect */}
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-[420px] h-[320px] bg-gradient-to-tr from-[#EA5D3A]/25 via-[#F97316]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Hero Content */}
          <div className="space-y-4 max-w-xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#FAFAFA] tracking-tight leading-tight">
              Top Tech Companies.
              <span className="block text-[#EA5D3A] mt-0.5">Structured Prep.</span>
            </h1>

            <p className="text-[#8A8A85] text-sm md:text-base leading-relaxed">
              Curated company tracks with handpicked problems, interview insights, and preparation resources.
            </p>

            {/* 3 Stat Pills Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#171717] border border-[#262626]">
                <Building2 className="w-4 h-4 text-[#EA5D3A]" />
                <div>
                  <span className="font-extrabold text-[#FAFAFA] text-sm font-mono">{totalStats.companies}</span>
                  <span className="text-xs text-[#8A8A85] ml-1.5 font-medium">Companies</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#171717] border border-[#262626]">
                <Layers className="w-4 h-4 text-[#EA5D3A]" />
                <div>
                  <span className="font-extrabold text-[#FAFAFA] text-sm font-mono">{totalStats.tracks}</span>
                  <span className="text-xs text-[#8A8A85] ml-1.5 font-medium">Tracks</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#171717] border border-[#262626]">
                <TrendingUp className="w-4 h-4 text-[#EA5D3A]" />
                <div>
                  <span className="font-extrabold text-[#FAFAFA] text-sm font-mono">{totalStats.problems.toLocaleString()}</span>
                  <span className="text-xs text-[#8A8A85] ml-1.5 font-medium">Problems</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Overlapping 3D Tech Logo Stack Visual matching Stitch UI */}
          <div className="relative hidden lg:flex items-center justify-center w-[360px] h-[220px]">
            {/* Ambient Sparkles */}
            <div className="absolute top-2 right-4 w-1.5 h-1.5 bg-[#EA5D3A] rounded-full animate-ping" />
            <div className="absolute bottom-6 left-6 w-1 h-1 bg-[#F97316] rounded-full animate-pulse" />

            {/* Stack Card 4: Apple */}
            <div className="absolute right-0 top-6 w-36 h-48 rounded-2xl bg-gradient-to-b from-[#222222] to-[#121212] border border-zinc-700/60 shadow-2xl p-4 transform rotate-12 translate-x-2 scale-90 flex flex-col justify-between opacity-80">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold text-sm">🍎</div>
              <div className="space-y-1.5">
                <div className="w-16 h-2 rounded bg-zinc-700/80" />
                <div className="w-10 h-1.5 rounded bg-zinc-800" />
              </div>
            </div>

            {/* Stack Card 3: Meta */}
            <div className="absolute right-12 top-4 w-36 h-48 rounded-2xl bg-gradient-to-b from-[#222222] to-[#121212] border border-zinc-700/60 shadow-2xl p-4 transform rotate-6 scale-95 flex flex-col justify-between opacity-90">
              <div className="w-8 h-8 rounded-lg bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">∞</div >
              <div className="space-y-1.5">
                <div className="w-16 h-2 rounded bg-zinc-700/80" />
                <div className="w-12 h-1.5 rounded bg-zinc-800" />
              </div>
            </div>

            {/* Stack Card 2: Amazon */}
            <div className="absolute right-24 top-2 w-36 h-48 rounded-2xl bg-gradient-to-b from-[#252321] to-[#151413] border border-amber-800/40 shadow-2xl p-4 transform -rotate-3 flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg bg-amber-900/40 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">a</div>
              <div className="space-y-1.5">
                <div className="w-16 h-2 rounded bg-[#EA5D3A]/60" />
                <div className="w-10 h-1.5 rounded bg-zinc-800" />
              </div>
            </div>

            {/* Stack Card 1: Google */}
            <div className="absolute right-36 top-0 w-38 h-50 rounded-2xl bg-gradient-to-b from-[#2a2422] to-[#161312] border border-[#EA5D3A]/50 shadow-2xl p-4 transform -rotate-12 flex flex-col justify-between ring-1 ring-[#EA5D3A]/30">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-red-500 font-extrabold text-base">G</div>
              <div className="space-y-2">
                <div className="w-20 h-2.5 rounded bg-gradient-to-r from-[#EA5D3A] to-[#F97316]" />
                <div className="w-12 h-1.5 rounded bg-zinc-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Category Filter Tabs Row matching Reference UI ── */}
      <div className="bg-[#0E0E0E] border border-[#1F1F1F] rounded-2xl p-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {FILTER_TABS.map((tab, idx) => {
          if (tab.id === 'DIVIDER') {
            return <div key={`div-${idx}`} className="h-5 w-[1px] bg-[#262626] mx-1 flex-shrink-0" />;
          }

          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'bg-[#1C1C1C] border border-[#EA5D3A]/70 text-[#FAFAFA] shadow-md shadow-[#EA5D3A]/10 font-bold'
                  : 'text-[#8A8A85] hover:text-[#FAFAFA] hover:bg-[#171717]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
        <button className="px-3 py-2 rounded-xl text-xs font-medium text-[#8A8A85] hover:text-white flex items-center gap-1 ml-auto flex-shrink-0">
          <span>More</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── 3. Search & Sort Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A85]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company or role..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#0E0E0E] border border-[#1F1F1F] rounded-2xl text-xs text-[#FAFAFA] placeholder-[#8A8A85] focus:outline-none focus:border-[#EA5D3A] focus:ring-1 focus:ring-[#EA5D3A] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-zinc-800 text-[#8A8A85] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-[#8A8A85] font-medium whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#0E0E0E] border border-[#1F1F1F] text-xs font-semibold text-[#FAFAFA] rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-[#EA5D3A] cursor-pointer"
          >
            <option value="popularity">Popularity</option>
            <option value="problems">Most Problems</option>
            <option value="tracks">Most Tracks</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Target Interview Timeline Widget */}
      <InterviewTimelineTracker totalTrackProblems={100} solvedCount={0} />

      {/* ── 4. 4-Column Companies Cards Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="h-44 rounded-2xl bg-[#0E0E0E] border border-[#1F1F1F] animate-pulse p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-800/60" />
                <div className="space-y-2 flex-1">
                  <div className="w-24 h-4 rounded bg-zinc-800/60" />
                  <div className="w-16 h-3 rounded bg-zinc-800/40" />
                </div>
              </div>
              <div className="h-8 rounded-xl bg-zinc-800/30 mt-6" />
            </div>
          ))}
        </div>
      ) : processedCompanies.length === 0 ? (
        <div className="text-center py-16 bg-[#0E0E0E] border border-[#1F1F1F] rounded-3xl p-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#EA5D3A]/10 border border-[#EA5D3A]/20 text-[#EA5D3A] flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#FAFAFA]">No Companies Found</h3>
          <p className="text-xs text-[#8A8A85] max-w-sm mx-auto">
            We couldn't find any company matching "{searchQuery}". Try adjusting your search query or tab filters.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedTab('ALL'); }}
            className="px-4 py-2 bg-[#EA5D3A] hover:bg-[#F2633F] text-white rounded-xl text-xs font-bold transition-all shadow-md mt-2 inline-flex items-center gap-1.5"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {processedCompanies.map((comp) => {
            const trackCount = comp.company_tracks?.length || 3;
            const problemCount = (comp.company_tracks || []).reduce((acc, t) => acc + (t.roadmap?.problems_count || 15), 0);

            return (
              <motion.div
                key={comp.id}
                variants={cardVariants}
                onClick={() => {
                  const firstTrackId = comp.company_tracks?.[0]?.id || 'default';
                  navigate(`/company/${comp.slug}/${firstTrackId}`);
                }}
                className="group relative rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between p-5 bg-[#131313] border border-[#1F1F1F] hover:border-[#EA5D3A]/60 hover:shadow-xl hover:shadow-[#EA5D3A]/10 hover:-translate-y-0.5"
              >
                {/* Card Header: Logo + Name + Tagline */}
                <div className="flex items-center gap-3.5">
                  {/* Logo Container */}
                  <div className="w-12 h-12 rounded-2xl bg-[#0A0A0A] border border-[#1F1F1F] p-2 flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:border-[#EA5D3A]/40 transition-all flex-shrink-0">
                    {comp.logo_url ? (
                      <img
                        src={comp.logo_url}
                        alt={comp.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full items-center justify-center font-extrabold text-[#EA5D3A] text-sm hidden">
                      {comp.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-extrabold text-[#FAFAFA] truncate group-hover:text-[#EA5D3A] transition-colors">
                      {comp.name}
                    </h3>
                    <p className="text-xs text-[#8A8A85] font-medium truncate mt-0.5">
                      Intern, Campus & SDE
                    </p>
                  </div>
                </div>

                {/* Card Footer: Problem & Track Stats + Action Circle Arrow */}
                <div className="pt-4 mt-4 border-t border-[#1F1F1F] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-[#FAFAFA] font-mono leading-none">
                        {problemCount}
                      </p>
                      <p className="text-[10px] text-[#8A8A85] font-medium mt-0.5">
                        Problems
                      </p>
                    </div>

                    <div className="h-6 w-[1px] bg-[#1F1F1F]" />

                    <div>
                      <p className="text-xs font-extrabold text-[#FAFAFA] font-mono leading-none">
                        {trackCount}
                      </p>
                      <p className="text-[10px] text-[#8A8A85] font-medium mt-0.5">
                        Tracks
                      </p>
                    </div>
                  </div>

                  {/* Circle Action Button ( → ) */}
                  <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#262626] text-[#8A8A85] group-hover:bg-[#EA5D3A] group-hover:border-[#EA5D3A] group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default CompaniesGrid;

