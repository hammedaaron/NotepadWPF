import React, { useState } from 'react';
import { X, Diamond, RefreshCw, Copy, Check, ArrowRight } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleGenerate = async (presetPrompt?: string) => {
    const userPrompt = presetPrompt || prompt;
    if (!userPrompt && !selectedText) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are Microsoft Copilot integrated directly into Windows Notepad. 
Task: ${userPrompt || 'Rewrite and improve the text'}.
Context/Source Text: "${selectedText}".
Output ONLY the clean final text result without conversational preamble or markdown code fence wrappers.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.text || '');
      } else {
        // Fallback demo generation if offline
        setResult(`[Copilot suggestion]: ${selectedText ? selectedText.trim() + ' (polished with clear tone and structure)' : 'Here is your drafted notes outline.'}`);
      }
    } catch (e) {
      setResult(`[Copilot]: ${selectedText ? selectedText.trim() : 'Sample text ready to insert.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        className={`w-full max-w-lg rounded-xl shadow-2xl border p-5 text-xs select-none flex flex-col space-y-3.5 ${
          isDark ? 'bg-[#252525] border-[#3d3d3d] text-[#f0f0f0]' : 'bg-white border-[#d1d5db] text-[#111827]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white">
              <Diamond className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-semibold text-sm">Rewrite with Copilot</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-500/20">
            <X className="w-4 h-4" />
          </button>
        </div>

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
            { label: 'Summarize', prompt: 'Summarize into key bullet points' },
            { label: 'Fix Spelling & Grammar', prompt: 'Fix all typos, grammar, and punctuation without altering tone' },
            { label: 'Make Casual', prompt: 'Make friendly and casual' }
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
            placeholder="Ask Copilot (e.g. 'Format as todo checklist', 'Expand this idea')..."
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
            <div className={`p-3 rounded border text-xs max-h-36 overflow-y-auto whitespace-pre-wrap ${
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
