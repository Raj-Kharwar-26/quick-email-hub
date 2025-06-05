
import React from 'react';
import { Mail } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">TempMail Hub</h2>
              <p className="text-sm text-gray-500">Secure • Anonymous • Temporary</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
