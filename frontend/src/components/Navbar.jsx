import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import SettingsModal from './SettingsModal';
import { companiesData, sheetsData } from '../lib/dataFallback';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Calendar, Bell, ChevronDown, Search, ExternalLink,
  X, FileCode2, Building2, Hash, Settings, LogOut, Menu, RefreshCw, Sun, Moon,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

const getInitials = (name = '') => {
  if (!name) return 'G';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const Navbar = ({ onToggleSidebar, onToggleCollapse, isCollapsed, onRefresh, refreshing, platformTotal = 0 }) => {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const name = profile?.name || user?.user_metadata?.name || 'Grinder';
  const initials = getInitials(name);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const userMenuRef = useRef(null);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const streakDays = platformTotal > 0 ? Math.max(1, Math.floor(platformTotal / 3)) : 0;

  // ─── Global Search State ───
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [topicResults, setTopicResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setTopicResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const q = query.trim().toLowerCase();

      const { data: supaProblems } = await supabase
        .from('problems')
        .select('id, title, difficulty, leetcode_slug, leetcode_url, source_type, source_id, topic_tags, step_name')
        .ilike('title', `%${q}%`)
        .limit(15);

      let results = supaProblems || [];

      if (results.length === 0) {
        let localResults = [];
        sheetsData.forEach(sheet => {
          (sheet.topics || []).forEach(topic => {
            (topic.problems || []).forEach(prob => {
              if (
                prob.title.toLowerCase().includes(q) ||
                prob.leetcode_slug.toLowerCase().includes(q) ||
                (prob.topic_tags || []).some(t => t.toLowerCase().includes(q))
              ) {
                localResults.push({
                  id: `local-${sheet.slug}-${prob.leetcode_slug}`,
                  title: prob.title,
                  difficulty: prob.difficulty || 'Medium',
                  leetcode_slug: prob.leetcode_slug,
                  leetcode_url: prob.leetcode_url,
                  source_type: 'sheet',
                  source_name: sheet.sheet_name,
                  topic_tags: prob.topic_tags || []
                });
              }
            });
          });
        });

        companiesData.forEach(company => {
          (company.roles || []).forEach(role => {
            (role.problems || []).forEach(prob => {
              if (
                prob.title.toLowerCase().includes(q) ||
                prob.leetcode_slug.toLowerCase().includes(q) ||
                (prob.topic_tags || []).some(t => t.toLowerCase().includes(q))
              ) {
                localResults.push({
                  id: `local-${company.slug}-${prob.leetcode_slug}`,
                  title: prob.title,
                  difficulty: prob.difficulty || 'Medium',
                  leetcode_slug: prob.leetcode_slug,
                  leetcode_url: prob.leetcode_url,
                  source_type: 'company',
                  source_name: company.company_name,
                  topic_tags: prob.topic_tags || []
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
        }).slice(0, 20);
      }

      setSearchResults(results.slice(0, 15));

      const allTags = new Set();
      results.forEach(r => {
        (r.topic_tags || []).forEach(t => {
          if (t.toLowerCase().includes(q)) allTags.add(t);
        });
      });
      const commonTopics = [
        'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
        'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search',
        'Breadth-First Search', 'Tree', 'Graph', 'Linked List', 'Stack',
        'Queue', 'Heap', 'Two Pointers', 'Sliding Window', 'Recursion',
        'Backtracking', 'Bit Manipulation', 'Matrix', 'Trie'
      ];
      commonTopics.forEach(t => {
        if (t.toLowerCase().includes(q)) allTags.add(t);
      });
      setTopicResults([...allTags].slice(0, 5));

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

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[#27272A] dark:border-[#27272A] light:border-slate-200 bg-[#0B0C10] dark:bg-[#0B0C10] light:bg-white flex-shrink-0">
      {/* Left side: Primary Logo + Collapse Button + Mobile Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-[#8b949e] dark:text-[#8b949e] light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="GrindFam Logo" className="w-8 h-8 rounded-lg object-cover border border-[#30363d] dark:border-[#30363d] light:border-slate-200 flex-shrink-0" />
          <span className="text-base font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight">
            Grind<span className="text-[#EA5D3A]">Fam</span>
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative flex-1 max-w-md mx-4" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-[#6e7681] dark:text-[#6e7681] light:text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search problems, topics, sheets..."
            className="w-full pl-9 pr-8 py-1.5 bg-[#161b22] dark:bg-[#161b22] light:bg-slate-50 border border-[#30363d] dark:border-[#30363d] light:border-slate-200 rounded-xl text-xs text-[#e6edf3] dark:text-[#e6edf3] light:text-slate-900 placeholder-[#6e7681] dark:placeholder-[#6e7681] light:placeholder-slate-400 focus:outline-none focus:border-[#EA5D3A] transition-all shadow-sm"
          />
          {searchQuery ? (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 p-1 rounded hover:bg-white/5 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[#6e7681]" />
            </button>
          ) : (
            <span className="absolute right-2 px-1.5 py-0.5 bg-[#21262d] dark:bg-[#21262d] light:bg-slate-200 border border-[#30363d] dark:border-[#30363d] light:border-slate-300 rounded text-[9px] text-[#6e7681] dark:text-[#6e7681] light:text-slate-600 font-mono hidden sm:inline-block">
              Ctrl+K
            </span>
          )}
        </div>

        {/* Search Dropdown */}
        <AnimatePresence>
          {isSearchOpen && (searchResults.length > 0 || topicResults.length > 0 || searchLoading) && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1.5 w-full min-w-[320px] max-w-[420px] bg-[#161b22] dark:bg-[#161b22] light:bg-white border border-[#30363d] dark:border-[#30363d] light:border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {searchLoading ? (
                <div className="p-4 text-center">
                  <div className="w-4 h-4 border-2 border-[#EA5D3A] border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                  <span className="text-xs text-[#8b949e] dark:text-[#8b949e] light:text-slate-500">Searching...</span>
                </div>
              ) : (
                <>
                  {topicResults.length > 0 && (
                    <div className="px-3 py-2.5 border-b border-[#21262d] dark:border-[#21262d] light:border-slate-200">
                      <p className="text-[9px] font-bold text-[#6e7681] dark:text-[#6e7681] light:text-slate-500 uppercase tracking-widest mb-2">Topics</p>
                      <div className="flex flex-wrap gap-1.5">
                        {topicResults.map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleTopicClick(tag)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EA5D3A]/10 hover:bg-[#EA5D3A]/20 border border-[#EA5D3A]/20 text-[#EA5D3A] text-[10px] font-semibold transition-all"
                          >
                            <Hash className="w-3 h-3" />
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="max-h-[320px] overflow-y-auto">
                      <p className="px-3 pt-2.5 pb-1 text-[9px] font-bold text-[#6e7681] dark:text-[#6e7681] light:text-slate-500 uppercase tracking-widest">
                        Problems ({searchResults.length})
                      </p>
                      {searchResults.map((result, idx) => (
                        <div
                          key={result.id || idx}
                          onClick={() => handleResultClick(result)}
                          className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-[#0d1117] dark:hover:bg-[#0d1117] light:hover:bg-slate-100 cursor-pointer transition-colors border-b border-[#21262d]/50 dark:border-[#21262d]/50 light:border-slate-200 last:border-b-0"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 bg-[#181818] dark:bg-[#181818] light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-200 text-[#8b949e]">
                              {result.source_type === 'company'
                                ? <Building2 className="w-3 h-3 text-[#8b949e] dark:text-[#8b949e] light:text-slate-600" />
                                : <FileCode2 className="w-3 h-3 text-[#EA5D3A]" />
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#e6edf3] dark:text-[#e6edf3] light:text-slate-900 truncate">{result.title}</p>
                              {result.source_name && (
                                <p className="text-[9px] text-[#6e7681] dark:text-[#6e7681] light:text-slate-500 truncate">from {result.source_name}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${result.difficulty === 'Easy'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : result.difficulty === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}>
                              {result.difficulty}
                            </span>
                            <ExternalLink className="w-3 h-3 text-[#484f58]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.length === 0 && topicResults.length === 0 && searchQuery.length >= 2 && (
                    <div className="py-6 text-center">
                      <p className="text-xs text-[#6e7681] dark:text-[#6e7681] light:text-slate-500">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3 ml-3">
        <div className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.25)]" title={`${streakDays} Day Streak`}>
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="font-extrabold font-mono text-xs text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] font-sans">
            {streakDays}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-3 h-8 rounded-full bg-[#121318] dark:bg-[#121318] light:bg-slate-50 border border-[#27272A] dark:border-[#27272A] light:border-slate-200 text-xs font-medium text-zinc-400 dark:text-zinc-400 light:text-slate-600 shadow-sm">
          <Calendar className="w-3.5 h-3.5" />
          <span>{dateStr}</span>
        </div>

        <button className="relative p-2 rounded-xl hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-100 text-[#8b949e] dark:text-[#8b949e] light:text-slate-600 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-zinc-800/80 dark:border-zinc-800/80 light:border-slate-200 bg-[#121318] dark:bg-[#121318] light:bg-slate-50 text-[#8b949e] dark:text-[#8b949e] light:text-slate-600 hover:text-amber-400 hover:border-amber-500/40 transition-all flex items-center justify-center relative group shadow-sm"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 transition-transform duration-300 group-hover:-rotate-12" />
          )}
        </button>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
};

export default Navbar;
