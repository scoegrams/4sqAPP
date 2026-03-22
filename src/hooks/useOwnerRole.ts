import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

/** True when logged-in user has a row in owner_roles (owner or staff). */
export function useOwnerRole(): boolean {
  const { user } = useAuth();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!user || !supabase) {
      setOk(false);
      return;
    }
    let cancelled = false;
    supabase
      .from('owner_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setOk(false);
          return;
        }
        setOk(!!data);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return ok;
}
