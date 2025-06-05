
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TemporaryEmail {
  id: string;
  email_address: string;
  display_name?: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  forward_to?: string;
  max_emails: number;
}

export const useTemporaryEmails = () => {
  const [temporaryEmails, setTemporaryEmails] = useState<TemporaryEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTemporaryEmails = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('temporary_emails')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemporaryEmails(data || []);
    } catch (error) {
      console.error('Error fetching temporary emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomEmail = async (domain: string = 'tempmail.dev') => {
    if (!user) throw new Error('User not authenticated');

    const randomString = Math.random().toString(36).substring(2, 15);
    const emailAddress = `${randomString}@${domain}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const { data, error } = await supabase
      .from('temporary_emails')
      .insert({
        user_id: user.id,
        email_address: emailAddress,
        expires_at: expiresAt.toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const generateCustomEmail = async (username: string, domain: string = 'tempmail.dev') => {
    if (!user) throw new Error('User not authenticated');

    const emailAddress = `${username}@${domain}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const { data, error } = await supabase
      .from('temporary_emails')
      .insert({
        user_id: user.id,
        email_address: emailAddress,
        expires_at: expiresAt.toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteTemporaryEmail = async (id: string) => {
    const { error } = await supabase
      .from('temporary_emails')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const extendExpiration = async (id: string, hours: number = 24) => {
    const newExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    
    const { error } = await supabase
      .from('temporary_emails')
      .update({ expires_at: newExpiresAt.toISOString() })
      .eq('id', id);

    if (error) throw error;
  };

  useEffect(() => {
    fetchTemporaryEmails();

    // Set up real-time subscription
    const subscription = supabase
      .channel('temporary_emails_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'temporary_emails',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        fetchTemporaryEmails();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    temporaryEmails,
    loading,
    generateRandomEmail,
    generateCustomEmail,
    deleteTemporaryEmail,
    extendExpiration,
    refetch: fetchTemporaryEmails
  };
};
