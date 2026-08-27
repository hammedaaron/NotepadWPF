import React from 'react';
import { ArrowLeft, X, Monitor, Moon, Sun, Type, Sliders, Palette, Check } from 'lucide-react';
import { NotepadSettings } from '../types';
import { ACCENT_PALETTES, AccentColorKey } from '../types/accentColors';

interface NotepadSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotepadSettings;
  onUpdateSettings: (newSettings: Partial<NotepadSettings>) => void;
  isDark: boolean;
}

export const NotepadSettingsModal: React.FC<NotepadSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  isDark
}) => {
  if (!isOpen) return null;

  const fontOptions = [
    { label: 'Consolas (Default Code)', value: 'Consolas, "Courier New", monospace' },
    { label: 'Cascadia Code (Windows 11)', value: '"Cascadia Code", "Cascadia Mono", Consolas, monospace' },
    { label: 'SF Pro / Apple System', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    { label: 'Segoe UI Variable (Modern UI)', value: '"Segoe UI Variable Text", "Segoe UI", sans-serif' },
    { label: 'Courier New (Typewriter)', value: '"Courier New", Courier, monospace' },
    { label: 'Lucida Console', value: '"Lucida Console", Monaco, monospace' },
    { label: 'Georgia (Editorial Serif)', value: 'Georgia, serif' }
  ];

  const accentKeys: AccentColorKey[] = ['silver', 'amber', 'slate', 'ocean', 'emerald', 'rose', 'violet'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl border flex flex-col overflow-hidden ${
          isDark 
            ? 'bg-[#202020] border-[#383838] text-[#f0f0f0]' 
            : 'bg-[#fafafa] border-[#d8d8dc] text-[#1a1a1a]'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between select-none ${
          isDark ? 'border-[#2d2d2d]' : 'border-[#e5e5e5]'
        }`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors ${
                isDark ? 'hover:bg-[#2d2d2d] text-[#aaa]' : 'hover:bg-[#ebebeb] text-[#666]'
              }`}
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-semibold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#2d2d2d] text-[#aaa]' : 'hover:bg-[#ebebeb] text-[#666]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 text-sm">
          {/* 1. App Theme Selection */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3">App theme</h3>
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-[#262626] border-[#333333]' : 'bg-white border-[#e0e0e0]'
            }`}>
              <div className="text-xs opacity-75">Select which app theme to display</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'Use system setting', icon: Monitor }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = settings.theme === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onUpdateSettings({ theme: item.id as any })}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? isDark 
                            ? 'bg-[#333333] border-white/40 text-white shadow-sm' 
                            : 'bg-slate-100 border-black/30 text-black shadow-sm'
                          : isDark
                          ? 'border-[#383838] hover:bg-[#2b2b2b] text-[#888]'
                          : 'border-[#eaeaea] hover:bg-[#f5f5f5] text-[#666]'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1.5 opacity-80" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Apple Notes & Selection Accent Color */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Accent & Selection Color
            </h3>
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-[#262626] border-[#333333]' : 'bg-white border-[#e0e0e0]'
            }`}>
              <div className="text-xs opacity-75">
                Choose the accent palette for Apple Notes active pill highlights, caret color, and badges:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {accentKeys.map((key) => {
                  const pal = ACCENT_PALETTES[key];
                  const isSelected = settings.accentColor === key;
                  const displayColor = isDark ? pal.darkColor : pal.lightColor;

                  return (
                    <button
                      key={key}
                      onClick={() => onUpdateSettings({ accentColor: key })}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? isDark 
                            ? 'border-white bg-[#303030] font-semibold text-white' 
                            : 'border-black bg-slate-100 font-semibold text-black'
                          : isDark
                          ? 'border-[#383838] hover:bg-[#2c2c2c] text-[#a0a0a0]'
                          : 'border-[#e0e0e0] hover:bg-[#f7f7f7] text-[#444]'
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center shadow-xs" 
                        style={{ backgroundColor: displayColor }}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-black/80 font-bold" />}
                      </span>
                      <span className="truncate">{pal.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Font Selection & Typography */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Font
            </h3>
            <div className={`p-4 rounded-xl border space-y-4 ${
              isDark ? 'bg-[#262626] border-[#333333]' : 'bg-white border-[#e0e0e0]'
            }`}>
              {/* Font Family */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-xs">Family</div>
                  <div className="text-[11px] opacity-60">Choose your preferred editor typeface</div>
                </div>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => onUpdateSettings({ fontFamily: e.target.value })}
                  className={`px-3 py-1.5 rounded-md border text-xs outline-none ${
                    isDark 
                      ? 'bg-[#1e1e1e] border-[#3d3d3d] text-white' 
                      : 'bg-[#f4f4f4] border-[#d1d5db] text-black'
                  }`}
                >
                  {fontOptions.map(f => (
                    <option key={f.label} value={f.value} className={isDark ? 'bg-[#202020]' : 'bg-white'}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Style */}
              <div className="flex items-center justify-between border-t pt-3 border-black/5 dark:border-white/5">
                <div>
                  <div className="font-medium text-xs">Style</div>
                  <div className="text-[11px] opacity-60">Regular, Bold, or Italic</div>
                </div>
                <select
                  value={settings.fontStyle}
                  onChange={(e) => onUpdateSettings({ fontStyle: e.target.value as any })}
                  className={`px-3 py-1.5 rounded-md border text-xs outline-none ${
                    isDark 
                      ? 'bg-[#1e1e1e] border-[#3d3d3d] text-white' 
                      : 'bg-[#f4f4f4] border-[#d1d5db] text-black'
                  }`}
                >
                  <option value="regular" className={isDark ? 'bg-[#202020]' : 'bg-white'}>Regular</option>
                  <option value="bold" className={isDark ? 'bg-[#202020]' : 'bg-white'}>Bold</option>
                  <option value="italic" className={isDark ? 'bg-[#202020]' : 'bg-white'}>Italic</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="flex items-center justify-between border-t pt-3 border-black/5 dark:border-white/5">
                <div>
                  <div className="font-medium text-xs">Size ({settings.fontSize}pt)</div>
                  <div className="text-[11px] opacity-60">Adjust readability scale</div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="10"
                    max="28"
                    step="1"
                    value={settings.fontSize}
                    onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value) })}
                    className="w-28 accent-blue-500"
                  />
                  <span className="w-6 text-right font-mono text-xs">{settings.fontSize}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Editor Options & Clutter Reducer */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Workspace & Clutter Reducer
            </h3>
            <div className={`p-4 rounded-xl border space-y-4 ${
              isDark ? 'bg-[#262626] border-[#333333]' : 'bg-white border-[#e0e0e0]'
            }`}>
              {/* Word wrap */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-xs">Word wrap</div>
                  <div className="text-[11px] opacity-60">Wrap lines to fit editor window automatically</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.wordWrap}
                  onChange={(e) => onUpdateSettings({ wordWrap: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Smart Clutter Reduction */}
              <div className="flex items-center justify-between border-t pt-3 border-black/5 dark:border-white/5">
                <div>
                  <div className="font-medium text-xs">Smart Folder Clutter Reducer</div>
                  <div className="text-[11px] opacity-60">Focus on active/pinned items by default</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smartFolderReducedClutter}
                  onChange={(e) => onUpdateSettings({ smartFolderReducedClutter: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between border-t pt-3 border-black/5 dark:border-white/5">
                <div>
                  <div className="font-medium text-xs">Status bar</div>
                  <div className="text-[11px] opacity-60">Show line/col position, zoom, line endings, and encoding</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showStatusBar}
                  onChange={(e) => onUpdateSettings({ showStatusBar: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex justify-end ${
          isDark ? 'bg-[#1a1a1a] border-[#2b2b2b]' : 'bg-[#f0f0f0] border-[#dedee3]'
        }`}>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
