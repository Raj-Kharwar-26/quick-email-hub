
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmailDomain {
  id: string;
  domain: string;
  is_active: boolean;
  created_at: string;
}

export const useDomains = () => {
  const [domains, setDomains] = useState<EmailDomain[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDomains = async () => {
    try {
      const { data, error } = await supabase
        .from('email_domains')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setDomains(data || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  return {
    domains,
    loading
  };
};
