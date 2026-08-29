import React, { useState } from 'react';
import { 
  ArrowLeft, 
  X, 
  Monitor, 
  Moon, 
  Sun, 
  Type, 
  Sliders, 
  Palette, 
  Check, 
  Key, 
  ExternalLink,
  Download,
  Laptop
} from 'lucide-react';
import { NotepadSettings } from '../types';
import { ACCENT_PALETTES, AccentColorKey } from '../types/accentColors';
import { 
  getStoredAiConfig, 
  saveStoredAiConfig, 
  UserAiConfig, 
  AiProvider 
} from '../utils/userAiService';

interface NotepadSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotepadSettings;
  onUpdateSettings: (newSettings: Partial<NotepadSettings>) => void;
  isDark: boolean;
  onOpenInstallModal?: () => void;
}

export const NotepadSettingsModal: React.FC<NotepadSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  isDark,
  onOpenInstallModal
}) => {
  const [aiConfig, setAiConfig] = useState<UserAiConfig>(() => getStoredAiConfig());
  const [apiKeySavedNotice, setApiKeySavedNotice] = useState(false);

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

  const handleUpdateAiConfig = (updates: Partial<UserAiConfig>) => {
    const updated = { ...aiConfig, ...updates };
    setAiConfig(updated);
    saveStoredAiConfig(updated);
    setApiKeySavedNotice(true);
    setTimeout(() => setApiKeySavedNotice(false), 2500);
  };

  const getKeyHelpLink = () => {
    if (aiConfig.provider === 'gemini') return 'https://aistudio.google.com/app/apikey';
    if (aiConfig.provider === 'anthropic') return 'https://console.anthropic.com/settings/keys';
    if (aiConfig.provider === 'openai') return 'https://platform.openai.com/api-keys';
    return null;
  };

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
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isDark ? 'hover:bg-[#2d2d2d] text-[#aaa]' : 'hover:bg-[#ebebeb] text-[#666]'
              }`}
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-semibold">Settings</h2>
          </div>
          <div className="flex items-center space-x-2">
            {onOpenInstallModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInstallModal();
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install to PC</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'hover:bg-[#2d2d2d] text-[#aaa]' : 'hover:bg-[#ebebeb] text-[#666]'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 text-sm">
          {/* Top Feature Banner: Install to PC */}
          {onOpenInstallModal && (
            <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
              isDark 
                ? 'bg-gradient-to-r from-blue-950/40 to-[#262626] border-blue-800/40 text-blue-100' 
                : 'bg-gradient-to-r from-blue-50 to-white border-blue-200 text-blue-950'
            }`}>
              <div className="space-y-1">
                <div className="font-semibold text-xs flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-400" />
                  <span>Desktop App & PC Installation</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30">
                    Offline Ready
                  </span>
                </div>
                <div className="text-[11.5px] opacity-75 leading-relaxed max-w-md">
                  Install as a standalone Windows 11 desktop application with taskbar pinning, desktop shortcuts, and zero store wait times.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInstallModal();
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Install to PC</span>
              </button>
            </div>
          )}

          {/* 1. Bring-Your-Own-Key (BYOK) AI Integration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" /> AI Assistant & API Keys (BYOK)
              </h3>
              {apiKeySavedNotice && (
                <span className="text-[11px] text-green-400 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3 h-3" /> Saved to browser
                </span>
              )}
            </div>

            <div className={`p-4 rounded-xl border space-y-3.5 ${
              isDark ? 'bg-[#262626] border-[#333333]' : 'bg-white border-[#e0e0e0]'
            }`}>
              <div className="flex items-center justify-between text-xs opacity-75">
                <span>Select your AI provider and enter your private API key to power Copilot:</span>
              </div>

              {/* Provider Selection */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'gemini', label: 'Gemini', desc: 'Google AI Studio' },
                  { id: 'anthropic', label: 'Claude', desc: 'Claude 3.5 Sonnet' },
                  { id: 'openai', label: 'OpenAI', desc: 'GPT-4o / Copilot' },
                  { id: 'custom', label: 'Custom', desc: 'Ollama / Local LLM' }
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => handleUpdateAiConfig({ provider: prov.id as AiProvider })}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                      aiConfig.provider === prov.id
                        ? isDark
                          ? 'bg-[#333333] border-blue-500 text-white shadow-sm ring-1 ring-blue-500'
                          : 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm ring-1 ring-blue-500'
                        : isDark
                        ? 'border-[#383838] hover:bg-[#2b2b2b] text-[#888]'
                        : 'border-[#eaeaea] hover:bg-[#f5f5f5] text-[#666]'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center justify-between w-full">
                      <span>{prov.label}</span>
                      {aiConfig.provider === prov.id && <Check className="w-3 h-3 text-blue-400" />}
                    </div>
                    <div className="text-[10px] opacity-70 mt-0.5">{prov.desc}</div>
                  </button>
                ))}
              </div>

              {/* Key Input Section */}
              <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium">
                    {aiConfig.provider === 'gemini' ? 'Google Gemini API Key' :
                     aiConfig.provider === 'anthropic' ? 'Anthropic Claude API Key' :
                     aiConfig.provider === 'openai' ? 'OpenAI API Key' : 'Custom Endpoint API Key'}
                  </label>
                  {getKeyHelpLink() && (
                    <a
                      href={getKeyHelpLink()!}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Get your API key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                <input
                  type="password"
                  placeholder={
                    aiConfig.provider === 'gemini' ? 'AIzaSy...' :
                    aiConfig.provider === 'anthropic' ? 'sk-ant-...' :
                    aiConfig.provider === 'openai' ? 'sk-...' :
                    'Custom Key (optional for local models)'
                  }
                  value={
                    aiConfig.provider === 'gemini' ? (aiConfig.geminiApiKey || '') :
                    aiConfig.provider === 'anthropic' ? (aiConfig.anthropicApiKey || '') :
                    aiConfig.provider === 'openai' ? (aiConfig.openaiApiKey || '') :
                    (aiConfig.customApiKey || '')
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (aiConfig.provider === 'gemini') handleUpdateAiConfig({ geminiApiKey: val });
                    else if (aiConfig.provider === 'anthropic') handleUpdateAiConfig({ anthropicApiKey: val });
                    else if (aiConfig.provider === 'openai') handleUpdateAiConfig({ openaiApiKey: val });
                    else handleUpdateAiConfig({ customApiKey: val });
                  }}
                  className={`w-full p-2.5 rounded-lg border outline-none font-mono text-xs ${
                    isDark 
                      ? 'bg-[#1a1a1a] border-[#444] text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-black focus:border-blue-500'
                  }`}
                />

                {aiConfig.provider === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] opacity-70 block mb-1">API Endpoint URL</label>
                      <input
                        type="text"
                        placeholder="http://localhost:11434/v1/chat/completions"
                        value={aiConfig.customEndpoint || ''}
                        onChange={(e) => handleUpdateAiConfig({ customEndpoint: e.target.value })}
                        className={`w-full p-2 rounded border outline-none font-mono text-xs ${
                          isDark ? 'bg-[#1a1a1a] border-[#444] text-white' : 'bg-white border-gray-300 text-black'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] opacity-70 block mb-1">Model Name</label>
                      <input
                        type="text"
                        placeholder="llama3 / mistral / etc"
                        value={aiConfig.customModelName || ''}
                        onChange={(e) => handleUpdateAiConfig({ customModelName: e.target.value })}
                        className={`w-full p-2 rounded border outline-none font-mono text-xs ${
                          isDark ? 'bg-[#1a1a1a] border-[#444] text-white' : 'bg-white border-gray-300 text-black'
                        }`}
                      />
                    </div>
                  </div>
                )}
                
                <p className="text-[11px] opacity-60">
                  Your keys are encrypted in your browser's private local storage. They are sent directly to the AI provider and never stored on any server.
                </p>
              </div>
            </div>
          </div>

          {/* 2. App Theme Selection */}
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

          {/* 3. Windows 11 Accent Color Customizer */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Windows 11 Accent Palette
            </h3>
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-[#262626] border-[#333333]' : 'bg-white border-[#e0e0e0]'
            }`}>
              <div className="text-xs opacity-75">Choose an accent tint for selection highlights, active tabs, and badges</div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
                {accentKeys.map((key) => {
                  const pal = ACCENT_PALETTES[key];
                  const isSelected = settings.accentColor === key;
                  return (
                    <button
                      key={key}
                      onClick={() => onUpdateSettings({ accentColor: key })}
                      className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all ${
                        isSelected 
                          ? isDark ? 'bg-[#333] border-white/50 ring-1 ring-white/50' : 'bg-slate-100 border-black/40 ring-1 ring-black/40' 
                          : isDark ? 'border-[#383838] hover:bg-[#2e2e2e]' : 'border-[#eaeaea] hover:bg-[#f2f2f2]'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full flex items-center justify-center shadow-xs" style={{ backgroundColor: isDark ? pal.darkColor : pal.lightColor }}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
                      </span>
                      <span className="text-[10px] font-medium mt-1 truncate max-w-full">{pal.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Typography / Font & Sizing */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Font & Typography
            </h3>
            <div className={`p-4 rounded-xl border space-y-4 ${
              isDark ? 'bg-[#262626] border-[#333333]' : 'bg-white border-[#e0e0e0]'
            }`}>
              {/* Font Family */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-xs">Font Family</div>
                  <div className="text-[11px] opacity-60">Choose editor typeface</div>
                </div>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => onUpdateSettings({ fontFamily: e.target.value })}
                  className={`p-1.5 rounded border text-xs outline-none max-w-[200px] truncate ${
                    isDark ? 'bg-[#1a1a1a] border-[#383838] text-white' : 'bg-white border-[#ccc] text-black'
                  }`}
                >
                  {fontOptions.map((f) => (
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
                  <div className="text-[11px] opacity-60">Weight & slope</div>
                </div>
                <select
                  value={settings.fontStyle}
                  onChange={(e) => onUpdateSettings({ fontStyle: e.target.value as any })}
                  className={`p-1.5 rounded border text-xs outline-none ${
                    isDark ? 'bg-[#1a1a1a] border-[#383838] text-white' : 'bg-white border-[#ccc] text-black'
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

          {/* 5. Editor Options & Clutter Reducer */}
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

          {/* 6. Desktop PC Installation (Direct / No Store Screening) */}
          {onOpenInstallModal && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-blue-400" /> Desktop App & PC Installation
              </h3>
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                isDark ? 'bg-[#262626] border-[#333333]' : 'bg-white border-[#e0e0e0]'
              }`}>
                <div className="space-y-1">
                  <div className="font-medium text-xs flex items-center gap-1.5">
                    <span>Install Notepad-XR to PC</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                      Zero Store Delay
                    </span>
                  </div>
                  <div className="text-[11.5px] opacity-65 leading-relaxed">
                    Install standalone Windows 11 app with desktop shortcuts, 100% offline capability, and no Microsoft Store review wait time.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenInstallModal();
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install Options</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between ${
          isDark ? 'bg-[#1a1a1a] border-[#2b2b2b]' : 'bg-[#f0f0f0] border-[#dedee3]'
        }`}>
          {onOpenInstallModal ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInstallModal();
              }}
              className="text-xs text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Notepad-XR to PC...</span>
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
