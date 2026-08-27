import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  noteTitle: string;
  isPermanent?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDark: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  noteTitle,
  isPermanent = false,
  onConfirm,
  onCancel,
  isDark
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-fadeIn">
      <div 
        className={`w-full max-w-[380px] rounded-xl border shadow-2xl p-5 select-none transition-all ${
          isDark 
            ? 'bg-[#202020] border-[#383838] text-white shadow-black/60' 
            : 'bg-white border-[#d1d5db] text-[#111827] shadow-xl'
        }`}
      >
        <div className="flex items-start gap-3.5 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isPermanent 
              ? 'bg-red-500/15 text-red-500' 
              : 'bg-amber-500/15 text-amber-500'
          }`}>
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold truncate mb-1">
              {title || (isPermanent ? 'Permanently Delete Note?' : 'Move Note to Trash?')}
            </h3>
            <p className="text-xs opacity-75 leading-relaxed">
              {isPermanent ? (
                <>
                  Are you sure you want to permanently delete <b className="font-semibold opacity-100">"{noteTitle || 'Untitled'}"</b>? This action cannot be undone.
                </>
              ) : (
                <>
                  Move <b className="font-semibold opacity-100">"{noteTitle || 'Untitled'}"</b> to Recently Deleted? You can recover it anytime from the Trash folder.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
          <button
            onClick={onCancel}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white' 
                : 'bg-black/5 hover:bg-black/10 text-gray-700 hover:text-black'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-white transition-all shadow-sm ${
              isPermanent 
                ? 'bg-red-600 hover:bg-red-700 active:scale-95' 
                : 'bg-amber-600 hover:bg-amber-700 active:scale-95'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isPermanent ? 'Delete Permanently' : 'Move to Trash'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
