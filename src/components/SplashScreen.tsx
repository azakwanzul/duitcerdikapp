import React from 'react';
import { Wallet } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-teal-700 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="mb-8 flex justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
            <Wallet size={64} className="text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">DuitCerdik</h1>
        <p className="text-white/80 text-lg font-medium">
          Smart Personal Finance for Malaysian Youth
        </p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;