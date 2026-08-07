import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Custom hook managing real-time Supabase subscriptions for Community feeds,
 * active squad messages, and direct messages. Automatically unsubscribes on unmount.
 */
export function useCommunityRealtime({ squadId, dmThreadId, onSquadMessage, onDMMessage, onPresenceChange }) {
  const squadChannelRef = useRef(null);
  const dmChannelRef = useRef(null);

  useEffect(() => {
    if (!squadId) return;

    // 1. Subscribe to active squad messages
    const channelName = `squad_realtime_${squadId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: squadId }
      }
    });

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'squad_messages',
          filter: `squad_id=eq.${squadId}`
        },
        (payload) => {
          if (onSquadMessage) {
            onSquadMessage(payload.new);
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        if (onPresenceChange) {
          const state = channel.presenceState();
          onPresenceChange(state);
        }
      })
      .subscribe();

    squadChannelRef.current = channel;

    return () => {
      if (squadChannelRef.current) {
        supabase.removeChannel(squadChannelRef.current);
      }
    };
  }, [squadId, onSquadMessage, onPresenceChange]);

  useEffect(() => {
    if (!dmThreadId) return;

    // 2. Subscribe to active DM thread
    const dmChannelName = `dm_realtime_${dmThreadId}`;
    const dmChannel = supabase.channel(dmChannelName);

    dmChannel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dm_messages',
          filter: `thread_id=eq.${dmThreadId}`
        },
        (payload) => {
          if (onDMMessage) {
            onDMMessage(payload.new);
          }
        }
      )
      .subscribe();

    dmChannelRef.current = dmChannel;

    return () => {
      if (dmChannelRef.current) {
        supabase.removeChannel(dmChannelRef.current);
      }
    };
  }, [dmThreadId, onDMMessage]);
}

export default useCommunityRealtime;
