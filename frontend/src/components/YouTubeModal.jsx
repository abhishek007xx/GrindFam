import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Youtube } from 'lucide-react';

export function YouTubeModal({ isOpen, onClose, videoUrl, problemTitle }) {
  if (!isOpen || !videoUrl) return null;

  // Convert youtube.com/watch?v=ID or youtu.be/ID to embed URL
  let embedUrl = null;
  const watchMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    embedUrl = `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1`;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-4xl bg-[#09090B] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#222225] bg-[#121215]/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                <Youtube className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white truncate max-w-[500px]">
                  Concept Tutorial: {problemTitle}
                </h3>
                <p className="text-[11px] text-[#A1A1AA]">Watch video explanation & step-by-step walk-through</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121215] hover:bg-white/5 border border-[#27272A] text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`Tutorial for ${problemTitle}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="text-center p-8 space-y-4">
                <Youtube className="w-16 h-16 text-red-500 mx-auto opacity-80 animate-pulse" />
                <div>
                  <h4 className="text-base font-bold text-white">Search Tutorial on YouTube</h4>
                  <p className="text-xs text-[#A1A1AA] mt-1 max-w-md mx-auto">
                    Click the button below to view the top video explanation for "{problemTitle}".
                  </p>
                </div>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Search on YouTube</span>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default YouTubeModal;
