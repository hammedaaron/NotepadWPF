import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Trash2, 
  FileText, 
  Pin, 
  Search, 
  SlidersHorizontal,
  Diamond,
  Clock,
  X,
  Plus,
  Layers,
  FolderTree,
  Calendar,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Box,
  FolderOpen
} from 'lucide-react';
import { NotepadDocument, NoteFolder, NotepadSettings } from '../types';
import { ACCENT_PALETTES } from '../types/accentColors';

interface AppleNotesSidebarProps {
  documents: NotepadDocument[];
  folders: NoteFolder[];
  activeDocId: string;
  selectedFolderId: string;
  isDark: boolean;
  settings: NotepadSettings;
  onSelectDoc: (docId: string) => void;
  onSelectFolder: (folderId: string) => void;
  onCreateDocInFolder: (folderId?: string) => void;
  onCreateFolder: (name: string, isSmart?: boolean, smartCriteria?: 'checklist' | 'table' | 'pinned' | 'today' | 'callout', parentId?: string | null) => void;
  onDeleteDocRequest: (docId: string) => void;
  onRestoreDoc: (docId: string) => void;
  onPermanentDeleteRequest: (docId: string) => void;
  onTogglePinDoc: (docId: string) => void;
  onCloseSidebar: () => void;
}

export const AppleNotesSidebar: React.FC<AppleNotesSidebarProps> = ({
  documents,
  folders,
  activeDocId,
  selectedFolderId,
  isDark,
  settings,
  onSelectDoc,
  onSelectFolder,
  onCreateDocInFolder,
  onCreateFolder,
  onDeleteDocRequest,
  onRestoreDoc,
  onPermanentDeleteRequest,
  onTogglePinDoc,
  onCloseSidebar
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);
  const [isSmartFolder, setIsSmartFolder] = useState(false);
  const [smartFolderCriteria, setSmartFolderCriteria] = useState<'checklist' | 'table' | 'pinned' | 'today' | 'callout'>('checklist');
  const [showSmartFilterMenu, setShowSmartFilterMenu] = useState(false);
  const [smartClutterFilter, setSmartClutterFilter] = useState<'all' | 'unpinned_hidden' | 'active_only' | 'recent_7_days'>('all');

  // Collapsible section toggles to save space
  const [isMyFoldersExpanded, setIsMyFoldersExpanded] = useState<boolean>(true);
  const [isSmartFiltersExpanded, setIsSmartFiltersExpanded] = useState<boolean>(true);
  const [isSystemFiltersExpanded, setIsSystemFiltersExpanded] = useState<boolean>(true);

  // Set of expanded folder IDs (Default Sandbox, Work, etc. are open)
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(() => {
    return new Set(['sandbox', 'work', 'personal']);
  });

  const toggleFolderExpanded = (folderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedFolderIds(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const accent = ACCENT_PALETTES[settings.accentColor] || ACCENT_PALETTES.silver;
  const activeBg = isDark ? accent.darkActiveBg : accent.lightActiveBg;
  const activeColor = isDark ? accent.darkColor : accent.lightColor;
  const activeBorder = isDark ? accent.darkBorder : accent.lightBorder;

  // Group & Filter Notes
  const currentFolder = folders.find(f => f.id === selectedFolderId) || folders[0];

  const filteredDocuments = useMemo(() => {
    let list = documents;

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d => 
        (d.title || 'Untitled').toLowerCase().includes(q) || 
        (d.plainText || '').toLowerCase().includes(q)
      );
    }

    // Filter by Folder / Smart Folder Logic
    if (selectedFolderId === 'all') {
      list = list.filter(d => d.folderId !== 'trash');
    } else if (selectedFolderId === 'pinned') {
      list = list.filter(d => d.isPinned && d.folderId !== 'trash');
    } else if (selectedFolderId === 'trash') {
      list = list.filter(d => d.folderId === 'trash');
    } else if (selectedFolderId === 'today') {
      const todayStr = new Date().toDateString();
      list = list.filter(d => new Date(d.updatedAt || d.createdAt).toDateString() === todayStr && d.folderId !== 'trash');
    } else if (currentFolder?.isSmart) {
      list = list.filter(d => {
        if (d.folderId === 'trash') return false;
        if (currentFolder.smartCriteria === 'checklist') {
          return d.content?.includes('checklist-item') || d.content?.includes('type="checkbox"');
        }
        if (currentFolder.smartCriteria === 'table') {
          return d.content?.includes('<table') || d.content?.includes('apple-table') || d.content?.includes('apple-notes-table');
        }
        if (currentFolder.smartCriteria === 'callout') {
          return d.content?.includes('apple-callout');
        }
        if (currentFolder.smartCriteria === 'pinned') {
          return !!d.isPinned;
        }
        if (currentFolder.smartCriteria === 'today') {
          return new Date(d.updatedAt || d.createdAt).toDateString() === new Date().toDateString();
        }
        return true;
      });
    } else {
      // Find all subfolder IDs under selected folder if it has children
      const childFolderIds = folders.filter(f => f.parentId === selectedFolderId).map(f => f.id);
      list = list.filter(d => 
        (d.folderId === selectedFolderId || childFolderIds.includes(d.folderId || '') || (!d.folderId && selectedFolderId === 'sandbox')) &&
        d.folderId !== 'trash'
      );
    }

    // Apply Smart Folder Clutter Reducer
    if (settings.smartFolderReducedClutter || smartClutterFilter !== 'all') {
      if (smartClutterFilter === 'unpinned_hidden') {
        list = list.filter(d => d.isPinned);
      } else if (smartClutterFilter === 'recent_7_days') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        list = list.filter(d => new Date(d.updatedAt || d.createdAt) >= weekAgo);
      }
    }

    return list;
  }, [documents, searchQuery, selectedFolderId, currentFolder, settings.smartFolderReducedClutter, smartClutterFilter, folders]);

  // Split Pinned vs Regular Notes
  const pinnedDocs = useMemo(() => filteredDocuments.filter(d => d.isPinned), [filteredDocuments]);
  const regularDocs = useMemo(() => filteredDocuments.filter(d => !d.isPinned), [filteredDocuments]);

  // Compute folder counts
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    folders.forEach(f => {
      if (f.id === 'all') {
        counts[f.id] = documents.filter(d => d.folderId !== 'trash').length;
      } else if (f.id === 'pinned') {
        counts[f.id] = documents.filter(d => d.isPinned && d.folderId !== 'trash').length;
      } else if (f.id === 'trash') {
        counts[f.id] = documents.filter(d => d.folderId === 'trash').length;
      } else if (f.id === 'today') {
        const todayStr = new Date().toDateString();
        counts[f.id] = documents.filter(d => new Date(d.updatedAt || d.createdAt).toDateString() === todayStr && d.folderId !== 'trash').length;
      } else if (f.isSmart) {
        counts[f.id] = documents.filter(d => {
          if (d.folderId === 'trash') return false;
          if (f.smartCriteria === 'checklist') return d.content?.includes('checklist-item') || d.content?.includes('type="checkbox"');
          if (f.smartCriteria === 'table') return d.content?.includes('<table') || d.content?.includes('apple-table') || d.content?.includes('apple-notes-table');
          if (f.smartCriteria === 'callout') return d.content?.includes('apple-callout');
          if (f.smartCriteria === 'today') return new Date(d.updatedAt || d.createdAt).toDateString() === new Date().toDateString();
          return true;
        }).length;
      } else {
        const childFolderIds = folders.filter(c => c.parentId === f.id).map(c => c.id);
        counts[f.id] = documents.filter(d => (d.folderId === f.id || childFolderIds.includes(d.folderId || '')) && d.folderId !== 'trash').length;
      }
    });
    return counts;
  }, [documents, folders]);

  const handleCreateNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(
      newFolderName.trim(), 
      isSmartFolder, 
      isSmartFolder ? smartFolderCriteria : undefined,
      newFolderParentId
    );
    setNewFolderName('');
    setNewFolderParentId(null);
    setIsCreatingFolder(false);
    setIsSmartFolder(false);
  };

  const openNewSubfolderForm = (parentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNewFolderParentId(parentId);
    setIsSmartFolder(false);
    setIsCreatingFolder(true);
    // Expand the parent so user sees the new folder
    setExpandedFolderIds(prev => new Set([...prev, parentId]));
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (diffDays === 1 || (diffHours < 48 && date.getDate() === now.getDate() - 1)) {
        return 'Yesterday';
      }
      if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
      }
      return date.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: '2-digit' });
    } catch {
      return '';
    }
  };

  // Organize folders into Top-Level and Child Folders
  const systemFolders = folders.filter(f => ['all', 'pinned', 'today'].includes(f.id));
  const trashFolder = folders.find(f => f.id === 'trash');
  const smartFolders = folders.filter(f => f.isSmart);
  
  // Custom & Sandbox top-level folders (parentId is null or undefined)
  const topLevelCustomFolders = folders.filter(f => !f.isSystem && !f.isSmart && !f.parentId);

  // Helper to render recursive folder node
  const renderFolderItem = (folder: NoteFolder, depth: number = 0) => {
    const isSelected = folder.id === selectedFolderId;
    const count = folderCounts[folder.id] || 0;
    const childFolders = folders.filter(f => f.parentId === folder.id);
    const hasChildren = childFolders.length > 0;
    const isExpanded = expandedFolderIds.has(folder.id);

    return (
      <div key={folder.id} className="space-y-0.5">
        <div
          onClick={() => onSelectFolder(folder.id)}
          className={`group flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer transition-all ${
            isSelected
              ? 'font-semibold shadow-sm'
              : isDark
              ? 'text-[#bbbbbb] hover:bg-white/5 hover:text-white'
              : 'text-[#444446] hover:bg-black/5 hover:text-black'
          }`}
          style={{
            paddingLeft: `${8 + depth * 12}px`,
            backgroundColor: isSelected ? activeBg : undefined,
            color: isSelected ? activeColor : undefined,
            border: isSelected ? `1px solid ${activeBorder}` : '1px solid transparent'
          }}
        >
          <div className="flex items-center space-x-1.5 truncate flex-1 min-w-0">
            {/* Toggle Chevron */}
            {hasChildren || folder.isSandbox ? (
              <button
                onClick={(e) => toggleFolderExpanded(folder.id, e)}
                className="w-4 h-4 -ml-1 flex items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 shrink-0"
                title={isExpanded ? 'Collapse folder' : 'Expand folder'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 stroke-[2.2]" />
                ) : (
                  <ChevronRight className="w-3 h-3 stroke-[2.2]" />
                )}
              </button>
            ) : (
              <span className="w-2 shrink-0" />
            )}

            {/* Folder Icon */}
            {folder.isSandbox ? (
              <Box className="w-3.5 h-3.5 shrink-0 text-blue-400" />
            ) : isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 shrink-0 opacity-85 text-amber-400" />
            ) : (
              <Folder className="w-3.5 h-3.5 shrink-0 opacity-80" />
            )}

            {/* Name */}
            <span className="truncate font-medium">{folder.name}</span>
          </div>

          {/* Right actions: Add subfolder icon + count */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={(e) => openNewSubfolderForm(folder.id, e)}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[10px] transition-opacity"
              title={`Add subfolder in ${folder.name}`}
            >
              <Plus className="w-3 h-3" />
            </button>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              isSelected 
                ? (isDark ? accent.badgeBgDark : accent.badgeBgLight)
                : (isDark ? 'bg-white/10 text-[#999]' : 'bg-black/5 text-[#777]')
            }`}>
              {count}
            </span>
          </div>
        </div>

        {/* Render nested children if expanded */}
        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {childFolders.map(child => renderFolderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`h-full flex border-r select-none transition-all duration-200 z-20 ${
        isDark 
          ? 'bg-[#1e1e1e] border-[#2d2d2d] text-[#e0e0e0]' 
          : 'bg-[#f4f4f7] border-[#e2e2e7] text-[#1c1c1e]'
      }`}
      style={{ width: `${settings.sidebarWidth || 360}px` }}
    >
      {/* 1. Folders Column (Left Hierarchy Pane) */}
      <div 
        className={`w-[180px] shrink-0 border-r flex flex-col justify-between p-2 ${
          isDark 
            ? 'bg-[#181818]/90 border-[#282828]' 
            : 'bg-[#ececf1]/80 border-[#dedee3]'
        }`}
      >
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
          {/* Header & Clutter Reducer */}
          <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
            <span className="text-[11px] font-bold tracking-wider uppercase opacity-60 flex items-center gap-1">
              <FolderTree className="w-3 h-3" /> Folders
            </span>
            <button
              onClick={() => setShowSmartFilterMenu(!showSmartFilterMenu)}
              className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${
                smartClutterFilter !== 'all' ? 'text-amber-500 font-bold' : 'opacity-60'
              }`}
              title="Smart Clutter Reducer & Filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Smart Clutter Dropdown Filter */}
          {showSmartFilterMenu && (
            <div className={`p-2 rounded-lg border text-xs shadow-lg space-y-1 ${
              isDark ? 'bg-[#252525] border-[#383838]' : 'bg-white border-[#d1d5db]'
            }`}>
              <div className="text-[10px] font-semibold uppercase opacity-60 px-1">Smart Clutter Reducer</div>
              <button
                onClick={() => { setSmartClutterFilter('all'); setShowSmartFilterMenu(false); }}
                className={`w-full text-left px-2 py-1 rounded flex items-center justify-between ${
                  smartClutterFilter === 'all' ? 'bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>Show All Notes</span>
              </button>
              <button
                onClick={() => { setSmartClutterFilter('unpinned_hidden'); setShowSmartFilterMenu(false); }}
                className={`w-full text-left px-2 py-1 rounded flex items-center justify-between ${
                  smartClutterFilter === 'unpinned_hidden' ? 'bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>Pinned Only</span>
                <Pin className="w-3 h-3" />
              </button>
              <button
                onClick={() => { setSmartClutterFilter('recent_7_days'); setShowSmartFilterMenu(false); }}
                className={`w-full text-left px-2 py-1 rounded flex items-center justify-between ${
                  smartClutterFilter === 'recent_7_days' ? 'bg-blue-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>Active Past 7 Days</span>
                <Clock className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* System Filters */}
          <div className="space-y-1">
            <div 
              onClick={() => setIsSystemFiltersExpanded(!isSystemFiltersExpanded)}
              className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-1 pt-1 flex items-center justify-between cursor-pointer hover:opacity-100 transition-opacity select-none"
              title={isSystemFiltersExpanded ? "Collapse Quick Views" : "Expand Quick Views"}
            >
              <div className="flex items-center gap-1">
                {isSystemFiltersExpanded ? (
                  <ChevronDown className="w-3 h-3 stroke-[2.2]" />
                ) : (
                  <ChevronRight className="w-3 h-3 stroke-[2.2]" />
                )}
                <span>Quick Views</span>
              </div>
            </div>

            {isSystemFiltersExpanded && (
              <div className="space-y-0.5 animate-fadeIn">
                {systemFolders.map(folder => {
                  const isSelected = folder.id === selectedFolderId;
                  const count = folderCounts[folder.id] || 0;

                  return (
                    <button
                      key={folder.id}
                      onClick={() => onSelectFolder(folder.id)}
                      className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all ${
                        isSelected
                          ? 'font-semibold shadow-sm'
                          : isDark
                          ? 'text-[#bbbbbb] hover:bg-white/5 hover:text-white'
                          : 'text-[#444446] hover:bg-black/5 hover:text-black'
                      }`}
                      style={{
                        backgroundColor: isSelected ? activeBg : undefined,
                        color: isSelected ? activeColor : undefined,
                        border: isSelected ? `1px solid ${activeBorder}` : '1px solid transparent'
                      }}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {folder.id === 'all' && <Layers className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                        {folder.id === 'pinned' && <Pin className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                        {folder.id === 'today' && <Calendar className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected 
                          ? (isDark ? accent.badgeBgDark : accent.badgeBgLight)
                          : (isDark ? 'bg-white/10 text-[#999]' : 'bg-black/5 text-[#777]')
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Custom Folders & Hierarchy */}
          <div className="space-y-1">
            <div 
              onClick={() => setIsMyFoldersExpanded(!isMyFoldersExpanded)}
              className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-1 pt-1 flex items-center justify-between cursor-pointer hover:opacity-100 transition-opacity select-none"
              title={isMyFoldersExpanded ? "Collapse My Folders" : "Expand My Folders"}
            >
              <div className="flex items-center gap-1">
                {isMyFoldersExpanded ? (
                  <ChevronDown className="w-3 h-3 stroke-[2.2]" />
                ) : (
                  <ChevronRight className="w-3 h-3 stroke-[2.2]" />
                )}
                <span>My Folders</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNewFolderParentId(null);
                  setIsSmartFolder(false);
                  setIsCreatingFolder(true);
                  setIsMyFoldersExpanded(true);
                }}
                className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                title="Add Root Folder"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {isMyFoldersExpanded && (
              <div className="space-y-0.5 animate-fadeIn">
                {topLevelCustomFolders.map(folder => renderFolderItem(folder, 0))}
              </div>
            )}
          </div>

          {/* Section: Smart Folders */}
          {smartFolders.length > 0 && (
            <div className="space-y-1">
              <div 
                onClick={() => setIsSmartFiltersExpanded(!isSmartFiltersExpanded)}
                className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-1 pt-1 flex items-center justify-between cursor-pointer hover:opacity-100 transition-opacity select-none"
                title={isSmartFiltersExpanded ? "Collapse Smart Filters" : "Expand Smart Filters"}
              >
                <div className="flex items-center gap-1">
                  {isSmartFiltersExpanded ? (
                    <ChevronDown className="w-3 h-3 stroke-[2.2]" />
                  ) : (
                    <ChevronRight className="w-3 h-3 stroke-[2.2]" />
                  )}
                  <span>Smart Filters</span>
                </div>
              </div>

              {isSmartFiltersExpanded && (
                <div className="space-y-0.5 animate-fadeIn">
                  {smartFolders.map(folder => {
                    const isSelected = folder.id === selectedFolderId;
                    const count = folderCounts[folder.id] || 0;
                    return (
                      <button
                        key={folder.id}
                        onClick={() => onSelectFolder(folder.id)}
                        className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all ${
                          isSelected
                            ? 'font-semibold shadow-sm'
                            : isDark
                            ? 'text-[#bbbbbb] hover:bg-white/5 hover:text-white'
                            : 'text-[#444446] hover:bg-black/5 hover:text-black'
                        }`}
                        style={{
                          backgroundColor: isSelected ? activeBg : undefined,
                          color: isSelected ? activeColor : undefined,
                          border: isSelected ? `1px solid ${activeBorder}` : '1px solid transparent'
                        }}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <Diamond className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                          <span className="truncate">{folder.name}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected 
                            ? (isDark ? accent.badgeBgDark : accent.badgeBgLight)
                            : (isDark ? 'bg-white/10 text-[#999]' : 'bg-black/5 text-[#777]')
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Recently Deleted (Trash) */}
          {trashFolder && (
            <div className="pt-1">
              <button
                onClick={() => onSelectFolder(trashFolder.id)}
                className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all ${
                  selectedFolderId === 'trash'
                    ? 'font-semibold shadow-sm text-red-400'
                    : isDark
                    ? 'text-[#a0a0a0] hover:bg-white/5 hover:text-red-400'
                    : 'text-[#666668] hover:bg-black/5 hover:text-red-600'
                }`}
                style={{
                  backgroundColor: selectedFolderId === 'trash' ? (isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)') : undefined,
                  border: selectedFolderId === 'trash' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent'
                }}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Trash2 className="w-3.5 h-3.5 shrink-0 text-red-500/80" />
                  <span className="truncate">{trashFolder.name}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-red-500/10 text-red-400">
                  {folderCounts.trash || 0}
                </span>
              </button>
            </div>
          )}

          {/* Inline Folder Creation Form */}
          {isCreatingFolder && (
            <form onSubmit={handleCreateNewFolder} className="p-2 rounded-lg border bg-black/10 dark:bg-white/5 space-y-2">
              <div className="text-[10px] font-semibold opacity-70">
                {newFolderParentId 
                  ? `New subfolder under "${folders.find(f => f.id === newFolderParentId)?.name}"`
                  : 'New Folder'
                }
              </div>
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="w-full px-2 py-1 text-xs rounded border bg-transparent outline-none"
              />
              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSmartFolder}
                    onChange={e => setIsSmartFolder(e.target.checked)}
                    className="rounded"
                  />
                  <span>Smart</span>
                </label>
                {isSmartFolder && (
                  <select
                    value={smartFolderCriteria}
                    onChange={e => setSmartFolderCriteria(e.target.value as any)}
                    className="text-[10px] bg-transparent border rounded px-1 py-0.5 outline-none"
                  >
                    <option value="checklist" className="dark:bg-[#202020]">Checklist</option>
                    <option value="table" className="dark:bg-[#202020]">Table</option>
                    <option value="callout" className="dark:bg-[#202020]">Callout</option>
                    <option value="today" className="dark:bg-[#202020]">Today</option>
                  </select>
                )}
              </div>
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderParentId(null);
                  }}
                  className="px-2 py-0.5 text-[11px] rounded hover:bg-black/10 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2 py-0.5 text-[11px] rounded bg-blue-600 text-white font-medium"
                >
                  Create
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Bottom: New Folder Action */}
        <div className="pt-2 border-t border-black/5 dark:border-white/5">
          <button
            onClick={() => {
              setNewFolderParentId(null);
              setIsSmartFolder(false);
              setIsCreatingFolder(true);
            }}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-md text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-80 hover:opacity-100"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* 2. Notes List Column (Apple Note Cards View) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Search & Actions */}
        <div className="p-2.5 border-b border-black/5 dark:border-white/5 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold truncate opacity-90">
              {currentFolder?.name || 'Notes'}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onCreateDocInFolder(selectedFolderId)}
                className={`p-1 rounded flex items-center gap-1 text-xs px-2 font-medium transition-all ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-black/5 hover:bg-black/10 text-black'
                }`}
                title="New Note (Ctrl+N)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Note</span>
              </button>
              <button
                onClick={onCloseSidebar}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors"
                title="Collapse Sidebar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className={`flex items-center px-2 py-1 rounded-md border text-xs ${
            isDark ? 'bg-black/20 border-[#333]' : 'bg-white border-[#d8d8dc]'
          }`}>
            <Search className="w-3.5 h-3.5 opacity-50 mr-1.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-transparent outline-none placeholder:opacity-50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="opacity-50 hover:opacity-100">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Note Cards List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
          {filteredDocuments.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center p-4 opacity-50">
              <FileText className="w-8 h-8 mb-2 stroke-[1.2]" />
              <p className="text-xs font-medium">
                {selectedFolderId === 'trash' ? 'Trash is Empty' : 'No Notes Found'}
              </p>
              <p className="text-[11px]">
                {selectedFolderId === 'trash' ? 'Deleted notes will appear here' : 'Click + Note to start writing'}
              </p>
            </div>
          ) : (
            <>
              {/* Pinned Section (if not in trash) */}
              {selectedFolderId !== 'trash' && pinnedDocs.length > 0 && (
                <div className="space-y-1 mb-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-2 flex items-center gap-1">
                    <Pin className="w-2.5 h-2.5" /> Pinned
                  </div>
                  {pinnedDocs.map(doc => renderNoteCard(doc))}
                </div>
              )}

              {/* Regular Notes Section */}
              {regularDocs.length > 0 && (
                <div className="space-y-1">
                  {selectedFolderId !== 'trash' && pinnedDocs.length > 0 && (
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-2 pt-2">
                      Notes
                    </div>
                  )}
                  {regularDocs.map(doc => renderNoteCard(doc))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  function renderNoteCard(doc: NotepadDocument) {
    const isActive = doc.id === activeDocId;
    const isTrashMode = selectedFolderId === 'trash' || doc.folderId === 'trash';
    const plainSnippet = doc.plainText
      ? doc.plainText.replace(doc.title, '').trim().substring(0, 70)
      : 'No additional text';

    return (
      <div
        key={doc.id}
        onClick={() => onSelectDoc(doc.id)}
        className={`group relative p-2.5 rounded-lg cursor-pointer transition-all border ${
          isActive
            ? 'shadow-sm font-medium'
            : isDark
            ? 'border-transparent hover:bg-white/5 text-[#cccccc]'
            : 'border-transparent hover:bg-black/5 text-[#333336]'
        }`}
        style={{
          backgroundColor: isActive ? activeBg : undefined,
          borderColor: isActive ? activeBorder : 'transparent',
          color: isActive ? (isDark ? '#ffffff' : '#000000') : undefined
        }}
      >
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <div className="flex items-center gap-1.5 truncate">
            {doc.isPinned && !isTrashMode && (
              <Pin className="w-3 h-3 shrink-0 text-amber-500 fill-amber-500/20" />
            )}
            <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-inherit font-bold' : ''}`}>
              {doc.title || 'Untitled'}
            </h4>
          </div>

          <span className="text-[10px] opacity-60 shrink-0 font-mono">
            {formatRelativeTime(doc.updatedAt || doc.createdAt)}
          </span>
        </div>

        {/* Snippet Preview */}
        <p className="text-[11px] line-clamp-2 opacity-70 leading-relaxed font-sans">
          {plainSnippet || 'Empty note'}
        </p>

        {/* Card Quick Action Bar on Hover */}
        <div className="absolute right-2 bottom-1.5 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isTrashMode ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestoreDoc(doc.id);
                }}
                className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-500 opacity-80 hover:opacity-100 flex items-center gap-1 text-[10px] px-1.5"
                title="Recover / Restore Note"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPermanentDeleteRequest(doc.id);
                }}
                className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-500 opacity-80 hover:opacity-100"
                title="Delete Permanently"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePinDoc(doc.id);
                }}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100"
                title={doc.isPinned ? 'Unpin' : 'Pin to top'}
              >
                <Pin className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDocRequest(doc.id);
                }}
                className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-500 opacity-70 hover:opacity-100"
                title="Move to Trash"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
};
