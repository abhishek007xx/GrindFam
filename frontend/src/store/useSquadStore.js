import { create } from 'zustand';
import { supabase } from '../supabase';

export const useSquadStore = create((set, get) => ({
  mySquads: [],
  communitySquads: [],
  activeSquad: null,
  activeChannel: 'general',
  members: [],
  messages: [],
  snippets: [],
  challenges: [],
  loading: false,
  error: null,
  realtimeChannel: null,
  typingUsers: [],
  showMemberList: true,

  setActiveChannel: (channel) => set({ activeChannel: channel }),
  toggleMemberList: () => set((s) => ({ showMemberList: !s.showMemberList })),

  loadMySquads: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { set({ loading: false }); return; }

      const { data: memberRows, error: memErr } = await supabase
        .from('squad_members').select('*').eq('user_id', user.id);
      if (memErr) throw memErr;

      const squadIds = (memberRows || []).map(m => m.squad_id);
      if (squadIds.length === 0) {
        set({ mySquads: [], activeSquad: null, members: [], loading: false });
        return;
      }

      const { data: squadsData, error: squadsErr } = await supabase
        .from('squads').select('*').in('id', squadIds);
      if (squadsErr) throw squadsErr;

      const roleMap = {};
      (memberRows || []).forEach(m => { roleMap[m.squad_id] = m.role; });

      const enrichedSquads = (squadsData || []).map(s => ({
        ...s, role: roleMap[s.id] || 'member'
      }));

      set({ mySquads: enrichedSquads, loading: false });

      const currentActive = get().activeSquad;
      if (!currentActive || !enrichedSquads.some(s => s.id === currentActive.id)) {
        if (enrichedSquads.length > 0) get().setActiveSquad(enrichedSquads[0].id);
      }
    } catch (err) {
      console.error('Error loading my squads:', err);
      set({ error: err.message, loading: false });
    }
  },

  fetchCommunitySquads: async () => {
    try {
      const { data: squads, error } = await supabase
        .from('squads').select('*').eq('squad_type', 'community')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const squadIds = (squads || []).map(s => s.id);
      let countMap = {};
      if (squadIds.length > 0) {
        const { data: membersData } = await supabase
          .from('squad_members').select('squad_id').in('squad_id', squadIds);
        (membersData || []).forEach(m => {
          countMap[m.squad_id] = (countMap[m.squad_id] || 0) + 1;
        });
      }

      const enriched = (squads || []).map(s => ({
        ...s, member_count: countMap[s.id] || 0
      })).sort((a, b) => b.member_count - a.member_count);

      set({ communitySquads: enriched });
    } catch (err) { console.error('Error fetching community squads:', err); }
  },

  setActiveSquad: async (squadId) => {
    const { mySquads } = get();
    const target = mySquads.find(s => s.id === squadId);
    if (!target) return;
    set({ activeSquad: target, activeChannel: 'general' });
    await get().fetchSquadData(squadId);
    get().subscribeRealtime(squadId);
  },

  fetchSquadData: async (squadId) => {
    try {
      const { data: memberRows } = await supabase
        .from('squad_members').select('*').eq('squad_id', squadId);

      const userIds = [...new Set((memberRows || []).map(m => m.user_id))];
      let profileMap = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles').select('id, username, leetcode_username, discord_username')
          .in('id', userIds);
        (profiles || []).forEach(p => { profileMap[p.id] = p; });
      }

      const members = (memberRows || []).map(m => {
        const prof = profileMap[m.user_id] || {};
        return {
          ...m,
          name: prof.username || prof.leetcode_username || 'Grinder',
          username: prof.username || prof.leetcode_username || '',
          leetcode_username: prof.leetcode_username || '',
          discord_username: prof.discord_username || ''
        };
      });

      const { data: rawMessages } = await supabase
        .from('squad_messages').select('*').eq('squad_id', squadId)
        .order('created_at', { ascending: false }).limit(80);

      const msgUserIds = [...new Set((rawMessages || []).map(m => m.user_id))];
      let msgProfileMap = {};
      if (msgUserIds.length > 0) {
        const { data: msgProfiles } = await supabase
          .from('profiles').select('id, username, leetcode_username')
          .in('id', msgUserIds);
        (msgProfiles || []).forEach(p => { msgProfileMap[p.id] = p; });
      }

      const enrichedMessages = (rawMessages || []).map(m => ({
        ...m,
        author_name: msgProfileMap[m.user_id]?.username || msgProfileMap[m.user_id]?.leetcode_username || 'Member'
      })).reverse();

      const { data: rawSnippets } = await supabase
        .from('squad_code_snippets').select('*').eq('squad_id', squadId)
        .order('created_at', { ascending: false }).limit(30);

      const snipUserIds = [...new Set((rawSnippets || []).map(s => s.user_id))];
      let snipProfileMap = {};
      if (snipUserIds.length > 0) {
        const { data: snipProfiles } = await supabase
          .from('profiles').select('id, username, leetcode_username')
          .in('id', snipUserIds);
        (snipProfiles || []).forEach(p => { snipProfileMap[p.id] = p; });
      }

      const enrichedSnippets = (rawSnippets || []).map(s => ({
        ...s,
        author: { name: snipProfileMap[s.user_id]?.username || snipProfileMap[s.user_id]?.leetcode_username || 'Member' }
      }));

      const today = new Date();
      const dayOfWeek = today.getDay();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: challenge } = await supabase
        .from('squad_weekly_challenges').select('*')
        .eq('squad_id', squadId).eq('week_start', weekStartStr).maybeSingle();

      set({
        members,
        messages: enrichedMessages,
        snippets: enrichedSnippets,
        challenges: challenge ? [challenge] : []
      });
    } catch (err) { console.error('Error fetching squad data:', err); }
  },

  createSquad: async ({ name, goal, squad_type = 'private', description }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const cleanName = (name || '').trim();
    if (!cleanName) throw new Error('Squad name required');

    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const maxMembers = squad_type === 'community' ? 100 : 10;

    const { data: newSquad, error: squadErr } = await supabase
      .from('squads').insert([{
        name: cleanName, goal: goal || null, squad_type,
        description: description || null, invite_code: inviteCode,
        code: inviteCode, created_by: user.id, max_members: maxMembers
      }]).select().single();
    if (squadErr) throw squadErr;

    const { error: memErr } = await supabase
      .from('squad_members').insert([{ squad_id: newSquad.id, user_id: user.id, role: 'admin' }]);
    if (memErr) throw memErr;

    await get().loadMySquads();
    get().setActiveSquad(newSquad.id);
    return newSquad;
  },

  joinByCode: async (codeOrId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const cleanInput = (codeOrId || '').trim().toUpperCase();
    if (!cleanInput) throw new Error('Please enter a valid Squad Invite Code.');

    let targetSquad = null;
    const { data: byInvite } = await supabase
      .from('squads').select('*').ilike('invite_code', cleanInput).maybeSingle();
    if (byInvite) targetSquad = byInvite;

    if (!targetSquad) {
      const { data: byCode } = await supabase
        .from('squads').select('*').ilike('code', cleanInput).maybeSingle();
      if (byCode) targetSquad = byCode;
    }

    if (!targetSquad) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(codeOrId)) {
        const { data: byId } = await supabase
          .from('squads').select('*').eq('id', codeOrId).maybeSingle();
        if (byId) targetSquad = byId;
      }
    }

    if (!targetSquad) throw new Error(`No squad found matching code "${codeOrId}".`);

    const { error: joinErr } = await supabase
      .from('squad_members').insert([{ squad_id: targetSquad.id, user_id: user.id, role: 'member' }]);
    if (joinErr) throw joinErr;

    await get().loadMySquads();
    get().setActiveSquad(targetSquad.id);
    return targetSquad;
  },

  leaveSquad: async (squadId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('squad_members').delete().eq('squad_id', squadId).eq('user_id', user.id);
    if (error) throw error;
    set({ activeSquad: null, members: [], messages: [], snippets: [], challenges: [] });
    await get().loadMySquads();
  },

  sendMessage: async (content, messageType = 'text') => {
    const { activeSquad } = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!activeSquad || !user || !content.trim()) return;
    const { error } = await supabase.from('squad_messages').insert([{
      squad_id: activeSquad.id, user_id: user.id,
      content: content.trim(), message_type: messageType
    }]);
    if (error) throw error;
  },

  sendTypingEvent: async () => {
    const { realtimeChannel } = get();
    if (!realtimeChannel) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    realtimeChannel.send({
      type: 'broadcast', event: 'typing',
      payload: { user_id: user.id, timestamp: Date.now() }
    });
  },

  shareSnippet: async ({ title, code, language, problem_slug }) => {
    const { activeSquad } = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!activeSquad || !user) return;
    const { error } = await supabase.from('squad_code_snippets').insert([{
      squad_id: activeSquad.id, user_id: user.id,
      title: title.trim(), code, language: language || 'javascript',
      problem_slug: problem_slug || null
    }]);
    if (error) throw error;
    await get().fetchSquadData(activeSquad.id);
  },

  subscribeRealtime: (squadId) => {
    get().unsubscribeRealtime();

    const channel = supabase
      .channel(`squad-realtime-${squadId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'squad_messages',
        filter: `squad_id=eq.${squadId}`
      }, async (payload) => {
        const newMsg = payload.new;
        const { data: prof } = await supabase.from('profiles')
          .select('username, leetcode_username').eq('id', newMsg.user_id).maybeSingle();
        const author_name = prof?.username || prof?.leetcode_username || 'Member';
        set((state) => ({
          messages: [...state.messages, { ...newMsg, author_name }]
        }));
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'squad_members',
        filter: `squad_id=eq.${squadId}`
      }, () => { get().fetchSquadData(squadId); })
      .on('broadcast', { event: 'typing' }, (payload) => {
        const typingUserId = payload?.payload?.user_id;
        if (!typingUserId) return;
        const { members, typingUsers } = get();
        const member = members.find(m => m.user_id === typingUserId);
        if (!member) return;
        const name = member.name || 'Someone';
        if (!typingUsers.includes(name)) {
          set({ typingUsers: [...typingUsers, name] });
        }
        setTimeout(() => {
          set((s) => ({ typingUsers: s.typingUsers.filter(n => n !== name) }));
        }, 3000);
      })
      .subscribe();

    set({ realtimeChannel: channel });
  },

  unsubscribeRealtime: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null, typingUsers: [] });
    }
  }
}));
