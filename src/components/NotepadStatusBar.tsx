import React, { useState } from 'react';
import { Check, CloudOff, Wifi } from 'lucide-react';
import { EditorPosition } from '../types';

interface NotepadStatusBarProps {
  isDark: boolean;
  position: EditorPosition;
  zoomLevel: number;
  lineEnding: 'CRLF' | 'LF';
  encoding: string;
  fileType: 'plain' | 'rich' | 'markdown';
  saveStatus?: 'saved' | 'saving' | 'unsaved';
  isOnline?: boolean;
  onZoomClick: () => void;
  onLineEndingToggle: () => void;
  onFileTypeChange?: (type: 'plain' | 'rich' | 'markdown') => void;
}

export const NotepadStatusBar: React.FC<NotepadStatusBarProps> = ({
  isDark,
  position,
  zoomLevel,
  lineEnding,
  encoding,
  fileType,
  saveStatus = 'saved',
  isOnline = true,
  onZoomClick,
  onLineEndingToggle,
  onFileTypeChange
}) => {
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const buttonHoverClass = `px-2 py-0.5 rounded transition-colors ${
    isDark ? 'hover:bg-[#2e2e2e]' : 'hover:bg-[#e2e2e2]'
  }`;

  return (
    <div
      className={`h-[26px] flex items-center justify-between px-3 text-[12px] select-none border-t ${
        isDark 
          ? 'bg-[#1c1c1c] border-[#2b2b2b] text-[#a0a0a0]' 
          : 'bg-[#f0f0f0] border-[#d8d8d8] text-[#555555]'
      }`}
    >
      {/* Left side metrics */}
      <div className="flex items-center space-x-5">
        {/* Ln and Col */}
        <span className="cursor-default font-mono">
          Ln {position.line}, Col {position.col}
        </span>

        {/* Characters count */}
        <span className="cursor-default hidden sm:inline">
          {position.selectedChars > 0 
            ? `${position.selectedChars} of ${position.totalChars} characters` 
            : `${position.totalChars} characters`}
        </span>

        {/* 3-Second Autosave Status Indicator */}
        <div className="flex items-center space-x-1.5 cursor-default text-[11px]">
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>Saved</span>
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-1 text-amber-500 font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="inline-flex items-center gap-1 opacity-60">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
              <span>Autosaving in 3s...</span>
            </span>
          )}
        </div>

        {/* Document type: Plain text / Rich text */}
        <div className="relative">
          <button
            onClick={() => setShowTypeMenu(!showTypeMenu)}
            className={buttonHoverClass}
            title="Document Format"
          >
            {fileType === 'plain' ? 'Plain text' : fileType === 'rich' ? 'Rich text' : 'Markdown'}
          </button>
          {showTypeMenu && (
            <div
              className={`absolute bottom-full mb-1 left-0 rounded shadow-lg border py-1 text-xs z-50 min-w-[110px] ${
                isDark ? 'bg-[#2b2b2b] border-[#3e3e3e] text-white' : 'bg-white border-[#ccc] text-black'
              }`}
            >
              <button
                onClick={() => { onFileTypeChange?.('plain'); setShowTypeMenu(false); }}
                className={`w-full text-left px-2.5 py-1 ${isDark ? 'hover:bg-[#3a3a3a]' : 'hover:bg-[#eee]'}`}
              >
                Plain text
              </button>
              <button
                onClick={() => { onFileTypeChange?.('rich'); setShowTypeMenu(false); }}
                className={`w-full text-left px-2.5 py-1 ${isDark ? 'hover:bg-[#3a3a3a]' : 'hover:bg-[#eee]'}`}
              >
                Rich text
              </button>
              <button
                onClick={() => { onFileTypeChange?.('markdown'); setShowTypeMenu(false); }}
                className={`w-full text-left px-2.5 py-1 ${isDark ? 'hover:bg-[#3a3a3a]' : 'hover:bg-[#eee]'}`}
              >
                Markdown
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center Footer Attribution */}
      <div 
        id="app-footer-brand"
        className="hidden md:flex items-center space-x-1 text-[11px] font-medium tracking-wide opacity-70 hover:opacity-100 transition-opacity select-none"
      >
        <span className="opacity-80">powered by</span>
        <span className="font-semibold tracking-wider text-amber-500 dark:text-amber-400">HAMST✧R</span>
      </div>

      {/* Right side metrics */}
      <div className="flex items-center space-x-3.5">
        {/* Offline / Online Status badge */}
        <div 
          className="flex items-center gap-1 text-[11px] opacity-75"
          title={isOnline ? "Online (Saved locally & cached)" : "Offline (Working offline with local storage)"}
        >
          {isOnline ? (
            <span className="inline-flex items-center gap-1 text-sky-400">
              <Wifi className="w-3 h-3" />
              <span className="hidden lg:inline">Offline Ready</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-400">
              <CloudOff className="w-3 h-3" />
              <span>Offline Mode</span>
            </span>
          )}
        </div>

        {/* Zoom */}
        <button
          onClick={onZoomClick}
          className={buttonHoverClass}
          title="Zoom Level (Click to change)"
        >
          {zoomLevel}%
        </button>

        {/* Line Endings (CRLF / LF) */}
        <button
          onClick={onLineEndingToggle}
          className={buttonHoverClass}
          title="Line Endings (Click to switch)"
        >
          {lineEnding === 'CRLF' ? 'CRLF' : 'LF'}
        </button>

        {/* Encoding */}
        <span className="cursor-default">
          {encoding || 'UTF-8'}
        </span>
      </div>
    </div>
  );
};
