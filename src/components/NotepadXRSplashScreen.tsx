import React, { useEffect, useState } from 'react';
import { AppLogo } from './AppLogo';

interface NotepadXRSplashScreenProps {
  onDismiss: () => void;
  isDark?: boolean;
}

export const NotepadXRSplashScreen: React.FC<NotepadXRSplashScreenProps> = ({ onDismiss }) => {
  const [fadingOut, setFadingOut] = useState(false);
  const [stage, setStage] = useState<'initial' | 'icon-in' | 'icon-shift' | 'text-reveal'>('initial');

  useEffect(() => {
    // 1. Icon appears centered
    const t1 = setTimeout(() => {
      setStage('icon-in');
    }, 150);

    // 2. Icon shifts to the left & container prepares
    const t2 = setTimeout(() => {
      setStage('icon-shift');
    }, 850);

    // 3. Text reveals from left to right
    const t3 = setTimeout(() => {
      setStage('text-reveal');
    }, 1250);

    // 4. Fade out whole splash screen smoothly
    const tAutoDismiss = setTimeout(() => {
      handleClose();
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tAutoDismiss);
    };
  }, []);

  const handleClose = () => {
    setFadingOut(true);
    setTimeout(() => {
      onDismiss();
    }, 600);
  };

  const isIconVisible = stage !== 'initial';
  const isShifted = stage === 'icon-shift' || stage === 'text-reveal';
  const isTextRevealed = stage === 'text-reveal';

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black select-none overflow-hidden cursor-default transition-opacity duration-600 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Centered Brand Presentation */}
      <div className="flex items-center justify-center relative">
        {/* Animated Brand Icon */}
        <div
          className="relative transition-all duration-700 ease-out flex items-center justify-center shrink-0"
          style={{
            opacity: isIconVisible ? 1 : 0,
            transform: isIconVisible
              ? isShifted
                ? 'translateX(0) scale(1)'
                : 'translateX(0) scale(1.05)'
              : 'scale(0.85)',
          }}
        >
          {/* Subtle Silver-White Halo Behind Icon */}
          <div 
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 via-slate-200/10 to-transparent blur-md opacity-60 pointer-events-none"
          />

          {/* App Logo */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#111113] border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.12)]">
            <AppLogo className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
          </div>
        </div>

        {/* Text Container: Title and 'powered by HAMST✧R' directly under the written word */}
        <div
          className="overflow-hidden transition-all duration-700 ease-out flex flex-col justify-center items-start text-left"
          style={{
            maxWidth: isShifted ? '320px' : '0px',
            opacity: isShifted ? 1 : 0,
            marginLeft: isShifted ? '16px' : '0px',
          }}
        >
          <span
            className="text-2xl sm:text-3xl font-bold tracking-tight whitespace-nowrap text-[#f3f4f6] inline-block transition-all duration-700 ease-out font-sans leading-tight"
            style={{
              transform: isTextRevealed ? 'translateX(0)' : 'translateX(-15px)',
              opacity: isTextRevealed ? 1 : 0,
              background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(255,255,255,0.15)'
            }}
          >
            Notepad-XR
          </span>

          {/* Powered by HAMST✧R Subtitle directly underneath written word */}
          <div
            className="mt-1 transition-all duration-700 ease-out whitespace-nowrap"
            style={{
              opacity: isTextRevealed ? 1 : 0,
              transform: isTextRevealed ? 'translateX(0)' : 'translateX(-10px)',
              transitionDelay: '100ms'
            }}
          >
            <p className="text-[10px] sm:text-[11px] font-medium tracking-widest uppercase text-[#8e95a5] flex items-center gap-1.5">
              <span>powered by</span>
              <span 
                className="font-semibold text-[#f1f5f9] tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 12px rgba(255,255,255,0.2)'
                }}
              >
                HAMST✧R
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
