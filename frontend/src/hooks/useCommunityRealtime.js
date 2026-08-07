import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * High-Performance, Stable Realtime Subscription Hook.
 * Uses refs for callback functions to prevent unnecessary WebSocket teardowns and re-subscriptions.
 */
export function useCommunityRealtime({ squadId, dmThreadId, onSquadMessage, onDMMessage, onPresenceChange }) {
  const squadMessageCbRef = useRef(onSquadMessage);
  const dmMessageCbRef = useRef(onDMMessage);
  const presenceCbRef = useRef(onPresenceChange);

  // Keep callback refs updated on every render without triggering effect re-runs
  useEffect(() => {
    squadMessageCbRef.current = onSquadMessage;
    dmMessageCbRef.current = onDMMessage;
    presenceCbRef.current = onPresenceChange;
  });

  const squadChannelRef = useRef(null);
  const dmChannelRef = useRef(null);

  // 1. Squad Realtime Subscription
  useEffect(() => {
    if (!squadId) return;

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
          if (squadMessageCbRef.current) {
            squadMessageCbRef.current(payload.new);
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        if (presenceCbRef.current) {
          const state = channel.presenceState();
          presenceCbRef.current(state);
        }
      })
      .subscribe();

    squadChannelRef.current = channel;

    return () => {
      if (squadChannelRef.current) {
        supabase.removeChannel(squadChannelRef.current);
        squadChannelRef.current = null;
      }
    };
  }, [squadId]);

  // 2. DM Realtime Subscription
  useEffect(() => {
    if (!dmThreadId) return;

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
          if (dmMessageCbRef.current) {
            dmMessageCbRef.current(payload.new);
          }
        }
      )
      .subscribe();

    dmChannelRef.current = dmChannel;

    return () => {
      if (dmChannelRef.current) {
        supabase.removeChannel(dmChannelRef.current);
        dmChannelRef.current = null;
      }
    };
  }, [dmThreadId]);
}

export default useCommunityRealtime;
