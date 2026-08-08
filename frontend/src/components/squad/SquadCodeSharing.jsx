import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Code, Send, MessageSquare, ChevronDown, ChevronUp, Copy, ExternalLink, Plus } from 'lucide-react';
import { supabase } from '../../supabase';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c', 'typescript', 'go', 'rust', 'sql'];

export default function SquadCodeSharing() {
  const { session } = useAuth();
  const { activeSquad, snippets, shareSnippet } = useSquadStore();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [problemSlug, setProblemSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedSnippet, setExpandedSnippet] = useState(null);
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const fetchComments = async (snippetId) => {
    try {
      const { data, error } = await supabase
        .from('squad_snippet_comments').select('*').eq('snippet_id', snippetId)
        .order('created_at', { ascending: true });
      if (error) throw error;

      const userIds = [...new Set((data || []).map(c => c.user_id))];
      let profileMap = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles').select('id, username, leetcode_username').in('id', userIds);
        (profiles || []).forEach(p => { profileMap[p.id] = p; });
      }

      const enriched = (data || []).map(c => ({
        ...c,
        author: { name: profileMap[c.user_id]?.username || profileMap[c.user_id]?.leetcode_username || 'Member' }
      }));
      setComments(prev => ({ ...prev, [snippetId]: enriched }));
    } catch (err) { console.error(err); }
  };

  const toggleSnippet = (snippetId) => {
    if (expandedSnippet === snippetId) { setExpandedSnippet(null); return; }
    setExpandedSnippet(snippetId);
    if (!comments[snippetId]) fetchComments(snippetId);
  };

  const handleCopyCode = (id, snippetCode) => {
    navigator.clipboard.writeText(snippetCode);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitSnippet = async (e) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;
    setSubmitting(true);
    try {
      await shareSnippet({ title: title.trim(), code, language, problem_slug: problemSlug || null });
      setTitle(''); setCode(''); setProblemSlug(''); setShowForm(false);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleAddComment = async (snippetId) => {
    const content = commentInputs[snippetId];
    if (!content?.trim() || !session?.user?.id) return;
    try {
      const { error } = await supabase.from('squad_snippet_comments').insert([{
        snippet_id: snippetId, user_id: session.user.id, content: content.trim()
      }]);
      if (error) throw error;
      setCommentInputs(prev => ({ ...prev, [snippetId]: '' }));
      fetchComments(snippetId);
    } catch (err) { console.error(err); }
  };

  const getInitial = (name) => (name || '?')[0].toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-[#22d3ee]" /> Shared Code Snippets ({snippets.length})
        </h3>
        <button onClick={() => setShowForm(!showForm)}
          className="px-3.5 py-2 bg-[#EA5D3A] hover:bg-[#f2704e] text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Share Snippet'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmitSnippet} className="p-5 bg-[#1E1E1E] border border-[#333333] rounded-2xl space-y-3">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Snippet Title (e.g. 2-Pointer O(N) solution for 3Sum)" required
            className="w-full px-4 py-2.5 bg-[#141414] border border-[#333333] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#EA5D3A]" />
          <div className="flex gap-2">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-xs text-white focus:outline-none focus:border-[#EA5D3A]">
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input type="text" value={problemSlug} onChange={(e) => setProblemSlug(e.target.value)}
              placeholder="LeetCode Problem Slug (e.g. 3sum)"
              className="flex-1 px-4 py-2 bg-[#141414] border border-[#333333] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#EA5D3A]" />
          </div>
          <textarea value={code} onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste code snippet here..." rows={6} required
            className="w-full p-4 bg-[#141414] border border-[#333333] rounded-xl text-xs text-amber-300 font-mono focus:outline-none focus:border-[#EA5D3A]" />
          <button type="submit" disabled={submitting}
            className="w-full py-2.5 bg-[#EA5D3A] hover:bg-[#f2704e] text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-all shadow-md">
            {submitting ? 'Publishing...' : 'Share Solution'}
          </button>
        </form>
      )}

      {/* Snippets List */}
      <div className="space-y-4">
        {snippets.length === 0 ? (
          <div className="p-8 text-center bg-[#1E1E1E] border border-[#333333] rounded-2xl">
            <Code2 className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">No code snippets shared yet. Click "Share Snippet" to collaborate!</p>
          </div>
        ) : (
          snippets.map(snip => {
            const isExpanded = expandedSnippet === snip.id;
            const snipComments = comments[snip.id] || [];
            return (
              <div key={snip.id} className="p-4 bg-[#1E1E1E] border border-[#333333] rounded-2xl hover:border-[#EA5D3A]/40 transition-all space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#EA5D3A] flex items-center justify-center text-white text-xs font-bold">
                      {getInitial(snip.author?.name)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{snip.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span>By {snip.author?.name || 'Member'}</span>
                        <span>•</span>
                        <span className="text-[#22d3ee] font-mono">{snip.language}</span>
                        {snip.problem_slug && (
                          <>
                            <span>•</span>
                            <a
                              href={`https://leetcode.com/problems/${snip.problem_slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#EA5D3A] hover:underline flex items-center gap-1"
                            >
                              LeetCode <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(snip.id, snip.code)}
                      className="px-2.5 py-1 bg-[#141414] hover:bg-[#262626] text-zinc-200 border border-[#333333] rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedId === snip.id ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => toggleSnippet(snip.id)}
                      className="flex items-center gap-1 text-[11px] text-[#EA5D3A] bg-[#EA5D3A]/10 px-3 py-1 rounded-lg border border-[#EA5D3A]/20 font-bold hover:bg-[#EA5D3A]/20"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Discuss ({snipComments.length})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-4 pt-3 border-t border-[#333333]">
                    <pre className="p-4 bg-[#141414] border border-[#333333] rounded-xl text-xs font-mono text-amber-300 overflow-x-auto">
                      <code>{snip.code}</code>
                    </pre>

                    {/* Comments */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-zinc-400">Peer Discussion ({snipComments.length})</h5>
                      {snipComments.map((c) => (
                        <div key={c.id} className="p-3 bg-[#141414] border border-[#333333] rounded-xl text-xs flex items-start gap-2">
                          <span className="font-bold text-[#EA5D3A]">{c.author?.name}:</span>
                          <span className="text-zinc-200 flex-1">{c.content}</span>
                        </div>
                      ))}

                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={commentInputs[snip.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [snip.id]: e.target.value })}
                          placeholder="Write a code review comment..."
                          className="flex-1 px-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#EA5D3A]"
                        />
                        <button onClick={() => handleAddComment(snip.id)} className="p-2 bg-[#EA5D3A] hover:bg-[#f2704e] text-white rounded-xl font-bold transition-colors">
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
