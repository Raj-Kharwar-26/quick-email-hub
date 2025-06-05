
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Json } from '@/integrations/supabase/types';

export interface Email {
  id: string;
  temporary_email_id: string;
  message_id?: string;
  from_address: string;
  to_address: string;
  cc_addresses?: string[];
  bcc_addresses?: string[];
  subject?: string;
  body_text?: string;
  body_html?: string;
  attachments?: any[];
  received_at: string;
  is_read: boolean;
  is_sent: boolean;
  email_type: 'received' | 'sent';
  spam_score?: number;
  headers?: Json;
}

export const useEmails = (temporaryEmailId?: string) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const mountedRef = useRef(true);

  const fetchEmails = async () => {
    if (!user || !temporaryEmailId || !mountedRef.current) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('temporary_email_id', temporaryEmailId)
        .order('received_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the data to match our Email interface
      const typedEmails: Email[] = (data || []).map(email => ({
        ...email,
        email_type: (email.email_type === 'sent' ? 'sent' : 'received') as 'received' | 'sent',
        attachments: Array.isArray(email.attachments) ? email.attachments : []
      }));
      
      if (mountedRef.current) {
        setEmails(typedEmails);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const markAsRead = async (emailId: string) => {
    const { error } = await supabase
      .from('emails')
      .update({ is_read: true })
      .eq('id', emailId);

    if (error) throw error;
  };

  const sendEmail = async (
    fromEmailId: string,
    to: string,
    subject: string,
    body: string,
    cc?: string[],
    bcc?: string[]
  ) => {
    if (!user) throw new Error('User not authenticated');

    // Get the from email address
    const { data: tempEmail, error: tempEmailError } = await supabase
      .from('temporary_emails')
      .select('email_address')
      .eq('id', fromEmailId)
      .single();

    if (tempEmailError) throw tempEmailError;

    // Store the sent email
    const { data, error } = await supabase
      .from('emails')
      .insert({
        temporary_email_id: fromEmailId,
        from_address: tempEmail.email_address,
        to_address: to,
        cc_addresses: cc,
        bcc_addresses: bcc,
        subject,
        body_text: body,
        is_sent: true,
        email_type: 'sent'
      })
      .select()
      .single();

    if (error) throw error;

    // Here you would integrate with an actual email service like Nodemailer, SendGrid, etc.
    // For now, we'll simulate sending
    console.log('Email sent:', {
      from: tempEmail.email_address,
      to,
      subject,
      body
    });

    return data;
  };

  const deleteEmail = async (emailId: string) => {
    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', emailId);

    if (error) throw error;
  };

  useEffect(() => {
    mountedRef.current = true;
    console.log('useEmails effect running for temporaryEmailId:', temporaryEmailId);
    
    // Cleanup any existing subscription with proper async handling
    const cleanupChannel = async () => {
      if (channelRef.current) {
        console.log('Cleaning up existing subscription');
        try {
          await supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.log('Error removing channel:', error);
        }
        channelRef.current = null;
      }
    };

    // Early return if no data needed
    if (!temporaryEmailId || !user) {
      console.log('No temporaryEmailId or user, setting loading to false');
      setLoading(false);
      cleanupChannel();
      return;
    }

    // Setup subscription
    const setupSubscription = async () => {
      await cleanupChannel();
      
      // Fetch initial emails
      await fetchEmails();

      if (!mountedRef.current) return;

      // Create a unique channel name
      const channelName = `emails_${temporaryEmailId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      console.log('Creating new channel:', channelName);
      
      // Create and configure the channel
      const channel = supabase.channel(channelName);
      channelRef.current = channel;
      
      // Configure the channel and subscribe
      channel
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'emails',
          filter: `temporary_email_id=eq.${temporaryEmailId}`
        }, (payload) => {
          console.log('Email change detected:', payload);
          // Only refetch if component is still mounted and this is still the active channel
          if (mountedRef.current && channelRef.current === channel) {
            fetchEmails();
          }
        })
        .subscribe((status) => {
          console.log('Channel subscription status:', status, 'for channel:', channelName);
        });
    };

    setupSubscription();

    // Cleanup function
    return () => {
      console.log('Cleaning up useEmails subscription');
      mountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [temporaryEmailId, user]);

  return {
    emails,
    loading,
    markAsRead,
    sendEmail,
    deleteEmail,
    refetch: fetchEmails
  };
};
