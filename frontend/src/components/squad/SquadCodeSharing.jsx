import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Code, Send, MessageSquare, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c', 'typescript', 'go', 'rust', 'sql'];

export default function SquadCodeSharing() {
  const { session, profile } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [problemSlug, setProblemSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedSnippet, setExpandedSnippet] = useState(null);
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const token = session?.access_token;

  const fetchSnippets = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/squads/snippets`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSnippets(data.snippets || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchSnippets(); }, [fetchSnippets]);

  const handleSubmitSnippet = async (e) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/squads/snippets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), code, language, problem_slug: problemSlug || null })
      });
      setTitle(''); setCode(''); setProblemSlug(''); setShowForm(false);
      fetchSnippets();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const fetchComments = async (snippetId) => {
    try {
      const res = await fetch(`${API_BASE}/api/squads/snippets/${snippetId}/comments`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setComments(prev => ({ ...prev, [snippetId]: data.comments || [] }));
    } catch (err) { console.error(err); }
  };

  const toggleSnippet = (snippetId) => {
    if (expandedSnippet === snippetId) { setExpandedSnippet(null); return; }
    setExpandedSnippet(snippetId);
    if (!comments[snippetId]) fetchComments(snippetId);
  };

  const handleAddComment = async (snippetId) => {
    const content = commentInputs[snippetId];
    if (!content?.trim()) return;
    try {
      await fetch(`${API_BASE}/api/squads/snippets/${snippetId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: content.trim() })
      });
      setCommentInputs(prev => ({ ...prev, [snippetId]: '' }));
      fetchComments(snippetId);
    } catch (err) { console.error(err); }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Share Snippet Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-indigo-400" />
          Shared Solutions ({snippets.length})
        </h3>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20">
          {showForm ? 'Cancel' : '+ Share Your Solution'}
        </button>
      </div>

      {/* New Snippet Form */}
      {showForm && (
        <form onSubmit={handleSubmitSnippet} className="p-5 bg-[#161b22] border border-[#30363d] rounded-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Solution title (e.g. Two Sum - HashMap)" className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white placeholder-[#6e7681] focus:outline-none focus:border-indigo-500/50" required />
            <div className="flex gap-2">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50">
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <input type="text" value={problemSlug} onChange={(e) => setProblemSlug(e.target.value)} placeholder="LeetCode slug (optional)" className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white placeholder-[#6e7681] focus:outline-none focus:border-indigo-500/50" />
            </div>
          </div>
          <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste your code here..." rows={8} className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-emerald-400 font-mono placeholder-[#6e7681] focus:outline-none focus:border-indigo-500/50 resize-none" required />
          <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-40 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Share with Squad</span>
          </button>
        </form>
      )}

      {/* Snippets List */}
      {snippets.length === 0 ? (
        <div className="text-center py-12 bg-[#161b22]/30 border border-[#30363d] rounded-2xl">
          <Code className="w-10 h-10 text-[#30363d] mx-auto mb-3" />
          <p className="text-sm text-[#8b949e]">No solutions shared yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {snippets.map(snippet => (
            <div key={snippet.id} className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-colors">
              {/* Snippet Header */}
              <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleSnippet(snippet.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {getInitials(snippet.author?.name)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{snippet.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#8b949e]">{snippet.author?.name || 'Unknown'}</span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">{snippet.language}</span>
                      {snippet.problem_slug && (
                        <span className="text-[10px] text-emerald-400">#{snippet.problem_slug}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#8b949e]">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{comments[snippet.id]?.length || 0}</span>
                  {expandedSnippet === snippet.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Expanded Code + Comments */}
              {expandedSnippet === snippet.id && (
                <div className="border-t border-[#21262d]">
                  <pre className="p-4 bg-[#0d1117] text-xs font-mono text-emerald-400 overflow-x-auto max-h-64">
                    <code>{snippet.code}</code>
                  </pre>

                  {/* Peer Review Comments */}
                  <div className="p-4 space-y-3 border-t border-[#21262d]">
                    <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">Peer Review Comments</span>
                    {(comments[snippet.id] || []).length === 0 ? (
                      <p className="text-xs text-[#6e7681]">No comments yet. Be the first to review!</p>
                    ) : (
                      <div className="space-y-2">
                        {(comments[snippet.id] || []).map(c => (
                          <div key={c.id} className="p-3 bg-[#0d1117] border border-[#21262d] rounded-xl flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-400 text-[9px] font-bold flex-shrink-0">
                              {getInitials(c.author?.name)}
                            </div>
                            <div>
                              <span className="text-[10px] text-[#8b949e] font-bold">{c.author?.name || 'Member'}</span>
                              <p className="text-xs text-[#e6edf3] mt-0.5">{c.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInputs[snippet.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [snippet.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(snippet.id)}
                        placeholder="Add a review comment..."
                        className="flex-1 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs text-white placeholder-[#6e7681] focus:outline-none focus:border-indigo-500/50"
                      />
                      <button onClick={() => handleAddComment(snippet.id)} className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
