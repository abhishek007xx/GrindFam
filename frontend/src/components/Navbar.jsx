import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import SettingsModal from './SettingsModal';
import { companiesData, sheetsData } from '../lib/dataFallback';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Calendar, Bell, ChevronDown, Search, ExternalLink,
  X, FileCode2, Building2, Hash, Settings, LogOut, Menu
} from 'lucide-react';

const getInitials = (name = '') => {
  if (!name) return 'G';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const Navbar = ({ onToggleSidebar, onRefresh, refreshing, platformTotal = 0 }) => {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
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
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[#30363d] bg-[#0d1117] flex-shrink-0">
      {/* Left side: Hamburger button (mobile) + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="GrindFam Logo" className="w-7 h-7 rounded-lg object-cover border border-[#30363d] flex-shrink-0" />
          <span className="text-base font-extrabold text-white">
            Grind<span className="text-[#EA5D3A]">Fam</span>
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative flex-1 max-w-md mx-4" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-[#6e7681]" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search problems, topics, sheets..."
            className="w-full pl-9 pr-8 py-1.5 bg-[#161b22] border border-[#30363d] rounded-xl text-xs text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#EA5D3A] transition-all"
          />
          {searchQuery ? (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 p-1 rounded hover:bg-white/5 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[#6e7681]" />
            </button>
          ) : (
            <span className="absolute right-2 px-1.5 py-0.5 bg-[#21262d] border border-[#30363d] rounded text-[9px] text-[#6e7681] font-mono hidden sm:inline-block">
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
              className="absolute top-full left-0 mt-1.5 w-full min-w-[320px] max-w-[420px] bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
            >
              {searchLoading ? (
                <div className="p-4 text-center">
                  <div className="w-4 h-4 border-2 border-[#EA5D3A] border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                  <span className="text-xs text-[#8b949e]">Searching...</span>
                </div>
              ) : (
                <>
                  {topicResults.length > 0 && (
                    <div className="px-3 py-2.5 border-b border-[#21262d]">
                      <p className="text-[9px] font-bold text-[#6e7681] uppercase tracking-widest mb-2">Topics</p>
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
                      <p className="px-3 pt-2.5 pb-1 text-[9px] font-bold text-[#6e7681] uppercase tracking-widest">
                        Problems ({searchResults.length})
                      </p>
                      {searchResults.map((result, idx) => (
                        <div
                          key={result.id || idx}
                          onClick={() => handleResultClick(result)}
                          className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-[#0d1117] cursor-pointer transition-colors border-b border-[#21262d]/50 last:border-b-0"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 bg-[#181818] border border-white/10 text-[#8b949e]">
                              {result.source_type === 'company'
                                ? <Building2 className="w-3 h-3 text-[#8b949e]" />
                                : <FileCode2 className="w-3 h-3 text-[#EA5D3A]" />
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#e6edf3] truncate">{result.title}</p>
                              {result.source_name && (
                                <p className="text-[9px] text-[#6e7681] truncate">from {result.source_name}</p>
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
                      <p className="text-xs text-[#6e7681]">No results found for "{searchQuery}"</p>
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
        <div className="hidden sm:flex items-center gap-1.5 px-3 h-8 rounded-full bg-[#161b22] border border-[#30363d] text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 text-[#EA5D3A]" />
          <span className={streakDays > 0 ? 'text-[#EA5D3A]' : 'text-[#6e7681]'}>
            {streakDays > 0 ? `${streakDays} Day Streak` : 'No Streak'}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-3 h-8 rounded-full bg-[#161b22] border border-[#30363d] text-xs font-medium text-[#8b949e]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{dateStr}</span>
        </div>

        <button className="relative p-2 rounded-xl hover:bg-white/5 text-[#8b949e] hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        <div className="relative pl-2 border-l border-[#21262d]" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white font-bold text-[11px] border border-white/20 flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm font-medium text-[#e6edf3] hidden sm:inline">{name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8b949e] hidden sm:inline" />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden z-50 py-1.5"
              >
                <div className="px-4 py-2.5 border-b border-[#21262d]">
                  <p className="text-xs font-bold text-white truncate">{name}</p>
                  <p className="text-[10px] text-[#8b949e] truncate">{user?.email || 'Logged In'}</p>
                </div>

                <button
                  onClick={() => { navigate('/settings'); setIsUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#e6edf3] hover:bg-[#21262d] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#EA5D3A]" />
                  <span>Account Settings</span>
                </button>

                <div className="border-t border-[#21262d] my-1" />

                <button
                  onClick={() => { signOut(); setIsUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
};

export default Navbar;
