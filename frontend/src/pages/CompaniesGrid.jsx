import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { companiesData } from '../lib/dataFallback';
import InterviewTimelineTracker from '../components/InterviewTimelineTracker';
import { Building2, Search, ArrowRight, GraduationCap, Award, Briefcase } from 'lucide-react';

const sanitizeSlug = (s) => (s || '').toLowerCase().replace(/--+/g, '-').trim();

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
      {/* 1. Header Typography */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">Company DSA Tracks</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Targeted prep kits for Internships, Campus Placements, and Senior Hiring across top tech companies.
        </p>
      </div>

      {/* Target Interview Countdown Widget */}
      <InterviewTimelineTracker totalTrackProblems={100} solvedCount={0} />

      {/* Search & Codolio Filter Pills */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search companies..."
            className="w-full pl-10 pr-4 py-2 bg-[#121318] border border-zinc-800/80 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#EA5D3A] transition-all"
          />
        </div>

        {/* 3. Codolio Minimal Rounded-Full Category Filter Pills */}
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedRoleFilter === filter.id
                  ? 'bg-zinc-100 text-zinc-900 border border-white font-semibold shadow-sm'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {filter.icon && <filter.icon className={`w-3.5 h-3.5 ${selectedRoleFilter === filter.id ? 'text-zinc-900' : 'text-zinc-400'}`} />}
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Codolio Sleek Zinc Surface Cards (#121318, rounded-2xl) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="h-52 rounded-2xl bg-[#121318]/50 border border-zinc-800/80 animate-pulse p-4 space-y-3" />
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12 bg-[#121318] border border-zinc-800/80 rounded-2xl p-6 space-y-2">
          <Building2 className="w-10 h-10 text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-100">No Companies Found</h3>
          <p className="text-xs text-zinc-400">Try adjusting your search query or role filter.</p>
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
                className={`group relative rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between p-5 bg-[#121318] border border-zinc-800/80 hover:border-zinc-700 ${
                  isFeatured ? 'md:col-span-2' : ''
                }`}
              >
                <div className="space-y-3">
                  {isFeatured && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
                        Featured Target Track
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 p-2 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform flex-shrink-0">
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

                    <div className="text-right">
                      <p className="text-[11px] font-medium text-zinc-400">
                        {isTopCompany ? 'Top Tech' : 'Tech Giant'} • {comp.company_tracks?.length || 3} Tracks
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-[#EA5D3A] transition-colors flex items-center justify-between">
                      <span>{comp.name}</span>
                      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#EA5D3A] group-hover:translate-x-0.5 transition-all" />
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">/{comp.slug}</p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 text-[11px]">Intern, Campus, Senior</span>
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
