import { useState, useCallback } from 'react';

/**
 * Custom hook providing optimistic UI updates for chat messages, solution reviews, and kudos.
 * Returns optimistic items instantly before remote database confirmation.
 */
export function useOptimisticMessages(initialItems = []) {
  const [items, setItems] = useState(initialItems);

  const addOptimisticItem = useCallback((newItem) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const optimisticPayload = {
      ...newItem,
      id: tempId,
      isPending: true,
      created_at: new Date().toISOString()
    };

    setItems((prev) => [optimisticPayload, ...prev]);
    return tempId;
  }, []);

  const confirmItem = useCallback((tempId, confirmedItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === tempId ? { ...confirmedItem, isPending: false } : item))
    );
  }, []);

  const rollbackItem = useCallback((tempId) => {
    setItems((prev) => prev.filter((item) => item.id !== tempId));
  }, []);

  return {
    items,
    setItems,
    addOptimisticItem,
    confirmItem,
    rollbackItem
  };
}

export default useOptimisticMessages;
