
import React, { useState } from 'react';
import { Send, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ComposeEmailProps {
  currentEmail: string;
}

export const ComposeEmail: React.FC<ComposeEmailProps> = ({ currentEmail }) => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // Simulate sending email
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setFormData({ to: '', subject: '', body: '' });
      }, 3000);
    }, 2000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border text-center">
        <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Sent Successfully!</h2>
        <p className="text-gray-600">Your email has been delivered from {currentEmail}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Compose Email</h2>
        <p className="opacity-90">Sending from: {currentEmail}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* To Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To *
          </label>
          <Input
            type="email"
            placeholder="recipient@example.com"
            value={formData.to}
            onChange={(e) => handleChange('to', e.target.value)}
            required
            className="w-full"
          />
        </div>

        {/* Subject Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <Input
            placeholder="Enter email subject"
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            required
            className="w-full"
          />
        </div>

        {/* Body Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <Textarea
            placeholder="Type your message here..."
            value={formData.body}
            onChange={(e) => handleChange('body', e.target.value)}
            required
            rows={8}
            className="w-full resize-none"
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
              onClick={() => setFormData({ to: '', subject: '', body: '' })}
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
                  <Send className="h-4 w-4 mr-2 animate-pulse" />
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
    </div>
  );
};
