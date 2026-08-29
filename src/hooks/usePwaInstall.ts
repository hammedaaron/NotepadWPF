import { useState, useEffect } from 'react';

export interface PwaInstallInfo {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  platform: 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'other';
  browser: 'edge' | 'chrome' | 'brave' | 'firefox' | 'safari' | 'opera' | 'other';
  promptInstall: () => Promise<boolean>;
}

export function usePwaInstall(): PwaInstallInfo {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed & running as app)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        setIsInstalled(true);
      }
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Detect Platform
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
  let platform: PwaInstallInfo['platform'] = 'other';
  if (userAgent.includes('win')) platform = 'windows';
  else if (userAgent.includes('mac')) platform = 'mac';
  else if (userAgent.includes('linux')) platform = 'linux';
  else if (userAgent.includes('android')) platform = 'android';
  else if (userAgent.includes('iphone') || userAgent.includes('ipad')) platform = 'ios';

  // Detect Browser
  let browser: PwaInstallInfo['browser'] = 'other';
  if (userAgent.includes('edg/')) browser = 'edge';
  else if (userAgent.includes('opr') || userAgent.includes('opera')) browser = 'opera';
  else if (userAgent.includes('brave')) browser = 'brave';
  else if (userAgent.includes('chrome')) browser = 'chrome';
  else if (userAgent.includes('firefox')) browser = 'firefox';
  else if (userAgent.includes('safari') && !userAgent.includes('chrome')) browser = 'safari';

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setCanInstall(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('PWA install prompt error:', err);
      return false;
    }
  };

  return {
    canInstall,
    isInstalled,
    isStandalone,
    platform,
    browser,
    promptInstall
  };
}
