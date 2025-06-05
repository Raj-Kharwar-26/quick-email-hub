
import React, { useState } from 'react';
import { Refresh, Mail, Copy, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTemporaryEmails } from '@/hooks/useTemporaryEmails';
import { useDomains } from '@/hooks/useDomains';
import { toast } from 'sonner';

interface EmailGeneratorProps {
  onEmailGenerated: (email: string) => void;
}

export const EmailGenerator: React.FC<EmailGeneratorProps> = ({ onEmailGenerated }) => {
  const [customUsername, setCustomUsername] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('tempmail.dev');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const { generateRandomEmail, generateCustomEmail } = useTemporaryEmails();
  const { domains } = useDomains();

  const handleGenerateRandom = async () => {
    setGenerating(true);
    try {
      const result = await generateRandomEmail(selectedDomain);
      onEmailGenerated(result.email_address);
      toast.success('Temporary email generated successfully!');
      copyToClipboard(result.email_address);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate email');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateCustom = async () => {
    if (!customUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setGenerating(true);
    try {
      const result = await generateCustomEmail(customUsername.trim(), selectedDomain);
      onEmailGenerated(result.email_address);
      toast.success('Custom temporary email generated successfully!');
      copyToClipboard(result.email_address);
      setCustomUsername('');
    } catch (error: any) {
      if (error.message.includes('duplicate')) {
        toast.error('This email address is already taken. Please try a different username.');
      } else {
        toast.error(error.message || 'Failed to generate email');
      }
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Email copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4 mx-auto">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Generate Temporary Email
        </CardTitle>
        <CardDescription>
          Create a temporary email address that expires in 24 hours
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Domain Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email Domain
          </label>
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger>
              <SelectValue placeholder="Select a domain" />
            </SelectTrigger>
            <SelectContent>
              {domains.map((domain) => (
                <SelectItem key={domain.id} value={domain.domain}>
                  @{domain.domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Generation Mode Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={!isCustomMode ? "default" : "outline"}
            onClick={() => setIsCustomMode(false)}
            size="sm"
          >
            <Refresh className="h-4 w-4 mr-2" />
            Random
          </Button>
          <Button
            variant={isCustomMode ? "default" : "outline"}
            onClick={() => setIsCustomMode(true)}
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Custom
          </Button>
        </div>

        {/* Custom Username Input */}
        {isCustomMode && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Custom Username
            </label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter username"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                className="flex-1"
              />
              <span className="flex items-center text-gray-500 text-sm">
                @{selectedDomain}
              </span>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={isCustomMode ? handleGenerateCustom : handleGenerateRandom}
          disabled={generating}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          size="lg"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Generate {isCustomMode ? 'Custom' : 'Random'} Email
            </>
          )}
        </Button>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Emails expire automatically after 24 hours</li>
            <li>• Maximum 100 emails per temporary address</li>
            <li>• All emails are automatically deleted when expired</li>
            <li>• Use only for legitimate purposes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
