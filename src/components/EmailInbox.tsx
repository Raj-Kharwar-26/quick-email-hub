import React, { useState } from 'react';
import { Mail, Trash2, MoreVertical, RefreshCw, Eye, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEmails, Email } from '@/hooks/useEmails';
import { useTemporaryEmails } from '@/hooks/useTemporaryEmails';
import { toast } from 'sonner';

interface EmailInboxProps {
  currentEmail: string;
}

export const EmailInbox: React.FC<EmailInboxProps> = ({ currentEmail }) => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  
  // Find the temporary email ID from the email address
  const { temporaryEmails } = useTemporaryEmails();
  const currentTempEmail = temporaryEmails.find(te => te.email_address === currentEmail);
  
  const { emails, loading, markAsRead, deleteEmail, refetch } = useEmails(currentTempEmail?.id);

  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email);
    if (!email.is_read) {
      try {
        await markAsRead(email.id);
        toast.success('Email marked as read');
      } catch (error) {
        console.error('Failed to mark email as read:', error);
      }
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    try {
      await deleteEmail(emailId);
      toast.success('Email deleted successfully');
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      toast.error('Failed to delete email');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = emails.filter(email => !email.is_read).length;

  // Helper function to safely parse attachments
  const getAttachments = (email: Email) => {
    if (!email.attachments) return [];
    if (Array.isArray(email.attachments)) return email.attachments;
    try {
      const parsed = typeof email.attachments === 'string' ? JSON.parse(email.attachments) : email.attachments;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading emails...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Inbox</CardTitle>
                  <CardDescription>{currentEmail}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Badge variant="secondary">{unreadCount} new</Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetch}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {emails.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No emails yet</h3>
                  <p className="text-gray-500">
                    Emails sent to {currentEmail} will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedEmail?.id === email.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      } ${!email.is_read ? 'bg-blue-25' : ''}`}
                      onClick={() => handleEmailClick(email)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="h-4 w-4 text-gray-400" />
                            <p className={`text-sm truncate ${!email.is_read ? 'font-semibold' : 'font-medium'}`}>
                              {email.from_address}
                            </p>
                            {!email.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm mb-1 ${!email.is_read ? 'font-medium' : ''}`}>
                            {email.subject || 'No Subject'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {email.body_text?.substring(0, 100) || 'No content'}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(email.received_at)}
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEmailClick(email)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEmail(email.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Email Content */}
        <div className="lg:col-span-2">
          {selectedEmail ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {selectedEmail.subject || 'No Subject'}
                    </CardTitle>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div><strong>From:</strong> {selectedEmail.from_address}</div>
                      <div><strong>To:</strong> {selectedEmail.to_address}</div>
                      {selectedEmail.cc_addresses && selectedEmail.cc_addresses.length > 0 && (
                        <div><strong>CC:</strong> {selectedEmail.cc_addresses.join(', ')}</div>
                      )}
                      <div><strong>Date:</strong> {new Date(selectedEmail.received_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEmail(selectedEmail.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="prose max-w-none">
                  {selectedEmail.body_html ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {selectedEmail.body_text || 'No content available'}
                    </pre>
                  )}
                </div>
                
                {(() => {
                  const attachments = getAttachments(selectedEmail);
                  return attachments.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-2">Attachments</h4>
                      <div className="space-y-2">
                        {attachments.map((attachment: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{attachment.filename || `Attachment ${index + 1}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an email</h3>
                  <p className="text-gray-500">
                    Choose an email from the list to view its content
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
