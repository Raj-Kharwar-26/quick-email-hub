
import React, { useState } from 'react';
import { Mail, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EmailGeneratorProps {
  onEmailGenerated: (email: string) => void;
}

export const EmailGenerator: React.FC<EmailGeneratorProps> = ({ onEmailGenerated }) => {
  const [customUsername, setCustomUsername] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const domains = ['tempmail.dev', 'quickmail.io', 'fastmail.temp'];

  const generateRandomUsername = () => {
    const adjectives = ['quick', 'temp', 'fast', 'secure', 'anon', 'private'];
    const nouns = ['mail', 'box', 'user', 'temp', 'guest', 'visitor'];
    const numbers = Math.floor(Math.random() * 999);
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adj}${noun}${numbers}`;
  };

  const handleGenerate = (useCustom = false) => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const username = useCustom && customUsername ? customUsername : generateRandomUsername();
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const email = `${username}@${domain}`;
      
      setGeneratedEmail(email);
      onEmailGenerated(email);
      setIsGenerating(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Temporary Email</h2>
        <p className="text-gray-600">Create a secure, temporary email address that expires automatically</p>
      </div>

      <div className="space-y-6">
        {/* Custom Username Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Username (Optional)
          </label>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter custom username"
              value={customUsername}
              onChange={(e) => setCustomUsername(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => handleGenerate(true)}
              disabled={isGenerating || !customUsername}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        </div>

        {/* Or Divider */}
        <div className="flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Random Generation */}
        <div className="text-center">
          <Button
            onClick={() => handleGenerate(false)}
            disabled={isGenerating}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="h-5 w-5 mr-2" />
                Generate Random Email
              </>
            )}
          </Button>
        </div>

        {/* Generated Email Display */}
        {generatedEmail && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Temporary Email:</h3>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-white rounded-md px-4 py-3 font-mono text-lg border">
                {generatedEmail}
              </div>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className={copied ? 'bg-green-500 text-white' : ''}
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-green-600 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Active for 1 hour
              </span>
              <span className="text-gray-500">Auto-deletes after expiration</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
