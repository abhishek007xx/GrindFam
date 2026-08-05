import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { companiesData, sheetsData } from '../lib/dataFallback';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Calendar, Bell, ChevronDown, Search, ExternalLink,
  X, FileCode2, Building2, Hash, ArrowRight
} from 'lucide-react';

const getInitials = (name = '') => {
  if (!name) return 'G';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const Navbar = ({ onRefresh, refreshing, platformTotal = 0 }) => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const name = profile?.name || user?.user_metadata?.name || 'Grinder';
  const initials = getInitials(name);

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

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Ctrl+K to focus search
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

  // Debounced search
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setTopicResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const q = query.trim().toLowerCase();

      // 1. Search Supabase problems by title (ilike)
      const { data: supaProblems } = await supabase
        .from('problems')
        .select('id, title, difficulty, leetcode_slug, leetcode_url, source_type, source_id, topic_tags, step_name')
        .ilike('title', `%${q}%`)
        .limit(15);

      let results = supaProblems || [];

      // 2. Also search by topic tag
      const { data: tagProblems } = await supabase
        .from('problems')
        .select('id, title, difficulty, leetcode_slug, leetcode_url, source_type, source_id, topic_tags, step_name')
        .contains('topic_tags', [q])
        .limit(10);

      if (tagProblems) {
        const existingIds = new Set(results.map(r => r.id));
        tagProblems.forEach(p => {
          if (!existingIds.has(p.id)) results.push(p);
        });
      }

      // If no Supabase results, search local fallback data
      if (results.length === 0) {
        const localResults = [];

        // Search sheets data
        sheetsData.forEach(sheet => {
          (sheet.steps || []).forEach(step => {
            (step.problems || []).forEach(prob => {
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

        // Search companies data
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

        // Deduplicate by leetcode_slug
        const seen = new Set();
        results = localResults.filter(r => {
          if (seen.has(r.leetcode_slug)) return false;
          seen.add(r.leetcode_slug);
          return true;
        }).slice(0, 20);
      }

      setSearchResults(results.slice(0, 15));

      // 3. Extract unique topic tags from results for quick topic navigation
      const allTags = new Set();
      results.forEach(r => {
        (r.topic_tags || []).forEach(t => {
          if (t.toLowerCase().includes(q)) allTags.add(t);
        });
      });
      // Also add common DSA topics that match the query
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
    const url = result.leetcode_url || `https://leetcode.com/problems/${result.leetcode_slug}/`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsSearchOpen(false);
  };

  const handleTopicClick = (tag) => {
    navigate(`/topics/${encodeURIComponent(tag)}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="h-14 bg-[#0d1117] border-b border-[#21262d] flex items-center justify-between px-6 sticky top-0 z-30">
      {/* ─── Global Search Bar ─── */}
      <div className="relative" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-[#6e7681] pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search problems, topics..."
            className="w-72 pl-9 pr-16 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-emerald-500/50 focus:bg-[#0d1117] transition-all"
          />
          {searchQuery ? (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 p-1 rounded hover:bg-white/5 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[#6e7681]" />
            </button>
          ) : (
            <span className="absolute right-2 px-1.5 py-0.5 bg-[#21262d] border border-[#30363d] rounded text-[9px] text-[#6e7681] font-mono">
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
              className="absolute top-full left-0 mt-1.5 w-[420px] bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
            >
              {searchLoading ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[#8b949e]">Searching...</span>
                </div>
              ) : (
                <>
                  {/* Topic Tags */}
                  {topicResults.length > 0 && (
                    <div className="px-3 py-2.5 border-b border-[#21262d]">
                      <p className="text-[9px] font-bold text-[#6e7681] uppercase tracking-widest mb-2">Topics</p>
                      <div className="flex flex-wrap gap-1.5">
                        {topicResults.map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleTopicClick(tag)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold transition-all"
                          >
                            <Hash className="w-3 h-3" />
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Problem Results */}
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
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                              result.source_type === 'company'
                                ? 'bg-indigo-500/10 border border-indigo-500/20'
                                : 'bg-emerald-500/10 border border-emerald-500/20'
                            }`}>
                              {result.source_type === 'company'
                                ? <Building2 className="w-3 h-3 text-indigo-400" />
                                : <FileCode2 className="w-3 h-3 text-emerald-400" />
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
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              result.difficulty === 'Easy'
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

      {/* ─── Right Section ─── */}
      <div className="flex items-center gap-4">
        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161b22] border border-[#30363d] text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className={streakDays > 0 ? 'text-orange-400' : 'text-[#6e7681]'}>
            {streakDays > 0 ? `${streakDays} Day Streak` : 'No Streak Yet'}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161b22] border border-[#30363d] text-xs font-medium text-[#8b949e]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{dateStr} (UTC)</span>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl hover:bg-white/5 text-[#8b949e] hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#21262d]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-[11px] border border-white/20">
            {initials}
          </div>
          <span className="text-sm font-medium text-[#e6edf3]">{name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#8b949e]" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
