import React, { 
  forwardRef, 
  useImperativeHandle, 
  useRef, 
  useEffect,
  useState
} from 'react';
import { 
  Trash2, 
  Columns, 
  Rows,
  FileText,
  Diamond,
  Bold,
  Italic,
  Heading2,
  ArrowLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { 
  NotepadDocument, 
  NotepadSettings, 
  EditorPosition, 
  FrameItem 
} from '../types';
import { FrameDeckBlock } from './FrameDeckBlock';

export interface NotepadEditorHandle {
  execCommand: (command: string, value?: string) => void;
  formatBlock: (tag: string) => void;
  insertTable: (rows: number, cols: number) => void;
  insertCallout: (type: 'note' | 'tip' | 'warning' | 'quote') => void;
  insertChecklist: () => void;
  insertNestedPageLink: (subpageId: string, title: string, icon?: string) => void;
  insertFrameDeck: (title?: string) => void;
  indent: () => void;
  outdent: () => void;
  insertText: (text: string) => void;
  insertLink: (url: string) => void;
  selectAll: () => void;
  goToLine: (line: number) => void;
  focus: () => void;
  getSelectionText: () => string;
}

export interface ActiveFrameState {
  deckId: string;
  frameId: string;
  frame: FrameItem;
  parentDocTitle: string;
}

interface NotepadEditorProps {
  document: NotepadDocument;
  settings: NotepadSettings;
  isDark: boolean;
  zoomLevel: number;
  activeFrame?: ActiveFrameState | null;
  onCloseFrame?: () => void;
  onFrameContentChange?: (deckId: string, frameId: string, content: string, plainText: string) => void;
  onFrameTitleChange?: (deckId: string, frameId: string, title: string) => void;
  onContentChange: (content: string, plainText: string) => void;
  onPositionChange: (position: EditorPosition) => void;
  onOpenCopilotWithSelection: (selection: string) => void;
  onOpenSubpage: (subpageId: string) => void;
  onCreateSubpageFromSelection: (selectedText: string) => void;
  onAddFrameDeck?: (title?: string) => void;
  onOpenFrame?: (deckId: string, frameId: string) => void;
  onAddFrameToDeck?: (deckId: string) => void;
  onDeleteFrameFromDeck?: (deckId: string, frameId: string) => void;
  onUpdateFrameTitleInDeck?: (deckId: string, frameId: string, title: string) => void;
  onToggleDeckOrientation?: (deckId: string) => void;
  onDeleteDeck?: (deckId: string) => void;
  onUpdateDeckTitle?: (deckId: string, title: string) => void;
}

export const NotepadEditor = forwardRef<NotepadEditorHandle, NotepadEditorProps>(({
  document: activeDoc,
  settings,
  isDark,
  zoomLevel,
  activeFrame,
  onCloseFrame,
  onFrameContentChange,
  onFrameTitleChange,
  onContentChange,
  onPositionChange,
  onOpenCopilotWithSelection,
  onOpenSubpage,
  onCreateSubpageFromSelection,
  onAddFrameDeck,
  onOpenFrame,
  onAddFrameToDeck,
  onDeleteFrameFromDeck,
  onUpdateFrameTitleInDeck,
  onToggleDeckOrientation,
  onDeleteDeck,
  onUpdateDeckTitle
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChangeRef = useRef(false);

  // Floating text selection toolbar state
  const [selectionPopup, setSelectionPopup] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    text: ''
  });

  // Table context bubble state
  const [tableTarget, setTableTarget] = useState<HTMLTableElement | null>(null);
  const [selectedCell, setSelectedCell] = useState<HTMLTableCellElement | null>(null);

  // Sync content when entering Frame mode or regular Document mode
  useEffect(() => {
    if (editorRef.current && !isInternalChangeRef.current) {
      if (activeFrame) {
        editorRef.current.innerHTML = activeFrame.frame.content || '<p><br></p>';
      } else {
        if (activeDoc.content) {
          editorRef.current.innerHTML = activeDoc.content;
        } else {
          editorRef.current.innerHTML = activeDoc.plainText 
            ? activeDoc.plainText.split('\n').map(l => `<p>${l || '<br>'}</p>`).join('')
            : '<p><br></p>';
        }
      }
      updateMetrics();
    }
    isInternalChangeRef.current = false;
  }, [activeDoc.id, activeDoc.content, activeFrame?.frameId, activeFrame?.frame.content]);

  // Expose imperative methods to MenuBar / Shortcuts / App
  useImperativeHandle(ref, () => ({
    execCommand: (cmd, val) => {
      document.execCommand(cmd, false, val);
      syncContent();
    },
    formatBlock: (tag) => {
      document.execCommand('formatBlock', false, `<${tag}>`);
      syncContent();
    },
    insertTable: (rows = 3, cols = 3) => {
      let tableHtml = `
        <div class="apple-table-wrapper" style="overflow-x: auto; margin: 12px 0;">
          <table class="apple-notes-table" style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid ${isDark ? '#383838' : '#d8d8dc'}; border-radius: 8px; font-size: 13px;">
            <thead>
              <tr style="background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};">
      `;
      for (let c = 0; c < cols; c++) {
        tableHtml += `<th style="padding: 8px 12px; text-align: left; font-weight: 600; border-right: ${c < cols - 1 ? (isDark ? '1px solid #383838' : '1px solid #d8d8dc') : 'none'}; border-bottom: 1px solid ${isDark ? '#383838' : '#d8d8dc'};">Header ${c + 1}</th>`;
      }
      tableHtml += `</tr></thead><tbody>`;

      for (let r = 0; r < rows; r++) {
        tableHtml += `<tr>`;
        for (let c = 0; c < cols; c++) {
          tableHtml += `<td style="padding: 8px 12px; border-right: ${c < cols - 1 ? (isDark ? '1px solid #2e2e2e' : '1px solid #eee') : 'none'}; border-bottom: ${r < rows - 1 ? (isDark ? '1px solid #2e2e2e' : '1px solid #eee') : 'none'};">Data ${r + 1},${c + 1}</td>`;
        }
        tableHtml += `</tr>`;
      }
      tableHtml += `</tbody></table></div><p><br></p>`;

      document.execCommand('insertHTML', false, tableHtml);
      syncContent();
    },
    insertCallout: (type = 'note') => {
      const calloutColors: Record<string, string> = {
        note: '#3B82F6',
        tip: '#10B981',
        warning: '#F59E0B',
        quote: '#8B5CF6'
      };
      const borderColor = calloutColors[type] || '#3B82F6';

      const calloutHtml = `
        <div class="apple-callout" style="display: block; margin: 12px 0; padding: 4px 0 4px 14px; border-left: 3.5px solid ${borderColor}; background: transparent;">
          <div style="font-size: 14px; line-height: 1.6;">Type your note here...</div>
        </div>
        <p><br></p>
      `;
      document.execCommand('insertHTML', false, calloutHtml);
      syncContent();
    },
    insertChecklist: () => {
      const checkHtml = `
        <div class="checklist-item" style="display: flex; align-items: flex-start; gap: 10px; margin: 6px 0;">
          <input type="checkbox" style="margin-top: 4px; width: 16px; height: 16px; cursor: pointer;" />
          <span style="flex: 1;">Task item</span>
        </div>
        <p><br></p>
      `;
      document.execCommand('insertHTML', false, checkHtml);
      syncContent();
    },
    insertNestedPageLink: (subpageId: string, title: string, icon = '📄') => {
      const badgeHtml = `
        <span class="nested-subpage-badge" data-subpage-id="${subpageId}" contenteditable="false" style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; background: rgba(59,130,246,0.15); color: #60a5fa; font-weight: 600; font-size: 13px; cursor: pointer; border: 1px solid rgba(59,130,246,0.3); margin: 0 3px; user-select: none;">
          <span class="nested-subpage-icon">${icon}</span>
          <span class="nested-subpage-title">${title}</span>
          <span class="nested-subpage-arrow">↗</span>
        </span>
      `;
      document.execCommand('insertHTML', false, badgeHtml);
      syncContent();
    },
    insertFrameDeck: (title = 'New Frame Deck') => {
      if (onAddFrameDeck) {
        onAddFrameDeck(title);
      }
    },
    indent: () => {
      document.execCommand('indent');
      syncContent();
    },
    outdent: () => {
      document.execCommand('outdent');
      syncContent();
    },
    insertText: (text: string) => {
      document.execCommand('insertText', false, text);
      syncContent();
    },
    insertLink: (url: string) => {
      document.execCommand('createLink', false, url);
      syncContent();
    },
    selectAll: () => {
      if (editorRef.current) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    },
    goToLine: (targetLine: number) => {
      if (!editorRef.current) return;
      const lines = editorRef.current.innerText.split('\n');
      const safeLine = Math.max(1, Math.min(targetLine, lines.length));
      
      let charCount = 0;
      for (let i = 0; i < safeLine - 1; i++) {
        charCount += lines[i].length + 1;
      }
      
      const sel = window.getSelection();
      const range = document.createRange();
      let currentPos = 0;
      let found = false;

      function traverseNodes(node: Node) {
        if (found) return;
        if (node.nodeType === Node.TEXT_NODE) {
          const nextPos = currentPos + (node.textContent?.length || 0);
          if (charCount <= nextPos) {
            range.setStart(node, Math.min(charCount - currentPos, node.textContent?.length || 0));
            range.collapse(true);
            found = true;
            return;
          }
          currentPos = nextPos;
        } else {
          for (let i = 0; i < node.childNodes.length; i++) {
            traverseNodes(node.childNodes[i]);
          }
        }
      }

      traverseNodes(editorRef.current);
      if (found) {
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    },
    focus: () => {
      editorRef.current?.focus();
    },
    getSelectionText: () => {
      return window.getSelection()?.toString() || '';
    }
  }));

  // Sync internal DOM updates to state
  const syncContent = () => {
    if (!editorRef.current) return;
    isInternalChangeRef.current = true;
    const content = editorRef.current.innerHTML;
    const plainText = editorRef.current.innerText;

    if (activeFrame && onFrameContentChange) {
      onFrameContentChange(activeFrame.deckId, activeFrame.frameId, content, plainText);
    } else {
      onContentChange(content, plainText);
    }
    updateMetrics();
  };

  // Track Caret Position & Selection Metrics
  const updateMetrics = () => {
    const sel = window.getSelection();
    let line = 1;
    let col = 1;
    let selectedChars = 0;
    let totalChars = 0;
    let totalWords = 0;
    let totalLines = 1;

    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      totalChars = text.length;
      totalWords = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
      totalLines = text.split('\n').length;

      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const selectedStr = range.toString().trim();
        selectedChars = range.toString().length;

        // Floating Selection Tooltip positioning
        if (selectedStr.length > 0) {
          const rect = range.getBoundingClientRect();
          setSelectionPopup({
            visible: true,
            x: Math.max(10, rect.left + rect.width / 2),
            y: Math.max(10, rect.top - 48),
            text: selectedStr
          });
        } else {
          setSelectionPopup(prev => ({ ...prev, visible: false }));
        }

        // Check if focused inside a table cell
        const parentCell = range.startContainer.parentElement?.closest('td, th') as HTMLTableCellElement;
        const parentTable = range.startContainer.parentElement?.closest('table') as HTMLTableElement;
        if (parentTable) {
          setTableTarget(parentTable);
          setSelectedCell(parentCell || null);
        } else {
          setTableTarget(null);
          setSelectedCell(null);
        }

        // Calculate Ln / Col
        try {
          const preRange = range.cloneRange();
          preRange.selectNodeContents(editorRef.current);
          preRange.setEnd(range.startContainer, range.startOffset);
          const preText = preRange.toString();
          const lines = preText.split('\n');
          line = lines.length;
          col = lines[lines.length - 1].length + 1;
        } catch {
          line = 1;
          col = 1;
        }
      } else {
        setSelectionPopup(prev => ({ ...prev, visible: false }));
      }
    }

    onPositionChange({
      line,
      col,
      selectedChars,
      totalChars,
      totalWords,
      totalLines
    });
  };

  // Table Control Actions (Add/Remove Row & Column)
  const handleAddRow = () => {
    if (!tableTarget) return;
    const cols = tableTarget.rows[0]?.cells.length || 2;
    const newRow = tableTarget.insertRow(-1);
    for (let i = 0; i < cols; i++) {
      const cell = newRow.insertCell(i);
      cell.style.padding = '8px 12px';
      cell.style.borderRight = i < cols - 1 ? (isDark ? '1px solid #2e2e2e' : '1px solid #eee') : 'none';
      cell.style.borderBottom = isDark ? '1px solid #2e2e2e' : '1px solid #eee';
      cell.innerText = 'New Cell';
    }
    syncContent();
  };

  const handleAddColumn = () => {
    if (!tableTarget) return;
    const rowCount = tableTarget.rows.length;
    for (let r = 0; r < rowCount; r++) {
      const isHeader = r === 0 && tableTarget.rows[0].cells[0]?.tagName === 'TH';
      const cell = isHeader ? document.createElement('th') : tableTarget.rows[r].insertCell(-1);
      if (isHeader) {
        cell.style.padding = '8px 12px';
        cell.style.fontWeight = '600';
        cell.style.textAlign = 'left';
        cell.style.borderBottom = isDark ? '1px solid #383838' : '1px solid #d8d8dc';
        cell.innerText = `Header ${tableTarget.rows[r].cells.length + 1}`;
        tableTarget.rows[r].appendChild(cell);
      } else {
        cell.style.padding = '8px 12px';
        cell.style.borderBottom = isDark ? '1px solid #2e2e2e' : '1px solid #eee';
        cell.innerText = 'Data';
      }
    }
    syncContent();
  };

  const handleDeleteRow = () => {
    if (!tableTarget || !selectedCell) return;
    const rowIndex = (selectedCell.parentElement as HTMLTableRowElement).rowIndex;
    if (tableTarget.rows.length > 1) {
      tableTarget.deleteRow(rowIndex);
      syncContent();
    }
  };

  const handleDeleteTable = () => {
    if (!tableTarget) return;
    const wrapper = tableTarget.closest('.apple-table-wrapper') || tableTarget;
    wrapper.remove();
    setTableTarget(null);
    setSelectedCell(null);
    syncContent();
  };

  // Checklist interactive click listener + Nested Sub-page Badge Click Listener
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Check if clicked a Nested Sub-page badge
    const subpageBadge = target.closest('.nested-subpage-badge') as HTMLElement;
    if (subpageBadge) {
      const subpageId = subpageBadge.getAttribute('data-subpage-id');
      if (subpageId) {
        e.preventDefault();
        e.stopPropagation();
        onOpenSubpage(subpageId);
        return;
      }
    }

    // Check if clicked a checklist checkbox
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      const checkbox = target as HTMLInputElement;
      const parent = checkbox.closest('.checklist-item');
      if (parent) {
        if (checkbox.checked) {
          parent.classList.add('checked-item');
        } else {
          parent.classList.remove('checked-item');
        }
      }
      syncContent();
    }
  };

  // Keyboard shortcut listener inside editor
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Tab key -> Indent / Outdent
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        document.execCommand('outdent');
      } else {
        document.execCommand('indent');
      }
      syncContent();
    }
    // Copilot quick popup on selection + Alt+C
    if (e.altKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      const sel = window.getSelection()?.toString() || '';
      if (sel) onOpenCopilotWithSelection(sel);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col h-full w-full overflow-hidden">
      {/* 1. Frame Sub-Page Header View (when drilled down into an interactive Frame) */}
      {activeFrame && (
        <div className={`flex flex-wrap items-center justify-between gap-3 px-6 sm:px-10 py-3 border-b select-none transition-colors ${
          isDark ? 'bg-[#202020] border-[#303030]' : 'bg-[#f6f6f6] border-[#e2e2e2]'
        }`}>
          {/* Back Navigation Button & Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onCloseFrame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow transition-colors"
              title="Return to parent note (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {activeFrame.parentDocTitle || 'Main Note'}</span>
            </button>
            
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />

            <span className="flex items-center gap-1.5 font-semibold text-neutral-400">
              <span>🖼️</span>
              <span className="truncate max-w-[200px]">{activeFrame.frame.title}</span>
            </span>
          </div>

          {/* Quick Frame Title Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={activeFrame.frame.title}
              onChange={(e) => {
                if (onFrameTitleChange) {
                  onFrameTitleChange(activeFrame.deckId, activeFrame.frameId, e.target.value);
                }
              }}
              placeholder="Frame Title..."
              className="text-xs font-bold px-2 py-1 rounded bg-black/5 dark:bg-white/5 border border-transparent hover:border-neutral-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
        </div>
      )}

      {/* 2. Floating Text Selection Tooltip (Notion-style Nested Page + Quick Formats) */}
      {selectionPopup.visible && !activeFrame && (
        <div 
          className={`fixed z-40 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border shadow-2xl backdrop-blur-md text-xs animate-in fade-in zoom-in-95 duration-100 ${
            isDark 
              ? 'bg-[#282828]/95 border-[#444] text-[#f0f0f0]' 
              : 'bg-white/95 border-neutral-300 text-neutral-800'
          }`}
          style={{ left: selectionPopup.x, top: selectionPopup.y }}
        >
          {/* Notion-style Turn into Nested Sub-Page Button */}
          <button
            onClick={() => {
              onCreateSubpageFromSelection(selectionPopup.text);
              setSelectionPopup(prev => ({ ...prev, visible: false }));
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-sm"
            title="Create a Notion-style nested page link for this text"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Add Nested Page</span>
          </button>

          <div className="w-[1px] h-4 bg-neutral-500/30 mx-1" />

          {/* Quick inline bold */}
          <button
            onClick={() => {
              document.execCommand('bold');
              syncContent();
            }}
            className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 font-bold"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Quick inline italic */}
          <button
            onClick={() => {
              document.execCommand('italic');
              syncContent();
            }}
            className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 italic"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Quick heading */}
          <button
            onClick={() => {
              document.execCommand('formatBlock', false, '<h2>');
              syncContent();
            }}
            className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
            title="Heading"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          {/* AI Copilot */}
          <button
            onClick={() => {
              onOpenCopilotWithSelection(selectionPopup.text);
              setSelectionPopup(prev => ({ ...prev, visible: false }));
            }}
            className="flex items-center gap-1 p-1.5 rounded hover:bg-cyan-500/20 text-cyan-400"
            title="Copilot AI rewrite"
          >
            <Diamond className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Floating Table Tools Bubble if Table is Focused */}
      {tableTarget && (
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-1 px-3 py-1.5 rounded-full border shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 text-xs ${
          isDark 
            ? 'bg-[#282828]/95 border-[#444] text-[#e0e0e0]' 
            : 'bg-white/95 border-[#d1d5db] text-[#1f2937]'
        }`}>
          <span className="text-[11px] font-semibold opacity-70 px-1">Table Tools:</span>
          <button
            onClick={handleAddRow}
            className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
            title="Add Row Below"
          >
            <Rows className="w-3.5 h-3.5" />
            <span>+Row</span>
          </button>
          <button
            onClick={handleAddColumn}
            className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
            title="Add Column Right"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>+Col</span>
          </button>
          {selectedCell && (
            <button
              onClick={handleDeleteRow}
              className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-amber-500"
              title="Delete Current Row"
            >
              <span>Del Row</span>
            </button>
          )}
          <div className="w-[1px] h-4 bg-gray-500/30 mx-1" />
          <button
            onClick={handleDeleteTable}
            className="flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-red-500/20 text-red-400"
            title="Delete entire table"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Main Scrollable Document Canvas (Full Screen / Unpartitioned) */}
      <div 
        className="flex-1 w-full h-full overflow-y-auto px-6 sm:px-12 md:px-16 py-8 cursor-text"
        onClick={() => editorRef.current?.focus()}
      >
        <div className="w-full max-w-5xl mx-auto flex flex-col min-h-full">
          {/* Main Editable Content Area */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncContent}
            onKeyUp={updateMetrics}
            onMouseUp={updateMetrics}
            onClick={handleEditorClick}
            onKeyDown={handleKeyDown}
            spellCheck={settings.spellCheck}
            className={`notepad-editor flex-1 outline-none transition-all leading-relaxed ${
              settings.wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
            }`}
            style={{
              fontFamily: settings.fontFamily,
              fontWeight: settings.fontStyle === 'bold' ? 700 : 400,
              fontStyle: settings.fontStyle === 'italic' ? 'italic' : 'normal',
              fontSize: `${(settings.fontSize * (zoomLevel / 100)).toFixed(1)}px`,
              color: isDark ? '#ffffff' : '#1a1a1a',
              caretColor: isDark ? '#ffffff' : '#000000'
            }}
          />

          {/* Interactive Frame Decks & Slider Rollers (shown in parent document view) */}
          {!activeFrame && activeDoc.frameDecks && activeDoc.frameDecks.length > 0 && (
            <div className="mt-8 pt-4 border-t border-inherit">
              {activeDoc.frameDecks.map(deck => (
                <FrameDeckBlock
                  key={deck.id}
                  deck={deck}
                  isDark={isDark}
                  onOpenFrame={(deckId, frameId) => onOpenFrame && onOpenFrame(deckId, frameId)}
                  onAddFrame={(deckId) => onAddFrameToDeck && onAddFrameToDeck(deckId)}
                  onDeleteFrame={(deckId, frameId) => onDeleteFrameFromDeck && onDeleteFrameFromDeck(deckId, frameId)}
                  onUpdateFrameTitle={(deckId, frameId, title) => onUpdateFrameTitleInDeck && onUpdateFrameTitleInDeck(deckId, frameId, title)}
                  onToggleOrientation={(deckId) => onToggleDeckOrientation && onToggleDeckOrientation(deckId)}
                  onDeleteDeck={(deckId) => onDeleteDeck && onDeleteDeck(deckId)}
                  onUpdateDeckTitle={(deckId, title) => onUpdateDeckTitle && onUpdateDeckTitle(deckId, title)}
                />
              ))}
            </div>
          )}

          {/* Quick "+ Add Frame Deck" action button when document has no decks */}
          {!activeFrame && (!activeDoc.frameDecks || activeDoc.frameDecks.length === 0) && (
            <div className="mt-8 pt-4 border-t border-dashed border-neutral-700/40 flex items-center justify-between text-xs text-neutral-400">
              <span className="italic">💡 Tip: You can insert interactive Frame Slider Rollers to organize sub-cards.</span>
              <button
                onClick={() => onAddFrameDeck && onAddFrameDeck('Project Frames & Cards')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-blue-600 hover:text-white transition-all font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert Frame Slider Roller</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

NotepadEditor.displayName = 'NotepadEditor';
