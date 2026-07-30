import React, { useState } from 'react';
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const AddFriend = ({ onAddFriend }) => {
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leetcodeUsername.trim()) return;
    setLoading(true); setMessage(null);
    try {
      const result = await onAddFriend(leetcodeUsername.trim());
      setMessage({ type: 'success', text: result?.message || 'Friend added!' });
      setLeetcodeUsername('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to add friend.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="dash-card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#22c55e]">
          <UserPlus className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Add Friend to Squad</h3>
          <p className="text-[10px] text-[#6e7681]">Enter their registered LeetCode handle</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2.5">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#6e7681] text-sm font-mono">@</span>
          <input type="text" value={leetcodeUsername} onChange={(e) => setLeetcodeUsername(e.target.value)}
            placeholder="leetcode_username" required
            className="w-full pl-8 pr-3 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent text-sm font-mono transition-all"
          />
        </div>
        <button type="submit" disabled={loading || !leetcodeUsername.trim()}
          className="px-4 py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
          <span>Add</span>
        </button>
      </form>

      {message && (
        <div className={`mt-3 p-2.5 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn ${
          message.type === 'success' ? 'bg-[#22c55e]/10 border-[#22c55e]/25 text-[#22c55e]' : 'bg-red-500/10 border-red-500/25 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default AddFriend;
