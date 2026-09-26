import { useCallback, useEffect, useState } from 'react';

import { LIST_COLUMNS, type PropertyListItem } from '@/hooks/use-properties';
import { supabase } from '@/lib/supabase';
import type { Agent } from '@/types/database';

const AGENT_SELECT = `id, name, avatar, email, phone, properties(${LIST_COLUMNS})` as const;

export type AgentDetail = Pick<Agent, 'id' | 'name' | 'avatar' | 'email' | 'phone'> & {
  properties: PropertyListItem[];
};

type UseAgentResult = {
  agent: AgentDetail | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
};

// Postgres rejects malformed UUIDs with 22P02; treat that as "not found", not an error.
const INVALID_TEXT_REPRESENTATION = '22P02';

export function useAgent(id: string | undefined): UseAgentResult {
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    supabase
      .from('agents')
      .select(AGENT_SELECT)
      .eq('id', id)
      .order('rating', { referencedTable: 'properties', ascending: false })
      .abortSignal(controller.signal)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (controller.signal.aborted) return;
        if (queryError && queryError.code !== INVALID_TEXT_REPRESENTATION) {
          setError(queryError.message);
        } else {
          setAgent(data);
          setError(null);
        }
        setLoading(false);
      });

    return () => controller.abort();
  }, [id, attempt]);

  const retry = useCallback(() => {
    setLoading(true);
    setAttempt((count) => count + 1);
  }, []);

  return { agent, loading: Boolean(id) && loading, error, retry };
}
