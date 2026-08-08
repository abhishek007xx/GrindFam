import React, { useState, useEffect } from 'react';
import { useSquadStore } from '../../store/useSquadStore';
import { useAuth } from '../../context/AuthContext';

export default function StitchCodeReviewHub() {
  const { session } = useAuth();
  const { activeSquad, peerReviews, fetchPeerReviews, giveKudos, addLineAnnotation, submitPeerReview } = useSquadStore();
  
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('All');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newLanguage, setNewLanguage] = useState('javascript');
  const [newNotes, setNewNotes] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (activeSquad?.id) {
      fetchPeerReviews(activeSquad.id);
    }
  }, [activeSquad?.id, fetchPeerReviews]);

  const filteredReviews = peerReviews.filter(r => {
    if (selectedLanguageFilter === 'All') return true;
    return (r.language || '').toLowerCase() === selectedLanguageFilter.toLowerCase();
  });

  const activeReview = filteredReviews.find(r => r.id === activeReviewId) || filteredReviews[0] || peerReviews[0];

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;
    try {
      await submitPeerReview({
        squadId: activeSquad.id,
        problemTitle: newTitle,
        codeSnippet: newCode,
        language: newLanguage,
        notes: newNotes,
        difficulty: 'Medium'
      });
      setIsCreating(false);
      setNewTitle('');
      setNewCode('');
      setNewNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !activeReview) return;
    try {
      await addLineAnnotation({
        reviewId: activeReview.id,
        lineNumber: 0,
        commentText: newComment
      });
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const languages = ['All', 'C++', 'Java', 'Python', 'JavaScript'];

  return (
    <div className="flex flex-1 overflow-hidden p-4 md:p-6 gap-6 w-full mx-auto font-['Inter'] antialiased">
      {/* Left Column: Snippet List (35%) */}
      <section className="w-full lg:w-[35%] flex flex-col h-full gap-4">
        <div className="flex justify-between items-center">
          <h2 className="font-['Outfit'] text-xl font-bold text-[#e5e2e1]">Review Queue</h2>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-[#EA5D3A] text-white px-4 py-2 rounded text-sm font-medium hover:brightness-110 hover:shadow-[0_0_8px_rgba(234,93,58,0.5)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">{isCreating ? 'close' : 'add'}</span>
            {isCreating ? 'Cancel' : 'New Snippet'}
          </button>
        </div>

        {/* Language Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {languages.map(lang => (
            <button 
              key={lang}
              onClick={() => setSelectedLanguageFilter(lang)}
              className={`px-3 py-1 rounded-full text-xs font-['JetBrains_Mono'] whitespace-nowrap transition-colors cursor-pointer ${
                selectedLanguageFilter === lang 
                  ? 'bg-[#03b5d3]/20 text-[#4cd7f6] border border-[#4cd7f6]/50 font-bold' 
                  : 'bg-[#353534]/50 text-[#e1bfb7] border border-transparent hover:border-[#333333]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Snippet List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 chat-scroll">
          {filteredReviews.length === 0 && !isCreating && (
            <p className="text-[#e1bfb7] text-sm text-center mt-10">No code reviews match this filter.</p>
          )}
          {filteredReviews.map((review, idx) => {
            const isActive = activeReview?.id === review.id;
            const borderColors = ['border-l-[#EA5D3A]', 'border-l-[#10B981]', 'border-l-[#EF4444]', 'border-l-[#F59E0B]'];
            const borderColor = borderColors[idx % borderColors.length];
            return (
              <div 
                key={review.id} 
                onClick={() => setActiveReviewId(review.id)}
                className={`glass-panel bg-[rgba(30,30,30,0.85)] p-4 rounded-lg border-l-4 ${borderColor} cursor-pointer interactive-glow transition-all group relative overflow-hidden`}
              >
                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-[#4cd7f6]/10 to-transparent opacity-100 z-0"></div>}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-['Inter'] text-base font-semibold transition-colors ${isActive ? 'text-[#4cd7f6]' : 'text-[#e5e2e1] group-hover:text-[#4cd7f6]'}`}>
                      {review.problem_title}
                    </h3>
                    <span className="text-xs text-[#e1bfb7] font-['JetBrains_Mono']">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-[#131313] text-[#e5e2e1] border border-[#333333]">{review.language}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-[#131313] text-[#e5e2e1] border border-[#333333]">{review.difficulty}</span>
                  </div>
                  <div className="bg-[#0e0e0e] p-2 rounded border border-[#333333] font-['JetBrains_Mono'] text-[12px] text-[#e1bfb7] overflow-hidden h-[44px] opacity-70">
                    <code>{review.code_snippet.split('\n')[0]}</code><br/>
                    <code>{review.code_snippet.split('\n')[1] || ''}</code>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right Column: Snippet Detail (65%) */}
      <section className="hidden lg:flex w-[65%] flex-col h-full bg-[#1c1b1b] rounded-xl border border-[#333333] overflow-hidden shadow-xl min-h-[600px]">
        {isCreating ? (
          <div className="p-6 flex flex-col h-full bg-[#131313]">
            <h1 className="font-['Outfit'] text-2xl font-bold text-[#e5e2e1] mb-6">Post Code Review</h1>
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 flex-1">
              <div>
                <label className="block text-sm text-[#e1bfb7] mb-1">Problem Title</label>
                <input 
                  type="text" 
                  value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#333333] rounded p-2 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#4cd7f6]"
                  placeholder="e.g. Optimize Dijkstra's Inner Loop" required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-[#e1bfb7] mb-1">Language</label>
                  <select 
                    value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-[#333333] rounded p-2 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#4cd7f6]"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-sm text-[#e1bfb7] mb-1">Code Snippet</label>
                <textarea 
                  value={newCode} onChange={(e) => setNewCode(e.target.value)}
                  className="w-full flex-1 bg-[#0D0D0D] border border-[#333333] rounded p-2 font-['JetBrains_Mono'] text-sm text-[#e5e2e1] focus:outline-none focus:border-[#4cd7f6] resize-none"
                  placeholder="Paste your code here..." required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm text-[#e1bfb7] mb-1">Notes (Optional)</label>
                <textarea 
                  value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#333333] rounded p-2 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#4cd7f6] resize-none"
                  placeholder="What do you need help with?"
                ></textarea>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-[#4cd7f6] text-[#0D0D0D] px-6 py-2 rounded font-bold hover:brightness-110 transition-all cursor-pointer">
                  Post for Review
                </button>
              </div>
            </form>
          </div>
        ) : activeReview ? (
          <>
            {/* Detail Header */}
            <div className="p-5 border-b border-[#333333] flex justify-between items-start bg-[#131313]/50">
              <div>
                <h1 className="font-['Outfit'] text-2xl font-bold text-[#e5e2e1] mb-2">{activeReview.problem_title}</h1>
                <div className="flex items-center gap-4 text-sm text-[#e1bfb7] font-['JetBrains_Mono']">
                  <span className="flex items-center gap-1">
                    @{activeReview.author_name}
                  </span>
                  <span>•</span>
                  <span>{activeReview.language}</span>
                  <span>•</span>
                  <span className={activeReview.status === 'resolved' ? 'text-[#10B981]' : 'text-[#4cd7f6]'}>
                    {activeReview.status === 'resolved' ? 'Resolved' : 'Needs Review'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => giveKudos(activeReview.id)}
                className="bg-transparent border border-[#4cd7f6] text-[#4cd7f6] px-4 py-2 rounded text-sm font-medium hover:bg-[#4cd7f6]/10 hover:shadow-[0_0_10px_rgba(76,215,246,0.3)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
                Kudos ({activeReview.kudos_count || 0})
              </button>
            </div>

            {/* Code Editor Area */}
            <div className="flex-1 overflow-y-auto bg-[#0D0D0D] relative font-['JetBrains_Mono'] text-sm">
              <div className="flex min-h-full relative">
                {/* Gutter */}
                <div className="w-12 bg-[#131313] flex flex-col text-right pr-2 py-4 text-[#555] border-r border-[#333333] select-none text-xs">
                  {activeReview.code_snippet.split('\n').map((_, i) => (
                    <div key={i} className="py-[2px]">{i + 1}</div>
                  ))}
                </div>
                
                {/* Code Content */}
                <div className="flex-1 p-4 overflow-x-auto text-[#d4d4d4] whitespace-pre pt-4">
                  {activeReview.code_snippet}
                </div>
              </div>
            </div>

            {/* General Comments Thread */}
            <div className="h-1/3 min-h-[250px] bg-[#353534] border-t border-[#333333] flex flex-col font-['Inter']">
              <div className="p-3 border-b border-[#333333] flex items-center justify-between bg-[#131313]/50">
                <h3 className="font-['Outfit'] text-sm font-semibold text-[#e5e2e1] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">forum</span> Discussion
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {activeReview.notes && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full border border-[#333333] bg-[#0e0e0e] flex items-center justify-center text-white font-bold">
                      {activeReview.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="bg-[#131313] p-3 rounded-lg border border-[#333333] rounded-tl-none">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-sm text-[#e5e2e1]">@{activeReview.author_name} (Author)</span>
                        </div>
                        <p className="text-sm text-[#e1bfb7]">{activeReview.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeReview.annotations?.map((ann) => (
                  <div key={ann.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full border border-[#333333] bg-[#353534] flex items-center justify-center text-white font-bold">
                      {ann.reviewer_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="bg-[#131313] p-3 rounded-lg border border-[#333333] rounded-tl-none">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-sm text-[#e5e2e1]">@{ann.reviewer_name}</span>
                          <span className="text-xs text-[#e1bfb7]">{new Date(ann.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-[#e1bfb7]">{ann.comment_text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Comment Input */}
              <div className="p-3 bg-[#131313] border-t border-[#333333]">
                <div className="relative">
                  <textarea 
                    value={newComment} onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-[#333333] rounded p-3 pr-12 text-sm text-[#e5e2e1] focus:outline-none focus:border-[#4cd7f6] focus:shadow-[0_0_8px_rgba(76,215,246,0.3)] transition-all resize-none h-[60px]" 
                    placeholder="Leave a review comment..."
                  ></textarea>
                  <button 
                    onClick={handlePostComment}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4cd7f6] p-2 hover:bg-[#4cd7f6]/10 rounded-full transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-[#e1bfb7]">
            <p>Select a snippet to review</p>
          </div>
        )}
      </section>
    </div>
  );
}
