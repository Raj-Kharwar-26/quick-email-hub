
import React, { useState } from 'react';
import { Mail, Trash, MailOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Email {
  id: number;
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
  read: boolean;
}

interface EmailInboxProps {
  currentEmail: string;
  emails: Email[];
  onMarkAsRead: (emailId: number) => void;
}

export const EmailInbox: React.FC<EmailInboxProps> = ({ 
  currentEmail, 
  emails, 
  onMarkAsRead 
}) => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    if (!email.read) {
      onMarkAsRead(email.id);
    }
  };

  const mockEmailContent = {
    body: `Dear User,

This is a sample email content that would be displayed when viewing the full email. In a real implementation, this would contain the actual email body content received from the email server.

The email might include:
- Rich text formatting
- Images and attachments
- Links and buttons
- Structured content

Best regards,
The Sender`,
    attachments: []
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Inbox</h2>
        <p className="opacity-90">{currentEmail}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm opacity-75">
            {emails.length} emails • {emails.filter(e => !e.read).length} unread
          </span>
          <Button 
            variant="secondary" 
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Mail className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
                  } ${!email.read ? 'font-semibold bg-blue-25' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 truncate flex-1">
                      {email.from}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{email.timestamp}</span>
                  </div>
                  <div className="flex items-center mb-1">
                    {!email.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    )}
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {email.subject}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{email.preview}</p>
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
                      {selectedEmail.subject}
                    </h3>
                    <div className="text-sm text-gray-600">
                      <p><strong>From:</strong> {selectedEmail.from}</p>
                      <p><strong>To:</strong> {currentEmail}</p>
                      <p><strong>Date:</strong> {selectedEmail.timestamp}</p>
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
                  <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                    {mockEmailContent.body}
                  </pre>
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
