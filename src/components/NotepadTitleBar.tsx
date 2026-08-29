import React from 'react';
import { Plus, X, Minus, Square } from 'lucide-react';
import { NotepadDocument } from '../types';
import { AppLogo } from './AppLogo';

interface NotepadTitleBarProps {
  documents: NotepadDocument[];
  activeId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
  isDark: boolean;
  onOpenInstallModal?: () => void;
  isStandalone?: boolean;
}

export const NotepadTitleBar: React.FC<NotepadTitleBarProps> = ({
  documents,
  activeId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  isDark,
}) => {
  return (
    <div className={`h-[42px] flex items-center justify-between select-none px-2 border-b ${
      isDark ? 'bg-[#181818] border-[#2b2b2b] text-[#cccccc]' : 'bg-[#f3f3f3] border-[#e5e5e5] text-[#333333]'
    }`}>
      {/* Left side: Icon + Tabs */}
      <div className="flex items-center space-x-1.5 flex-1 min-w-0 overflow-x-auto no-scrollbar pr-2">
        {/* App Logo */}
        <div
          className={`flex items-center justify-center w-6 h-6 shrink-0 mr-1.5 rounded-[5px] transition-colors ${
            isDark
              ? 'bg-[#1e1e20] border border-white/10 text-white hover:border-white/20'
              : 'bg-[#e0e0e0] border border-black/10 text-[#1e1e20] hover:border-black/20'
          }`}
          title="Notepad-XR"
        >
          <AppLogo className="w-4 h-4" />
        </div>

        {/* Tab Items */}
        <div className="flex items-center space-x-1 flex-1 min-w-0">
          {documents.map((doc) => {
            const isActive = doc.id === activeId;
            return (
              <div
                key={doc.id}
                onClick={() => onSelectTab(doc.id)}
                className={`group relative flex items-center h-[34px] max-w-[200px] min-w-[120px] px-3 rounded-t-[6px] cursor-pointer text-xs transition-colors duration-150 border-t border-x ${
                  isActive
                    ? isDark
                      ? 'bg-[#282828] border-[#383838] border-b-transparent text-white font-medium shadow-sm'
                      : 'bg-white border-[#d1d5db] border-b-transparent text-[#111827] font-medium shadow-sm'
                    : isDark
                    ? 'bg-transparent border-transparent text-[#a0a0a0] hover:bg-[#222222] hover:text-[#e0e0e0]'
                    : 'bg-transparent border-transparent text-[#666666] hover:bg-[#eaeaea] hover:text-[#111111]'
                }`}
                title={doc.title}
              >
                {/* Title */}
                <span className="truncate flex-1 pr-1.5 text-[12.5px]">
                  {doc.title || 'Untitled'}
                </span>

                {/* Dot indicator for inactive/dirty OR Close button */}
                <div className="flex items-center justify-center shrink-0 w-5 h-5">
                  {doc.isDirty && !isActive ? (
                    <span className="w-2 h-2 rounded-full bg-[#888888] inline-block" title="Unsaved changes" />
                  ) : isActive ? (
                    <button
                      onClick={(e) => onCloseTab(doc.id, e)}
                      className={`p-0.5 rounded transition-colors ${
                        isDark 
                          ? 'hover:bg-[#3d3d3d] text-[#b0b0b0] hover:text-white' 
                          : 'hover:bg-[#e0e0e0] text-[#707070] hover:text-black'
                      }`}
                      title="Close tab (Ctrl+W)"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => onCloseTab(doc.id, e)}
                      className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all ${
                        isDark 
                          ? 'hover:bg-[#333333] text-[#a0a0a0] hover:text-white' 
                          : 'hover:bg-[#e5e5e5] text-[#666666] hover:text-black'
                      }`}
                      title="Close tab (Ctrl+W)"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* New Tab '+' Button */}
          <button
            onClick={onNewTab}
            className={`w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
              isDark
                ? 'hover:bg-[#282828] text-[#a0a0a0] hover:text-white'
                : 'hover:bg-[#e2e2e2] text-[#555555] hover:text-black'
            }`}
            title="New tab (Ctrl+N / Ctrl+T)"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right side: Window Controls */}
      <div className="flex items-center h-full -mr-2">
        <button
          className={`h-full w-[46px] flex items-center justify-center transition-colors ${
            isDark ? 'hover:bg-[#2e2e2e] text-[#cccccc]' : 'hover:bg-[#e5e5e5] text-[#444444]'
          }`}
          title="Minimize"
          onClick={() => {}}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          className={`h-full w-[46px] flex items-center justify-center transition-colors ${
            isDark ? 'hover:bg-[#2e2e2e] text-[#cccccc]' : 'hover:bg-[#e5e5e5] text-[#444444]'
          }`}
          title="Maximize"
          onClick={() => {}}
        >
          <Square className="w-3 h-3 stroke-[1.5]" />
        </button>
        <button
          className="h-full w-[46px] flex items-center justify-center transition-colors hover:bg-[#c42b1c] hover:text-white text-[#cccccc]"
          title="Close"
          onClick={() => {}}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
