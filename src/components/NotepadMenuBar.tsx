import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  Settings, 
  Megaphone, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  CheckSquare, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Indent, 
  Outdent, 
  Quote, 
  Table as TableIcon, 
  FolderOpen, 
  FileText, 
  SlidersHorizontal, 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Strikethrough as StrikethroughIcon, 
  Heading as HeadingIcon, 
  Highlighter,
  Download,
  Globe
} from 'lucide-react';
import { NotepadSettings } from '../types';
import { ExportFormat } from '../utils/documentExporter';

interface NotepadMenuBarProps {
  isDark: boolean;
  settings: NotepadSettings;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewTab: () => void;
  onOpenFile: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExportAs?: (format: ExportFormat) => void;
  onPrint: () => void;
  onCloseTab: () => void;
  onOpenFind: () => void;
  onOpenReplace: () => void;
  onOpenGoTo: () => void;
  onInsertDateTime: () => void;
  onSelectAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onOpenSettings: () => void;
  onOpenCopilot: () => void;
  onFormatBlock: (tag: string) => void;
  onFormatInline: (cmd: string, val?: string) => void;
  onInsertTable: (rows: number, cols: number) => void;
  onInsertCallout: (type?: 'note' | 'tip' | 'warning' | 'quote') => void;
  onIndent: () => void;
  onOutdent: () => void;
  onInsertLink: () => void;
  onInsertChecklist: () => void;
  onInsertNestedPage?: () => void;
  onInsertFrameDeck?: () => void;
  onToggleWordWrap: () => void;
  onToggleStatusBar: () => void;
  zoomLevel: number;
  onSetZoom: (zoom: number) => void;
  onOpenInstallModal?: () => void;
}

export const NotepadMenuBar: React.FC<NotepadMenuBarProps> = ({
  isDark,
  settings,
  sidebarOpen,
  onToggleSidebar,
  onNewTab,
  onOpenFile,
  onSave,
  onSaveAs,
  onExportAs,
  onPrint,
  onCloseTab,
  onOpenFind,
  onOpenReplace,
  onOpenGoTo,
  onInsertDateTime,
  onSelectAll,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onOpenSettings,
  onOpenCopilot,
  onFormatBlock,
  onFormatInline,
  onInsertTable,
  onInsertCallout,
  onIndent,
  onOutdent,
  onInsertLink,
  onInsertChecklist,
  onInsertNestedPage,
  onInsertFrameDeck,
  onToggleWordWrap,
  onToggleStatusBar,
  zoomLevel,
  onSetZoom,
  onOpenInstallModal
}) => {
  // Dropdown menu states
  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'insert' | 'view' | 'heading' | 'list' | 'table' | 'callout' | 'color' | null>(null);

  // Table row and column input state
  const [tableRows, setTableRows] = useState<number>(3);
  const [tableCols, setTableCols] = useState<number>(3);

  // Close menus on outside click
  const menuBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menu: 'file' | 'edit' | 'insert' | 'view' | 'heading' | 'list' | 'table' | 'callout' | 'color') => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleMenuAction = (action?: () => void) => {
    if (action) action();
    setActiveMenu(null);
  };

  const menuButtonClass = `px-2.5 py-1 text-[13px] rounded transition-colors select-none ${
    isDark
      ? 'text-[#e0e0e0] hover:bg-[#2e2e2e]'
      : 'text-[#333333] hover:bg-[#eaeaea]'
  }`;

  const toolbarButtonClass = `p-1.5 rounded transition-colors select-none flex items-center justify-center ${
    isDark
      ? 'text-[#d0d0d0] hover:bg-[#2e2e2e] active:bg-[#383838]'
      : 'text-[#444444] hover:bg-[#e5e5e5] active:bg-[#d0d0d0]'
  }`;

  const dropdownContainerClass = `absolute top-full mt-1 z-50 rounded-lg shadow-xl border py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md ${
    isDark
      ? 'bg-[#2b2b2b]/95 border-[#3d3d3d] text-[#e0e0e0]'
      : 'bg-white/95 border-[#d1d5db] text-[#111827]'
  }`;

  const dropdownItemClass = `w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors ${
    isDark ? 'hover:bg-[#383838]' : 'hover:bg-[#f3f4f6]'
  }`;

  const dividerClass = `my-1 border-t ${isDark ? 'border-[#3d3d3d]' : 'border-[#e5e7eb]'}`;

  return (
    <div 
      ref={menuBarRef}
      className={`h-[40px] flex items-center justify-between px-2.5 border-b select-none transition-colors ${
        isDark ? 'bg-[#202020] border-[#2b2b2b]' : 'bg-[#fbfbfb] border-[#e5e5e5]'
      }`}
    >
      {/* Left: Sidebar Toggle + Classic Menu items (File, Edit, Insert, View) */}
      <div className="flex items-center space-x-1 relative">
        {/* Collapsible Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className={`${toolbarButtonClass} w-8 h-8 mr-1 ${
            sidebarOpen 
              ? (isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black') 
              : ''
          }`}
          title={sidebarOpen ? 'Collapse Notes Sidebar (Ctrl+\\)' : 'Show Notes Sidebar (Ctrl+\\)'}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>

        {/* FILE MENU */}
        <div className="relative">
          <button 
            onClick={() => toggleMenu('file')}
            className={`${menuButtonClass} ${activeMenu === 'file' ? (isDark ? 'bg-[#2e2e2e]' : 'bg-[#eaeaea]') : ''}`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className={`${dropdownContainerClass} left-0 min-w-[220px]`}>
              <button onClick={() => handleMenuAction(onNewTab)} className={dropdownItemClass}>
                <span>New tab</span>
                <span className="text-[#888] text-[11px]">Ctrl+N</span>
              </button>
              <button onClick={() => handleMenuAction(onOpenFile)} className={dropdownItemClass}>
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 opacity-70" />
                  <span>Open any document...</span>
                </span>
                <span className="text-[#888] text-[11px]">Ctrl+O</span>
              </button>
              <button onClick={() => handleMenuAction(onSave)} className={dropdownItemClass}>
                <span>Save</span>
                <span className="text-[#888] text-[11px]">Ctrl+S</span>
              </button>
              <button onClick={() => handleMenuAction(onSaveAs)} className={dropdownItemClass}>
                <span>Save as...</span>
                <span className="text-[#888] text-[11px]">Ctrl+Shift+S</span>
              </button>
              
              {/* Universal Export Submenu */}
              <div className="relative group/export">
                <div className={`${dropdownItemClass} cursor-pointer`}>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Export in any format</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </div>
                
                {/* Submenu Dropdown */}
                <div className={`hidden group-hover/export:block absolute left-full top-0 ml-0.5 min-w-[210px] rounded-lg shadow-2xl border py-1.5 text-xs animate-in fade-in duration-100 backdrop-blur-md ${
                  isDark ? 'bg-[#282828] border-[#3d3d3d] text-[#e0e0e0]' : 'bg-white border-[#d1d5db] text-[#111827]'
                }`}>
                  <button onClick={() => handleMenuAction(() => onExportAs && onExportAs('standalone-html'))} className={dropdownItemClass}>
                    <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Interactive Document (.html)</span>
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1 rounded">Frames & Pages</span>
                  </button>
                  <button onClick={() => handleMenuAction(() => onExportAs && onExportAs('txt'))} className={dropdownItemClass}>
                    <span>Plain Text (.txt)</span>
                  </button>
                  <button onClick={() => handleMenuAction(() => onExportAs && onExportAs('md'))} className={dropdownItemClass}>
                    <span>Markdown (.md)</span>
                  </button>
                  <button onClick={() => handleMenuAction(() => onExportAs && onExportAs('doc'))} className={dropdownItemClass}>
                    <span>Microsoft Word (.doc)</span>
                  </button>
                  <button onClick={() => handleMenuAction(() => onExportAs && onExportAs('html'))} className={dropdownItemClass}>
                    <span>Web Page (.html)</span>
                  </button>
                  <button onClick={() => handleMenuAction(() => onExportAs && onExportAs('json'))} className={dropdownItemClass}>
                    <span>JSON Raw Data (.json)</span>
                  </button>
                  <button onClick={() => handleMenuAction(() => onExportAs && onExportAs('csv'))} className={dropdownItemClass}>
                    <span>CSV / Spreadsheets (.csv)</span>
                  </button>
                  <button onClick={() => handleMenuAction(() => onExportAs && onExportAs('rtf'))} className={dropdownItemClass}>
                    <span>Rich Text Format (.rtf)</span>
                  </button>
                </div>
              </div>

              <div className={dividerClass} />
              {onOpenInstallModal && (
                <button 
                  onClick={() => handleMenuAction(onOpenInstallModal)} 
                  className={`${dropdownItemClass} text-blue-400 font-medium`}
                >
                  <span className="flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    <span>Install to PC (Direct / No Store)...</span>
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded">Desktop App</span>
                </button>
              )}
              <div className={dividerClass} />
              <button onClick={() => handleMenuAction(onPrint)} className={dropdownItemClass}>
                <span>Print...</span>
                <span className="text-[#888] text-[11px]">Ctrl+P</span>
              </button>
              <div className={dividerClass} />
              <button onClick={() => handleMenuAction(onCloseTab)} className={dropdownItemClass}>
                <span>Close tab</span>
                <span className="text-[#888] text-[11px]">Ctrl+W</span>
              </button>
            </div>
          )}
        </div>

        {/* EDIT MENU */}
        <div className="relative">
          <button 
            onClick={() => toggleMenu('edit')}
            className={`${menuButtonClass} ${activeMenu === 'edit' ? (isDark ? 'bg-[#2e2e2e]' : 'bg-[#eaeaea]') : ''}`}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className={`${dropdownContainerClass} left-0 min-w-[210px]`}>
              <button onClick={() => handleMenuAction(onUndo)} className={dropdownItemClass}>
                <span>Undo</span>
                <span className="text-[#888] text-[11px]">Ctrl+Z</span>
              </button>
              <button onClick={() => handleMenuAction(onRedo)} className={dropdownItemClass}>
                <span>Redo</span>
                <span className="text-[#888] text-[11px]">Ctrl+Y</span>
              </button>
              <div className={dividerClass} />
              <button onClick={() => handleMenuAction(onCut)} className={dropdownItemClass}>
                <span>Cut</span>
                <span className="text-[#888] text-[11px]">Ctrl+X</span>
              </button>
              <button onClick={() => handleMenuAction(onCopy)} className={dropdownItemClass}>
                <span>Copy</span>
                <span className="text-[#888] text-[11px]">Ctrl+C</span>
              </button>
              <button onClick={() => handleMenuAction(onPaste)} className={dropdownItemClass}>
                <span>Paste</span>
                <span className="text-[#888] text-[11px]">Ctrl+V</span>
              </button>
              <div className={dividerClass} />
              <button onClick={() => handleMenuAction(onOpenFind)} className={dropdownItemClass}>
                <span>Find</span>
                <span className="text-[#888] text-[11px]">Ctrl+F</span>
              </button>
              <button onClick={() => handleMenuAction(onOpenReplace)} className={dropdownItemClass}>
                <span>Replace</span>
                <span className="text-[#888] text-[11px]">Ctrl+H</span>
              </button>
              <button onClick={() => handleMenuAction(onOpenGoTo)} className={dropdownItemClass}>
                <span>Go to...</span>
                <span className="text-[#888] text-[11px]">Ctrl+G</span>
              </button>
              <div className={dividerClass} />
              <button onClick={() => handleMenuAction(onSelectAll)} className={dropdownItemClass}>
                <span>Select all</span>
                <span className="text-[#888] text-[11px]">Ctrl+A</span>
              </button>
              <button onClick={() => handleMenuAction(onInsertDateTime)} className={dropdownItemClass}>
                <span>Time/Date</span>
                <span className="text-[#888] text-[11px]">F5</span>
              </button>
            </div>
          )}
        </div>

        {/* INSERT MENU (Notion Nested Pages & Frames) */}
        <div className="relative">
          <button 
            onClick={() => toggleMenu('insert')}
            className={`${menuButtonClass} ${activeMenu === 'insert' ? (isDark ? 'bg-[#2e2e2e]' : 'bg-[#eaeaea]') : ''}`}
          >
            Insert
          </button>
          {activeMenu === 'insert' && (
            <div className={`${dropdownContainerClass} left-0 min-w-[240px]`}>
              <button onClick={() => handleMenuAction(onInsertNestedPage)} className={dropdownItemClass}>
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Notion Nested Page</span>
                </span>
                <span className="text-[#888] text-[11px]">Side Drawer</span>
              </button>
              <button onClick={() => handleMenuAction(onInsertFrameDeck)} className={dropdownItemClass}>
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Frame Slider Roller</span>
                </span>
                <span className="text-[#888] text-[11px]">Interactive Deck</span>
              </button>
              <div className={dividerClass} />
              <button onClick={() => { setActiveMenu('table'); }} className={dropdownItemClass}>
                <span className="flex items-center gap-2">
                  <TableIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Insert Table...</span>
                </span>
                <span className="text-[#888] text-[11px]">Custom Rows & Cols</span>
              </button>
              <button onClick={() => handleMenuAction(() => onInsertCallout('note'))} className={dropdownItemClass}>
                <span className="flex items-center gap-2">
                  <Quote className="w-3.5 h-3.5 text-amber-400" />
                  <span>Apple Callout Box</span>
                </span>
              </button>
              <button onClick={() => handleMenuAction(onInsertChecklist)} className={dropdownItemClass}>
                <span className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interactive Checklist</span>
                </span>
              </button>
            </div>
          )}
        </div>

        {/* VIEW MENU */}
        <div className="relative">
          <button 
            onClick={() => toggleMenu('view')}
            className={`${menuButtonClass} ${activeMenu === 'view' ? (isDark ? 'bg-[#2e2e2e]' : 'bg-[#eaeaea]') : ''}`}
          >
            View
          </button>
          {activeMenu === 'view' && (
            <div className={`${dropdownContainerClass} left-0 min-w-[210px]`}>
              <div className="px-3 py-1 text-[11px] font-semibold text-[#888]">Zoom ({zoomLevel}%)</div>
              <button onClick={() => handleMenuAction(() => onSetZoom(Math.min(zoomLevel + 10, 200)))} className={dropdownItemClass}>
                <span>Zoom in</span>
                <span className="text-[#888] text-[11px]">Ctrl++</span>
              </button>
              <button onClick={() => handleMenuAction(() => onSetZoom(Math.max(zoomLevel - 10, 50)))} className={dropdownItemClass}>
                <span>Zoom out</span>
                <span className="text-[#888] text-[11px]">Ctrl+-</span>
              </button>
              <button onClick={() => handleMenuAction(() => onSetZoom(100))} className={dropdownItemClass}>
                <span>Restore default zoom</span>
                <span className="text-[#888] text-[11px]">Ctrl+0</span>
              </button>
              <div className={dividerClass} />
              <button onClick={() => handleMenuAction(onToggleSidebar)} className={dropdownItemClass}>
                <span className="flex items-center">
                  <span className="w-4 inline-block">{sidebarOpen ? '✓' : ''}</span>
                  Apple Notes Sidebar
                </span>
              </button>
              <button onClick={() => handleMenuAction(onToggleStatusBar)} className={dropdownItemClass}>
                <span className="flex items-center">
                  <span className="w-4 inline-block">{settings.showStatusBar ? '✓' : ''}</span>
                  Status bar
                </span>
              </button>
              <button onClick={() => handleMenuAction(onToggleWordWrap)} className={dropdownItemClass}>
                <span className="flex items-center">
                  <span className="w-4 inline-block">{settings.wordWrap ? '✓' : ''}</span>
                  Word wrap
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center: Modern Apple & Notion Formatting Toolbar */}
      <div className="flex items-center space-x-1">
        {/* H1 Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('heading')}
            className="flex items-center space-x-1 px-1.5 py-1 rounded text-xs font-semibold hover:bg-white/10 transition-colors"
            title="Heading style"
          >
            <HeadingIcon className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          {activeMenu === 'heading' && (
            <div className={`${dropdownContainerClass} left-0 min-w-[140px]`}>
              <button onClick={() => handleMenuAction(() => onFormatBlock('h1'))} className={dropdownItemClass}>
                <span className="font-bold text-base">Heading 1</span>
              </button>
              <button onClick={() => handleMenuAction(() => onFormatBlock('h2'))} className={dropdownItemClass}>
                <span className="font-semibold text-sm">Heading 2</span>
              </button>
              <button onClick={() => handleMenuAction(() => onFormatBlock('h3'))} className={dropdownItemClass}>
                <span className="font-medium text-xs">Heading 3</span>
              </button>
              <button onClick={() => handleMenuAction(() => onFormatBlock('p'))} className={dropdownItemClass}>
                <span className="text-xs">Normal text (P)</span>
              </button>
            </div>
          )}
        </div>

        {/* List Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('list')}
            className="flex items-center space-x-1 px-1.5 py-1 rounded text-xs hover:bg-white/10 transition-colors"
            title="Lists"
          >
            <List className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          {activeMenu === 'list' && (
            <div className={`${dropdownContainerClass} left-0 min-w-[140px]`}>
              <button onClick={() => handleMenuAction(() => onFormatInline('insertUnorderedList'))} className={dropdownItemClass}>
                <span className="flex items-center space-x-2">
                  <List className="w-3.5 h-3.5" />
                  <span>Bullet List</span>
                </span>
              </button>
              <button onClick={() => handleMenuAction(() => onFormatInline('insertOrderedList'))} className={dropdownItemClass}>
                <span className="flex items-center space-x-2">
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Numbered List</span>
                </span>
              </button>
              <button onClick={() => handleMenuAction(onInsertChecklist)} className={dropdownItemClass}>
                <span className="flex items-center space-x-2">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Checklist</span>
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Indent & Outdent buttons */}
        <button
          onClick={onOutdent}
          className={`${toolbarButtonClass} w-7 h-7`}
          title="Decrease Indent (Shift+Tab)"
        >
          <Outdent className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onIndent}
          className={`${toolbarButtonClass} w-7 h-7`}
          title="Increase Indent (Tab)"
        >
          <Indent className="w-3.5 h-3.5" />
        </button>

        {/* Bold */}
        <button
          onClick={() => onFormatInline('bold')}
          className={`${toolbarButtonClass} w-7 h-7`}
          title="Bold (Ctrl+B)"
        >
          <BoldIcon className="w-3.5 h-3.5" />
        </button>

        {/* Italic */}
        <button
          onClick={() => onFormatInline('italic')}
          className={`${toolbarButtonClass} w-7 h-7`}
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon className="w-3.5 h-3.5" />
        </button>

        {/* Strikethrough */}
        <button
          onClick={() => onFormatInline('strikeThrough')}
          className={`${toolbarButtonClass} w-7 h-7`}
          title="Strikethrough"
        >
          <StrikethroughIcon className="w-3.5 h-3.5" />
        </button>

        {/* Link 🔗 */}
        <button
          onClick={onInsertLink}
          className={`${toolbarButtonClass} w-7 h-7`}
          title="Insert Link (Ctrl+K)"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        {/* Notion Nested Subpage Quick Button */}
        {onInsertNestedPage && (
          <button
            onClick={onInsertNestedPage}
            className={`${toolbarButtonClass} w-7 h-7 text-blue-400 hover:text-blue-300 hover:bg-blue-500/15`}
            title="Create Notion-style Nested Page Link"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Frame Deck Quick Button */}
        {onInsertFrameDeck && (
          <button
            onClick={onInsertFrameDeck}
            className={`${toolbarButtonClass} w-7 h-7 text-purple-400 hover:text-purple-300 hover:bg-purple-500/15`}
            title="Insert Frame Deck / Horizontal Slider Roller"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Apple Notes Callout Box Feature */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('callout')}
            className="flex items-center space-x-1 px-1.5 py-1 rounded text-xs hover:bg-white/10 transition-colors"
            title="Apple Notes Callout Box"
          >
            <Quote className="w-3.5 h-3.5 opacity-80" />
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          {activeMenu === 'callout' && (
            <div className={`${dropdownContainerClass} left-0 min-w-[160px]`}>
              <button onClick={() => handleMenuAction(() => onInsertCallout('note'))} className={dropdownItemClass}>
                <span className="w-1 h-3.5 rounded-full bg-blue-500 mr-2 inline-block"></span>
                <span>Blue Accent Line</span>
              </button>
              <button onClick={() => handleMenuAction(() => onInsertCallout('tip'))} className={dropdownItemClass}>
                <span className="w-1 h-3.5 rounded-full bg-emerald-500 mr-2 inline-block"></span>
                <span>Emerald Accent Line</span>
              </button>
              <button onClick={() => handleMenuAction(() => onInsertCallout('warning'))} className={dropdownItemClass}>
                <span className="w-1 h-3.5 rounded-full bg-amber-500 mr-2 inline-block"></span>
                <span>Amber Accent Line</span>
              </button>
              <button onClick={() => handleMenuAction(() => onInsertCallout('quote'))} className={dropdownItemClass}>
                <span className="w-1 h-3.5 rounded-full bg-purple-500 mr-2 inline-block"></span>
                <span>Purple Accent Line</span>
              </button>
            </div>
          )}
        </div>

        {/* Table ⊞ ⌄ */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('table')}
            className={`flex items-center space-x-1 px-1.5 py-1 rounded text-xs transition-colors ${
              activeMenu === 'table' ? (isDark ? 'bg-[#383838]' : 'bg-[#e5e5e5]') : 'hover:bg-white/10'
            }`}
            title="Insert Custom Table"
          >
            <TableIcon className="w-3.5 h-3.5 text-blue-400" />
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          {activeMenu === 'table' && (
            <div 
              className={`${dropdownContainerClass} left-0 min-w-[220px] p-3 shadow-2xl border ${
                isDark ? 'bg-[#2b2b2b] border-[#444]' : 'bg-white border-[#d1d5db]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-500/20">
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  <TableIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Insert Table</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {tableRows} × {tableCols}
                </span>
              </div>

              {/* Rows input */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <label className="text-[11px] font-medium text-gray-300">
                  Rows:
                </label>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setTableRows(prev => Math.max(1, prev - 1))}
                    className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                      isDark ? 'bg-[#3a3a3a] hover:bg-[#484848] text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={tableRows}
                    onChange={(e) => setTableRows(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                    className={`w-12 h-6 text-center text-xs font-semibold rounded border ${
                      isDark 
                        ? 'bg-[#1e1e1e] border-[#444] text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setTableRows(prev => Math.min(50, prev + 1))}
                    className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                      isDark ? 'bg-[#3a3a3a] hover:bg-[#484848] text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Columns input */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <label className="text-[11px] font-medium text-gray-300">
                  Columns:
                </label>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setTableCols(prev => Math.max(1, prev - 1))}
                    className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                      isDark ? 'bg-[#3a3a3a] hover:bg-[#484848] text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={tableCols}
                    onChange={(e) => setTableCols(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    className={`w-12 h-6 text-center text-xs font-semibold rounded border ${
                      isDark 
                        ? 'bg-[#1e1e1e] border-[#444] text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setTableCols(prev => Math.min(20, prev + 1))}
                    className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                      isDark ? 'bg-[#3a3a3a] hover:bg-[#484848] text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Insert Action Button */}
              <button
                type="button"
                onClick={() => {
                  handleMenuAction(() => onInsertTable(Math.max(1, tableRows), Math.max(1, tableCols)));
                }}
                className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Insert Table ({tableRows} × {tableCols})</span>
              </button>
            </div>
          )}
        </div>

        {/* Highlight & Text Color */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('color')}
            className="flex items-center space-x-1 px-1.5 py-1 rounded text-xs hover:bg-white/10 transition-colors"
            title="Text color & Highlight"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-400" />
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
          {activeMenu === 'color' && (
            <div className={`${dropdownContainerClass} left-0 min-w-[150px]`}>
              <div className="px-2.5 py-1 text-[11px] font-semibold text-[#888]">Highlight</div>
              <div className="flex items-center space-x-1 px-2.5 py-1.5">
                {[
                  { name: 'Yellow', color: '#fef08a' },
                  { name: 'Green', color: '#bbf7d0' },
                  { name: 'Cyan', color: '#bae6fd' },
                  { name: 'Pink', color: '#fbcfe8' },
                  { name: 'None', color: 'transparent' }
                ].map((hl) => (
                  <button
                    key={hl.name}
                    onClick={() => handleMenuAction(() => onFormatInline('hiliteColor', hl.color))}
                    className="w-4 h-4 rounded-full border border-gray-400/50 hover:scale-125 transition-transform"
                    style={{ backgroundColor: hl.color === 'transparent' ? (isDark ? '#333' : '#eee') : hl.color }}
                    title={hl.name}
                  />
                ))}
              </div>
              <div className={dividerClass} />
              <div className="px-2.5 py-1 text-[11px] font-semibold text-[#888]">Text Color</div>
              <div className="flex items-center space-x-1 px-2.5 py-1.5">
                {[
                  { name: 'Default', color: isDark ? '#ffffff' : '#000000' },
                  { name: 'Red', color: '#ef4444' },
                  { name: 'Blue', color: '#3b82f6' },
                  { name: 'Green', color: '#10b981' },
                  { name: 'Orange', color: '#f97316' }
                ].map((tc) => (
                  <button
                    key={tc.name}
                    onClick={() => handleMenuAction(() => onFormatInline('foreColor', tc.color))}
                    className="w-4 h-4 rounded-full border border-gray-400/50 hover:scale-125 transition-transform"
                    style={{ backgroundColor: tc.color }}
                    title={tc.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Feedback / Copilot Megaphone + Settings Gear */}
      <div className="flex items-center space-x-1">
        {/* Megaphone / Copilot / What's New */}
        <button
          onClick={onOpenCopilot}
          className={`${toolbarButtonClass} w-8 h-8 relative`}
          title="Copilot AI & What's New"
        >
          <Megaphone className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        </button>

        {/* Settings Gear */}
        <button
          onClick={onOpenSettings}
          className={`${toolbarButtonClass} w-8 h-8`}
          title="Settings (Themes, Native Silver Accents, Fonts, etc.)"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
