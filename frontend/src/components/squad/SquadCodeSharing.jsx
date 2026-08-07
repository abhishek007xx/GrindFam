import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Code, Send, MessageSquare, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../supabase';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c', 'typescript', 'go', 'rust', 'sql'];

export default function SquadCodeSharing() {
  const { session } = useAuth();
  const { activeSquad, snippets, shareSnippet, fetchSquadData } = useSquadStore();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [problemSlug, setProblemSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedSnippet, setExpandedSnippet] = useState(null);
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const fetchComments = async (snippetId) => {
    try {
      const { data, error } = await supabase
        .from('squad_snippet_comments')
        .select('*')
        .eq('snippet_id', snippetId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const userIds = [...new Set((data || []).map(c => c.user_id))];
      let profileMap = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, leetcode_username')
          .in('id', userIds);
        (profiles || []).forEach(p => { profileMap[p.id] = p; });
      }

      const enriched = (data || []).map(c => ({
        ...c,
        author: {
          name: profileMap[c.user_id]?.username || profileMap[c.user_id]?.leetcode_username || 'Member'
        }
      }));

      setComments(prev => ({ ...prev, [snippetId]: enriched }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const toggleSnippet = (snippetId) => {
    if (expandedSnippet === snippetId) {
      setExpandedSnippet(null);
      return;
    }
    setExpandedSnippet(snippetId);
    if (!comments[snippetId]) fetchComments(snippetId);
  };

  const handleSubmitSnippet = async (e) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;
    setSubmitting(true);
    try {
      await shareSnippet({
        title: title.trim(),
        code,
        language,
        problem_slug: problemSlug || null
      });
      setTitle('');
      setCode('');
      setProblemSlug('');
      setShowForm(false);
    } catch (err) {
      console.error('Error sharing snippet:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (snippetId) => {
    const content = commentInputs[snippetId];
    if (!content?.trim() || !session?.user?.id) return;
    try {
      const { error } = await supabase
        .from('squad_snippet_comments')
        .insert([{
          snippet_id: snippetId,
          user_id: session.user.id,
          content: content.trim()
        }]);

      if (error) throw error;
      setCommentInputs(prev => ({ ...prev, [snippetId]: '' }));
      fetchComments(snippetId);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-emerald-400" />
          Shared Solutions ({snippets.length})
        </h3>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20">
          {showForm ? 'Cancel' : '+ Share Your Solution'}
        </button>
      </div>

      {/* Share Code Form */}
      {showForm && (
        <form onSubmit={handleSubmitSnippet} className="p-4 bg-[#161b22] border border-emerald-500/30 rounded-2xl space-y-3">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Solution Title (e.g. Optimal O(N) 2-Pointer Approach for 3Sum)" className="w-full px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white placeholder-[#6e7681] focus:outline-none focus:border-emerald-500/50" required />
          <div className="flex gap-2">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white capitalize focus:outline-none focus:border-emerald-500/50">
              {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            <input type="text" value={problemSlug} onChange={(e) => setProblemSlug(e.target.value)} placeholder="LeetCode Slug (optional)" className="flex-1 px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white placeholder-[#6e7681] focus:outline-none focus:border-emerald-500/50" />
          </div>
          <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="// Paste clean code snippet here..." rows={6} className="w-full p-4 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500/50" required />
          <button type="submit" disabled={submitting} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-all shadow-lg shadow-emerald-600/20">
            {submitting ? 'Sharing...' : 'Publish Solution to Squad'}
          </button>
        </form>
      )}

      {/* Snippet Feed */}
      {snippets.length === 0 ? (
        <div className="text-center py-12 bg-[#161b22]/40 border border-[#30363d] rounded-2xl">
          <Code className="w-10 h-10 text-[#30363d] mx-auto mb-2" />
          <p className="text-xs text-[#8b949e]">No solutions shared yet. Be the first to share your code!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {snippets.map((snip) => {
            const isExpanded = expandedSnippet === snip.id;
            const snipComments = comments[snip.id] || [];

            return (
              <div key={snip.id} className="p-4 bg-[#161b22] border border-[#30363d] rounded-2xl hover:border-emerald-500/30 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(snip.author?.name)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{snip.title}</h4>
                      <p className="text-[10px] text-[#6e7681]">By {snip.author?.name || 'Member'} • <span className="text-emerald-400 font-mono">{snip.language}</span></p>
                    </div>
                  </div>
                  <button onClick={() => toggleSnippet(snip.id)} className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 font-bold hover:bg-emerald-500/20">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>View & Peer Review</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4 pt-3 border-t border-[#30363d]">
                    <pre className="p-4 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto">
                      <code>{snip.code}</code>
                    </pre>

                    {/* Comments section */}
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold text-[#8b949e]">Peer Comments ({snipComments.length})</h5>
                      {snipComments.map((c) => (
                        <div key={c.id} className="p-2.5 bg-[#0d1117] border border-[#21262d] rounded-xl text-xs flex items-start gap-2">
                          <span className="font-bold text-emerald-400 text-[10px]">{c.author?.name || 'Member'}:</span>
                          <span className="text-[#c9d1d9] flex-1">{c.content}</span>
                        </div>
                      ))}

                      {/* Add comment */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={commentInputs[snip.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [snip.id]: e.target.value })}
                          placeholder="Write a code review comment..."
                          className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white placeholder-[#6e7681] focus:outline-none focus:border-emerald-500/50"
                        />
                        <button onClick={() => handleAddComment(snip.id)} className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
