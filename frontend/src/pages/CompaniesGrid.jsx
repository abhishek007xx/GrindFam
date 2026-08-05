import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { companiesData } from '../lib/dataFallback';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Building2, Search, ArrowRight, Sparkles, Layers } from 'lucide-react';

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
        // Try fetching from Supabase
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

        if (error || !data || data.length === 0) {
          console.warn('Supabase empty or unreachable. Using local dataset fallback.');
          // Map local JSON data
          const fallbackList = companiesData.map((c, cIdx) => ({
            id: `local-comp-${c.slug}`,
            name: c.company_name,
            slug: c.slug,
            logo_url: c.logo_url,
            company_tracks: c.roles.map((r, rIdx) => ({
              id: `${c.slug}-track-${rIdx}`,
              role: r.role_name,
              level: r.level,
              roadmap: { problems_count: r.problems ? r.problems.length : 0 }
            }))
          }));
          setCompanies(fallbackList);
        } else {
          setCompanies(data);
        }
      } catch (err) {
        console.warn('Error connecting to Supabase. Loading fallback companies dataset.', err);
        const fallbackList = companiesData.map((c, cIdx) => ({
          id: `local-comp-${c.slug}`,
          name: c.company_name,
          slug: c.slug,
          logo_url: c.logo_url,
          company_tracks: c.roles.map((r, rIdx) => ({
            id: `${c.slug}-track-${rIdx}`,
            role: r.role_name,
            level: r.level,
            roadmap: { problems_count: r.problems ? r.problems.length : 0 }
          }))
        }));
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
    const hasRole = c.company_tracks?.some(t => t.role.toLowerCase().includes(selectedRoleFilter.toLowerCase()));
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
    <div className="min-h-screen bg-[#090d11] text-[#e6edf3] font-sans">
      <Sidebar activeSection="companies" />

      <div className="pl-[240px]">
        <Navbar />

        <main className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-[#0d1117] border border-[#30363d] p-8 shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Building2 className="w-64 h-64 text-indigo-400" />
            </div>
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Targeted Interview Prep</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Company DSA Tracks
              </h1>
              <p className="text-sm text-[#8b949e] leading-relaxed">
                Curated problem sets and exact interview guidelines for top tech companies & Indian placement recruiters. Practice role-specific DSA roadmaps tailored to SDE-1, SDE-2, and Senior roles.
              </p>
            </div>
          </div>

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
              {['ALL', 'SDE-1', 'SDE-2', 'Senior', 'Backend'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedRoleFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedRoleFilter === filter
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/30'
                      : 'bg-[#161b22] text-[#8b949e] border border-[#30363d] hover:text-white hover:border-[#484f58]'
                  }`}
                >
                  {filter === 'ALL' ? 'All Roles' : filter}
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
              {filteredCompanies.map(comp => (
                <motion.div
                  key={comp.id}
                  variants={cardVariants}
                  className="group relative bg-[#0d1117]/80 backdrop-blur border border-[#30363d] hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between"
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

                      <span className="px-2.5 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-[11px] font-semibold text-[#8b949e] flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        {comp.company_tracks?.length || 0} Tracks
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {comp.name}
                      </h3>
                      <p className="text-xs text-[#8b949e] font-mono mt-0.5">/{comp.slug}</p>
                    </div>

                    {/* Roles List */}
                    <div className="space-y-2 pt-2 border-t border-[#21262d]">
                      <span className="text-[11px] font-semibold text-[#6e7681] uppercase tracking-wider block">
                        Available Tracks:
                      </span>

                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {comp.company_tracks && comp.company_tracks.length > 0 ? (
                          comp.company_tracks.map(track => (
                            <div
                              key={track.id}
                              onClick={() => navigate(`/company/${comp.slug}/${track.id}`)}
                              className="p-2.5 rounded-xl bg-[#161b22] hover:bg-indigo-600/10 border border-[#30363d] hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between group/track"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="text-xs font-semibold text-[#e6edf3] group-hover/track:text-indigo-400 truncate">
                                  {track.role}
                                </p>
                                <p className="text-[10px] text-[#8b949e]">
                                  {track.level}
                                </p>
                              </div>

                              <ArrowRight className="w-3.5 h-3.5 text-[#6e7681] group-hover/track:text-indigo-400 group-hover/track:translate-x-0.5 transition-all flex-shrink-0" />
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-[#6e7681] italic">General Track</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CompaniesGrid;
