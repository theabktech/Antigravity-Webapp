import React, { useState, useEffect } from 'react';
import { SetupHub } from './components/SetupHub';
import { admobService } from './services/admobService';

export const App: React.FC = () => {
  // Check if we have an active saved session URL
  const [savedRemoteUrl, setSavedRemoteUrl] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('agy_live_remote_url');
      } catch (e) {}
    }
    return null;
  });

  // Always keep persistent bottom banner active across the entire app
  useEffect(() => {
    // Show App Startup Ad on initial boot
    admobService.showAppStartupAd(true);

    // Keep persistent banner running everywhere (Setup Hub & inside Workspace)
    admobService.showPersistentBanner();

    if (savedRemoteUrl && typeof window !== 'undefined') {
      window.location.replace(savedRemoteUrl);
    }
  }, [savedRemoteUrl]);

  const handleConnect = (url: string) => {
    try {
      localStorage.setItem('agy_live_remote_url', url);
    } catch (e) {}
    setSavedRemoteUrl(url);
    if (typeof window !== 'undefined') {
      window.location.replace(url);
    }
  };

  const handleClearSaved = async () => {
    try {
      localStorage.removeItem('agy_live_remote_url');
    } catch (e) {}
    // Show interstitial transition ad when clearing/switching sessions
    await admobService.showInterstitial();
    setSavedRemoteUrl(null);
    admobService.showPersistentBanner();
  };

  // If saved URL is redirecting, render a clean dark background
  if (savedRemoteUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#090b10] text-gray-100" />
    );
  }

  // If no session is saved yet, show the Setup Hub & Walkthrough
  return (
    <SetupHub
      onConnect={handleConnect}
      savedUrl={savedRemoteUrl}
      onClearSaved={handleClearSaved}
      hapticsEnabled={true}
    />
  );
};

export default App;
