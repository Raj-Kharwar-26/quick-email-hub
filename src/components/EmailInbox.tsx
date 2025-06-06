
import React, { useState, useEffect } from 'react';
import { Mail, Trash, MailOpen, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmails } from '@/hooks/useTempEmails';
import { useTempEmails } from '@/hooks/useTempEmails';
import { supabase } from '@/integrations/supabase/client';

interface EmailInboxProps {
  tempEmailId: string;
}

export const EmailInbox: React.FC<EmailInboxProps> = ({ tempEmailId }) => {
  const { emails, emailsLoading, markAsRead } = useEmails(tempEmailId);
  const { tempEmails } = useTempEmails();
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  const currentTempEmail = tempEmails.find(e => e.id === tempEmailId);

  // Set up realtime subscription for new emails
  useEffect(() => {
    const channel = supabase
      .channel('emails-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emails',
          filter: `temporary_email_id=eq.${tempEmailId}`,
        },
        () => {
          // Refetch emails when new ones arrive
          console.log('New email received!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tempEmailId]);

  const handleEmailClick = (email: any) => {
    setSelectedEmail(email);
    if (!email.is_read) {
      markAsRead(email.id);
    }
  };

  const unreadCount = emails.filter(e => !e.is_read).length;

  if (emailsLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Inbox</h2>
        <p className="opacity-90">{currentTempEmail?.email_address}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm opacity-75">
            {emails.length} emails • {unreadCount} unread
          </span>
          <div className="text-sm opacity-75">
            Expires: {currentTempEmail && new Date(currentTempEmail.expires_at).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex h-96">
        {/* Email List */}
        <div className="w-1/2 border-r bg-gray-50">
          {emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Mail className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No emails yet</p>
              <p className="text-sm">Your emails will appear here</p>
            </div>
          ) : (
            <div className="overflow-y-auto h-full">
              {emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => handleEmailClick(email)}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    selectedEmail?.id === email.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-100'
                  } ${!email.is_read ? 'font-semibold bg-blue-25' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 truncate flex-1">
                      {email.from_address}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(email.received_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center mb-1">
                    {!email.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    )}
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {email.subject || 'No Subject'}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {email.body_text?.substring(0, 100) || 'No preview available'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Content */}
        <div className="w-1/2 bg-white">
          {selectedEmail ? (
            <div className="h-full flex flex-col">
              {/* Email Header */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedEmail.subject || 'No Subject'}
                    </h3>
                    <div className="text-sm text-gray-600">
                      <p><strong>From:</strong> {selectedEmail.from_address}</p>
                      <p><strong>To:</strong> {selectedEmail.to_address}</p>
                      <p><strong>Date:</strong> {new Date(selectedEmail.received_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <MailOpen className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose max-w-none">
                  {selectedEmail.body_html ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                      {selectedEmail.body_text || 'No content available'}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MailOpen className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Select an email to view</p>
              <p className="text-sm">Choose an email from the list to read its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
