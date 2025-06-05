
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
  const currentEmailIdRef = useRef<string | undefined>(undefined);

  const fetchEmails = async () => {
    if (!user || !temporaryEmailId) {
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
        email_type: email.email_type as 'received' | 'sent',
        attachments: Array.isArray(email.attachments) ? email.attachments : []
      }));
      
      setEmails(typedEmails);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
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
    // Cleanup function to remove existing subscription
    const cleanup = async () => {
      if (channelRef.current) {
        console.log('Cleaning up existing channel');
        try {
          await supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing channel:', error);
        }
        channelRef.current = null;
      }
    };

    // Setup new subscription
    const setupSubscription = async () => {
      // Only proceed if we have all required data and it's different from current
      if (!temporaryEmailId || !user || temporaryEmailId === currentEmailIdRef.current) {
        if (!temporaryEmailId || !user) {
          setLoading(false);
        }
        return;
      }

      console.log('Setting up subscription for email ID:', temporaryEmailId);
      
      // Update the current email ID reference
      currentEmailIdRef.current = temporaryEmailId;

      try {
        // Fetch initial emails
        await fetchEmails();

        // Create a unique channel name to avoid conflicts
        const channelName = `emails-${temporaryEmailId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        
        console.log('Creating channel:', channelName);
        
        // Create new channel
        const channel = supabase
          .channel(channelName)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'emails',
            filter: `temporary_email_id=eq.${temporaryEmailId}`
          }, (payload) => {
            console.log('Email change detected:', payload);
            fetchEmails();
          })
          .subscribe((status) => {
            console.log('Channel subscription status:', status);
          });

        channelRef.current = channel;
      } catch (error) {
        console.error('Error setting up email subscription:', error);
        setLoading(false);
      }
    };

    // Run cleanup then setup
    cleanup().then(setupSubscription);

    // Cleanup on unmount or dependency change
    return () => {
      cleanup();
      currentEmailIdRef.current = undefined;
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
