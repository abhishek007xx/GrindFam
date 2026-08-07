import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, Code, Send } from 'lucide-react';
import useOptimisticMessages from '../../hooks/useOptimisticMessages';

export function PeerCodeReviewQueue() {
  const initialReviews = [
    {
      id: 'rev-1',
      author: 'Alex G.',
      problemTitle: 'Trapping Rain Water (Hard)',
      language: 'C++',
      kudos: 14,
      codeSnippet: `int trap(vector<int>& height) {
    int l = 0, r = height.size() - 1;
    int leftMax = 0, rightMax = 0, res = 0;
    while (l < r) { ... }
    return res;
}`,
      comment: 'Line 4: Used Two Pointer approach for O(N) time and O(1) auxiliary space.'
    },
    {
      id: 'rev-2',
      author: 'Priya K.',
      problemTitle: 'Lowest Common Ancestor of Binary Tree (Medium)',
      language: 'Python',
      kudos: 8,
      codeSnippet: `def lowestCommonAncestor(self, root, p, q):
    if not root or root == p or root == q:
        return root
    left = self.lowestCommonAncestor(root.left, p, q)
    right = self.lowestCommonAncestor(root.right, p, q)`,
      comment: 'Line 3: Clean post-order recursion. Pass test cases in 18ms.'
    }
  ];

  const { items: reviews, setItems } = useOptimisticMessages(initialReviews);
  const [commentInput, setCommentInput] = useState({});

  const handleKudos = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, kudos: item.kudos + 1 } : item))
    );
  };

  const handleAddComment = (id) => {
    const text = commentInput[id];
    if (!text || !text.trim()) return;
    alert(`Comment submitted on review: "${text}" (+5 Reviewer XP awarded)`);
    setCommentInput({ ...commentInput, [id]: '' });
  };

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddComment(id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-[#21262D] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#F3F4F6] flex items-center gap-2">
            <Code className="w-5 h-5 text-[#EA5D3A]" aria-hidden="true" />
            <span>Peer Code Review Queue</span>
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Review squadmates' solution logic, leave line-item feedback, and earn Peer Reviewer XP.
          </p>
        </div>
      </div>

      {/* Review Queue Items */}
      <div className="space-y-4">
        <AnimatePresence>
          {reviews.map((rev, idx) => (
            <motion.article
              key={rev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              className="bg-[#161B22] border border-[#30363D] hover:border-[#4B5563] rounded-xl p-5 space-y-4 transition-all"
            >
              {/* Header: Author + Problem Title */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="px-2 py-0.5 rounded bg-[#1F2937] text-[#EA5D3A] text-[10px] font-bold border border-[#30363D]">
                    {rev.language}
                  </span>
                  <h3 className="text-sm font-bold text-[#F3F4F6]">{rev.problemTitle}</h3>
                  <p className="text-xs text-[#9CA3AF]">
                    Submitted by <strong className="text-white">{rev.author}</strong>
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleKudos(rev.id)}
                  aria-label={`Give Kudos to ${rev.author}. Current kudos count: ${rev.kudos}`}
                  className="px-3 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#252D3B] text-[#10B981] border border-[#10B981]/30 text-xs font-bold transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
                >
                  <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Kudos ({rev.kudos})</span>
                </motion.button>
              </div>

              {/* Code Snippet Container */}
              <div
                tabIndex={0}
                aria-label={`Code snippet for ${rev.problemTitle}`}
                className="bg-[#0D1117] border border-[#21262D] rounded-lg p-3 font-mono text-xs text-[#F3F4F6] overflow-x-auto focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#EA5D3A]"
              >
                <pre>{rev.codeSnippet}</pre>
              </div>

              {/* Line Comment Annotation */}
              <div className="bg-[#1F2937]/50 border border-[#30363D] rounded-lg p-3 text-xs text-[#9CA3AF] flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-[#EA5D3A] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{rev.comment}</span>
              </div>

              {/* Input Comment Box */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#21262D]">
                <input
                  type="text"
                  value={commentInput[rev.id] || ''}
                  onChange={(e) => setCommentInput({ ...commentInput, [rev.id]: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, rev.id)}
                  placeholder="Leave line feedback or feedback (Press Enter to submit)..."
                  aria-label={`Leave review comment on ${rev.author}'s solution`}
                  className="flex-1 px-3 py-1.5 bg-[#0D1117] border border-[#21262D] rounded-lg text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#EA5D3A] focus-visible:ring-1 focus-visible:ring-[#EA5D3A]"
                />
                <button
                  onClick={() => handleAddComment(rev.id)}
                  aria-label="Submit code review comment"
                  className="px-3 py-1.5 bg-[#EA5D3A] hover:bg-[#F2633F] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Review</span>
                </button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PeerCodeReviewQueue;
