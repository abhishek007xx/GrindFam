import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  Briefcase, ExternalLink, Github, Globe, Code2,
  Award, GraduationCap, Star, Calendar, Building2,
  MapPin, Flame, Swords, ShieldCheck
} from 'lucide-react';
import useStreakEngine from '../hooks/useStreakEngine';
import useArenaMatchmaking from '../hooks/useArenaMatchmaking';

function TagBadge({ text, color = 'orange' }) {
  const colorMap = {
    orange: 'bg-[#EA5D3A]/15 text-[#EA5D3A] border-[#EA5D3A]/30',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${colorMap[color]}`}>
      {text}
    </span>
  );
}

export default function PublicPortfolio() {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);

  // Stats are fetched once we have the user_id
  const streakEngine = useStreakEngine(profile?.id);
  const arenaMatchmaking = useArenaMatchmaking(profile?.id);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Find user by username in profiles
        // If not found by username, try falling back to assuming the param is a user_id
        let userIdToFetch = null;
        const { data: profileData } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
        
        if (profileData) {
          setProfile(profileData);
          userIdToFetch = profileData.id;
        } else {
          // Check if username parameter is actually an ID
          const { data: profileById } = await supabase.from('profiles').select('*').eq('id', username).maybeSingle();
          if (profileById) {
            setProfile(profileById);
            userIdToFetch = profileById.id;
          }
        }

        if (userIdToFetch) {
          const { data: portData } = await supabase.from('portfolios').select('*').eq('user_id', userIdToFetch).maybeSingle();
          if (portData && portData.is_public) {
            setPortfolioData(portData.content);
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-[#EA5D3A] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#9CA3AF]">Loading Grind Profile...</p>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-16 h-16 text-[#30363D] mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Profile Not Found or Private</h1>
        <p className="text-sm text-[#9CA3AF] max-w-sm mb-6">
          This user has not made their GrindFam portfolio public, or the user does not exist.
        </p>
        <Link to="/" className="px-5 py-2 rounded-lg bg-[#EA5D3A] text-white text-sm font-bold shadow-lg shadow-[#EA5D3A]/20">
          Go to GrindFam
        </Link>
      </div>
    );
  }

  const name = profile?.name || 'Developer';
  const data = portfolioData;

  return (
    <div className="min-h-screen bg-[#0A0E17] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* GrindFam Header */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EA5D3A] to-[#F2633F] flex items-center justify-center shadow-lg shadow-[#EA5D3A]/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xl leading-none">G</span>
            </div>
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-2">Powered by GrindFam</span>
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-xl bg-[#161B22] border border-[#30363D] p-6 md:p-8 shadow-2xl">
          <img src="/logo.png" alt="Mascot" className="absolute -bottom-8 -right-8 w-44 h-44 object-contain opacity-[0.05] grayscale pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white font-bold text-3xl border-4 border-[#161B22] shadow-xl overflow-hidden flex-shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={name} className="w-full h-full object-cover" />
                ) : name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#1F2937] border border-[#30363D] text-[#9CA3AF] text-xs font-medium mb-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#EA5D3A]" />
                  <span>Developer Portfolio</span>
                </div>
                <h1 className="text-3xl font-extrabold text-[#F3F4F6] tracking-tight">{name}</h1>
                <p className="text-sm text-[#9CA3AF] max-w-lg mt-1 line-clamp-2">{data.headline}</p>
                {data.location && (
                  <div className="flex items-center gap-1 text-xs text-[#6B7280] mt-2">
                    <MapPin className="w-3 h-3" />
                    <span>{data.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {data.github && (
                <a href={data.github} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] rounded-lg text-xs font-bold text-white transition-colors">
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
              {data.linkedin && (
                <a href={data.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] rounded-lg text-xs font-bold text-[#3B82F6] transition-colors">
                  <Globe className="w-4 h-4" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Grind Stats Hologram Card */}
        <div className="bg-gradient-to-r from-[#161B22] to-[#1a1f27] border border-[#EA5D3A]/20 rounded-xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(234,93,58,0.05)] group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EA5D3A]/10 via-transparent to-[#10B981]/10 opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex-1 space-y-1 border-b md:border-b-0 md:border-r border-[#30363D] pb-4 md:pb-0 md:pr-6">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5"><Flame className="w-4 h-4 text-[#EA5D3A]" /> Consistency</h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-white tracking-tighter">{streakEngine.currentStreak || 0}</span>
                <span className="text-xs text-[#6B7280]">day streak</span>
              </div>
              {streakEngine.currentStreak >= 7 && <div className="mt-2"><TagBadge text="🔥 Streak Warrior" color="orange" /></div>}
            </div>

            <div className="flex-1 space-y-1 border-b md:border-b-0 md:border-r border-[#30363D] pb-4 md:pb-0 md:px-6">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5"><Swords className="w-4 h-4 text-purple-400" /> Arena Record</h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-white tracking-tighter">{arenaMatchmaking.matchHistory?.length || 0}</span>
                <span className="text-xs text-[#6B7280]">matches played</span>
              </div>
              {arenaMatchmaking.matchHistory?.length >= 5 && <div className="mt-2"><TagBadge text="⚔️ Arena Gladiator" color="purple" /></div>}
            </div>

            <div className="flex-1 space-y-1 md:pl-6">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#10B981]" /> Grind XP</h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-white tracking-tighter">{streakEngine.totalXP || 0}</span>
                <span className="text-xs text-[#6B7280]">XP earned</span>
              </div>
            </div>
            
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Bio */}
            {data.bio && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3"><Briefcase className="w-4 h-4 text-[#EA5D3A]" /> About</h2>
                <p className="text-sm text-[#9CA3AF] leading-relaxed whitespace-pre-wrap">{data.bio}</p>
              </div>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><Code2 className="w-4 h-4 text-[#EA5D3A]" /> Featured Projects</h2>
                <div className="grid gap-4">
                  {data.projects.map((project, i) => (
                    <div key={i} className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-[#F3F4F6]">{project.title}</h4>
                          <p className="text-xs text-[#9CA3AF] mt-1">{project.description}</p>
                        </div>
                        {project.status && <TagBadge text={project.status} color="orange" />}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(project.tech || []).map((t, idx) => <TagBadge key={idx} text={t} color="blue" />)}
                      </div>
                      <div className="flex items-center gap-3">
                        {project.github && <a href={project.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-[#9CA3AF] hover:text-[#EA5D3A] transition-colors"><Github className="w-3.5 h-3.5" /> Code</a>}
                        {project.demo && <a href={project.demo} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-[#9CA3AF] hover:text-[#EA5D3A] transition-colors"><ExternalLink className="w-3.5 h-3.5" /> Demo</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><Building2 className="w-4 h-4 text-[#EA5D3A]" /> Experience</h2>
                <div className="space-y-4">
                  {data.experience.map((exp, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i !== data.experience.length - 1 && <div className="absolute top-10 left-5 bottom-0 w-px bg-[#30363D]" />}
                      <div className="w-10 h-10 rounded-full bg-[#0D1117] border border-[#30363D] flex items-center justify-center flex-shrink-0 z-10">
                        <Briefcase className="w-4 h-4 text-[#EA5D3A]" />
                      </div>
                      <div className="pb-4">
                        <h4 className="text-sm font-bold text-[#F3F4F6]">{exp.role}</h4>
                        <p className="text-xs text-[#EA5D3A] font-medium">{exp.company}</p>
                        <p className="text-[10px] text-[#6B7280] flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" /> {exp.duration}</p>
                        <p className="text-xs text-[#9CA3AF] mt-2 whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><Star className="w-4 h-4 text-[#EA5D3A]" /> Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[#21262D] border border-[#30363D] rounded-md text-xs font-medium text-[#F3F4F6]">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><GraduationCap className="w-4 h-4 text-[#EA5D3A]" /> Education</h2>
                <div className="space-y-4">
                  {data.education.map((edu, i) => (
                    <div key={i}>
                      <h4 className="text-xs font-bold text-[#F3F4F6]">{edu.institution}</h4>
                      <p className="text-[11px] text-[#EA5D3A] mt-0.5">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                      <p className="text-[10px] text-[#6B7280] mt-1">{edu.year} {edu.grade && `· ${edu.grade}`}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {data.achievements && data.achievements.length > 0 && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><Award className="w-4 h-4 text-[#EA5D3A]" /> Achievements</h2>
                <div className="space-y-4">
                  {data.achievements.map((ach, i) => (
                    <div key={i}>
                      <h4 className="text-xs font-bold text-[#F3F4F6] flex items-start gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        {ach.title}
                      </h4>
                      {ach.description && <p className="text-[10px] text-[#9CA3AF] mt-1">{ach.description}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        {ach.date && <span className="text-[10px] text-[#6B7280]">{ach.date}</span>}
                        {ach.link && <a href={ach.link} target="_blank" rel="noreferrer" className="text-[10px] text-[#3B82F6] hover:underline">View Proof</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
