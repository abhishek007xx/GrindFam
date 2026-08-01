const supabase = require('../config/supabaseClient');
const { generateSquadCode } = require('../config/squadInit');

/**
 * POST /api/squads/create
 * Accept { name }
 * Creates a new squad and sets creator as leader
 */
const createSquad = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

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

    // 1. Create squad record
    const { data: newSquad, error: createError } = await supabase
      .from('squads')
      .insert([
        {
          name: squadName,
          code,
          created_by: userId
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating squad:', createError);
      return res.status(500).json({ error: 'Failed to create squad in database.' });
    }

    // 2. Remove user from existing squads
    await supabase
      .from('squad_members')
      .delete()
      .eq('user_id', userId);

    // 3. Add user as leader in new squad
    const { error: memberError } = await supabase
      .from('squad_members')
      .insert([
        {
          squad_id: newSquad.id,
          user_id: userId,
          role: 'leader'
        }
      ]);

    if (memberError) {
      console.error('Error adding squad leader:', memberError);
      return res.status(500).json({ error: 'Failed to assign squad leadership.' });
    }

    return res.status(201).json({
      message: `Squad "${squadName}" created successfully!`,
      squad: newSquad,
      squadCode: code
    });
  } catch (error) {
    console.error('Error in createSquad:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/squads/join
 * Accept { squadCode } or { squadId }
 * Joins user to specified squad
 */
const joinSquad = async (req, res) => {
  try {
    const userId = req.user.id;
    const { squadCode, squadId, code } = req.body;

    const rawInput = (squadCode || squadId || code || '').trim();
    if (!rawInput) {
      return res.status(400).json({ error: 'Please enter a valid Squad ID or Squad Code.' });
    }

    const cleanInput = rawInput.toUpperCase();

    // 1. Find squad by code first, then try UUID id
    let targetSquad = null;

    // Try by code (case-insensitive)
    const { data: byCode, error: codeError } = await supabase
      .from('squads')
      .select('*')
      .ilike('code', cleanInput)
      .maybeSingle();

    if (!codeError && byCode) {
      targetSquad = byCode;
    }

    // If not found by code, try by UUID id (only if input looks like a UUID)
    if (!targetSquad) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(rawInput)) {
        const { data: byId, error: idError } = await supabase
          .from('squads')
          .select('*')
          .eq('id', rawInput)
          .maybeSingle();
        if (!idError && byId) {
          targetSquad = byId;
        }
      }
    }

    if (!targetSquad) {
      return res.status(404).json({
        error: `No squad found matching "${rawInput}". Please check the Squad ID/Code and try again.`
      });
    }

    // 2. Check if user is already a member
    const { data: existingMember } = await supabase
      .from('squad_members')
      .select('*')
      .eq('squad_id', targetSquad.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      return res.status(400).json({
        error: `You are already a member of "${targetSquad.name}".`
      });
    }

    // 3. Remove user from current squad
    await supabase
      .from('squad_members')
      .delete()
      .eq('user_id', userId);

    // 4. Add user to new squad
    const { error: joinError } = await supabase
      .from('squad_members')
      .insert([
        {
          squad_id: targetSquad.id,
          user_id: userId,
          role: 'member'
        }
      ]);

    if (joinError) {
      console.error('Error joining squad:', joinError);
      return res.status(500).json({ error: 'Failed to join squad.' });
    }

    return res.json({
      message: `Successfully joined "${targetSquad.name}"!`,
      squad: targetSquad
    });
  } catch (error) {
    console.error('Error in joinSquad:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/squads/leave
 * Removes logged-in user from their active squad
 */
const leaveSquad = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error: deleteError } = await supabase
      .from('squad_members')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error leaving squad:', deleteError);
      return res.status(500).json({ error: 'Failed to leave squad.' });
    }

    return res.json({ message: 'You have left your squad.' });
  } catch (error) {
    console.error('Error in leaveSquad:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/squads/current
 * Fetches user's current squad details and members
 */
const getSquadDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get active squad member entry
    const { data: memberRow, error: memberError } = await supabase
      .from('squad_members')
      .select('*, squad:squads(*)')
      .eq('user_id', userId)
      .maybeSingle();

    if (memberError || !memberRow || !memberRow.squad) {
      return res.json({ inSquad: false, squad: null, members: [] });
    }

    // Get all members of squad
    const { data: members, error: membersError } = await supabase
      .from('squad_members')
      .select('*, profile:profiles(*)')
      .eq('squad_id', memberRow.squad_id);

    if (membersError) {
      console.error('Error fetching squad members:', membersError);
      return res.status(500).json({ error: 'Failed to fetch squad members' });
    }

    return res.json({
      inSquad: true,
      squad: memberRow.squad,
      role: memberRow.role,
      members: (members || []).map(m => m.profile).filter(Boolean)
    });
  } catch (error) {
    console.error('Error in getSquadDetails:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Helper to ensure a user has an active squad.
 * If user is not in any squad, creates a default squad for them.
 */
const autoEnsureUserSquad = async (userId, userProfile) => {
  try {
    const { data: memberRow } = await supabase
      .from('squad_members')
      .select('squad_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (memberRow && memberRow.squad_id) {
      return memberRow.squad_id;
    }

    // Create default squad for user
    const defaultName = `${userProfile.name || 'Grind'}'s Squad`;
    const code = generateSquadCode();

    const { data: newSquad, error: createError } = await supabase
      .from('squads')
      .insert([
        {
          name: defaultName,
          code,
          created_by: userId
        }
      ])
      .select()
      .single();

    if (!createError && newSquad) {
      await supabase.from('squad_members').insert([
        { squad_id: newSquad.id, user_id: userId, role: 'leader' }
      ]);
      return newSquad.id;
    }
  } catch (err) {
    console.error('Error in autoEnsureUserSquad:', err);
  }
  return null;
};

module.exports = {
  createSquad,
  joinSquad,
  leaveSquad,
  getSquadDetails,
  autoEnsureUserSquad
};
