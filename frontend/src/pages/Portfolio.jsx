import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  Briefcase, Plus, Trash2, ExternalLink, Github, Globe, Code2,
  Award, GraduationCap, Pencil, X, Star, Zap, Calendar, Building2,
  FileText, Mail, Phone, MapPin, Linkedin, Twitter, Save,
  ToggleLeft, ToggleRight, Eye, EyeOff
} from 'lucide-react';

function TagBadge({ text, color = 'orange', onRemove }) {
  const colorMap = {
    orange: 'bg-[#EA5D3A]/15 text-[#EA5D3A] border-[#EA5D3A]/30',
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${colorMap[color] || colorMap.orange}`}>
      {text}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 hover:opacity-70">
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#EA5D3A]/15 border border-[#EA5D3A]/30 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#EA5D3A]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#F3F4F6]">{title}</h3>
          {subtitle && <p className="text-[10px] text-[#6B7280] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
      <div className="w-10 h-10 rounded-full bg-[#21262D] flex items-center justify-center">
        <Zap className="w-5 h-5 text-[#4B5563]" />
      </div>
      <p className="text-xs text-[#6B7280]">{message}</p>
    </div>
  );
}

function SkillAdder({ onAdd }) {
  const [value, setValue] = useState('');
  const [color, setColor] = useState('orange');
  const colors = ['orange', 'green', 'blue', 'purple', 'amber'];
  const colorHex = { orange: '#EA5D3A', green: '#10B981', blue: '#3B82F6', purple: '#8B5CF6', amber: '#F59E0B' };
  return (
    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#30363D]">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && value.trim()) { onAdd({ name: value.trim(), color }); setValue(''); } }}
        placeholder="Type skill & press Enter (e.g. React, Python)"
        className="flex-1 px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all"
      />
      <div className="flex gap-1">
        {colors.map(c => (
          <button key={c} onClick={() => setColor(c)}
            className={`w-4 h-4 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
            style={{ background: colorHex[c] }}
          />
        ))}
      </div>
      <button
        onClick={() => { if (value.trim()) { onAdd({ name: value.trim(), color }); setValue(''); } }}
        className="px-3 py-1.5 rounded-md bg-[#EA5D3A] text-white text-xs font-semibold hover:bg-[#F2633F] transition-all"
      >Add</button>
    </div>
  );
}

function ProjectCard({ project, onUpdate, onRemove, previewMode }) {
  const [editing, setEditing] = useState(!project.title);
  const [newTech, setNewTech] = useState('');
  const statusColors = { Live: 'green', 'In Progress': 'amber', Archived: 'purple' };
  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4 space-y-3">
      {editing && !previewMode ? (
        <div className="space-y-2.5">
          <input value={project.title} onChange={e => onUpdate({ title: e.target.value })} placeholder="Project title"
            className="w-full px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all font-semibold" />
          <textarea value={project.description} onChange={e => onUpdate({ description: e.target.value })} placeholder="What does this project do?" rows={3}
            className="w-full px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all resize-none" />
          <div className="flex gap-2">
            <input value={project.github} onChange={e => onUpdate({ github: e.target.value })} placeholder="GitHub URL"
              className="flex-1 px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
            <input value={project.demo} onChange={e => onUpdate({ demo: e.target.value })} placeholder="Live Demo URL"
              className="flex-1 px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
          </div>
          <div className="flex gap-2">
            <input value={newTech} onChange={e => setNewTech(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newTech.trim()) { onUpdate({ tech: [...(project.tech || []), newTech.trim()] }); setNewTech(''); } }}
              placeholder="Add tech (press Enter)" className="flex-1 px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
            <select value={project.status} onChange={e => onUpdate({ status: e.target.value })}
              className="px-2 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] focus:outline-none focus:border-[#EA5D3A]">
              {['In Progress', 'Live', 'Archived'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(project.tech || []).map((t, i) => (
              <TagBadge key={i} text={t} color="blue" onRemove={() => onUpdate({ tech: project.tech.filter((_, j) => j !== i) })} />
            ))}
          </div>
          <button onClick={() => setEditing(false)} className="w-full py-1.5 rounded-md bg-[#EA5D3A] text-white text-xs font-semibold hover:bg-[#F2633F] transition-all">Done</button>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h4 className="text-sm font-bold text-[#F3F4F6] truncate">{project.title || 'Untitled Project'}</h4>
                {project.status && <TagBadge text={project.status} color={statusColors[project.status] || 'orange'} />}
              </div>
              <p className="text-xs text-[#9CA3AF] leading-relaxed line-clamp-2">{project.description || 'No description added yet.'}</p>
            </div>
            {!previewMode && (
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEditing(true)} className="p-1.5 rounded-md bg-[#21262D] text-[#9CA3AF] hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={onRemove} className="p-1.5 rounded-md bg-[#21262D] text-[#9CA3AF] hover:text-rose-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(project.tech || []).map((t, i) => <TagBadge key={i} text={t} color="blue" />)}
          </div>
          <div className="flex items-center gap-3 pt-1 border-t border-[#30363D]/60">
            {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-[#9CA3AF] hover:text-[#EA5D3A] transition-colors"><Github className="w-3.5 h-3.5" /> Code</a>}
            {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-[#9CA3AF] hover:text-[#EA5D3A] transition-colors"><ExternalLink className="w-3.5 h-3.5" /> Demo</a>}
          </div>
        </>
      )}
    </div>
  );
}

function ExperienceCard({ exp, onUpdate, onRemove, previewMode }) {
  const [editing, setEditing] = useState(!exp.company);
  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
      {editing && !previewMode ? (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <input value={exp.role} onChange={e => onUpdate({ role: e.target.value })} placeholder="Role / Title"
              className="px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
            <input value={exp.company} onChange={e => onUpdate({ company: e.target.value })} placeholder="Company Name"
              className="px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
          </div>
          <input value={exp.duration} onChange={e => onUpdate({ duration: e.target.value })} placeholder="Duration (e.g. Jun 2024 - Present)"
            className="w-full px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
          <textarea value={exp.description} onChange={e => onUpdate({ description: e.target.value })} placeholder="Responsibilities & impact" rows={3}
            className="w-full px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all resize-none" />
          <button onClick={() => setEditing(false)} className="w-full py-1.5 rounded-md bg-[#EA5D3A] text-white text-xs font-semibold hover:bg-[#F2633F] transition-all">Done</button>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#21262D] border border-[#30363D] flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-[#EA5D3A]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-[#F3F4F6]">{exp.role || 'Role'}</p>
                <p className="text-[11px] text-[#EA5D3A] font-medium">{exp.company || 'Company'}</p>
                {exp.duration && <p className="text-[10px] text-[#6B7280] flex items-center gap-1 mt-0.5"><Calendar className="w-2.5 h-2.5" />{exp.duration}</p>}
              </div>
              {!previewMode && (
                <div className="flex gap-1">
                  <button onClick={() => setEditing(true)} className="p-1 rounded-md bg-[#21262D] text-[#9CA3AF] hover:text-white transition-colors"><Pencil className="w-3 h-3" /></button>
                  <button onClick={onRemove} className="p-1 rounded-md bg-[#21262D] text-[#9CA3AF] hover:text-rose-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                </div>
              )}
            </div>
            {exp.description && <p className="text-[11px] text-[#9CA3AF] mt-1.5 leading-relaxed">{exp.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function EducationCard({ edu, onUpdate, onRemove, previewMode }) {
  const [editing, setEditing] = useState(!edu.institution);
  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
      {editing && !previewMode ? (
        <div className="space-y-2.5">
          <input value={edu.institution} onChange={e => onUpdate({ institution: e.target.value })} placeholder="Institution Name"
            className="w-full px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
          <div className="grid grid-cols-2 gap-2">
            <input value={edu.degree} onChange={e => onUpdate({ degree: e.target.value })} placeholder="Degree (e.g. B.Tech)"
              className="px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
            <input value={edu.field} onChange={e => onUpdate({ field: e.target.value })} placeholder="Field (e.g. CS)"
              className="px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={edu.year} onChange={e => onUpdate({ year: e.target.value })} placeholder="Year (e.g. 2021-2025)"
              className="px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
            <input value={edu.grade} onChange={e => onUpdate({ grade: e.target.value })} placeholder="CGPA / % / Grade"
              className="px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
          </div>
          <button onClick={() => setEditing(false)} className="w-full py-1.5 rounded-md bg-[#EA5D3A] text-white text-xs font-semibold hover:bg-[#F2633F] transition-all">Done</button>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#21262D] border border-[#30363D] flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-[#EA5D3A]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-[#F3F4F6]">{edu.institution || 'Institution'}</p>
                <p className="text-[11px] text-[#EA5D3A]">{edu.degree}{edu.field ? ` - ${edu.field}` : ''}</p>
                {edu.year && <p className="text-[10px] text-[#6B7280] mt-0.5">{edu.year}{edu.grade ? ` · ${edu.grade}` : ''}</p>}
              </div>
              {!previewMode && (
                <div className="flex gap-1">
                  <button onClick={() => setEditing(true)} className="p-1 rounded-md bg-[#21262D] text-[#9CA3AF] hover:text-white transition-colors"><Pencil className="w-3 h-3" /></button>
                  <button onClick={onRemove} className="p-1 rounded-md bg-[#21262D] text-[#9CA3AF] hover:text-rose-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AchievementCard({ ach, onUpdate, onRemove, previewMode }) {
  const [editing, setEditing] = useState(!ach.title);
  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
      {editing && !previewMode ? (
        <div className="space-y-2.5">
          <input value={ach.title} onChange={e => onUpdate({ title: e.target.value })} placeholder="Achievement title"
            className="w-full px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
          <textarea value={ach.description} onChange={e => onUpdate({ description: e.target.value })} placeholder="Describe the achievement" rows={2}
            className="w-full px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all resize-none" />
          <div className="grid grid-cols-2 gap-2">
            <input value={ach.date} onChange={e => onUpdate({ date: e.target.value })} placeholder="Date (e.g. Oct 2024)"
              className="px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
            <input value={ach.link} onChange={e => onUpdate({ link: e.target.value })} placeholder="Certificate URL"
              className="px-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
          </div>
          <button onClick={() => setEditing(false)} className="w-full py-1.5 rounded-md bg-[#EA5D3A] text-white text-xs font-semibold hover:bg-[#F2633F] transition-all">Done</button>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs font-bold text-[#F3F4F6]">{ach.title || 'Achievement'}</p>
            </div>
            {!previewMode && (
              <div className="flex gap-1">
                <button onClick={() => setEditing(true)} className="p-1 rounded-md bg-[#21262D] text-[#9CA3AF] hover:text-white transition-colors"><Pencil className="w-3 h-3" /></button>
                <button onClick={onRemove} className="p-1 rounded-md bg-[#21262D] text-[#9CA3AF] hover:text-rose-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
              </div>
            )}
          </div>
          {ach.description && <p className="text-[11px] text-[#9CA3AF] leading-relaxed">{ach.description}</p>}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#30363D]/60">
            {ach.date && <span className="text-[10px] text-[#6B7280] flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{ach.date}</span>}
            {ach.link && <a href={ach.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#EA5D3A] hover:underline flex items-center gap-1"><ExternalLink className="w-2.5 h-2.5" /> View</a>}
          </div>
        </>
      )}
    </div>
  );
}

export default function Portfolio() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [previewMode, setPreviewMode] = useState(false);

  const defaultPortfolio = {
    bio: '', headline: '', location: '', email: user?.email || '',
    phone: '', website: '', github: '', linkedin: '', twitter: '',
    isPublic: false, skills: [], projects: [], experience: [], education: [], achievements: [],
  };

  const [draft, setDraft] = useState(defaultPortfolio);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('portfolios').select('*').eq('user_id', user.id).maybeSingle();
        if (data?.content) setDraft({ ...defaultPortfolio, ...data.content });
      } catch (_) { }
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('portfolios').upsert({ user_id: user.id, content: draft, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      setEditSection(null);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const addItem = (field, item) => setDraft(d => ({ ...d, [field]: [...(d[field] || []), item] }));
  const removeItem = (field, idx) => setDraft(d => ({ ...d, [field]: d[field].filter((_, i) => i !== idx) }));
  const updateItem = (field, idx, updates) => setDraft(d => ({ ...d, [field]: d[field].map((item, i) => i === idx ? { ...item, ...updates } : item) }));

  const name = profile?.name || user?.user_metadata?.name || 'Your Name';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-[#EA5D3A] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#9CA3AF]">Loading portfolio...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'projects', label: 'Projects', icon: Code2 },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'achievements', label: 'Achievements', icon: Award },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-lg bg-[#161B22] border border-[#30363D] p-6 md:p-8">
        <img
          src="/logo.png"
          alt="GrindFam Mascot"
          className="absolute -bottom-8 -right-8 w-44 h-44 object-contain opacity-[0.05] grayscale pointer-events-none select-none"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white font-bold text-xl border-2 border-[#EA5D3A]/30 shadow-lg overflow-hidden flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={name} className="w-full h-full object-cover" />
              ) : name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#1F2937] border border-[#30363D] text-[#9CA3AF] text-xs font-medium mb-2">
                <Briefcase className="w-3.5 h-3.5 text-[#EA5D3A]" />
                <span>Developer Portfolio</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#F3F4F6] tracking-tight">{name}</h1>
              <p className="text-sm text-[#9CA3AF] mt-0.5">{draft.headline || 'Add a headline to your profile'}</p>
              {draft.location && (
                <div className="flex items-center gap-1 text-xs text-[#6B7280] mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{draft.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${previewMode ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-[#1F2937] text-[#9CA3AF] border-[#30363D] hover:text-white'}`}>
              {previewMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {previewMode ? 'Preview On' : 'Edit Mode'}
            </button>
            <button onClick={() => setDraft(d => ({ ...d, isPublic: !d.isPublic }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${draft.isPublic ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-[#1F2937] text-[#9CA3AF] border-[#30363D] hover:text-white'}`}>
              {draft.isPublic ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
              {draft.isPublic ? 'Public' : 'Private'}
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#EA5D3A] hover:bg-[#F2633F] text-white text-xs font-semibold transition-all disabled:opacity-60 shadow-md">
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Portfolio'}
            </button>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-[#30363D]/60">
          {[
            { icon: Github, label: 'GitHub', href: draft.github },
            { icon: Linkedin, label: 'LinkedIn', href: draft.linkedin },
            { icon: Globe, label: 'Website', href: draft.website },
            { icon: Twitter, label: 'Twitter', href: draft.twitter },
            { icon: Mail, label: 'Email', href: draft.email ? `mailto:${draft.email}` : '' },
          ].filter(x => x.href).map(({ icon: Icon, label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#9CA3AF] hover:text-[#EA5D3A] transition-colors">
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </a>
          ))}
          {!draft.github && !draft.linkedin && !draft.website && (
            <button onClick={() => setEditSection('contact')} className="text-[10px] text-[#EA5D3A] hover:underline">+ Add social links</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-[#30363D]">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-[#EA5D3A] text-[#EA5D3A]' : 'border-transparent text-[#9CA3AF] hover:text-[#F3F4F6]'}`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5">
                <SectionHeader icon={FileText} title="About Me" subtitle="Short bio about yourself"
                  action={<button onClick={() => setEditSection(editSection === 'bio' ? null : 'bio')} className="p-1.5 rounded-md bg-[#21262D] text-[#9CA3AF] hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>} />
                {editSection === 'bio' ? (
                  <div className="space-y-3">
                    <input value={draft.headline} onChange={e => setDraft(d => ({ ...d, headline: e.target.value }))} placeholder="Your headline (e.g. Full Stack Developer | Open to Work)"
                      className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
                    <textarea value={draft.bio} onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))} placeholder="Write a short bio..." rows={4}
                      className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all resize-none" />
                    <input value={draft.location} onChange={e => setDraft(d => ({ ...d, location: e.target.value }))} placeholder="Location (e.g. Bangalore, India)"
                      className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
                    <button onClick={() => setEditSection(null)} className="w-full py-1.5 rounded-md bg-[#EA5D3A] text-white text-xs font-semibold hover:bg-[#F2633F] transition-all">Done</button>
                  </div>
                ) : (
                  draft.bio ? <p className="text-xs text-[#9CA3AF] leading-relaxed">{draft.bio}</p>
                    : <EmptyState message="Add a bio to tell recruiters about yourself" />
                )}
              </div>

              <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5">
                <SectionHeader icon={Mail} title="Contact & Links" subtitle="Social profiles and contact info"
                  action={<button onClick={() => setEditSection(editSection === 'contact' ? null : 'contact')} className="p-1.5 rounded-md bg-[#21262D] text-[#9CA3AF] hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>} />
                {editSection === 'contact' ? (
                  <div className="space-y-2">
                    {[
                      { key: 'email', icon: Mail, placeholder: 'your@email.com' },
                      { key: 'phone', icon: Phone, placeholder: '+91 XXXXX XXXXX' },
                      { key: 'github', icon: Github, placeholder: 'https://github.com/username' },
                      { key: 'linkedin', icon: Linkedin, placeholder: 'https://linkedin.com/in/...' },
                      { key: 'website', icon: Globe, placeholder: 'https://yoursite.com' },
                      { key: 'twitter', icon: Twitter, placeholder: 'https://x.com/handle' },
                    ].map(({ key, icon: Icon, placeholder }) => (
                      <div key={key} className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
                        <input value={draft[key] || ''} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} placeholder={placeholder}
                          className="w-full pl-9 pr-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-md text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] transition-all" />
                      </div>
                    ))}
                    <button onClick={() => setEditSection(null)} className="w-full py-1.5 rounded-md bg-[#EA5D3A] text-white text-xs font-semibold hover:bg-[#F2633F] transition-all mt-1">Done</button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {[
                      { label: 'Email', value: draft.email, icon: Mail },
                      { label: 'GitHub', value: draft.github, icon: Github },
                      { label: 'LinkedIn', value: draft.linkedin, icon: Linkedin },
                      { label: 'Website', value: draft.website, icon: Globe },
                    ].filter(x => x.value).map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-[#EA5D3A] flex-shrink-0" />
                        <span className="text-xs text-[#9CA3AF] truncate">{value}</span>
                      </div>
                    ))}
                    {!draft.email && !draft.github && <EmptyState message="Add your contact details and social links" />}
                  </div>
                )}
              </div>

              <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5 md:col-span-2">
                <SectionHeader icon={Code2} title="Skills & Technologies" subtitle="Languages, frameworks and tools you know"
                  action={<button onClick={() => setEditSection(editSection === 'skills' ? null : 'skills')} className="p-1.5 rounded-md bg-[#21262D] text-[#9CA3AF] hover:text-white transition-colors"><Plus className="w-3.5 h-3.5" /></button>} />
                <div className="flex flex-wrap gap-2 mb-3">
                  {draft.skills.map((skill, i) => (
                    <TagBadge key={i} text={skill.name} color={skill.color || 'orange'} onRemove={!previewMode ? () => removeItem('skills', i) : undefined} />
                  ))}
                  {draft.skills.length === 0 && <EmptyState message="Add skills like React, Python, LeetCode, etc." />}
                </div>
                {editSection === 'skills' && <SkillAdder onAdd={(skill) => addItem('skills', skill)} />}
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#6B7280]">{draft.projects.length} projects added</p>
                <button onClick={() => addItem('projects', { title: '', description: '', tech: [], github: '', demo: '', status: 'In Progress' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1F2937] border border-[#30363D] text-[#9CA3AF] hover:text-white text-xs font-medium transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>
              {draft.projects.length === 0 && <div className="bg-[#161B22] border border-[#30363D] rounded-lg"><EmptyState message="Showcase your projects to stand out to recruiters" /></div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draft.projects.map((project, i) => (
                  <ProjectCard key={i} project={project} onUpdate={(u) => updateItem('projects', i, u)} onRemove={() => removeItem('projects', i)} previewMode={previewMode} />
                ))}
              </div>
            </div>
          )}

          {/* EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#6B7280]">{draft.experience.length} roles added</p>
                <button onClick={() => addItem('experience', { company: '', role: '', duration: '', description: '' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1F2937] border border-[#30363D] text-[#9CA3AF] hover:text-white text-xs font-medium transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>
              {draft.experience.length === 0 && <div className="bg-[#161B22] border border-[#30363D] rounded-lg"><EmptyState message="Add internships, full-time roles, freelance work etc." /></div>}
              {draft.experience.map((exp, i) => (
                <ExperienceCard key={i} exp={exp} onUpdate={(u) => updateItem('experience', i, u)} onRemove={() => removeItem('experience', i)} previewMode={previewMode} />
              ))}
            </div>
          )}

          {/* EDUCATION */}
          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#6B7280]">{draft.education.length} entries added</p>
                <button onClick={() => addItem('education', { institution: '', degree: '', field: '', year: '', grade: '' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1F2937] border border-[#30363D] text-[#9CA3AF] hover:text-white text-xs font-medium transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add Education
                </button>
              </div>
              {draft.education.length === 0 && <div className="bg-[#161B22] border border-[#30363D] rounded-lg"><EmptyState message="Add your college, school, bootcamp or courses" /></div>}
              {draft.education.map((edu, i) => (
                <EducationCard key={i} edu={edu} onUpdate={(u) => updateItem('education', i, u)} onRemove={() => removeItem('education', i)} previewMode={previewMode} />
              ))}
            </div>
          )}

          {/* ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#6B7280]">{draft.achievements.length} achievements</p>
                <button onClick={() => addItem('achievements', { title: '', description: '', date: '', link: '' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1F2937] border border-[#30363D] text-[#9CA3AF] hover:text-white text-xs font-medium transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add Achievement
                </button>
              </div>
              {draft.achievements.length === 0 && <div className="bg-[#161B22] border border-[#30363D] rounded-lg"><EmptyState message="Add hackathon wins, competition ranks, open source contributions, etc." /></div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draft.achievements.map((ach, i) => (
                  <AchievementCard key={i} ach={ach} onUpdate={(u) => updateItem('achievements', i, u)} onRemove={() => removeItem('achievements', i)} previewMode={previewMode} />
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
