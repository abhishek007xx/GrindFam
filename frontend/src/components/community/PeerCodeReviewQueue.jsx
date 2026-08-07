import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, Code, Send, Plus, X, Loader2, CheckCircle } from 'lucide-react';
import { useSquadStore } from '../../store/useSquadStore';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_SAMPLE_REVIEWS = [
  {
    id: 'sample-review-1',
    author_name: 'AlgoNinja_92',
    problem_title: '3Sum (Medium)',
    notes: 'Looking for feedback on spatial complexity — can we optimize memory overhead?',
    status: 'pending',
    kudos_count: 5,
    created_at: new Date().toISOString(),
    code_snippet: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (sum === 0) {
        res.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l + 1]) l++;
        while (l < r && nums[r] === nums[r - 1]) r--;
        l++; r--;
      } else if (sum < 0) l++;
      else r--;
    }
  }
  return res;
}`,
    annotations: [
      { id: 'ann-1', line_number: 2, reviewer_name: 'GraphMaster', comment_text: 'Sorting in-place O(N log N) is fine, space complexity is O(1) auxiliary.' }
    ]
  }
];

export function PeerCodeReviewQueue() {
  const { session } = useAuth();
  const { 
    activeSquad, 
    peerReviews, 
    fetchPeerReviews, 
    submitPeerReview, 
    addLineAnnotation, 
    giveKudos 
  } = useSquadStore();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'approved'
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Submit Form State
  const [problemTitle, setProblemTitle] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [notes, setNotes] = useState('');

  // Annotation Form State
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [annotatingLine, setAnnotatingLine] = useState(null);
  const [annotationText, setAnnotationText] = useState('');
  const [submittingAnnotation, setSubmittingAnnotation] = useState(false);

  useEffect(() => {
    if (activeSquad?.id) {
      fetchPeerReviews(activeSquad.id);
    }
  }, [activeSquad?.id, fetchPeerReviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!problemTitle.trim() || !codeSnippet.trim() || submitting) return;
    
    const targetSquadId = activeSquad?.id;
    if (!targetSquadId) {
      alert('Please join or select a Squad Pod before submitting code for review!');
      return;
    }

    setSubmitting(true);
    try {
      await submitPeerReview({
        squadId: targetSquadId,
        problemTitle,
        difficulty: 'Medium',
        codeSnippet,
        language: 'javascript',
        notes
      });
      setShowSubmitModal(false);
      setProblemTitle('');
      setCodeSnippet('');
      setNotes('');
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAnnotation = async (reviewId) => {
    if (!annotationText.trim() || annotatingLine === null || submittingAnnotation) return;
    
    setSubmittingAnnotation(true);
    try {
      await addLineAnnotation({
        reviewId,
        lineNumber: annotatingLine,
        commentText: annotationText
      });
      setAnnotatingLine(null);
      setAnnotationText('');
    } catch (err) {
      console.error('Failed to add annotation:', err);
    } finally {
      setSubmittingAnnotation(false);
    }
  };

  const handleKudos = async (reviewId) => {
    await giveKudos(reviewId);
  };

  // Filter logic memoized for performance with fallback to default sample reviews
  const reviewsToDisplay = peerReviews.length > 0 ? peerReviews : DEFAULT_SAMPLE_REVIEWS;

  const filteredReviews = useMemo(() => {
    return reviewsToDisplay.filter(review => {
      if (activeTab === 'all') return true;
      if (activeTab === 'approved') return review.status === 'approved';
      if (activeTab === 'pending') return review.status === 'pending' && review.author_id !== session?.user?.id;
      return true;
    });
  }, [reviewsToDisplay, activeTab, session?.user?.id]);

  return (
    <div className="space-y-6" aria-live="polite">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#F4F4F5] tracking-tight">Peer Code Review</h2>
          <p className="text-xs text-[#9CA3AF] mt-1">Get feedback from your squad on time & space complexity.</p>
        </div>
        
        <button
          onClick={() => setShowSubmitModal(true)}
          aria-haspopup="dialog"
          aria-expanded={showSubmitModal}
          className="px-4 py-2 bg-[#EA5D3A] hover:bg-[#F2633F] text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA5D3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Submit for Review</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#27272A] pb-2" role="tablist" aria-label="Review Queue Filters">
        {['all', 'pending', 'approved'].map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA5D3A] ${
              activeTab === tab 
                ? 'border-[#EA5D3A] text-[#EA5D3A]' 
                : 'border-transparent text-[#9CA3AF] hover:text-[#F4F4F5]'
            }`}
          >
            {tab === 'all' && 'All Reviews'}
            {tab === 'pending' && 'Pending My Review'}
            {tab === 'approved' && 'Approved'}
          </button>
        ))}
      </div>

      {/* Review Queue List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-10 bg-[#121215] border border-[#27272A] rounded-xl">
            <Code className="w-8 h-8 text-[#6B7280] mx-auto mb-3" />
            <p className="text-sm text-[#9CA3AF]">No reviews found in this category.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-[#121215] border rounded-xl overflow-hidden shadow-sm transition-colors ${
                  review.isPending ? 'border-[#EA5D3A]/50 opacity-70' : 'border-[#27272A]'
                }`}
              >
                {/* Review Header */}
                <div className="p-4 border-b border-[#222225] flex items-start justify-between bg-[#09090B]/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#F4F4F5]">{review.author_name}</span>
                      <span className="text-[#6B7280] text-xs">submitted</span>
                      <span className="text-[#EA5D3A] font-semibold text-sm">{review.problem_title}</span>
                    </div>
                    {review.notes && (
                      <p className="text-xs text-[#9CA3AF] mt-1">{review.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {review.status === 'approved' && (
                      <span className="px-2 py-1 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Approved
                      </span>
                    )}
                    <button
                      onClick={() => handleKudos(review.id)}
                      aria-label={`Give kudos to ${review.author_name}'s solution. Current kudos: ${review.kudos_count || 0}`}
                      className="flex items-center gap-1.5 px-2 py-1 bg-[#18181B] hover:bg-[#252D3B] text-[#9CA3AF] hover:text-[#EA5D3A] border border-[#27272A] rounded-md transition-colors text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA5D3A]"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{review.kudos_count || 0}</span>
                    </button>
                  </div>
                </div>

                {/* Code Snippet with Line Actions */}
                <div className="p-4 bg-[#09090B] font-mono text-xs overflow-x-auto scrollbar-thin scrollbar-thumb-[#27272A]">
                  <pre className="text-[#F4F4F5]">
                    {review.code_snippet.split('\n').map((line, idx) => {
                      const lineNum = idx + 1;
                      const hasAnnotation = review.annotations?.some(a => a.line_number === lineNum);
                      const isAnnotatingThisLine = activeReviewId === review.id && annotatingLine === lineNum;
                      
                      return (
                        <div key={lineNum} className="group flex hover:bg-[#121215] transition-colors relative pr-12">
                          <span className="w-8 flex-shrink-0 text-[#6B7280] select-none text-right pr-3 border-r border-[#27272A] mr-3">
                            {lineNum}
                          </span>
                          <span className="flex-1 whitespace-pre">{line || ' '}</span>
                          
                          {/* Add Annotation Button (Hover) */}
                          <button
                            onClick={() => {
                              setActiveReviewId(review.id);
                              setAnnotatingLine(lineNum);
                              setAnnotationText('');
                            }}
                            className="absolute right-2 top-0 bottom-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-[#6B7280] hover:text-[#EA5D3A] px-2 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA5D3A]"
                            aria-label={`Add comment on line ${lineNum}`}
                            title={`Add comment on line ${lineNum}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      );
                    })}
                  </pre>
                </div>

                {/* Annotations List */}
                {review.annotations?.length > 0 && (
                  <div className="border-t border-[#27272A] bg-[#121215] divide-y divide-[#27272A]">
                    {review.annotations.map(ann => (
                      <div key={ann.id} className={`p-3 flex gap-3 text-xs ${ann.isPending ? 'opacity-70' : ''}`}>
                        <div className="w-10 h-6 flex items-center justify-center bg-[#18181B] text-[#9CA3AF] font-mono rounded border border-[#27272A] flex-shrink-0">
                          L{ann.line_number}
                        </div>
                        <div>
                          <div className="font-bold text-[#F4F4F5] mb-0.5">{ann.reviewer_name}</div>
                          <div className="text-[#9CA3AF]">{ann.comment_text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Annotation Input */}
                {activeReviewId === review.id && annotatingLine !== null && (
                  <div className="p-3 border-t border-[#EA5D3A]/40 bg-[#18181B]/50 flex gap-3">
                    <div className="w-10 h-8 flex items-center justify-center bg-[#EA5D3A]/20 text-[#EA5D3A] font-mono rounded border border-[#EA5D3A]/40 font-bold text-xs">
                      L{annotatingLine}
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        autoFocus
                        value={annotationText}
                        onChange={(e) => setAnnotationText(e.target.value)}
                        placeholder="Add review comment..."
                        aria-label={`Annotation comment for line ${annotatingLine}`}
                        className="w-full bg-[#09090B] border border-[#27272A] focus:border-[#EA5D3A] rounded-md py-1.5 px-3 text-xs text-[#F4F4F5] outline-none pr-10 focus-visible:ring-2 focus-visible:ring-[#EA5D3A]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddAnnotation(review.id);
                          if (e.key === 'Escape') setAnnotatingLine(null);
                        }}
                      />
                      <button
                        onClick={() => handleAddAnnotation(review.id)}
                        disabled={!annotationText.trim() || submittingAnnotation}
                        aria-label="Submit annotation"
                        className="absolute right-1.5 top-1.5 text-[#EA5D3A] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA5D3A] rounded"
                      >
                        {submittingAnnotation ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Send className="w-3.5 h-3.5" aria-hidden="true" />}
                      </button>
                    </div>
                    <button onClick={() => setAnnotatingLine(null)} aria-label="Cancel annotation" className="text-[#6B7280] hover:text-[#F4F4F5] p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA5D3A] rounded">
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#09090B]/80 backdrop-blur-sm z-50"
              onClick={() => setShowSubmitModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#121215] border border-[#27272A] rounded-2xl shadow-2xl z-50 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 id="modal-title" className="text-xl font-bold text-white">Submit Solution for Review</h3>
                <button onClick={() => setShowSubmitModal(false)} aria-label="Close modal" className="text-[#6B7280] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA5D3A] rounded">
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1.5">Problem Title</label>
                  <input
                    type="text"
                    required
                    value={problemTitle}
                    onChange={(e) => setProblemTitle(e.target.value)}
                    placeholder="e.g., Binary Tree Level Order Traversal"
                    className="w-full bg-[#09090B] border border-[#27272A] focus:border-[#EA5D3A] rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1.5">Implementation (Paste Code)</label>
                  <textarea
                    required
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="function solution() { ... }"
                    className="w-full h-48 bg-[#09090B] border border-[#27272A] focus:border-[#EA5D3A] rounded-lg px-4 py-3 text-sm text-white font-mono outline-none transition-colors scrollbar-thin"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9CA3AF] mb-1.5">Context / What needs review?</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Is my space complexity O(1) or O(N)?"
                    className="w-full bg-[#09090B] border border-[#27272A] focus:border-[#EA5D3A] rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-5 py-2.5 bg-[#18181B] hover:bg-[#252D3B] text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !problemTitle.trim() || !codeSnippet.trim()}
                    className="px-5 py-2.5 bg-[#EA5D3A] hover:bg-[#F2633F] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Submit</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PeerCodeReviewQueue;
