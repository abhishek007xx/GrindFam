import React, { useState } from 'react';
import { Target, X, Check, Loader2 } from 'lucide-react';

const EditTargetModal = ({ isOpen, currentTarget = 5, onClose, onSave }) => {
  const [targetValue, setTargetValue] = useState(currentTarget);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseInt(targetValue, 10);
    if (isNaN(val) || val < 1) { setError('Minimum target is 1.'); return; }
    setLoading(true); setError(null);
    try { await onSave(val); onClose(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to update target.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-[#121215] p-7 rounded-2xl border border-[#27272A] shadow-2xl shadow-black/40 relative animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all hover:rotate-90 duration-200">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#22c55e]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Edit Group Target</h3>
            <p className="text-[11px] text-[#A1A1AA]">Updates for everyone in your squad</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">Questions Per Day</label>
            <input type="number" min="1" max="100" required value={targetValue} onChange={(e) => setTargetValue(e.target.value)}
              className="w-full px-4 py-3 bg-[#09090B] border border-[#27272A] rounded-xl text-white font-extrabold text-2xl text-center focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
            />
          </div>
          {error && <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs text-center">{error}</div>}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#222225]">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[#222225] hover:bg-[#27272A] text-[#A1A1AA] rounded-xl text-xs font-semibold transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTargetModal;
