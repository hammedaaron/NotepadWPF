import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface NotepadGoToModalProps {
  isOpen: boolean;
  isDark: boolean;
  totalLines: number;
  onGoToLine: (lineNumber: number) => void;
  onClose: () => void;
}

export const NotepadGoToModal: React.FC<NotepadGoToModalProps> = ({
  isOpen,
  isDark,
  totalLines,
  onGoToLine,
  onClose
}) => {
  const [lineNumber, setLineNumber] = useState<string>('1');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLineNumber('1');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(lineNumber, 10);
    if (!isNaN(num) && num >= 1) {
      onGoToLine(num);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-100">
      <div
        className={`w-full max-w-sm rounded-lg shadow-2xl border p-4 text-xs select-none ${
          isDark ? 'bg-[#2b2b2b] border-[#3e3e3e] text-[#f0f0f0]' : 'bg-white border-[#d1d5db] text-[#111827]'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Go To Line</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-500/20">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1.5">Line number (1 - {totalLines}):</label>
            <input
              ref={inputRef}
              type="number"
              min="1"
              max={totalLines}
              value={lineNumber}
              onChange={(e) => setLineNumber(e.target.value)}
              className={`w-full p-2 rounded border outline-none ${
                isDark ? 'bg-[#1e1e1e] border-[#444] text-white' : 'bg-white border-[#ccc] text-black'
              }`}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Go To
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-1.5 rounded transition-colors ${
                isDark ? 'bg-[#383838] hover:bg-[#484848] text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
