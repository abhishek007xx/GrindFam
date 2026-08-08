import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import SettingsModal from './SettingsModal';
import { companiesData, sheetsData } from '../lib/dataFallback';
import { useTrackStore } from '../store/useTrackStore';
import {
  LayoutDashboard, Building2, FileCode2, Map, Hash, Trophy, Users, UserPlus, Pencil,
  Activity, Settings, Flame, Shield, Sun, Moon, PanelLeftClose, PanelLeftOpen,
  Search, X, ExternalLink, LogOut, ChevronRight, Briefcase, Check
} from 'lucide-react';

const mainNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'companies', label: 'Company Tracks', icon: Building2, path: '/companies' },
  { id: 'sheets', label: 'DSA Sheets', icon: FileCode2, path: '/sheets' },
  { id: 'roadmaps', label: 'Roadmaps', icon: Map, path: '/roadmaps' },
  { id: 'topics', label: 'Topics', icon: Hash, path: '/topics/Array' },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase, path: '/portfolio' },
];

const socialNavItems = [
  { id: 'community', label: 'Grind Hub', icon: Users, path: '/community' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
];

const settingsNavItems = [
  { id: 'editTarget', label: 'Edit Target', icon: Pencil, path: null },
  { id: 'activity', label: 'Activity', icon: Activity, path: '/dashboard?scrollTo=activity-section' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const getInitials = (name = '') => {
  if (!name) return 'G';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export default function Sidebar({
  activeSection = null,
  onNavigate,
  onEditTarget,
  onOpenSquadModal,
  platformTotal = 0,
  isCollapsed = false,
  onToggleCollapse
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const name = profile?.name || user?.user_metadata?.name || 'Grinder';
  const handle = profile?.leetcode_username || profile?.username || user?.email?.split('@')[0] || 'user';
  const initials = getInitials(name);

  const level = Math.max(1, Math.floor(platformTotal / 10) + 1);
  const xpInLevel = (platformTotal % 10) * 50;
  const xpMax = 500;
  const xpPercent = Math.min(100, Math.round((xpInLevel / xpMax) * 100));

  const currentTab = new URLSearchParams(location.search).get('tab');

  // ─── Sidebar Global Search State ───
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [topicResults, setTopicResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isCollapsed && onToggleCollapse) {
          onToggleCollapse();
        }
        setTimeout(() => inputRef.current?.focus(), 100);
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed, onToggleCollapse]);

  // Perform search across problems
  const performSearch = useCallback(async (query) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      setTopicResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    try {
      let results = [];
      const { data: dbProblems } = await supabase
        .from('problems')
        .select('id, title, difficulty, leetcode_slug, topic_tags')
        .ilike('title', `%${q}%`)
        .limit(10);

      if (dbProblems && dbProblems.length > 0) {
        results = dbProblems;
      } else {
        const localResults = [];
        companiesData.forEach(c => {
          c.roles.forEach(r => {
            (r.roadmap?.topics || []).forEach(t => {
              (t.problems || []).forEach(p => {
                if (p.title.toLowerCase().includes(q) || (p.leetcode_slug && p.leetcode_slug.includes(q))) {
                  localResults.push({
                    title: p.title,
                    difficulty: p.difficulty,
                    leetcode_slug: p.leetcode_slug,
                    source_type: 'company',
                    source_name: c.company_name,
                    topic_tags: [t.topic_name]
                  });
                }
              });
            });
          });
        });

        sheetsData.forEach(s => {
          (s.topics || []).forEach(t => {
            (t.problems || []).forEach(p => {
              if (p.title.toLowerCase().includes(q) || (p.leetcode_slug && p.leetcode_slug.includes(q))) {
                localResults.push({
                  title: p.title,
                  difficulty: p.difficulty,
                  leetcode_slug: p.leetcode_slug,
                  source_type: 'sheet',
                  source_name: s.sheet_name,
                  topic_tags: [t.topic_name]
                });
              }
            });
          });
        });

        const seen = new Set();
        results = localResults.filter(r => {
          if (seen.has(r.leetcode_slug)) return false;
          seen.add(r.leetcode_slug);
          return true;
        }).slice(0, 15);
      }

      setSearchResults(results.slice(0, 10));

      const allTags = new Set();
      results.forEach(r => {
        (r.topic_tags || []).forEach(t => {
          if (t.toLowerCase().includes(q)) allTags.add(t);
        });
      });
      const commonTopics = [
        'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
        'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search',
        'Tree', 'Graph', 'Linked List', 'Stack', 'Sliding Window'
      ];
      commonTopics.forEach(t => {
        if (t.toLowerCase().includes(q)) allTags.add(t);
      });
      setTopicResults([...allTags].slice(0, 4));

    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsSearchOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(val);
    }, 300);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setTopicResults([]);
    setIsSearchOpen(false);
  };

  const handleResultClick = (result) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (result.leetcode_url) {
      window.open(result.leetcode_url, '_blank');
    } else if (result.leetcode_slug) {
      window.open(`https://leetcode.com/problems/${result.leetcode_slug}`, '_blank');
    }
  };

  const handleTopicClick = (tagName) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(`/topics/${encodeURIComponent(tagName)}`);
  };

  const handleClick = (item) => {
    onNavigate?.();
    if (item.id === 'settings') {
      navigate('/settings');
      return;
    }
    if (item.id === 'editTarget') {
      onEditTarget?.();
      return;
    }
    if (item.id === 'squadOptions') {
      onOpenSquadModal?.();
      return;
    }

    if (item.path) {
      navigate(item.path);
    }
  };

  const renderNavGroup = (items, label) => (
    <div className="mb-3">
      {label && !isCollapsed && (
        <p className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-500 light:text-slate-600 uppercase transition-opacity duration-200">{label}</p>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = item.path
            ? (item.path.includes('?tab=')
                ? (location.pathname === '/' || location.pathname === '/dashboard') && currentTab === new URLSearchParams(item.path.split('?')[1]).get('tab')
                : (item.path === '/' ? (location.pathname === '/' || location.pathname === '/dashboard') && !currentTab : location.pathname.startsWith(item.path)))
            : activeSection === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium cursor-pointer transition-all ${
                isCollapsed ? 'justify-center px-2' : ''
              } ${
                isActive
                  ? 'bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-slate-200 text-white dark:text-white light:text-slate-900 border-l-2 border-[#EA5D3A] rounded-r-md font-semibold'
                  : 'bg-transparent text-zinc-400 dark:text-zinc-400 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 rounded-md'
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#EA5D3A]' : 'text-zinc-400 dark:text-zinc-400 light:text-slate-500'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col h-full py-3 gap-3 bg-[#141414] dark:bg-[#141414] light:bg-white border-r border-[#333333] dark:border-[#333333] light:border-slate-200 transition-all duration-300 ${
      isCollapsed ? 'px-2' : 'px-3'
    }`}>
      {/* 1. TOP USER PROFILE CARD */}
      {isCollapsed ? (
        <div
          className="flex flex-col items-center py-2 px-1 border-b border-[#333333] dark:border-[#333333] light:border-slate-200 cursor-pointer"
          title={`${name} (@${handle})`}
          onClick={() => navigate('/settings')}
        >
          <div className="w-9 h-9 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/20 overflow-hidden flex-shrink-0">
            {profile?.avatar_url || profile?.avatarUrl ? (
              <img
                src={profile.avatar_url || profile.avatarUrl}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              initials
            )}
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl space-y-2 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 cursor-pointer" onClick={() => navigate('/settings')}>
              <div className="w-9 h-9 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/20 flex-shrink-0 overflow-hidden">
                {profile?.avatar_url || profile?.avatarUrl ? (
                  <img
                    src={profile.avatar_url || profile.avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white dark:text-white light:text-slate-900 truncate leading-tight">
                  {name}
                </p>
                <p className="text-[10px] text-[#EA5D3A] font-semibold truncate">
                  @{handle}
                </p>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-400 light:text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. WORKING SEARCH BAR IN SIDEBAR */}
      <div className="relative flex-shrink-0" ref={searchRef}>
        {isCollapsed ? (
          <button
            onClick={() => {
              if (onToggleCollapse) onToggleCollapse();
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="w-full flex items-center justify-center p-2.5 bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl text-zinc-400 hover:text-white transition-all shadow-sm"
            title="Search problems (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-[#EA5D3A]" />
          </button>
        ) : (
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-zinc-500 dark:text-zinc-500 light:text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search problems..."
              className="w-full pl-9 pr-7 py-2 bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-slate-50 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl text-xs text-zinc-100 dark:text-zinc-100 light:text-slate-900 placeholder-zinc-500 dark:placeholder-zinc-500 light:placeholder-slate-400 focus:outline-none focus:border-[#EA5D3A] transition-all shadow-sm"
            />
            {searchQuery ? (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 p-1 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-2 px-1.5 py-0.5 bg-[#262626] dark:bg-[#262626] light:bg-slate-200 border border-[#333333] dark:border-[#333333] light:border-slate-300 rounded text-[9px] text-zinc-500 dark:text-zinc-500 light:text-slate-600 font-mono">
                ⌘K
              </span>
            )}
          </div>
        )}

        {/* Floating Search Results Overlay */}
        {isSearchOpen && searchQuery && (
          <div className="absolute left-0 top-full mt-1.5 w-72 bg-[#1E1E1E] dark:bg-[#1E1E1E] light:bg-white border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 py-2 space-y-2">
            {searchLoading ? (
              <div className="p-3 text-center text-xs text-zinc-400 dark:text-zinc-400 light:text-slate-500">
                Searching problems...
              </div>
            ) : searchResults.length === 0 && topicResults.length === 0 ? (
              <div className="p-3 text-center text-xs text-zinc-400 dark:text-zinc-400 light:text-slate-500">
                No matching questions found
              </div>
            ) : (
              <>
                {searchResults.length > 0 && (
                  <div>
                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 light:text-slate-500">
                      Problems ({searchResults.length})
                    </p>
                    {searchResults.map((r, i) => {
                      const pProg = useTrackStore.getState().getProblemProgress(r);
                      const isSolved = pProg.status === 'solved';
                      const solveCount = pProg.solve_count || (isSolved ? 1 : 0);
                      return (
                        <div
                          key={i}
                          onClick={() => handleResultClick(r)}
                          className="px-3 py-2 hover:bg-[#262626] dark:hover:bg-[#262626] light:hover:bg-slate-100 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode2 className="w-3.5 h-3.5 text-[#EA5D3A] flex-shrink-0" />
                            <span className={`truncate font-medium ${isSolved ? 'text-emerald-400 line-through opacity-85' : 'text-zinc-200 dark:text-zinc-200 light:text-slate-900'}`}>
                              {r.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            {isSolved && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                                <Check className="w-3 h-3 stroke-[3]" />
                                {solveCount > 1 ? `${solveCount}x` : 'Solved'}
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              r.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10' :
                              r.difficulty === 'Hard' ? 'text-rose-400 bg-rose-500/10' : 'text-amber-400 bg-amber-500/10'
                            }`}>
                              {r.difficulty || 'Medium'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {topicResults.length > 0 && (
                  <div className="border-t border-[#333333] dark:border-[#333333] light:border-slate-200 pt-1">
                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 light:text-slate-500">
                      Topic Patterns
                    </p>
                    {topicResults.map((t, i) => (
                      <div
                        key={i}
                        onClick={() => handleTopicClick(t)}
                        className="px-3 py-1.5 hover:bg-[#262626] dark:hover:bg-[#262626] light:hover:bg-slate-100 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          <span className="text-zinc-200 dark:text-zinc-200 light:text-slate-900 font-medium">{t}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. NAV GROUPS */}
      <nav className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-[#333333]">
        {renderNavGroup(mainNavItems, null)}
        {renderNavGroup(socialNavItems, 'SOCIAL')}
        {renderNavGroup(settingsNavItems, 'SETTINGS')}
      </nav>

      {/* 4. LEVEL / XP PROGRESS WIDGET */}
      {isCollapsed ? (
        <div
          className="p-2 bg-[#121212] dark:bg-[#121212] light:bg-slate-100/90 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl flex flex-col items-center gap-2 flex-shrink-0 shadow-sm"
          title={`Level ${level} Grinder (${xpInLevel}/${xpMax} XP)`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#EA5D3A]/15 text-[#EA5D3A] border border-[#EA5D3A]/30 flex items-center justify-center font-bold text-xs">
            L{level}
          </div>
          <button
            onClick={toggleTheme}
            className="p-1 rounded text-zinc-400 dark:text-zinc-400 light:text-slate-600 hover:text-amber-400 hover:bg-white/5 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
          </button>
        </div>
      ) : (
        <div className="p-3 bg-[#121212] dark:bg-[#121212] light:bg-slate-100/90 border border-[#333333] dark:border-[#333333] light:border-slate-200 rounded-xl space-y-2.5 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-100 dark:text-zinc-100 light:text-slate-900 flex items-center gap-1.5">
              Level {level} Grinder
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-1 rounded text-zinc-400 dark:text-zinc-400 light:text-slate-600 hover:text-amber-400 hover:bg-white/5 transition-colors"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-1 rounded text-zinc-400 dark:text-zinc-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/5 transition-colors"
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="w-full bg-[#262626] dark:bg-[#262626] light:bg-slate-200 border border-[#333333] dark:border-[#333333] light:border-slate-300 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#10B981] h-full rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
            </div>
            <div className="flex items-center justify-between text-[9px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 mt-1 font-mono">
              <span>XP Progress</span>
              <span>{xpInLevel} / {xpMax}</span>
            </div>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
