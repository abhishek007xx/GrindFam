import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch user profile from Supabase profiles table
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error.message);
      } else if (data) {
        setProfile(data);
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
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
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
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: data.user.id,
            name: name,
            leetcode_username: leetcodeUsername
          }
        ]);

      if (profileError) {
        console.error('Error upserting user profile:', profileError);
      }

      await fetchProfile(data.user.id);
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
    signOut,
    refreshProfile: () => user && fetchProfile(user.id)
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
