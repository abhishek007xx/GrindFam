import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch user profile from Supabase profiles table
  const fetchProfile = async (userId, userEmail = null, userMetadata = null) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error.message);
      } else if (data) {
        // If profile exists and user email provided, attempt safe sync
        if (data.email === undefined) {
          // email column does not exist on profile schema, attach from auth user
          data.email = userEmail ? userEmail.toLowerCase() : null;
        } else if (!data.email && userEmail) {
          try {
            const { error: updateErr } = await supabase
              .from('profiles')
              .update({ email: userEmail.toLowerCase() })
              .eq('id', userId);
            if (!updateErr) {
              data.email = userEmail.toLowerCase();
            }
          } catch (_) {}
        }
        setProfile(data);
      } else {
        // Profile does not exist yet (e.g., OAuth sign in) - auto create profile
        const nameFromMeta = userMetadata?.full_name || userMetadata?.name || (userEmail ? userEmail.split('@')[0] : 'User');
        const payload = {
          id: userId,
          name: nameFromMeta,
          username: nameFromMeta,
          email: userEmail ? userEmail.toLowerCase() : null
        };
        const { data: created, error: createErr } = await supabase
          .from('profiles')
          .upsert([payload])
          .select()
          .maybeSingle();

        if (!createErr && created) {
          setProfile(created);
        } else {
          // Fallback if email column doesn't exist in profiles schema
          const fallbackPayload = { id: userId, name: nameFromMeta, username: nameFromMeta };
          const { data: fallbackCreated } = await supabase
            .from('profiles')
            .upsert([fallbackPayload])
            .select()
            .maybeSingle();
          setProfile(fallbackCreated || fallbackPayload);
        }
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    }
  };

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign Up with email, password, name, and leetcode_username metadata
  const signUp = async ({ email, password, name, leetcodeUsername }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          leetcode_username: leetcodeUsername
        }
      }
    });

    if (error) throw error;

    // Upsert into `profiles` table
    if (data?.user) {
      const payload = {
        id: data.user.id,
        name: name,
        leetcode_username: leetcodeUsername
      };
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{ ...payload, email: email ? email.toLowerCase() : null }]);

      if (profileError) {
        // Retry without email column if schema doesn't have email column
        await supabase.from('profiles').upsert([payload]);
      }

      await fetchProfile(data.user.id, email);
    }

    return data;
  };

  // Sign In with email & password
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  // Sign In with Google OAuth
  const signInWithGoogle = async () => {
    const redirectUrl = window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    if (error) throw error;
    return data;
  };

  // Sign Out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error.message);
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    profile,
    token: session?.access_token || null,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id, user.email, user.user_metadata)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

