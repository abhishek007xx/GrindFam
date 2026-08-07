import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSquadStore } from '../../store/useSquadStore';
import { Code, Send, MessageSquare, ChevronDown, ChevronUp, Hash } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-[#96989d]" />
          Shared Solutions ({snippets.length})
        </h3>
        <button onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-xs font-medium transition-colors">
          {showForm ? 'Cancel' : '+ Share Solution'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmitSnippet} className="p-4 bg-[#2f3136] rounded-lg space-y-3 border border-[#202225]">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Solution Title" required
            className="w-full px-3 py-2 bg-[#40444b] rounded text-sm text-[#dcddde] placeholder-[#72767d] outline-none focus:ring-1 focus:ring-[#5865f2]" />
          <div className="flex gap-2">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 bg-[#40444b] rounded text-sm text-[#dcddde] outline-none">
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input type="text" value={problemSlug} onChange={(e) => setProblemSlug(e.target.value)}
              placeholder="LeetCode slug (optional)"
              className="flex-1 px-3 py-2 bg-[#40444b] rounded text-sm text-[#dcddde] placeholder-[#72767d] outline-none focus:ring-1 focus:ring-[#5865f2]" />
          </div>
          <textarea value={code} onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste your code here" rows={6} required
            className="w-full p-3 bg-[#202225] rounded text-xs text-[#3ba55d] font-mono outline-none focus:ring-1 focus:ring-[#5865f2]" />
          <button type="submit" disabled={submitting}
            className="w-full py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-sm font-medium disabled:opacity-40 transition-colors">
            {submitting ? 'Sharing...' : 'Publish to Squad'}
          </button>
        </form>
      )}

      {snippets.length === 0 ? (
        <div className="text-center py-12">
          <Hash className="w-10 h-10 text-[#40444b] mx-auto mb-3" />
          <p className="text-sm text-[#96989d]">No solutions shared yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {snippets.map((snip) => {
            const isExpanded = expandedSnippet === snip.id;
            const snipComments = comments[snip.id] || [];
            return (
              <div key={snip.id} className="bg-[#2f3136] rounded-lg border border-[#202225] hover:border-[#40444b] transition-colors">
                <div className="p-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {getInitial(snip.author?.name)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{snip.title}</h4>
                      <p className="text-[11px] text-[#72767d]">{snip.author?.name || 'Member'} · <span className="text-[#5865f2] font-mono">{snip.language}</span></p>
                    </div>
                  </div>
                  <button onClick={() => toggleSnippet(snip.id)}
                    className="flex items-center gap-1 text-[11px] text-[#96989d] hover:text-[#dcddde] bg-[#40444b] px-2.5 py-1 rounded font-medium transition-colors">
                    <MessageSquare className="w-3 h-3" />
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-[#202225] pt-3">
                    <pre className="p-3 bg-[#202225] rounded text-xs font-mono text-[#3ba55d] overflow-x-auto"><code>{snip.code}</code></pre>
                    <div className="space-y-2">
                      <span className="text-[11px] font-medium text-[#96989d]">Comments ({snipComments.length})</span>
                      {snipComments.map(c => (
                        <div key={c.id} className="p-2 bg-[#202225] rounded text-xs flex gap-2">
                          <span className="font-semibold text-[#5865f2]">{c.author?.name}:</span>
                          <span className="text-[#dcddde] flex-1">{c.content}</span>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input type="text" value={commentInputs[snip.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [snip.id]: e.target.value })}
                          placeholder="Write a review..."
                          className="flex-1 px-3 py-1.5 bg-[#40444b] rounded text-xs text-[#dcddde] placeholder-[#72767d] outline-none" />
                        <button onClick={() => handleAddComment(snip.id)}
                          className="p-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded transition-colors">
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
