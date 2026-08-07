import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { companiesData } from '../lib/dataFallback';
import InterviewTimelineTracker from '../components/InterviewTimelineTracker';
import { Building2, Search, ArrowRight, GraduationCap, Award, Briefcase } from 'lucide-react';

export function CompaniesGrid() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

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

        let activeCompanies = data;
        if (error || !data || data.length === 0) {
          activeCompanies = companiesData.map((c, cIdx) => ({
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
          activeCompanies = activeCompanies.map(c => ({
            ...c,
            popularity_rank: localMap.get(c.slug) ?? 999
          }));
        }

        activeCompanies.sort((a, b) => (a.popularity_rank ?? 999) - (b.popularity_rank ?? 999));
        setCompanies(activeCompanies);
      } catch (err) {
        console.warn('Error fetching companies. Loading fallback dataset.', err);
        const fallbackList = companiesData.map((c, cIdx) => ({
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
        })).sort((a, b) => (a.popularity_rank ?? 999) - (b.popularity_rank ?? 999));
        setCompanies(fallbackList);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.slug.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedRoleFilter === 'ALL') return matchesSearch;
    const hasRole = c.company_tracks?.some(t => t.role.toLowerCase().includes(selectedRoleFilter.toLowerCase()) || t.level?.toLowerCase().includes(selectedRoleFilter.toLowerCase()));
    return matchesSearch && hasRole;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Hero Banner — Pitch Black (#09090B) with Dot Grid & Subtle Orange Radial Blur */}
      <div className="relative overflow-hidden rounded-lg bg-[#121212] border border-[#27272A] border-t border-white/10 p-6 md:p-8 dot-grid-bg">
        {/* Subtle Radial Glow in Corner (5-8% opacity) */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#EA5D3A]/[0.06] blur-3xl pointer-events-none" />

        <img
          src="/logo.png"
          alt="GrindFam Mascot"
          className="absolute -bottom-8 -right-8 w-44 h-44 object-contain opacity-[0.04] grayscale pointer-events-none select-none"
        />

        <div className="relative z-10 max-w-2xl space-y-2.5">
          {/* Neutral Dark Pill Badge */}
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#27272A] border border-[#3F3F46] text-[#A1A1AA] text-xs font-medium">
            <Building2 className="w-3.5 h-3.5 text-[#EA5D3A]" />
            <span>Hiring Popularity Tracks</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F4F4F5] tracking-tight">
            Company DSA Tracks
          </h1>
          <p className="text-xs md:text-sm text-[#A1A1AA] leading-relaxed">
            Targeted prep kits for <strong>Internships</strong>, <strong>Campus Placements</strong>, and <strong>Senior Hiring</strong> across Google, Amazon, Microsoft, Meta & top tech companies.
          </p>
        </div>
      </div>

      {/* 2. Target Interview Countdown (Urgent Target Section) */}
      <InterviewTimelineTracker totalTrackProblems={100} solvedCount={0} />

      {/* 3. Search & Neutral Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search companies..."
            className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#27272A] rounded-md text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#EA5D3A] transition-all"
          />
        </div>

        {/* Filter Pills — Neutral Dark Background (#27272A) + Light Gray Text (#A1A1AA) */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Roles', icon: null },
            { id: 'Intern', label: 'Intern Track', icon: GraduationCap },
            { id: 'Campus', label: 'Campus Placement', icon: Award },
            { id: 'Senior', label: 'Senior Level', icon: Briefcase }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedRoleFilter(filter.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                selectedRoleFilter === filter.id
                  ? 'bg-[#27272A] text-white border-[#EA5D3A] shadow-sm'
                  : 'bg-[#121212] text-[#A1A1AA] border-[#27272A] hover:text-white hover:border-[#3F3F46]'
              }`}
            >
              {filter.icon && <filter.icon className="w-3.5 h-3.5" />}
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Company Cards Grid — #18181B Cards with #27272A Borders & Top 3D Stroke Highlight */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="h-52 rounded-lg bg-[#18181B]/50 border border-[#27272A] animate-pulse p-4 space-y-3" />
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12 bg-[#121212] border border-[#27272A] rounded-lg p-6 space-y-2">
          <Building2 className="w-10 h-10 text-[#71717A] mx-auto" />
          <h3 className="text-sm font-semibold text-[#F4F4F5]">No Companies Found</h3>
          <p className="text-xs text-[#A1A1AA]">Try adjusting your search query or role filter.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredCompanies.map((comp, idx) => {
            const isFeatured = idx === 0 && selectedRoleFilter === 'ALL';
            const isTopCompany = idx < 5;

            return (
              <motion.div
                key={comp.id}
                variants={cardVariants}
                onClick={() => {
                  const firstTrackId = comp.company_tracks?.[0]?.id || 'default';
                  navigate(`/company/${comp.slug}/${firstTrackId}`);
                }}
                className={`group relative rounded-lg transition-all duration-200 cursor-pointer flex flex-col justify-between p-5 bg-[#18181B] border border-[#27272A] border-t border-white/10 hover:border-[#3F3F46] ${
                  isFeatured ? 'md:col-span-2 ring-1 ring-[#EA5D3A]/30' : ''
                }`}
              >
                <div className="space-y-3">
                  {/* Neutral Dark Badge for Featured Card */}
                  {isFeatured && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#27272A] text-[#A1A1AA] border border-[#3F3F46]">
                        Featured Target Track
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    {/* Real Company Brand Logo */}
                    <div className="w-10 h-10 rounded-md bg-[#27272A] border border-[#3F3F46] p-2 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform flex-shrink-0">
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
                      <div className="w-full h-full items-center justify-center font-bold text-[#EA5D3A] text-xs hidden">
                        {comp.name.slice(0, 2).toUpperCase()}
                      </div>
                    </div>

                    {/* Compact Meta-Line */}
                    <div className="text-right">
                      <p className="text-[11px] font-medium text-[#A1A1AA]">
                        {isTopCompany ? 'Top Tech' : 'Tech Giant'} • {comp.company_tracks?.length || 3} Tracks
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#F4F4F5] group-hover:text-[#EA5D3A] transition-colors flex items-center justify-between">
                      <span>{comp.name}</span>
                      <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#EA5D3A] group-hover:translate-x-0.5 transition-all" />
                    </h3>
                    <p className="text-[11px] text-[#71717A] font-mono mt-0.5">/{comp.slug}</p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#27272A] flex items-center justify-between text-xs">
                  <span className="text-[#71717A] text-[11px]">Intern, Campus, Senior</span>
                  <span className="font-medium text-[#EA5D3A] group-hover:translate-x-0.5 transition-transform text-[11px] flex items-center gap-1">
                    Explore →
                  </span>
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
