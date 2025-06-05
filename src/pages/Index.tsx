
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { EmailGenerator } from '@/components/EmailGenerator';
import { EmailInbox } from '@/components/EmailInbox';
import { ComposeEmail } from '@/components/ComposeEmail';
import { EmailStats } from '@/components/EmailStats';

const Index = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [emails, setEmails] = useState([
    {
      id: 1,
      from: 'notifications@github.com',
      subject: 'Your GitHub Activity Summary',
      preview: 'Here is your weekly activity summary for your repositories...',
      timestamp: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      from: 'no-reply@stripe.com',
      subject: 'Payment Confirmation',
      preview: 'Thank you for your payment. Your transaction has been processed...',
      timestamp: '1 hour ago',
      read: true
    },
    {
      id: 3,
      from: 'team@vercel.com',
      subject: 'Deployment Successful',
      preview: 'Your deployment has been successfully completed and is now live...',
      timestamp: '3 hours ago',
      read: false
    }
  ]);

  const handleEmailGenerated = (email: string) => {
    setCurrentEmail(email);
    setActiveTab('inbox');
  };

  const markAsRead = (emailId: number) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, read: true } : email
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Temporary Email Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate secure, temporary email addresses instantly. Receive emails, send messages, and protect your privacy online.
          </p>
        </div>

        {/* Stats */}
        <EmailStats />

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg border">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'generator'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              Generate Email
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'inbox'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              disabled={!currentEmail}
            >
              Inbox {emails.filter(e => !e.read).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {emails.filter(e => !e.read).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('compose')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'compose'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              disabled={!currentEmail}
            >
              Compose
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'generator' && (
            <EmailGenerator onEmailGenerated={handleEmailGenerated} />
          )}
          
          {activeTab === 'inbox' && currentEmail && (
            <EmailInbox 
              currentEmail={currentEmail} 
              emails={emails}
              onMarkAsRead={markAsRead}
            />
          )}
          
          {activeTab === 'compose' && currentEmail && (
            <ComposeEmail currentEmail={currentEmail} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
