import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Clock, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  CheckSquare, 
  Table as TableIcon, 
  MessageSquare,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { NestedSubPage, NotepadSettings } from '../types';

interface NestedPageDrawerProps {
  isOpen: boolean;
  subpage: NestedSubPage | null;
  parentDocTitle: string;
  isDark: boolean;
  settings: NotepadSettings;
  onClose: () => void;
  onUpdateSubpage: (updated: NestedSubPage) => void;
  onDeleteSubpage: (subpageId: string) => void;
  onOpenAsTab?: (subpage: NestedSubPage) => void;
}

const EMOJI_OPTIONS = ['📄', '💡', '🚀', '📌', '✨', '🔥', '📊', '📝', '🎯', '⚡', '🌟', '🧠', '🛠️', '🎨', '💼'];

export const NestedPageDrawer: React.FC<NestedPageDrawerProps> = ({
  isOpen,
  subpage,
  parentDocTitle,
  isDark,
  settings,
  onClose,
  onUpdateSubpage,
  onDeleteSubpage,
  onOpenAsTab
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('📄');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChangeRef = useRef(false);

  useEffect(() => {
    if (subpage) {
      setTitle(subpage.title || 'Untitled Sub-page');
      setIcon(subpage.icon || '📄');
      if (editorRef.current && !isInternalChangeRef.current) {
        editorRef.current.innerHTML = subpage.content || '<p>Start typing sub-page notes here...</p>';
      }
      isInternalChangeRef.current = false;
    }
  }, [subpage?.id]);

  if (!isOpen || !subpage) return null;

  const handleSyncContent = () => {
    if (!editorRef.current || !subpage) return;
    isInternalChangeRef.current = true;
    const content = editorRef.current.innerHTML;
    const plainText = editorRef.current.innerText;

    onUpdateSubpage({
      ...subpage,
      title,
      icon,
      content,
      plainText,
      updatedAt: new Date().toISOString()
    });
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (subpage) {
      onUpdateSubpage({
        ...subpage,
        title: newTitle,
        icon,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    setIcon(emoji);
    setShowEmojiPicker(false);
    if (subpage) {
      onUpdateSubpage({
        ...subpage,
        icon: emoji,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleExec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    handleSyncContent();
  };

  const handleFormatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, `<${tag}>`);
    handleSyncContent();
  };

  const handleInsertChecklist = () => {
    const checkHtml = `
      <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 10px; margin: 6px 0;">
        <input type="checkbox" style="margin-top: 4px; width: 16px; height: 16px; cursor: pointer;" />
        <span style="flex: 1;">Task item</span>
      </div>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, checkHtml);
    handleSyncContent();
  };

  const handleInsertCallout = () => {
    const calloutHtml = `
      <div class="apple-callout" style="display: block; margin: 12px 0; padding: 4px 0 4px 14px; border-left: 3.5px solid #3B82F6; background: transparent;">
        <div style="font-size: 14px; line-height: 1.6;">Add reference details or key takeaway...</div>
      </div>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, calloutHtml);
    handleSyncContent();
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <div class="apple-table-wrapper" style="overflow-x: auto; margin: 12px 0;">
        <table class="apple-notes-table" style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid ${isDark ? '#383838' : '#d8d8dc'}; border-radius: 8px; font-size: 13px;">
          <thead>
            <tr style="background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};">
              <th style="padding: 8px 12px; text-align: left; font-weight: 600; border-right: 1px solid ${isDark ? '#383838' : '#d8d8dc'}; border-bottom: 1px solid ${isDark ? '#383838' : '#d8d8dc'};">Key Point</th>
              <th style="padding: 8px 12px; text-align: left; font-weight: 600; border-bottom: 1px solid ${isDark ? '#383838' : '#d8d8dc'};">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px 12px; border-right: 1px solid ${isDark ? '#2e2e2e' : '#eee'}; border-bottom: 1px solid ${isDark ? '#2e2e2e' : '#eee'};">Item 1</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid ${isDark ? '#2e2e2e' : '#eee'};">Description</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-right: 1px solid ${isDark ? '#2e2e2e' : '#eee'};">Item 2</td>
              <td style="padding: 8px 12px;">Notes</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, tableHtml);
    handleSyncContent();
  };

  const wordCount = subpage.plainText ? subpage.plainText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = subpage.plainText ? subpage.plainText.length : 0;

  return (
    <div 
      className={`fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl transition-all duration-300 ease-in-out border-l ${
        isExpanded ? 'w-full md:w-3/4 lg:w-2/3' : 'w-full sm:w-[500px] md:w-[560px]'
      } ${
        isDark 
          ? 'bg-[#1e1e1e] border-[#333] text-[#f0f0f0]' 
          : 'bg-[#ffffff] border-[#e0e0e0] text-[#1a1a1a]'
      }`}
    >
      {/* 1. Header with Breadcrumbs & Actions */}
      <div className={`flex items-center justify-between px-4 py-3 border-b select-none ${
        isDark ? 'bg-[#252525] border-[#333]' : 'bg-[#fafafa] border-[#eaeaea]'
      }`}>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium overflow-hidden">
          <span className="truncate max-w-[140px]" title={parentDocTitle}>{parentDocTitle}</span>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
          <span className="flex items-center gap-1 text-neutral-200 dark:text-neutral-100 font-semibold truncate max-w-[160px]">
            <span>{icon}</span>
            <span className="truncate">{title || 'Nested Page'}</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {onOpenAsTab && (
            <button
              onClick={() => onOpenAsTab(subpage)}
              className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-200 transition-colors"
              title="Open as main tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-200 transition-colors"
            title={isExpanded ? "Collapse panel width" : "Expand panel width"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this nested page?')) {
                onDeleteSubpage(subpage.id);
                onClose();
              }
            }}
            className="p-1.5 rounded-md hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
            title="Delete nested page"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-neutral-500/30 mx-1" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Close panel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Mini Formatting Ribbon */}
      <div className={`flex items-center gap-0.5 px-3 py-1.5 border-b overflow-x-auto select-none text-xs ${
        isDark ? 'bg-[#202020] border-[#2d2d2d]' : 'bg-[#f4f4f4] border-[#e8e8e8]'
      }`}>
        <button
          onClick={() => handleFormatBlock('p')}
          className="px-2 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10 font-medium"
          title="Normal Text"
        >
          Text
        </button>
        <button
          onClick={() => handleFormatBlock('h1')}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleFormatBlock('h2')}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-3.5 bg-neutral-500/20 mx-1" />
        <button
          onClick={() => handleExec('bold')}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 font-bold"
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleExec('italic')}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 italic"
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleExec('insertUnorderedList')}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
          title="Bulleted List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleInsertChecklist}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
          title="Insert Checklist"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-3.5 bg-neutral-500/20 mx-1" />
        <button
          onClick={handleInsertCallout}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
          title="Insert Callout Box"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleInsertTable}
          className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
          title="Insert Table"
        >
          <TableIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Nested Page Canvas */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6">
        {/* Title & Icon Header */}
        <div className="flex items-start gap-3 mb-4 group">
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-3xl p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-center select-none"
              title="Change icon"
            >
              {icon}
            </button>
            {showEmojiPicker && (
              <div className={`absolute top-full left-0 mt-2 z-50 p-2 rounded-xl shadow-2xl border grid grid-cols-5 gap-1 text-xl ${
                isDark ? 'bg-[#2b2b2b] border-[#444]' : 'bg-white border-neutral-200'
              }`}>
                {EMOJI_OPTIONS.map(em => (
                  <button
                    key={em}
                    onClick={() => handleSelectEmoji(em)}
                    className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Nested Page Title..."
            className="flex-1 text-2xl font-bold bg-transparent outline-none border-none placeholder:opacity-40 py-1"
          />
        </div>

        {/* Sub-page Body Editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleSyncContent}
          className="notepad-editor min-h-[300px] outline-none leading-relaxed text-sm whitespace-pre-wrap break-words"
          style={{
            fontFamily: settings.fontFamily,
            color: isDark ? '#ffffff' : '#1a1a1a'
          }}
        />
      </div>

      {/* 4. Sub-page Footer Metrics */}
      <div className={`px-4 py-2 border-t flex items-center justify-between text-[11px] text-neutral-400 select-none ${
        isDark ? 'bg-[#222] border-[#333]' : 'bg-[#f7f7f7] border-[#eaeaea]'
      }`}>
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-80">
          <Clock className="w-3 h-3" />
          <span>Auto-saved</span>
        </div>
      </div>
    </div>
  );
};
