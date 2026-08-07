const supabase = require('../config/supabaseClient');
const { generateSquadCode } = require('../config/squadInit');

// ── CREATE SQUAD ─────────────────────────────────────────────
const createSquad = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, goal, avatar_url } = req.body;
    const squadName = (name || '').trim();
    if (!squadName) {
      return res.status(400).json({ error: 'Please provide a name for your squad.' });
    }

    // Generate unique squad code
    let code = generateSquadCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('squads')
        .select('id')
        .eq('code', code)
        .maybeSingle();
      if (!existing) break;
      code = generateSquadCode();
      attempts++;
    }

    let newSquad = null;
    let createError = null;

    // Try inserting with extra fields if provided
    const payload = { name: squadName, code, created_by: userId };
    if (goal) payload.goal = goal;
    if (avatar_url) payload.avatar_url = avatar_url;

    const res1 = await supabase
      .from('squads')
      .insert([payload])
      .select()
      .single();

    if (res1.error) {
      console.warn('Extended squad creation failed (column missing), falling back to basic insert:', res1.error.message);
      // Fallback: Insert using basic columns (name, code, created_by)
      const res2 = await supabase
        .from('squads')
        .insert([{ name: squadName, code, created_by: userId }])
        .select()
        .single();

      newSquad = res2.data;
      createError = res2.error;
    } else {
      newSquad = res1.data;
    }

    if (createError || !newSquad) {
      console.error('Error creating squad:', createError);
      return res.status(500).json({ error: createError?.message || 'Failed to create squad in database.' });
    }

    // Remove user from any existing squads
    await supabase.from('squad_members').delete().eq('user_id', userId);

    // Add user as leader in new squad
    const { error: memberError } = await supabase
      .from('squad_members')
      .insert([{ squad_id: newSquad.id, user_id: userId, role: 'leader' }]);

    if (memberError) {
      console.error('Error assigning squad leader:', memberError);
      return res.status(500).json({ error: memberError.message || 'Failed to assign squad leadership.' });
    }

    // Post system message safely
    try {
      await supabase.from('squad_messages').insert([{
        squad_id: newSquad.id,
        user_id: userId,
        content: `Squad "${squadName}" was created! 🎉`,
        message_type: 'system'
      }]);
    } catch (msgErr) {
      console.warn('System message creation skipped:', msgErr?.message);
    }

    return res.status(201).json({
      message: `Squad "${squadName}" created successfully!`,
      squad: newSquad,
      squadCode: code
    });
  } catch (error) {
    console.error('Error in createSquad:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
};

// ── JOIN SQUAD ───────────────────────────────────────────────
const joinSquad = async (req, res) => {
  try {
    const userId = req.user.id;
    const { squadCode, squadId, code: codeInput } = req.body;
    const rawInput = (squadCode || squadId || codeInput || '').trim();
    if (!rawInput) {
      return res.status(400).json({ error: 'Please enter a valid Squad Code or ID.' });
    }

    const cleanInput = rawInput.toUpperCase();
    let targetSquad = null;

    // Search by squad code (case-insensitive)
    const { data: byCode } = await supabase
      .from('squads')
      .select('*')
      .ilike('code', cleanInput)
      .maybeSingle();

    if (byCode) targetSquad = byCode;

    // Search by UUID if input format is UUID
    if (!targetSquad) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(rawInput)) {
        const { data: byId } = await supabase
          .from('squads')
          .select('*')
          .eq('id', rawInput)
          .maybeSingle();
        if (byId) targetSquad = byId;
      }
    }

    if (!targetSquad) {
      return res.status(404).json({ error: `No squad found matching "${rawInput}". Please check the code and try again.` });
    }

    // Safely check member count cap
    try {
      const { count } = await supabase
        .from('squad_members')
        .select('*', { count: 'exact', head: true })
        .eq('squad_id', targetSquad.id);

      const maxMembers = targetSquad.max_members || 10;
      if (count !== null && count >= maxMembers) {
        return res.status(400).json({ error: `This squad is full (${maxMembers}/${maxMembers} members).` });
      }
    } catch (countErr) {}

    // Check if user is already a member of target squad
    const { data: existingMember } = await supabase
      .from('squad_members')
      .select('*')
      .eq('squad_id', targetSquad.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      return res.status(400).json({ error: `You are already a member of "${targetSquad.name}".` });
    }

    // Remove user from previous squad memberships
    await supabase.from('squad_members').delete().eq('user_id', userId);

    // Add user to new squad as member
    const { error: joinError } = await supabase
      .from('squad_members')
      .insert([{ squad_id: targetSquad.id, user_id: userId, role: 'member' }]);

    if (joinError) {
      console.error('Error joining squad:', joinError);
      return res.status(500).json({ error: joinError.message || 'Failed to join squad.' });
    }

    // Post system message safely
    try {
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', userId).maybeSingle();
      await supabase.from('squad_messages').insert([{
        squad_id: targetSquad.id,
        user_id: userId,
        content: `${profile?.name || 'A new member'} joined the squad! 👋`,
        message_type: 'system'
      }]);
    } catch (msgErr) {
      console.warn('System message post skipped on join:', msgErr?.message);
    }

    return res.json({
      message: `Successfully joined "${targetSquad.name}"!`,
      squad: targetSquad
    });
  } catch (error) {
    console.error('Error in joinSquad:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
};

// ── LEAVE SQUAD ──────────────────────────────────────────────
const leaveSquad = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: memberRow } = await supabase
      .from('squad_members')
      .select('squad_id')
      .eq('user_id', userId)
      .maybeSingle();

    const { error: deleteError } = await supabase
      .from('squad_members')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error leaving squad:', deleteError);
      return res.status(500).json({ error: 'Failed to leave squad.' });
    }

    if (memberRow) {
      try {
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', userId).maybeSingle();
        await supabase.from('squad_messages').insert([{
          squad_id: memberRow.squad_id,
          user_id: userId,
          content: `${profile?.name || 'A member'} left the squad.`,
          message_type: 'system'
        }]);
      } catch (e) {}
    }

    return res.json({ message: 'You have left your squad.' });
  } catch (error) {
    console.error('Error in leaveSquad:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── GET SQUAD DETAILS ────────────────────────────────────────
const getSquadDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user's member row directly
    const { data: memberRow, error: memberError } = await supabase
      .from('squad_members')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (memberError) {
      console.error('Error fetching squad_members for user:', memberError);
    }

    if (!memberRow || !memberRow.squad_id) {
      return res.json({ inSquad: false, squad: null, members: [], role: null });
    }

    // 2. Fetch squad record
    const { data: squadRow, error: squadError } = await supabase
      .from('squads')
      .select('*')
      .eq('id', memberRow.squad_id)
      .maybeSingle();

    if (squadError || !squadRow) {
      console.error('Error fetching squad by ID:', squadError);
      return res.json({ inSquad: false, squad: null, members: [], role: null });
    }

    // 3. Fetch all squad members
    const { data: memberRows, error: membersError } = await supabase
      .from('squad_members')
      .select('*')
      .eq('squad_id', memberRow.squad_id);

    if (membersError) {
      console.error('Error fetching squad member list:', membersError);
    }

    // 4. Fetch profiles for member user IDs
    const userIds = [...new Set((memberRows || []).map(m => m.user_id).filter(Boolean))];
    let profileMap = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, email')
        .in('id', userIds);

      (profiles || []).forEach(p => { profileMap[p.id] = p; });
    }

    const formattedMembers = (memberRows || []).map(m => {
      const prof = profileMap[m.user_id] || {};
      return {
        ...prof,
        id: m.user_id || prof.id,
        user_id: m.user_id,
        name: prof.name || 'Member',
        username: prof.username || '',
        avatar_url: prof.avatar_url || null,
        role: m.role || 'member',
        is_muted: m.is_muted || false,
        weekly_solved: m.weekly_solved || 0,
        joined_at: m.joined_at || m.created_at
      };
    });

    return res.json({
      inSquad: true,
      squad: squadRow,
      role: memberRow.role || 'member',
      members: formattedMembers
    });
  } catch (error) {
    console.error('Error in getSquadDetails:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── CHAT: GET MESSAGES ───────────────────────────────────────
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    const limit = parseInt(req.query.limit) || 80;
    const offset = parseInt(req.query.offset) || 0;

    const { data: rawMessages, error } = await supabase
      .from('squad_messages')
      .select('*')
      .eq('squad_id', memberRow.squad_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !rawMessages) {
      return res.json({ messages: [] });
    }

    const userIds = [...new Set(rawMessages.map(m => m.user_id).filter(Boolean))];
    let profileMap = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, name, username, avatar_url').in('id', userIds);
      (profiles || []).forEach(p => { profileMap[p.id] = p; });
    }

    const enriched = rawMessages.map(m => ({
      ...m,
      profile: profileMap[m.user_id] || { name: 'Member', username: '' }
    })).reverse();

    return res.json({ messages: enriched });
  } catch (error) {
    console.error('Error in getMessages:', error);
    return res.json({ messages: [] });
  }
};

// ── CHAT: SEND MESSAGE ───────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, message_type } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

    const { data: memberRow } = await supabase.from('squad_members').select('squad_id, is_muted').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });
    if (memberRow.is_muted) return res.status(403).json({ error: 'You are muted in this squad.' });

    const { data: msg, error } = await supabase
      .from('squad_messages')
      .insert([{ squad_id: memberRow.squad_id, user_id: userId, content: content.trim(), message_type: message_type || 'text' }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message || 'Failed to send message.' });
    return res.status(201).json({ message: msg });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── CODE SNIPPETS: GET ───────────────────────────────────────
const getSnippets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    const { data: snippets, error } = await supabase
      .from('squad_code_snippets')
      .select('*')
      .eq('squad_id', memberRow.squad_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !snippets) return res.json({ snippets: [] });

    // Attach author profiles explicitly
    const userIds = [...new Set(snippets.map(s => s.user_id).filter(Boolean))];
    const { data: profiles } = userIds.length ? await supabase.from('profiles').select('id, name, username, avatar_url').in('id', userIds) : { data: [] };
    const profileMap = {};
    (profiles || []).forEach(p => { profileMap[p.id] = p; });

    const enriched = snippets.map(s => ({ ...s, author: profileMap[s.user_id] || null }));
    return res.json({ snippets: enriched });
  } catch (error) {
    console.error('Error in getSnippets:', error);
    return res.json({ snippets: [] });
  }
};

// ── CODE SNIPPETS: POST ──────────────────────────────────────
const createSnippet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, code, language, problem_slug } = req.body;
    if (!title || !code) return res.status(400).json({ error: 'Title and code are required.' });

    const { data: memberRow } = await supabase.from('squad_members').select('squad_id, is_muted').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });
    if (memberRow.is_muted) return res.status(403).json({ error: 'You are muted.' });

    const { data: snippet, error } = await supabase
      .from('squad_code_snippets')
      .insert([{ squad_id: memberRow.squad_id, user_id: userId, title, code, language: language || 'javascript', problem_slug: problem_slug || null }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message || 'Failed to share snippet.' });

    // Post system notification in chat
    try {
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', userId).maybeSingle();
      await supabase.from('squad_messages').insert([{
        squad_id: memberRow.squad_id, user_id: userId,
        content: `💻 ${profile?.name || 'Someone'} shared a solution: "${title}"`,
        message_type: 'code'
      }]);
    } catch (e) {}

    return res.status(201).json({ snippet });
  } catch (error) {
    console.error('Error in createSnippet:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── SNIPPET COMMENTS: GET ────────────────────────────────────
const getSnippetComments = async (req, res) => {
  try {
    const snippetId = req.params.id;
    const { data: comments, error } = await supabase
      .from('squad_snippet_comments')
      .select('*')
      .eq('snippet_id', snippetId)
      .order('created_at', { ascending: true });

    if (error || !comments) return res.json({ comments: [] });

    const userIds = [...new Set(comments.map(c => c.user_id).filter(Boolean))];
    const { data: profiles } = userIds.length ? await supabase.from('profiles').select('id, name, username, avatar_url').in('id', userIds) : { data: [] };
    const profileMap = {};
    (profiles || []).forEach(p => { profileMap[p.id] = p; });

    const enriched = comments.map(c => ({ ...c, author: profileMap[c.user_id] || null }));
    return res.json({ comments: enriched });
  } catch (error) {
    console.error('Error in getSnippetComments:', error);
    return res.json({ comments: [] });
  }
};

// ── SNIPPET COMMENTS: POST ───────────────────────────────────
const addSnippetComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const snippetId = req.params.id;
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Comment cannot be empty.' });

    const { data: comment, error } = await supabase
      .from('squad_snippet_comments')
      .insert([{ snippet_id: snippetId, user_id: userId, content: content.trim() }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message || 'Failed to add comment.' });
    return res.status(201).json({ comment });
  } catch (error) {
    console.error('Error in addSnippetComment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── WEEKLY CHALLENGE: GET ────────────────────────────────────
const getWeeklyChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const { data: challenge } = await supabase
      .from('squad_weekly_challenges')
      .select('*')
      .eq('squad_id', memberRow.squad_id)
      .eq('week_start', weekStartStr)
      .maybeSingle();

    return res.json({ challenge: challenge || null, weekStart: weekStartStr });
  } catch (error) {
    console.error('Error in getWeeklyChallenge:', error);
    return res.json({ challenge: null });
  }
};

// ── WEEKLY CHALLENGE: VOTE ───────────────────────────────────
const voteWeeklyChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { problems } = req.body;
    if (!Array.isArray(problems) || problems.length === 0) return res.status(400).json({ error: 'Provide problems array.' });

    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const { data: existing } = await supabase.from('squad_weekly_challenges')
      .select('*').eq('squad_id', memberRow.squad_id).eq('week_start', weekStartStr).maybeSingle();

    if (existing) {
      const newVotes = { ...existing.votes, [userId]: problems };
      await supabase.from('squad_weekly_challenges')
        .update({ votes: newVotes, problems: problems.slice(0, 5) })
        .eq('id', existing.id);
    } else {
      await supabase.from('squad_weekly_challenges')
        .insert([{ squad_id: memberRow.squad_id, week_start: weekStartStr, problems: problems.slice(0, 5), votes: { [userId]: problems }, status: 'active' }]);
    }

    return res.json({ message: 'Vote recorded!' });
  } catch (error) {
    console.error('Error in voteWeeklyChallenge:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── DAILY STANDUP ────────────────────────────────────────────
const postStandup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Standup message required.' });

    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    const { data: msg, error } = await supabase.from('squad_messages')
      .insert([{ squad_id: memberRow.squad_id, user_id: userId, content: content.trim(), message_type: 'standup' }])
      .select().single();

    if (error) return res.status(500).json({ error: 'Failed to post standup.' });
    return res.status(201).json({ message: msg });
  } catch (error) {
    console.error('Error in postStandup:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── SQUAD LEADERBOARD ────────────────────────────────────────
const getLeaderboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    const { data: members } = await supabase
      .from('squad_members')
      .select('*')
      .eq('squad_id', memberRow.squad_id);

    const userIds = [...new Set((members || []).map(m => m.user_id).filter(Boolean))];
    let profileMap = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, name, username, avatar_url').in('id', userIds);
      (profiles || []).forEach(p => { profileMap[p.id] = p; });
    }

    let commentCounts = {};
    try {
      const { data: snippets } = await supabase.from('squad_code_snippets').select('id').eq('squad_id', memberRow.squad_id);
      const snippetIds = (snippets || []).map(s => s.id);

      if (snippetIds.length > 0) {
        const { data: comments } = await supabase.from('squad_snippet_comments').select('user_id').in('snippet_id', snippetIds);
        (comments || []).forEach(c => { commentCounts[c.user_id] = (commentCounts[c.user_id] || 0) + 1; });
      }
    } catch (e) {}

    const leaderboard = (members || []).map((m) => {
      const prof = profileMap[m.user_id] || {};
      return {
        userId: m.user_id,
        name: prof.name || 'Member',
        username: prof.username || '',
        avatar_url: prof.avatar_url || null,
        role: m.role || 'member',
        weekly_solved: m.weekly_solved || 0,
        helps: commentCounts[m.user_id] || 0,
        points: (m.weekly_solved || 0) * 10 + (commentCounts[m.user_id] || 0) * 5
      };
    });

    leaderboard.sort((a, b) => b.points - a.points);
    leaderboard.forEach((m, i) => { m.rank = i + 1; });

    return res.json({ leaderboard });
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return res.json({ leaderboard: [] });
  }
};

// ── REPORT MEMBER ────────────────────────────────────────────
const reportMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reported_user_id, reason } = req.body;
    if (!reported_user_id || !reason) return res.status(400).json({ error: 'User and reason required.' });

    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (!memberRow) return res.status(403).json({ error: 'Not in a squad.' });

    await supabase.from('squad_reports').insert([{
      squad_id: memberRow.squad_id, reporter_id: userId, reported_user_id, reason
    }]);

    return res.json({ message: 'Report submitted. Squad admins will review.' });
  } catch (error) {
    console.error('Error in reportMember:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── MUTE MEMBER (Admin) ─────────────────────────────────────
const muteMember = async (req, res) => {
  try {
    const adminId = req.user.id;
    const targetUserId = req.params.userId;

    const { data: adminRow } = await supabase.from('squad_members').select('squad_id, role').eq('user_id', adminId).maybeSingle();
    if (!adminRow || adminRow.role !== 'leader') return res.status(403).json({ error: 'Only squad leaders can mute members.' });

    const { data: targetRow } = await supabase.from('squad_members').select('is_muted').eq('squad_id', adminRow.squad_id).eq('user_id', targetUserId).maybeSingle();
    if (!targetRow) return res.status(404).json({ error: 'Member not found in squad.' });

    await supabase.from('squad_members').update({ is_muted: !targetRow.is_muted }).eq('squad_id', adminRow.squad_id).eq('user_id', targetUserId);

    return res.json({ message: targetRow.is_muted ? 'Member unmuted.' : 'Member muted.' });
  } catch (error) {
    console.error('Error in muteMember:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── KICK MEMBER (Admin) ─────────────────────────────────────
const kickMember = async (req, res) => {
  try {
    const adminId = req.user.id;
    const targetUserId = req.params.userId;

    const { data: adminRow } = await supabase.from('squad_members').select('squad_id, role').eq('user_id', adminId).maybeSingle();
    if (!adminRow || adminRow.role !== 'leader') return res.status(403).json({ error: 'Only squad leaders can remove members.' });

    if (adminId === targetUserId) return res.status(400).json({ error: 'You cannot kick yourself.' });

    await supabase.from('squad_members').delete().eq('squad_id', adminRow.squad_id).eq('user_id', targetUserId);

    try {
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', targetUserId).maybeSingle();
      await supabase.from('squad_messages').insert([{
        squad_id: adminRow.squad_id, user_id: adminId,
        content: `${profile?.name || 'A member'} was removed from the squad.`,
        message_type: 'system'
      }]);
    } catch (e) {}

    return res.json({ message: 'Member removed from squad.' });
  } catch (error) {
    console.error('Error in kickMember:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ── AUTO ENSURE ──────────────────────────────────────────────
const autoEnsureUserSquad = async (userId, userProfile) => {
  try {
    const { data: memberRow } = await supabase.from('squad_members').select('squad_id').eq('user_id', userId).maybeSingle();
    if (memberRow && memberRow.squad_id) return memberRow.squad_id;

    const defaultName = `${userProfile?.name || 'Grind'}'s Squad`;
    const code = generateSquadCode();
    const { data: newSquad, error: createError } = await supabase
      .from('squads')
      .insert([{ name: defaultName, code, created_by: userId }])
      .select().single();

    if (!createError && newSquad) {
      await supabase.from('squad_members').insert([{ squad_id: newSquad.id, user_id: userId, role: 'leader' }]);
      return newSquad.id;
    }
  } catch (err) {
    console.error('Error in autoEnsureUserSquad:', err);
  }
  return null;
};

module.exports = {
  createSquad, joinSquad, leaveSquad, getSquadDetails,
  getMessages, sendMessage,
  getSnippets, createSnippet,
  getSnippetComments, addSnippetComment,
  getWeeklyChallenge, voteWeeklyChallenge,
  postStandup, getLeaderboard,
  reportMember, muteMember, kickMember,
  autoEnsureUserSquad
};
