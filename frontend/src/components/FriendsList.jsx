import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { Users, UserMinus, Flame, CheckCircle2, UserPlus, Search, RefreshCw, Loader2, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const getInitials = (name = '') => {
  if (!name) return 'F';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const avatarGradients = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600'
];

const FriendsList = ({ token, onRemoveFriend, removingId, onOpenAddFriend }) => {
  const { session } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    try {
      if (token) {
        const res = await axios.get(`${API_BASE_URL}/friends`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFriends(res.data?.friends || []);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend friends endpoint unavailable, using Supabase direct query:', err);
    }

    // Direct Supabase fallback
    try {
      const userId = session?.user?.id;
      if (!userId) { setLoading(false); return; }

      const { data: friendRows } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', userId);

      const friendIds = (friendRows || []).map(f => f.friend_id);
      if (friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, leetcode_username')
        .in('id', friendIds);

      const { data: progress } = await supabase
        .from('user_progress')
        .select('user_id, status, solved_at')
        .in('user_id', friendIds)
        .eq('status', 'solved');

      const todayStr = new Date().toISOString().split('T')[0];
      const todayMap = {};
      const totalMap = {};

      (progress || []).forEach(p => {
        totalMap[p.user_id] = (totalMap[p.user_id] || 0) + 1;
        if (p.solved_at && p.solved_at.startsWith(todayStr)) {
          todayMap[p.user_id] = (todayMap[p.user_id] || 0) + 1;
        }
      });

      const formatted = (profiles || []).map(p => ({
        id: p.id,
        name: p.username || p.leetcode_username || 'Friend',
        leetcodeUsername: p.leetcode_username || p.username || '',
        todayCount: todayMap[p.id] || 0,
        platformTotal: totalMap[p.id] || 0
      }));

      setFriends(formatted);
    } catch (fallbackErr) {
      console.error('Supabase friends query error:', fallbackErr);
    } finally {
      setLoading(false);
    }
  }, [token, session]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const filteredFriends = friends.filter(f =>
    (f.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.leetcodeUsername || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dash-card overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-[#21262d]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              Squad Friends List
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                {friends.length} Active
              </span>
            </h3>
            <p className="text-xs text-[#8b949e]">Your added friends and competitive allies</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchFriends}
            className="p-2 rounded-xl bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white transition-all"
            title="Refresh Friends"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenAddFriend}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#CC785C] to-[#DA7756] hover:from-[#B85C3E] hover:to-[#CC785C] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#CC785C]/20 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Add Friend
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-5 py-3 border-b border-[#21262d] bg-[#0d1117]/50">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search friends by name or LeetCode handle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#6e7681] focus:outline-none focus:border-[#CC785C] transition-all"
          />
        </div>
      </div>

      {/* Friends Cards / List */}
      <div className="p-4">
        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-2 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#CC785C]" />
            <p className="text-xs text-[#8b949e]">Loading your friends...</p>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-white/5 text-[#8b949e]">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">No Friends Found</p>
              <p className="text-xs text-[#8b949e] mt-1 max-w-sm mx-auto">
                {search ? "No friends match your search query." : "Add friends by LeetCode handle or email to track their progress together!"}
              </p>
            </div>
            {!search && (
              <button
                onClick={onOpenAddFriend}
                className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#CC785C] to-[#DA7756] hover:from-[#B85C3E] hover:to-[#CC785C] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Add Your First Friend
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredFriends.map((friend, idx) => {
              const initials = getInitials(friend.name);
              const grad = avatarGradients[idx % avatarGradients.length];

              return (
                <div
                  key={friend.id}
                  className="p-3.5 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center justify-between hover:border-[#484f58] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-xs border border-white/20 shadow-md flex-shrink-0`}>
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-white truncate">{friend.name}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#CC785C]" />
                      </div>
                      <p className="text-xs text-[#8b949e] truncate">@{friend.leetcodeUsername || 'leetcode'}</p>

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#8b949e]">
                        <span className="flex items-center gap-1 text-[#CC785C] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Today: {friend.todayCount || 0}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-white">
                          Total: {friend.platformTotal || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFriend(friend.id)}
                    disabled={removingId === friend.id}
                    className="p-2 rounded-xl text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all flex-shrink-0"
                    title="Remove Friend"
                  >
                    {removingId === friend.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                    ) : (
                      <UserMinus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
