import React, { useState } from 'react';
import { X, Search, MessageSquare, ShieldCheck } from 'lucide-react';
import { useSquadStore } from '../../store/useSquadStore';
import { useAuth } from '../../context/AuthContext';

export default function NewDMModal({ isOpen, onClose }) {
  const { session } = useAuth();
  const { members, openDM } = useSquadStore();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const currentUserId = session?.user?.id;
  const filtered = members.filter(m =>
    m.user_id !== currentUserId &&
    (m.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectMember = (userId) => {
    openDM(userId);
    onClose();
  };

  const getInitial = (name) => (name || 'G')[0].toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm bg-[#1a221a] border border-[#3d4a3d] rounded-2xl p-5 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-2 border-b border-[#3d4a3d]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#22c55e]" /> Select Member to Message
          </h3>
          <button onClick={onClose} className="p-1 text-[#869585] hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#869585] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search squad members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#091009] border border-[#3d4a3d] rounded-xl text-xs text-white placeholder-[#869585] focus:outline-none focus:border-[#22c55e]"
          />
        </div>

        <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-[#3d4a3d]">
          {filtered.length === 0 ? (
            <p className="text-xs text-[#869585] text-center py-6">No matching members found.</p>
          ) : (
            filtered.map((m) => (
              <button
                key={m.user_id}
                onClick={() => handleSelectMember(m.user_id)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#23272b] transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center text-[#0e150e] text-xs font-bold">
                    {getInitial(m.name)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-[#22c55e] flex items-center gap-1">
                      {m.name}
                      {m.role === 'admin' && <span title="Admin">👑</span>}
                    </p>
                    <p className="text-[10px] text-[#869585]">@{m.leetcode_username || 'grinder'}</p>
                  </div>
                </div>
                <ShieldCheck className="w-4 h-4 text-[#22c55e] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
