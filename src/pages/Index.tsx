
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { EmailGenerator } from '@/components/EmailGenerator';
import { EmailInbox } from '@/components/EmailInbox';
import { ComposeEmail } from '@/components/ComposeEmail';
import { EmailStats } from '@/components/EmailStats';
import { useAuth } from '@/hooks/useAuth';
import { useTemporaryEmails } from '@/hooks/useTemporaryEmails';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generator');
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const { temporaryEmails } = useTemporaryEmails();

  // Set current email to the first available one if not set
  useEffect(() => {
    if (temporaryEmails.length > 0 && !currentEmail) {
      setCurrentEmail(temporaryEmails[0].email_address);
    }
  }, [temporaryEmails, currentEmail]);

  const handleEmailGenerated = (email: string) => {
    setCurrentEmail(email);
    setActiveTab('inbox');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Temporary Email Hub
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Generate secure, temporary email addresses instantly. Receive emails, send messages, and protect your privacy online.
            </p>
            
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In to Get Started
            </Button>
          </div>

          {/* Stats */}
          <EmailStats />

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Privacy Protected</h3>
              <p className="text-gray-600">Keep your real email private and secure from spam</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Generation</h3>
              <p className="text-gray-600">Get temporary emails in seconds with custom or random addresses</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Auto Cleanup</h3>
              <p className="text-gray-600">Emails automatically expire and get cleaned up after 24 hours</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Get unread count for badge
  const unreadCount = temporaryEmails.reduce((total, tempEmail) => {
    // This would require fetching emails for each temp email, but for simplicity we'll skip it
    return total;
  }, 0);

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
              Inbox
              {temporaryEmails.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {temporaryEmails.length}
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
        <div className="max-w-6xl mx-auto">
          {activeTab === 'generator' && (
            <EmailGenerator onEmailGenerated={handleEmailGenerated} />
          )}
          
          {activeTab === 'inbox' && currentEmail && (
            <EmailInbox currentEmail={currentEmail} />
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
