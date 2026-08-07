import React, { useState } from 'react';
import { UserPlus, Loader2, CheckCircle2, AlertCircle, Mail, AtSign } from 'lucide-react';

const AddFriend = ({ onAddFriend }) => {
  const [mode, setMode] = useState('username'); // 'username' | 'email'
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    // Auto-detect email format if input contains '@' and '.'
    if (val.includes('@') && val.includes('.')) {
      setMode('email');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanVal = inputValue.trim();
    if (!cleanVal) return;

    setLoading(true);
    setMessage(null);

    const isEmail = mode === 'email' || (cleanVal.includes('@') && cleanVal.includes('.'));
    const payload = isEmail
      ? { friendEmail: cleanVal }
      : { friendLeetcodeUsername: cleanVal };

    try {
      const result = await onAddFriend(payload);
      setMessage({ type: 'success', text: result?.message || 'Friend added to squad!' });
      setInputValue('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to add friend.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#EA5D3A]/10 border border-[#EA5D3A]/25 text-[#EA5D3A]">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Add Friend to Squad</h3>
            <p className="text-[10px] text-[#737373]">Enter their registered handle or email</p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-[#141414] p-1 rounded-lg border border-[#333333] text-xs">
          <button
            type="button"
            onClick={() => setMode('username')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
              mode === 'username'
                ? 'bg-[#2C2C2C] text-[#EA5D3A] font-semibold'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <AtSign className="w-3 h-3" /> Handle
          </button>
          <button
            type="button"
            onClick={() => setMode('email')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
              mode === 'email'
                ? 'bg-[#2C2C2C] text-[#EA5D3A] font-semibold'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <Mail className="w-3 h-3" /> Email
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2.5">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#737373]">
            {mode === 'email' ? (
              <Mail className="w-3.5 h-3.5" />
            ) : (
              <span className="text-sm font-mono">@</span>
            )}
          </span>
          <input
            type={mode === 'email' ? 'email' : 'text'}
            value={inputValue}
            onChange={handleInputChange}
            placeholder={mode === 'email' ? 'friend@example.com' : 'leetcode_username'}
            required
            className="w-full pl-8 pr-3 py-2.5 bg-[#141414] border border-[#333333] rounded-xl text-[#F4F4F5] placeholder-[#444444] focus:outline-none focus:ring-2 focus:ring-[#EA5D3A] focus:border-transparent text-sm font-mono transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="px-4 py-2.5 bg-gradient-to-r from-[#EA5D3A] to-[#F2704E] hover:from-[#D84C2A] hover:to-[#EA5D3A] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
          <span>Add</span>
        </button>
      </form>

      {message && (
        <div
          className={`mt-3 p-2.5 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn ${
            message.type === 'success'
              ? 'bg-[#EA5D3A]/10 border-[#EA5D3A]/25 text-[#EA5D3A]'
              : 'bg-red-500/10 border-red-500/25 text-red-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default AddFriend;
