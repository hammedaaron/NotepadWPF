import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  ArrowRight, 
  Settings2, 
  Key, 
  AlertCircle, 
  ExternalLink
} from 'lucide-react';
import { 
  UserAiConfig, 
  getStoredAiConfig, 
  saveStoredAiConfig, 
  executeAiRequest, 
  AiProvider 
} from '../utils/userAiService';

interface NotepadCopilotModalProps {
  isOpen: boolean;
  isDark: boolean;
  selectedText: string;
  onReplaceWithAi: (newText: string) => void;
  onInsertBelow: (newText: string) => void;
  onClose: () => void;
}

export const NotepadCopilotModal: React.FC<NotepadCopilotModalProps> = ({
  isOpen,
  isDark,
  selectedText,
  onReplaceWithAi,
  onInsertBelow,
  onClose
}) => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User AI Configuration State
  const [aiConfig, setAiConfig] = useState<UserAiConfig>(() => getStoredAiConfig());
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(() => {
    const cfg = getStoredAiConfig();
    if (cfg.provider === 'gemini') return cfg.geminiApiKey || '';
    if (cfg.provider === 'anthropic') return cfg.anthropicApiKey || '';
    if (cfg.provider === 'openai') return cfg.openaiApiKey || '';
    return cfg.customApiKey || '';
  });

  if (!isOpen) return null;

  const currentKey = 
    aiConfig.provider === 'gemini' ? aiConfig.geminiApiKey :
    aiConfig.provider === 'anthropic' ? aiConfig.anthropicApiKey :
    aiConfig.provider === 'openai' ? aiConfig.openaiApiKey :
    aiConfig.customApiKey;

  const hasKeyConfigured = Boolean(currentKey && currentKey.trim().length > 0);

  const handleSaveConfig = () => {
    const updated: UserAiConfig = { ...aiConfig };
    if (aiConfig.provider === 'gemini') updated.geminiApiKey = tempApiKey.trim();
    if (aiConfig.provider === 'anthropic') updated.anthropicApiKey = tempApiKey.trim();
    if (aiConfig.provider === 'openai') updated.openaiApiKey = tempApiKey.trim();
    if (aiConfig.provider === 'custom') updated.customApiKey = tempApiKey.trim();

    setAiConfig(updated);
    saveStoredAiConfig(updated);
    setIsConfigOpen(false);
    setErrorMessage(null);
  };

  const handleProviderChange = (newProvider: AiProvider) => {
    const updated = { ...aiConfig, provider: newProvider };
    setAiConfig(updated);
    if (newProvider === 'gemini') setTempApiKey(updated.geminiApiKey || '');
    if (newProvider === 'anthropic') setTempApiKey(updated.anthropicApiKey || '');
    if (newProvider === 'openai') setTempApiKey(updated.openaiApiKey || '');
    if (newProvider === 'custom') setTempApiKey(updated.customApiKey || '');
  };

  const handleGenerate = async (presetPrompt?: string) => {
    const userPrompt = presetPrompt || prompt;
    if (!userPrompt && !selectedText) return;

    if (!hasKeyConfigured && aiConfig.provider !== 'custom') {
      setIsConfigOpen(true);
      setErrorMessage(`Please enter your ${aiConfig.provider.toUpperCase()} API key to use AI.`);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await executeAiRequest(aiConfig, userPrompt || 'Improve this text', selectedText);

    setIsLoading(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setResult(res.text);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getProviderName = (p: AiProvider) => {
    switch (p) {
      case 'gemini': return 'Google Gemini';
      case 'anthropic': return 'Anthropic Claude';
      case 'openai': return 'OpenAI / Copilot (GPT-4o)';
      case 'custom': return 'Custom / Local LLM';
    }
  };

  const getKeyHelpLink = () => {
    if (aiConfig.provider === 'gemini') return 'https://aistudio.google.com/app/apikey';
    if (aiConfig.provider === 'anthropic') return 'https://console.anthropic.com/settings/keys';
    if (aiConfig.provider === 'openai') return 'https://platform.openai.com/api-keys';
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        className={`w-full max-w-lg rounded-xl shadow-2xl border p-5 text-xs select-none flex flex-col space-y-3.5 ${
          isDark ? 'bg-[#252525] border-[#3d3d3d] text-[#f0f0f0]' : 'bg-white border-[#d1d5db] text-[#111827]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                <span>AI Writing Assistant</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  BYOK
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={`p-1.5 rounded flex items-center gap-1 text-[11px] font-medium transition-colors ${
                isConfigOpen 
                  ? 'bg-blue-600 text-white' 
                  : isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
              }`}
              title="Configure your own AI API Key"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{getProviderName(aiConfig.provider).split(' ')[0]}</span>
              <Settings2 className="w-3 h-3 opacity-60" />
            </button>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-500/20">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* API Key / Provider Configuration Drawer */}
        {isConfigOpen && (
          <div className={`p-3.5 rounded-lg border space-y-3 animate-in slide-in-from-top-2 duration-150 ${
            isDark ? 'bg-[#1c1c1c] border-[#383838]' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-xs flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Bring Your Own API Key (BYOK)</span>
              </div>
              <span className="text-[10px] text-gray-400">Stored locally in your browser</span>
            </div>

            {/* Provider Selector */}
            <div className="grid grid-cols-4 gap-1.5">
              {(['gemini', 'anthropic', 'openai', 'custom'] as AiProvider[]).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => handleProviderChange(prov)}
                  className={`py-1 px-1.5 rounded text-[11px] font-medium border text-center truncate transition-colors ${
                    aiConfig.provider === prov
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : isDark
                      ? 'bg-[#282828] border-[#444] text-gray-300 hover:bg-[#333]'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {prov === 'gemini' ? 'Gemini' : prov === 'anthropic' ? 'Claude' : prov === 'openai' ? 'OpenAI' : 'Custom'}
                </button>
              ))}
            </div>

            {/* API Key Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <label className="font-medium text-gray-300">
                  {getProviderName(aiConfig.provider)} API Key:
                </label>
                {getKeyHelpLink() && (
                  <a
                    href={getKeyHelpLink()!}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-0.5 text-[10px]"
                  >
                    Get API Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              <input
                type="password"
                placeholder={
                  aiConfig.provider === 'gemini' ? 'AIzaSy...' :
                  aiConfig.provider === 'anthropic' ? 'sk-ant-...' :
                  aiConfig.provider === 'openai' ? 'sk-...' :
                  'Custom API Key (optional)'
                }
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className={`w-full p-2 rounded border outline-none font-mono text-xs ${
                  isDark ? 'bg-[#141414] border-[#444] text-white' : 'bg-white border-gray-300 text-black'
                }`}
              />

              {aiConfig.provider === 'custom' && (
                <div className="space-y-1.5 pt-1.5">
                  <input
                    type="text"
                    placeholder="Endpoint (e.g. http://localhost:11434/v1/chat/completions)"
                    value={aiConfig.customEndpoint || ''}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, customEndpoint: e.target.value }))}
                    className={`w-full p-2 rounded border outline-none font-mono text-xs ${
                      isDark ? 'bg-[#141414] border-[#444] text-white' : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Model name (e.g. llama3, mistral, gpt-4o)"
                    value={aiConfig.customModelName || ''}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, customModelName: e.target.value }))}
                    className={`w-full p-2 rounded border outline-none font-mono text-xs ${
                      isDark ? 'bg-[#141414] border-[#444] text-white' : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="px-2.5 py-1 rounded border border-gray-500/30 hover:bg-gray-500/10 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm"
              >
                Save API Key
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMessage}</span>
              {!hasKeyConfigured && !isConfigOpen && (
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(true)}
                  className="ml-2 underline font-semibold text-red-300 hover:text-white"
                >
                  Enter Key Now
                </button>
              )}
            </div>
          </div>
        )}

        {/* Selected text preview */}
        {selectedText && (
          <div className={`p-2.5 rounded border text-xs max-h-24 overflow-y-auto ${
            isDark ? 'bg-[#1e1e1e] border-[#383838] text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}>
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Source Text:</span>
            {selectedText}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Rewrite Pro', prompt: 'Rewrite professionally with concise phrasing' },
            { label: 'Summarize', prompt: 'Summarize into clear key bullet points' },
            { label: 'Fix Spelling & Grammar', prompt: 'Fix all typos, spelling, and grammatical errors without changing the message' },
            { label: 'Make Casual', prompt: 'Rewrite in a friendly and conversational tone' },
            { label: 'Make Markdown Table', prompt: 'Format the text or information into a clean Markdown table' }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleGenerate(item.prompt)}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors ${
                isDark 
                  ? 'border-[#444] bg-[#2e2e2e] hover:bg-[#383838] text-gray-200' 
                  : 'border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom prompt input */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={`Ask ${getProviderName(aiConfig.provider)} (e.g. 'Turn into action items', 'Explain clearly')...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className={`flex-1 p-2 rounded border outline-none text-xs ${
              isDark ? 'bg-[#1c1c1c] border-[#444] text-white' : 'bg-white border-[#ccc] text-black'
            }`}
          />
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium flex items-center space-x-1"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Result Area */}
        {result && (
          <div className="space-y-2 pt-2 border-t border-gray-500/20">
            <div className={`p-3 rounded border text-xs max-h-40 overflow-y-auto whitespace-pre-wrap ${
              isDark ? 'bg-[#1a1a1a] border-[#383838]' : 'bg-blue-50/50 border-blue-100'
            }`}>
              {result}
            </div>
            
            <div className="flex items-center justify-between">
              <button
                onClick={handleCopy}
                className={`px-2.5 py-1 rounded border flex items-center space-x-1.5 text-xs ${
                  isDark ? 'border-[#444] hover:bg-[#333]' : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { onInsertBelow(result); onClose(); }}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    isDark ? 'bg-[#383838] hover:bg-[#484848]' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Insert Below
                </button>
                <button
                  onClick={() => { onReplaceWithAi(result); onClose(); }}
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Replace Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
