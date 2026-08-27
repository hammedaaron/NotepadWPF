import React, { useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, X, ChevronRight } from 'lucide-react';
import { FindReplaceState } from '../types';

interface NotepadFindReplaceProps {
  isDark: boolean;
  state: FindReplaceState;
  onUpdateState: (updates: Partial<FindReplaceState>) => void;
  onFindNext: () => void;
  onFindPrev: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
}

export const NotepadFindReplace: React.FC<NotepadFindReplaceProps> = ({
  isDark,
  state,
  onUpdateState,
  onFindNext,
  onFindPrev,
  onReplace,
  onReplaceAll,
  onClose
}) => {
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.isOpen) {
      findInputRef.current?.focus();
      findInputRef.current?.select();
    }
  }, [state.isOpen]);

  if (!state.isOpen) return null;

  return (
    <div
      className={`absolute top-2 right-4 z-40 rounded-lg shadow-2xl border p-2 text-xs select-none animate-in fade-in slide-in-from-top-2 duration-150 ${
        isDark 
          ? 'bg-[#2b2b2b] border-[#3e3e3e] text-[#f0f0f0]' 
          : 'bg-white border-[#d1d5db] text-[#111827]'
      }`}
      style={{ minWidth: '340px' }}
    >
      {/* Top row: Find */}
      <div className="flex items-center space-x-1.5">
        {/* Toggle Replace row button */}
        <button
          onClick={() => onUpdateState({ isReplaceMode: !state.isReplaceMode })}
          className={`p-1 rounded transition-colors ${
            isDark ? 'hover:bg-[#3d3d3d] text-[#b0b0b0]' : 'hover:bg-[#e5e5e5] text-[#555]'
          }`}
          title={state.isReplaceMode ? 'Hide Replace' : 'Show Replace'}
        >
          {state.isReplaceMode ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Find Input */}
        <div className={`flex-1 flex items-center border rounded px-2 py-1 ${
          isDark 
            ? 'bg-[#1f1f1f] border-[#444] focus-within:border-blue-500' 
            : 'bg-white border-[#ccc] focus-within:border-blue-600'
        }`}>
          <input
            ref={findInputRef}
            type="text"
            placeholder="Find"
            value={state.findText}
            onChange={(e) => onUpdateState({ findText: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) onFindPrev();
                else onFindNext();
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            className="w-full bg-transparent outline-none text-xs"
          />
        </div>

        {/* Match Case 'Aa' */}
        <button
          onClick={() => onUpdateState({ matchCase: !state.matchCase })}
          className={`px-1.5 py-1 rounded text-[11px] font-bold border transition-colors ${
            state.matchCase
              ? isDark ? 'bg-blue-600/30 border-blue-500 text-blue-400' : 'bg-blue-100 border-blue-500 text-blue-800'
              : isDark ? 'border-transparent text-gray-400 hover:bg-[#3d3d3d]' : 'border-transparent text-gray-600 hover:bg-gray-100'
          }`}
          title="Match Case"
        >
          Aa
        </button>

        {/* Wrap Around '↻' */}
        <button
          onClick={() => onUpdateState({ wrapAround: !state.wrapAround })}
          className={`px-1.5 py-1 rounded text-[11px] border transition-colors ${
            state.wrapAround
              ? isDark ? 'bg-blue-600/30 border-blue-500 text-blue-400' : 'bg-blue-100 border-blue-500 text-blue-800'
              : isDark ? 'border-transparent text-gray-400 hover:bg-[#3d3d3d]' : 'border-transparent text-gray-600 hover:bg-gray-100'
          }`}
          title="Wrap Around"
        >
          ↻
        </button>

        {/* Previous */}
        <button
          onClick={onFindPrev}
          className={`p-1 rounded transition-colors ${
            isDark ? 'hover:bg-[#3d3d3d] text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Find Previous (Shift+F3)"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>

        {/* Next */}
        <button
          onClick={onFindNext}
          className={`p-1 rounded transition-colors ${
            isDark ? 'hover:bg-[#3d3d3d] text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Find Next (F3 / Enter)"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`p-1 rounded transition-colors ${
            isDark ? 'hover:bg-[#3d3d3d] text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-black'
          }`}
          title="Close (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom row: Replace (if expanded) */}
      {state.isReplaceMode && (
        <div className="flex items-center space-x-1.5 mt-2 pt-2 border-t border-gray-500/20">
          <div className="w-5" />
          <div className={`flex-1 flex items-center border rounded px-2 py-1 ${
            isDark 
              ? 'bg-[#1f1f1f] border-[#444] focus-within:border-blue-500' 
              : 'bg-white border-[#ccc] focus-within:border-blue-600'
          }`}>
            <input
              type="text"
              placeholder="Replace"
              value={state.replaceText}
              onChange={(e) => onUpdateState({ replaceText: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onReplace();
                else if (e.key === 'Escape') onClose();
              }}
              className="w-full bg-transparent outline-none text-xs"
            />
          </div>

          <button
            onClick={onReplace}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              isDark ? 'bg-[#383838] hover:bg-[#484848] text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'
            }`}
          >
            Replace
          </button>

          <button
            onClick={onReplaceAll}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              isDark ? 'bg-[#383838] hover:bg-[#484848] text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'
            }`}
          >
            Replace All
          </button>
        </div>
      )}
    </div>
  );
};
