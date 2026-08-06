import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { companiesData } from '../lib/dataFallback';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import InterviewTimelineTracker from '../components/InterviewTimelineTracker';
import { Building2, Search, ArrowRight, Sparkles, Layers, Flame, GraduationCap, Award, Briefcase } from 'lucide-react';

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

        // Sort by Popularity Rank Ascending
        activeCompanies.sort((a, b) => (a.popularity_rank ?? 999) - (b.popularity_rank ?? 999));
        setCompanies(activeCompanies);
      } catch (err) {
        console.warn('Error fetching companies. Loading popularity ranked fallback dataset.', err);
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
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="page-shell">
      <Sidebar activeSection="companies" />

      <div className="page-content">
        <Navbar />

        <main className="page-main-constrained space-y-8 animate-fadeIn">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-[#0d1117] border border-[#30363d] p-8 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Building2 className="w-64 h-64 text-indigo-400" />
            </div>
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ranked by Hiring Popularity & Role Level</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Company DSA Tracks by Role Level
              </h1>
              <p className="text-sm text-[#8b949e] leading-relaxed">
                Tailored kits for <strong>Internships</strong>, <strong>Campus Placements</strong>, and <strong>Senior/Lateral Hiring</strong> across Google, Amazon, Microsoft, Meta, Apple, Uber, Netflix & 90+ tech giants.
              </p>
            </div>
          </div>

          {/* 🎯 Interview Timeline Tracker Banner */}
          <InterviewTimelineTracker totalTrackProblems={100} solvedCount={0} />

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies by name or slug..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#161b22] border border-[#30363d] rounded-xl text-sm text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', label: 'All Roles', icon: null },
                { id: 'Intern', label: '🎓 Intern Track', icon: GraduationCap },
                { id: 'Campus', label: '🚀 Campus Placement', icon: Award },
                { id: 'Senior', label: '💼 Senior Level', icon: Briefcase }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedRoleFilter(filter.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedRoleFilter === filter.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/30'
                      : 'bg-[#161b22] text-[#8b949e] border border-[#30363d] hover:text-white hover:border-[#484f58]'
                  }`}
                >
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid View */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <div key={n} className="h-64 rounded-2xl bg-[#161b22]/50 border border-[#30363d] animate-pulse p-6 space-y-4" />
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-16 bg-[#161b22]/30 border border-[#30363d] rounded-2xl p-8 space-y-3">
              <Building2 className="w-12 h-12 text-[#6e7681] mx-auto" />
              <h3 className="text-base font-semibold text-white">No Companies Found</h3>
              <p className="text-xs text-[#8b949e]">Try adjusting your search query or role filter.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredCompanies.map((comp, idx) => {
                const isTopCompany = idx < 5;

                return (
                  <motion.div
                    key={comp.id}
                    variants={cardVariants}
                    onClick={() => {
                      const firstTrackId = comp.company_tracks?.[0]?.id || 'default';
                      navigate(`/company/${comp.slug}/${firstTrackId}`);
                    }}
                    className="group relative bg-[#0d1117]/80 backdrop-blur border border-[#30363d] hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-[#161b22] border border-[#30363d] p-2 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                          {comp.logo_url ? (
                            <img
                              src={comp.logo_url}
                              alt={comp.name}
                              className="w-full h-full object-contain filter drop-shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                  e.currentTarget.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full items-center justify-center font-bold text-indigo-400 text-lg hidden"
                          >
                            {comp.name.slice(0, 2).toUpperCase()}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isTopCompany && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-500" />
                              Top Tech
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-[11px] font-semibold text-[#8b949e] flex items-center gap-1">
                            <Layers className="w-3 h-3 text-indigo-400" />
                            {comp.company_tracks?.length || 3} Tracks
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                          <span>{comp.name}</span>
                          <ArrowRight className="w-4 h-4 text-[#6e7681] group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                        </h3>
                        <p className="text-xs text-[#8b949e] font-mono mt-0.5">/{comp.slug}</p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#21262d] flex items-center justify-between text-xs">
                      <span className="text-[#8b949e] text-[11px]">🎓 Intern, 🚀 Campus, 💼 Senior</span>
                      <span className="font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Explore Tracks →
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CompaniesGrid;
