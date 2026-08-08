import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ShieldCheck, Crown, MessageSquare } from 'lucide-react';
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
      <div className="w-full max-w-sm bg-[#1E1E1E] border border-[#333333] rounded-2xl p-5 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-2 border-b border-[#333333]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#EA5D3A]" /> Select Member to Message
          </h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search squad members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#141414] border border-[#333333] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#EA5D3A]"
          />
        </div>

        <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-[#333333]">
          {filtered.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No matching members found.</p>
          ) : (
            filtered.map((m) => (
              <button
                key={m.user_id}
                onClick={() => handleSelectMember(m.user_id)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#262626] transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EA5D3A] flex items-center justify-center text-white text-xs font-bold">
                    {getInitial(m.name)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-[#EA5D3A] flex items-center gap-1">
                      {m.name}
                      {m.role === 'admin' && <Crown className="w-3.5 h-3.5 text-amber-400" title="Admin" />}
                    </p>
                    <p className="text-[10px] text-zinc-400">@{m.leetcode_username || 'grinder'}</p>
                  </div>
                </div>
                <ShieldCheck className="w-4 h-4 text-[#EA5D3A] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
