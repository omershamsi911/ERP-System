import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const useRealtime = (table, event = 'INSERT', callback) => {
  const subscription = useRef(null);

  const subscribe = useCallback(() => {
    if (subscription.current) {
      subscription.current.unsubscribe();
    }

    subscription.current = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event, schema: 'public', table }, callback)
      .subscribe();
  }, [table, event, callback]);

  const unsubscribe = useCallback(() => {
    if (subscription.current) {
      subscription.current.unsubscribe();
      subscription.current = null;
    }
  }, []);

  useEffect(() => {
    subscribe();

    return () => {
      unsubscribe();
    };
  }, [subscribe, unsubscribe]);

  return { subscribe, unsubscribe };
};