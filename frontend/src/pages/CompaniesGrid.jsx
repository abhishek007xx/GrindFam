import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { companiesData } from '../lib/dataFallback';
import { useAuth } from '../context/AuthContext';
import { getCompanyLogoUrl } from '../lib/iconHelper';
import {
  Building2, Search, ArrowRight, CheckCircle2,
  BookOpen
} from 'lucide-react';

const sanitizeSlug = (s) => (s || '').toLowerCase().replace(/--+/g, '-').trim();

function ProgressRing({ percentage = 0, size = 56, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#21262D" strokeWidth={strokeWidth} fill="transparent"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#10B981" strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-semibold text-[#F3F4F6] font-mono">
        {percentage}%
      </span>
    </div>
  );
}

export function CompaniesGrid() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [companies, setCompanies] = useState([]);
  const [companyStats, setCompanyStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    async function fetchCompaniesAndProgress() {
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

        let rawCompanies = data || [];
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

        const stats = {};
        const solvedMap = {};

        if (user) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('problem_id, problems(source_id)')
            .eq('user_id', user.id)
            .eq('status', 'solved');

          if (progressData) {
            progressData.forEach(item => {
              const srcId = item.problems?.source_id;
              if (srcId) {
                solvedMap[srcId] = (solvedMap[srcId] || 0) + 1;
              }
            });
          }
        }

        activeCompanies.forEach(comp => {
          const totalProblems = (comp.company_tracks || []).reduce((acc, t) => acc + (t.roadmap?.problems_count || 15), 0);
          const solved = (comp.company_tracks || []).reduce((acc, t) => acc + (solvedMap[t.id] || 0), 0);
          const percentage = totalProblems > 0 ? Math.round((solved / totalProblems) * 100) : 0;
          stats[comp.id] = { total: totalProblems, solved, percentage, tracksCount: comp.company_tracks?.length || 3 };
        });

        setCompanyStats(stats);
      } catch (err) {
        console.warn('Error fetching companies.', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompaniesAndProgress();
  }, [user]);

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.slug.toLowerCase().includes(searchQuery.toLowerCase());
    if (roleFilter === 'ALL') return matchesSearch;
    const hasRole = c.company_tracks?.some(t =>
      t.role.toLowerCase().includes(roleFilter.toLowerCase()) ||
      t.level?.toLowerCase().includes(roleFilter.toLowerCase())
    );
    return matchesSearch && hasRole;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-lg bg-[#161B22] border border-[#30363D] p-6 md:p-8">
        <img
          src="/logo.png"
          alt="GrindFam Mascot"
          className="absolute -bottom-8 -right-8 w-44 h-44 object-contain opacity-[0.05] grayscale pointer-events-none select-none"
        />
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#1F2937] border border-[#30363D] text-[#9CA3AF] text-xs font-medium">
            <Building2 className="w-3.5 h-3.5 text-[#EA5D3A]" />
            <span>Popularity Ranked Company Prep Kits</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F3F4F6] tracking-tight">
            Company DSA Tracks
          </h1>
          <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed">
            Targeted prep kits for Internships, Campus Placements, and Senior Hiring across Google, Meta, Amazon, Microsoft, Netflix, Apple & more!
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search companies or tracks..."
            className="w-full pl-10 pr-4 py-2 bg-[#161B22] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Roles' },
            { id: 'Intern', label: 'Intern Track' },
            { id: 'Campus', label: 'Campus Placement' },
            { id: 'Senior', label: 'Senior Level' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setRoleFilter(filter.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${
                roleFilter === filter.id
                  ? 'bg-[#1F2937] text-white border-[#EA5D3A] shadow-sm font-semibold'
                  : 'bg-[#161B22] text-[#9CA3AF] border-[#30363D] hover:text-white hover:border-[#4B5563]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View with Company Logos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-50 rounded-lg bg-[#161B22]/50 border border-[#30363D] animate-pulse p-5 space-y-3" />
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12 bg-[#161B22] border border-[#30363D] rounded-lg p-6 space-y-2">
          <Building2 className="w-10 h-10 text-[#6B7280] mx-auto" />
          <h3 className="text-sm font-semibold text-[#F3F4F6]">No Companies Found</h3>
          <p className="text-xs text-[#9CA3AF]">Try adjusting your search query or role filter.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredCompanies.map((comp, idx) => {
            const stats = companyStats[comp.id] || {
              total: (comp.company_tracks || []).reduce((acc, t) => acc + (t.roadmap?.problems_count || 15), 0),
              solved: 0,
              percentage: 0,
              tracksCount: comp.company_tracks?.length || 3
            };
            const logoUrl = getCompanyLogoUrl(comp.name, comp.logo_url);

            return (
              <motion.div
                key={comp.id}
                variants={cardVariants}
                onClick={() => {
                  const firstTrackId = comp.company_tracks?.[0]?.id || 'default';
                  navigate(`/company/${comp.slug}/${firstTrackId}`);
                }}
                className="group relative bg-[#161B22] border border-[#30363D] hover:border-[#4B5563] rounded-lg p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 pr-2">
                      {/* Company Logo Icon Box */}
                      <div className="w-11 h-11 rounded-lg bg-[#1F2937] border border-[#30363D] p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform bg-white/5">
                        <img
                          src={logoUrl}
                          alt={comp.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-full h-full items-center justify-center font-bold text-[#EA5D3A] text-xs hidden">
                          {comp.name.slice(0, 2).toUpperCase()}
                        </div>
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <span className="px-2 py-0.5 rounded bg-[#1F2937] border border-[#30363D] text-[#9CA3AF] text-[10px] font-medium">
                          #{idx + 1} Company
                        </span>
                        <h3 className="text-base font-bold text-[#F3F4F6] group-hover:text-[#EA5D3A] transition-colors leading-snug truncate">
                          {comp.name}
                        </h3>
                        <p className="text-xs text-[#9CA3AF] flex items-center gap-1 font-mono">
                          <span>Intern, Campus & SDE</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 group-hover:scale-105 transition-transform">
                      <ProgressRing percentage={stats.percentage} size={56} strokeWidth={5} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#21262D] flex items-center justify-between text-xs text-[#9CA3AF]">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#6B7280]" />
                      <span>{stats.total} Problems</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-[#10B981]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{stats.tracksCount} Tracks</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 flex items-center justify-between text-xs font-semibold text-[#EA5D3A] group-hover:translate-x-0.5 transition-transform">
                  <span>Open Company Track</span>
                  <ArrowRight className="w-4 h-4" />
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
