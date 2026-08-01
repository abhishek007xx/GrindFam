const supabase = require('../config/supabaseClient');

/**
 * POST /api/friends/add
 * Accept { friendLeetcodeUsername }
 * Finds user profile by LeetCode username and adds to user's friends list
 */
const addFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendLeetcodeUsername, friendEmail, friendIdentifier } = req.body;

    const rawInput = (friendEmail || friendLeetcodeUsername || friendIdentifier || '').trim();

    if (!rawInput) {
      return res.status(400).json({ error: 'Please enter a LeetCode username or email address.' });
    }

    const isEmail = Boolean(friendEmail) || (rawInput.includes('@') && rawInput.includes('.'));
    let friendProfile = null;

    if (isEmail) {
      const targetEmail = rawInput.toLowerCase();
      // 1a. Search profile in `profiles` table by email
      const { data: profileByEmail, error: emailSearchError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', targetEmail)
        .maybeSingle();

      if (emailSearchError) {
        console.error('Error searching profile by email:', emailSearchError);
      }

      friendProfile = profileByEmail;

      // 1b. Fallback: search via auth admin if available
      if (!friendProfile && supabase.auth?.admin?.listUsers) {
        try {
          const { data: authUsersData, error: adminError } = await supabase.auth.admin.listUsers();
          if (!adminError && authUsersData?.users) {
            const foundUser = authUsersData.users.find(u => u.email && u.email.toLowerCase() === targetEmail);
            if (foundUser) {
              const { data: profileById } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', foundUser.id)
                .maybeSingle();
              if (profileById) {
                friendProfile = profileById;
                // Backfill email in profiles
                await supabase.from('profiles').update({ email: targetEmail }).eq('id', foundUser.id);
              }
            }
          }
        } catch (adminErr) {
          console.warn('Admin listUsers fallback note:', adminErr.message);
        }
      }

      if (!friendProfile) {
        return res.status(404).json({
          error: `User with email "${targetEmail}" has not registered on GrindFam yet.`
        });
      }
    } else {
      // Search by LeetCode handle
      const targetUsername = rawInput;
      const { data: profileByUsername, error: searchError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('leetcode_username', targetUsername)
        .maybeSingle();

      if (searchError) {
        console.error('Error searching profile by handle:', searchError);
        return res.status(500).json({ error: 'Database error searching for friend.' });
      }

      if (!profileByUsername) {
        return res.status(404).json({
          error: `User with LeetCode handle "${targetUsername}" has not registered on GrindFam yet.`
        });
      }

      friendProfile = profileByUsername;
    }

    // 2. Prevent adding oneself
    if (friendProfile.id === userId) {
      return res.status(400).json({ error: 'You cannot add yourself as a friend.' });
    }

    // 3. Check if already added in either direction
    const { data: existingFriend, error: checkError } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendProfile.id}),and(user_id.eq.${friendProfile.id},friend_id.eq.${userId})`)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing friend:', checkError);
      return res.status(500).json({ error: 'Database error checking friendship.' });
    }

    if (existingFriend) {
      return res.status(400).json({ error: 'This user is already in your friends list.' });
    }

    // 4. Insert bi-directional records into friends table
    const { data: newFriends, error: insertError } = await supabase
      .from('friends')
      .upsert(
        [
          { user_id: userId, friend_id: friendProfile.id },
          { user_id: friendProfile.id, friend_id: userId }
        ],
        { onConflict: 'user_id, friend_id' }
      )
      .select();

    if (insertError) {
      console.error('Error inserting friend:', insertError);
      return res.status(500).json({ error: 'Failed to add friend.' });
    }

    return res.status(201).json({
      message: 'Friend added to squad successfully!',
      friend: friendProfile,
      relationship: newFriends?.[0] || null
    });
  } catch (error) {
    console.error('Error in addFriend:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE /api/friends/remove/:id
 * Remove friend by target friend profile ID
 */
const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendTargetId = req.params.id;

    if (!friendTargetId) {
      return res.status(400).json({ error: 'Friend ID is required.' });
    }

    // Delete record from friends table in both directions
    const { error: deleteError } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendTargetId}),and(user_id.eq.${friendTargetId},friend_id.eq.${userId})`);

    if (deleteError) {
      console.error('Error deleting friend:', deleteError);
      return res.status(500).json({ error: 'Failed to remove friend.' });
    }

    return res.json({ message: 'Friend removed successfully.' });
  } catch (error) {
    console.error('Error in removeFriend:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addFriend,
  removeFriend
};
