
import React, { useState } from 'react';
import { Send, Mail, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmails } from '@/hooks/useEmails';
import { useTemporaryEmails } from '@/hooks/useTemporaryEmails';
import { toast } from 'sonner';

interface ComposeEmailProps {
  currentEmail: string;
}

export const ComposeEmail: React.FC<ComposeEmailProps> = ({ currentEmail }) => {
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const { temporaryEmails } = useTemporaryEmails();
  const currentTempEmail = temporaryEmails.find(te => te.email_address === currentEmail);
  const { sendEmail } = useEmails(currentTempEmail?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTempEmail) {
      toast.error('No temporary email selected');
      return;
    }

    setIsSending(true);

    try {
      const ccAddresses = formData.cc ? formData.cc.split(',').map(email => email.trim()) : undefined;
      const bccAddresses = formData.bcc ? formData.bcc.split(',').map(email => email.trim()) : undefined;

      await sendEmail(
        currentTempEmail.id,
        formData.to,
        formData.subject,
        formData.body,
        ccAddresses,
        bccAddresses
      );

      setSent(true);
      toast.success('Email sent successfully!');
      
      setTimeout(() => {
        setSent(false);
        setFormData({ to: '', cc: '', bcc: '', subject: '', body: '' });
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (sent) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Email Sent Successfully!
          </CardTitle>
          <CardDescription>
            Your email has been delivered from {currentEmail}
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Compose Email</CardTitle>
        <CardDescription>
          Sending from: <span className="font-medium text-blue-600">{currentEmail}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* To Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              To *
            </label>
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={formData.to}
              onChange={(e) => handleChange('to', e.target.value)}
              required
            />
          </div>

          {/* CC Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              CC
            </label>
            <Input
              type="text"
              placeholder="cc1@example.com, cc2@example.com"
              value={formData.cc}
              onChange={(e) => handleChange('cc', e.target.value)}
            />
          </div>

          {/* BCC Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              BCC
            </label>
            <Input
              type="text"
              placeholder="bcc1@example.com, bcc2@example.com"
              value={formData.bcc}
              onChange={(e) => handleChange('bcc', e.target.value)}
            />
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Subject *
            </label>
            <Input
              placeholder="Enter email subject"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              required
            />
          </div>

          {/* Body Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Message *
            </label>
            <Textarea
              placeholder="Type your message here..."
              value={formData.body}
              onChange={(e) => handleChange('body', e.target.value)}
              required
              rows={8}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{formData.body.length}</span> characters
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({ to: '', cc: '', bcc: '', subject: '', body: '' })}
              >
                Clear
              </Button>
              <Button
                type="submit"
                disabled={isSending || !formData.to || !formData.subject || !formData.body}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Note */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a demonstration. In production, this would integrate with a real email service like SendGrid, Mailgun, or SMTP server.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
