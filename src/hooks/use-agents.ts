import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Agent } from '@/types/database';

export type AgentListItem = Pick<Agent, 'id' | 'name' | 'avatar' | 'email' | 'phone'> & {
  listingCount: number;
};

type UseAgentsResult = {
  agents: AgentListItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
};

export function useAgents(): UseAgentsResult {
  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    supabase
      .from('agents')
      .select('id, name, avatar, email, phone, properties(count)')
      .order('name')
      .abortSignal(controller.signal)
      .then(({ data, error: queryError }) => {
        if (controller.signal.aborted) return;
        if (queryError) {
          setError(queryError.message);
        } else {
          setAgents(
            data.map(({ properties, ...agent }) => ({
              ...agent,
              listingCount: properties[0]?.count ?? 0,
            }))
          );
          setError(null);
        }
        setLoading(false);
        setRefreshing(false);
      });

    return () => controller.abort();
  }, [reloadCount]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setReloadCount((count) => count + 1);
  }, []);

  return { agents, loading, refreshing, error, refresh };
}
