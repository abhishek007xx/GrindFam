import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { companiesData } from '../lib/dataFallback';
import InterviewTimelineTracker from '../components/InterviewTimelineTracker';
import {
  Building2, Search, ArrowRight, GraduationCap, Award, Briefcase,
  Flame, Sparkles, X, CheckCircle2, TrendingUp, Target, Zap, ChevronRight, Layers, Star
} from 'lucide-react';

const sanitizeSlug = (s) => (s || '').toLowerCase().replace(/--+/g, '-').trim();

// Featured top tech shortcuts for fast filtering
const POPULAR_COMPANIES = [
  { name: 'Meta', slug: 'meta', icon: '⚡' },
  { name: 'Google', slug: 'google', icon: '🔥' },
  { name: 'Amazon', slug: 'amazon', icon: '💎' },
  { name: 'Microsoft', slug: 'microsoft', icon: '🚀' },
  { name: 'Apple', slug: 'apple', icon: '🍎' },
  { name: 'Uber', slug: 'uber', icon: '🚕' },
  { name: 'Netflix', slug: 'netflix', icon: '🎬' }
];

export function CompaniesGrid() {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedFastCompany, setSelectedFastCompany] = useState(null);

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
            name: c.company_name,
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

  const handleFastCompanyClick = (slug) => {
    if (selectedFastCompany === slug) {
      setSelectedFastCompany(null);
      setSearchQuery('');
    } else {
      setSelectedFastCompany(slug);
      setSearchQuery(slug);
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.slug.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedRoleFilter === 'ALL') return matchesSearch;
    const hasRole = c.company_tracks?.some(t => t.role.toLowerCase().includes(selectedRoleFilter.toLowerCase()) || t.level?.toLowerCase().includes(selectedRoleFilter.toLowerCase()));
    return matchesSearch && hasRole;
  });

  const totalProblemsCount = companies.reduce((acc, comp) => {
    const compTotal = (comp.company_tracks || []).reduce((tAcc, t) => tAcc + (t.roadmap?.problems_count || 15), 0);
    return acc + compTotal;
  }, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* ── 1. Hero Header with Warm Orangish Accent Theme ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b1715] via-[#141211] to-[#0d0c0c] border border-[#EA5D3A]/25 p-6 md:p-8 shadow-2xl shadow-black/60">
        {/* Glow Spheres */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#EA5D3A]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 text-[#EA5D3A] text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span>Targeted Company Prep Kits</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Master Top Tech <span className="bg-gradient-to-r from-[#EA5D3A] via-[#F97316] to-[#FF5722] bg-clip-text text-transparent">Company Tracks</span>
            </h1>

            <p className="text-zinc-300 text-sm leading-relaxed">
              Curated problem roadmaps tagged by frequency for <strong className="text-white">Internships</strong>, <strong className="text-white">Campus Placements</strong>, and <strong className="text-white">Senior Hiring</strong> at Meta, Google, Amazon, Microsoft, Netflix, & Apple.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 bg-[#0d0c0c]/80 border border-[#EA5D3A]/20 p-4 rounded-2xl flex-shrink-0 backdrop-blur-md">
            <div className="text-center px-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Companies</p>
              <p className="text-xl font-extrabold text-white font-mono mt-0.5">{companies.length || 24}</p>
              <span className="text-[9px] text-[#EA5D3A] font-semibold">Tier-1 Tech</span>
            </div>
            <div className="text-center px-2 border-x border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">DSA Tracks</p>
              <p className="text-xl font-extrabold font-mono text-[#F97316] mt-0.5">
                {companies.reduce((acc, c) => acc + (c.company_tracks?.length || 3), 0)}
              </p>
              <span className="text-[9px] text-zinc-400">Curated Kits</span>
            </div>
            <div className="text-center px-2">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">High-Freq</p>
              <p className="text-xl font-extrabold text-white font-mono mt-0.5">{totalProblemsCount || '500+'}</p>
              <span className="text-[9px] text-emerald-400 font-semibold">Tagged Problems</span>
            </div>
          </div>
        </div>

        {/* Top Tier Company Quick Ribbon */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-[#EA5D3A]" /> Quick Target:
          </span>
          {POPULAR_COMPANIES.map(item => {
            const isSelected = selectedFastCompany === item.slug;
            return (
              <button
                key={item.slug}
                onClick={() => handleFastCompanyClick(item.slug)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  isSelected
                    ? 'bg-[#EA5D3A] text-white shadow-lg shadow-[#EA5D3A]/30 border border-[#FF5722]'
                    : 'bg-[#181514] border border-zinc-800 text-zinc-300 hover:text-white hover:border-[#EA5D3A]/50 hover:bg-[#EA5D3A]/10'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Interview Timeline Widget */}
      <InterviewTimelineTracker totalTrackProblems={100} solvedCount={0} />

      {/* ── 2. Search & Role Filter Navigation ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#121110] p-4 rounded-2xl border border-zinc-800/80 shadow-lg">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (selectedFastCompany) setSelectedFastCompany(null);
            }}
            placeholder="Search company or track name... (Press '/' to focus)"
            className="w-full pl-10 pr-9 py-2 bg-[#1b1817] border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#EA5D3A] focus:ring-1 focus:ring-[#EA5D3A] transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => { setSearchQuery(''); setSelectedFastCompany(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
              /
            </span>
          )}
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Roles', icon: Layers },
            { id: 'Intern', label: 'Intern Track', icon: GraduationCap },
            { id: 'Campus', label: 'Campus Placement', icon: Award },
            { id: 'Senior', label: 'Senior Level', icon: Briefcase }
          ].map(filter => {
            const isActive = selectedRoleFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedRoleFilter(filter.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#EA5D3A] to-[#F97316] text-white shadow-lg shadow-[#EA5D3A]/25 border border-[#FF5722]'
                    : 'bg-[#181514] border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
                }`}
              >
                <filter.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Companies Cards Grid Section ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="h-56 rounded-2xl bg-[#141211]/60 border border-zinc-800/80 animate-pulse p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-zinc-800/50" />
                <div className="w-20 h-4 rounded bg-zinc-800/50" />
              </div>
              <div className="space-y-2">
                <div className="w-32 h-5 rounded bg-zinc-800/50" />
                <div className="w-20 h-3 rounded bg-zinc-800/50" />
              </div>
              <div className="h-8 rounded-xl bg-zinc-800/40 mt-4" />
            </div>
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-16 bg-[#141211] border border-zinc-800/80 rounded-3xl p-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#EA5D3A]/10 border border-[#EA5D3A]/20 text-[#EA5D3A] flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-zinc-100">No Companies Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            We couldn't find any company matching "{searchQuery}". Try clearing filters or searching for another tech giant.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedRoleFilter('ALL'); setSelectedFastCompany(null); }}
            className="px-4 py-2 bg-[#EA5D3A] hover:bg-[#F97316] text-white rounded-xl text-xs font-bold transition-all shadow-md mt-2 inline-flex items-center gap-1.5"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredCompanies.map((comp, idx) => {
            const isFeatured = idx === 0 && selectedRoleFilter === 'ALL' && !searchQuery;
            const isTopTier = idx < 5;
            const trackCount = comp.company_tracks?.length || 3;

            return (
              <motion.div
                key={comp.id}
                variants={cardVariants}
                onClick={() => {
                  const firstTrackId = comp.company_tracks?.[0]?.id || 'default';
                  navigate(`/company/${comp.slug}/${firstTrackId}`);
                }}
                className={`group relative rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between p-5 bg-gradient-to-b from-[#161413] via-[#121010] to-[#0e0d0d] border border-zinc-800/90 hover:border-[#EA5D3A]/60 hover:shadow-xl hover:shadow-[#EA5D3A]/10 ${
                  isFeatured ? 'md:col-span-2 border-[#EA5D3A]/40 bg-gradient-to-br from-[#1e1917] via-[#141110] to-[#0d0c0c]' : ''
                }`}
              >
                {/* Top Badge */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    {/* Logo Box */}
                    <div className="w-12 h-12 rounded-2xl bg-[#1b1817] border border-zinc-800 p-2 flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:border-[#EA5D3A]/50 transition-all flex-shrink-0 shadow-md">
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

                    <div className="text-right flex flex-col items-end">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isTopTier
                          ? 'bg-[#EA5D3A]/15 text-[#EA5D3A] border border-[#EA5D3A]/30'
                          : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/50'
                      }`}>
                        {isTopTier ? '🔥 FAANG Tier' : 'Tech Giant'}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono mt-1">
                        {trackCount} Track{trackCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Company Name & Slug */}
                  <div>
                    <h3 className="text-lg font-extrabold text-white group-hover:text-[#EA5D3A] transition-colors flex items-center justify-between">
                      <span>{comp.name}</span>
                      <div className="w-7 h-7 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-[#EA5D3A]/40 group-hover:bg-[#EA5D3A]/10 text-zinc-400 group-hover:text-[#EA5D3A] flex items-center justify-center transition-all">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1">
                      <span>/{comp.slug}</span>
                    </p>
                  </div>
                </div>

                {/* Bottom Footer Info */}
                <div className="pt-4 mt-4 border-t border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#EA5D3A]" />
                      <span className="text-zinc-400 text-[11px] font-medium">Intern, Campus & Senior</span>
                    </div>
                    <span className="font-bold text-[#EA5D3A] group-hover:translate-x-1 transition-transform text-xs flex items-center gap-1">
                      Explore Prep <ChevronRight className="w-3.5 h-3.5" />
                    </span>
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

