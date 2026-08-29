import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  NotepadDocument, 
  NotepadSettings, 
  EditorPosition, 
  FindReplaceState, 
  NoteFolder,
  NestedSubPage,
  FrameDeck,
  FrameItem
} from './types';
import { NotepadTitleBar } from './components/NotepadTitleBar';
import { NotepadMenuBar } from './components/NotepadMenuBar';
import { NotepadEditor, NotepadEditorHandle, ActiveFrameState } from './components/NotepadEditor';
import { NotepadStatusBar } from './components/NotepadStatusBar';
import { NotepadFindReplace } from './components/NotepadFindReplace';
import { NotepadSettingsModal } from './components/NotepadSettingsModal';
import { NotepadGoToModal } from './components/NotepadGoToModal';
import { NotepadCopilotModal } from './components/NotepadCopilotModal';
import { AppleNotesSidebar } from './components/AppleNotesSidebar';
import { NestedPageDrawer } from './components/NestedPageDrawer';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { NotepadXRSplashScreen } from './components/NotepadXRSplashScreen';
import { InstallToPcModal } from './components/InstallToPcModal';
import { usePwaInstall } from './hooks/usePwaInstall';
import { parseDocumentFile } from './utils/universalDocumentParser';
import { exportDocument, ExportFormat } from './utils/documentExporter';
import { INITIAL_DOCS, INITIAL_FOLDERS } from './data/initialData';

const STORAGE_KEY_DOCS = 'win11_notepad_docs_v5';
const STORAGE_KEY_FOLDERS = 'win11_notepad_folders_v5';
const STORAGE_KEY_ACTIVE = 'win11_notepad_active_v5';
const STORAGE_KEY_SETTINGS = 'win11_notepad_settings_v5';
const STORAGE_KEY_OPEN_TABS = 'win11_notepad_open_tabs_v5';

const DEFAULT_SETTINGS: NotepadSettings = {
  theme: 'dark', // Native dark mode
  accentColor: 'silver', // Native white silver
  fontFamily: 'Consolas, "Lucida Console", Courier, monospace',
  fontStyle: 'regular',
  fontSize: 14,
  wordWrap: true,
  showStatusBar: true,
  openFilesBehavior: 'tab',
  spellCheck: false,
  sidebarOpen: false, // Default to FALSE for full-screen unpartitioned canvas as requested!
  sidebarWidth: 360,
  smartFolderReducedClutter: false
};

const BLANK_DEFAULT_DOC: NotepadDocument = {
  id: 'doc-blank-default',
  title: 'Untitled',
  content: '',
  plainText: '',
  isDirty: false,
  fileType: 'plain',
  encoding: 'UTF-8',
  lineEnding: 'CRLF',
  folderId: 'notepad-xr',
  isPinned: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default function App() {
  // Splash Screen State (Shown whenever app is launched / opened)
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Folders State
  const [folders, setFolders] = useState<NoteFolder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FOLDERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FOLDERS;
  });

  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');

  // Documents state (All saved notes in database/storage)
  // Default to a completely blank clean document
  const [documents, setDocuments] = useState<NotepadDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DOCS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [BLANK_DEFAULT_DOC];
  });

  // Open Tab IDs (Default to a single fresh blank tab)
  const [openDocIds, setOpenDocIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OPEN_TABS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return ['doc-blank-default'];
  });

  // Active Document ID (Default to the blank clean document)
  const [activeId, setActiveId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return 'doc-blank-default';
  });

  // Settings
  const [settings, setSettings] = useState<NotepadSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  });

  // Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    docId: string | null;
    noteTitle: string;
    isPermanent: boolean;
  }>({
    isOpen: false,
    docId: null,
    noteTitle: '',
    isPermanent: false
  });

  // Notion Nested Page Drawer state (right-hand panel)
  const [activeSubpageId, setActiveSubpageId] = useState<string | null>(null);

  // Active Frame Sub-page State (in-tab full page drilldown)
  const [activeFrame, setActiveFrame] = useState<ActiveFrameState | null>(null);

  // Editor Position & Metrics
  const [position, setPosition] = useState<EditorPosition>({
    line: 1,
    col: 1,
    selectedChars: 0,
    totalChars: 0,
    totalWords: 0,
    totalLines: 1
  });

  // Zoom Level
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Find & Replace state
  const [findReplaceState, setFindReplaceState] = useState<FindReplaceState>({
    isOpen: false,
    isReplaceMode: false,
    findText: '',
    replaceText: '',
    matchCase: false,
    wrapAround: true,
    upDown: 'down',
    matchIndex: 0,
    totalMatches: 0
  });

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGoToOpen, setIsGoToOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [copilotSelection, setCopilotSelection] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  // PWA Direct Install Hook
  const pwaInfo = usePwaInstall();

  // Autosave & Offline tracking
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const editorRef = useRef<NotepadEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA File Handling (Chromium LaunchQueue), Protocol Handling & Share Target Receiver
  useEffect(() => {
    // 1. Check LaunchQueue for files opened from OS Explorer / Finder
    if ('launchQueue' in window && 'setConsumer' in (window as any).launchQueue) {
      (window as any).launchQueue.setConsumer(async (launchParams: any) => {
        if (!launchParams.files || launchParams.files.length === 0) return;
        for (const fileHandle of launchParams.files) {
          try {
            const file = await fileHandle.getFile();
            const parsed = await parseDocumentFile(file);
            const newDocId = `doc-file-${Date.now()}`;
            const newDoc: NotepadDocument = {
              id: newDocId,
              title: parsed.title || file.name,
              content: parsed.content,
              plainText: parsed.plainText,
              isDirty: false,
              fileType: parsed.fileType,
              encoding: 'UTF-8',
              lineEnding: 'CRLF',
              folderId: 'notepad-xr',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setDocuments(prev => [...prev, newDoc]);
            setOpenDocIds(prev => [...prev, newDocId]);
            setActiveId(newDocId);
          } catch (e) {
            console.error('Error handling launched file:', e);
          }
        }
      });
    }

    // 2. Check URL Query Parameters for PWA Actions / Share Target / Protocols
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action === 'new' || action === 'new_note') {
      handleNewTab();
      window.history.replaceState({}, '', '/');
    } else if (action === 'shared-content') {
      // Retrieve shared content cached by Service Worker
      caches.open('notepad-xr-cache-v2').then(async (cache) => {
        const cached = await cache.match('/_shared_pwa_content');
        if (cached) {
          try {
            const data = await cached.json();
            const newDocId = `doc-shared-${Date.now()}`;
            const cleanTitle = data.title || 'Shared Note';
            const cleanContent = data.text ? `<p>${data.text.replace(/\n/g, '<br/>')}</p>` : '';
            const newDoc: NotepadDocument = {
              id: newDocId,
              title: cleanTitle,
              content: cleanContent,
              plainText: data.text || '',
              isDirty: true,
              fileType: 'plain',
              encoding: 'UTF-8',
              lineEnding: 'CRLF',
              folderId: 'notepad-xr',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setDocuments(prev => [...prev, newDoc]);
            setOpenDocIds(prev => [...prev, newDocId]);
            setActiveId(newDocId);
            cache.delete('/_shared_pwa_content');
          } catch (e) {
            console.error('Failed to parse shared PWA content:', e);
          }
        }
      });
      window.history.replaceState({}, '', '/');
    } else if (urlParams.get('title') || urlParams.get('text')) {
      // Direct GET share target
      const title = urlParams.get('title') || 'Shared Note';
      const text = urlParams.get('text') || '';
      const newDocId = `doc-shared-${Date.now()}`;
      const newDoc: NotepadDocument = {
        id: newDocId,
        title,
        content: text ? `<p>${text.replace(/\n/g, '<br/>')}</p>` : '',
        plainText: text,
        isDirty: true,
        fileType: 'plain',
        encoding: 'UTF-8',
        lineEnding: 'CRLF',
        folderId: 'notepad-xr',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setDocuments(prev => [...prev, newDoc]);
      setOpenDocIds(prev => [...prev, newDocId]);
      setActiveId(newDocId);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // 3-Second Debounced Autosave
  useEffect(() => {
    const activeDocument = documents.find(d => d.id === activeId);
    if (!activeDocument || !activeDocument.isDirty) {
      setSaveStatus('saved');
      return;
    }

    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      setSaveStatus('saving');
      // Mark active dirty document as saved
      setDocuments(prev => prev.map(d => d.id === activeId ? { ...d, isDirty: false } : d));
      setTimeout(() => {
        setSaveStatus('saved');
      }, 300);
    }, 3000); // 3 seconds debounced autosave

    return () => clearTimeout(timer);
  }, [documents, activeId]);

  // Persist documents, folders & settings & open tabs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
    } catch (e) {
      console.error(e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
    } catch (e) {
      console.error(e);
    }
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OPEN_TABS, JSON.stringify(openDocIds));
    } catch (e) {
      console.error(e);
    }
  }, [openDocIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeId);
    } catch (e) {
      console.error(e);
    }
  }, [activeId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Derive open documents for titlebar tabs
  const openDocuments = useMemo(() => {
    const list = documents.filter(d => openDocIds.includes(d.id));
    if (list.length > 0) return list;
    return documents.slice(0, 1);
  }, [documents, openDocIds]);

  // Determine active document
  const activeDoc = documents.find(d => d.id === activeId) || openDocuments[0] || documents[0] || INITIAL_DOCS[0];

  // Dark mode resolution
  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key -> close active frame or nested drawer
      if (e.key === 'Escape') {
        if (activeFrame) {
          setActiveFrame(null);
        } else if (activeSubpageId) {
          setActiveSubpageId(null);
        }
      }
      // Ctrl+\ -> Toggle Sidebar
      else if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setSettings(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
      }
      // Ctrl+N -> New Tab
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        handleNewTab();
      }
      // Ctrl+W -> Close Tab
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        handleCloseTab(activeId);
      }
      // Ctrl+S -> Save
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+F -> Find
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFindReplaceState(prev => ({ ...prev, isOpen: true, isReplaceMode: false }));
      }
      // Ctrl+H -> Replace
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setFindReplaceState(prev => ({ ...prev, isOpen: true, isReplaceMode: true }));
      }
      // Ctrl+G -> Go to line
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setIsGoToOpen(true);
      }
      // Ctrl+O -> Open file
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
      // Ctrl+P -> Print
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      }
      // Ctrl+Plus -> Zoom In
      else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoomLevel(prev => Math.min(prev + 10, 200));
      }
      // Ctrl+Minus -> Zoom Out
      else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        setZoomLevel(prev => Math.max(prev - 10, 50));
      }
      // Ctrl+0 -> Reset Zoom
      else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoomLevel(100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId, findReplaceState.findText, documents, activeFrame, activeSubpageId, openDocIds]);

  // Tab & Document management
  const handleNewTab = (folderId?: string) => {
    setActiveFrame(null);
    setActiveSubpageId(null);
    const newDocId = `doc-${Date.now()}`;
    const newDoc: NotepadDocument = {
      id: newDocId,
      title: 'Untitled',
      content: '',
      plainText: '',
      isDirty: false,
      fileType: 'plain',
      encoding: 'UTF-8',
      lineEnding: 'CRLF',
      folderId: folderId || (selectedFolderId !== 'trash' && selectedFolderId !== 'pinned' && selectedFolderId !== 'today' && selectedFolderId !== 'all' ? selectedFolderId : 'notepad-xr'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDocuments(prev => [...prev, newDoc]);
    setOpenDocIds(prev => [...prev, newDocId]);
    setActiveId(newDocId);
  };

  // Closing a tab should NOT delete the saved note from storage!
  const handleCloseTab = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveFrame(null);
    setActiveSubpageId(null);

    if (openDocIds.length <= 1) {
      // If closing the only tab, open another note or make a new draft
      const remainingSaved = documents.filter(d => d.id !== id && d.folderId !== 'trash');
      if (remainingSaved.length > 0) {
        const nextDoc = remainingSaved[0];
        setOpenDocIds([nextDoc.id]);
        setActiveId(nextDoc.id);
      } else {
        const fallbackId = `doc-${Date.now()}`;
        const fallbackDoc: NotepadDocument = {
          id: fallbackId,
          title: 'Untitled',
          content: '',
          plainText: '',
          isDirty: false,
          fileType: 'plain',
          encoding: 'UTF-8',
          lineEnding: 'CRLF',
          folderId: 'sandbox',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setDocuments(prev => [...prev, fallbackDoc]);
        setOpenDocIds([fallbackId]);
        setActiveId(fallbackId);
      }
      return;
    }

    const currentIndex = openDocIds.indexOf(id);
    const nextOpen = openDocIds.filter(docId => docId !== id);
    setOpenDocIds(nextOpen);

    if (activeId === id) {
      const nextActiveIndex = Math.max(0, currentIndex - 1);
      setActiveId(nextOpen[nextActiveIndex] || nextOpen[0]);
    }
  };

  const handleSelectTab = (id: string) => {
    setActiveFrame(null);
    setActiveSubpageId(null);
    setActiveId(id);
  };

  // Selecting a note from sidebar opens its tab if not already open
  const handleSelectDocFromSidebar = (id: string) => {
    setActiveFrame(null);
    setActiveSubpageId(null);
    setOpenDocIds(prev => prev.includes(id) ? prev : [...prev, id]);
    setActiveId(id);
  };

  // Content update from main editor
  const handleContentChange = (content: string, plainText: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === activeId) {
        let title = d.title;
        if (d.title === 'Untitled' && plainText.trim()) {
          const firstLine = plainText.trim().split('\n')[0].substring(0, 30);
          if (firstLine) title = firstLine;
        }

        return {
          ...d,
          content,
          plainText,
          title,
          isDirty: true,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }));
  };

  // Document Operations
  const handleSave = () => {
    setDocuments(prev => prev.map(d => d.id === activeId ? { ...d, isDirty: false } : d));
  };

  const handleSaveAs = () => {
    const blob = new Blob([activeDoc.plainText || activeDoc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDoc.title || 'Untitled'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    handleSave();
  };

  // Universal Document File Import
  const handleUniversalFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    try {
      const parsed = await parseDocumentFile(file);
      const newDocId = `doc-${Date.now()}`;
      const newDoc: NotepadDocument = {
        id: newDocId,
        title: parsed.title || file.name,
        content: parsed.content,
        plainText: parsed.plainText,
        isDirty: false,
        fileType: parsed.fileType,
        encoding: 'UTF-8',
        lineEnding: 'CRLF',
        folderId: selectedFolderId !== 'trash' ? selectedFolderId : 'sandbox',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDocuments(prev => [...prev, newDoc]);
      setOpenDocIds(prev => [...prev, newDocId]);
      setActiveId(newDocId);
    } catch (err) {
      console.error('File parsing error:', err);
    } finally {
      setIsLoadingFile(false);
      e.target.value = '';
    }
  };

  // -------------------------------------------------------------
  // NOTION-STYLE NESTED SUB-PAGES
  // -------------------------------------------------------------
  const handleCreateSubpageFromSelection = (selectedText: string) => {
    const subpageId = `sub-${Date.now()}`;
    const cleanTitle = selectedText?.trim() || 'Untitled Subpage';
    
    const newSubpage: NestedSubPage = {
      id: subpageId,
      parentId: activeDoc.id,
      title: cleanTitle,
      icon: '📄',
      content: `<h2>${cleanTitle}</h2><p>Start typing your sub-page notes here...</p>`,
      plainText: `${cleanTitle}\nStart typing your sub-page notes here...`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDocuments(prev => prev.map(d => {
      if (d.id === activeId) {
        const subpages = { ...(d.subpages || {}), [subpageId]: newSubpage };
        return { ...d, subpages, isDirty: true, updatedAt: new Date().toISOString() };
      }
      return d;
    }));

    // Insert inline badge link in editor
    editorRef.current?.insertNestedPageLink(subpageId, cleanTitle, '📄');

    // Slide open right panel
    setActiveSubpageId(subpageId);
  };

  const handleOpenSubpage = (subpageId: string) => {
    setActiveSubpageId(subpageId);
  };

  const handleUpdateSubpage = (updated: NestedSubPage) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === activeId) {
        const subpages = { ...(d.subpages || {}), [updated.id]: updated };
        return { ...d, subpages, isDirty: true, updatedAt: new Date().toISOString() };
      }
      return d;
    }));
  };

  const handleDeleteSubpage = (subpageId: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === activeId && d.subpages) {
        const subpages = { ...d.subpages };
        delete subpages[subpageId];
        return { ...d, subpages, isDirty: true, updatedAt: new Date().toISOString() };
      }
      return d;
    }));
    if (activeSubpageId === subpageId) {
      setActiveSubpageId(null);
    }
  };

  const handleOpenSubpageAsTab = (subpage: NestedSubPage) => {
    const newDocId = `doc-${Date.now()}`;
    const newDoc: NotepadDocument = {
      id: newDocId,
      title: subpage.title || 'Untitled',
      content: subpage.content,
      plainText: subpage.plainText,
      isDirty: false,
      fileType: 'rich',
      encoding: 'UTF-8',
      lineEnding: 'CRLF',
      folderId: activeDoc.folderId || 'sandbox',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDocuments(prev => [...prev, newDoc]);
    setOpenDocIds(prev => [...prev, newDocId]);
    setActiveId(newDocId);
    setActiveSubpageId(null);
  };

  // -------------------------------------------------------------
  // FRAME DECKS & HORIZONTAL SLIDER ROLLERS
  // -------------------------------------------------------------
  const handleAddFrameDeck = (title: string = 'Interactive Frame Roller') => {
    const deckId = `deck-${Date.now()}`;
    const newDeck: FrameDeck = {
      id: deckId,
      title,
      orientation: 'horizontal',
      frames: [
        {
          id: `frame-${Date.now()}-1`,
          title: 'Card 1: Overview',
          content: '<h2>Card 1 Overview</h2><p>Double-tap this card to write dedicated frame notes in this tab.</p>',
          plainText: 'Card 1 Overview\nDouble-tap this card to write dedicated frame notes.',
          color: 'blue',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `frame-${Date.now()}-2`,
          title: 'Card 2: Deep Dive',
          content: '<h2>Card 2 Deep Dive</h2><p>Use the upper-left back button to return to the parent document anytime.</p>',
          plainText: 'Card 2 Deep Dive\nUse the upper-left back button to return to the parent document.',
          color: 'emerald',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `frame-${Date.now()}-3`,
          title: 'Card 3: Deliverables',
          content: '<h2>Card 3 Deliverables</h2><p>All formatting features from the navigation bar work inside frame editors.</p>',
          plainText: 'Card 3 Deliverables\nAll formatting features work inside frame editors.',
          color: 'purple',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };

    setDocuments(prev => prev.map(d => {
      if (d.id === activeId) {
        const frameDecks = [...(d.frameDecks || []), newDeck];
        return { ...d, frameDecks, isDirty: true, updatedAt: new Date().toISOString() };
      }
      return d;
    }));
  };

  const handleOpenFrame = (deckId: string, frameId: string) => {
    const deck = activeDoc.frameDecks?.find(d => d.id === deckId);
    const frame = deck?.frames.find(f => f.id === frameId);
    if (frame) {
      setActiveFrame({
        deckId,
        frameId,
        frame,
        parentDocTitle: activeDoc.title || 'Main Document'
      });
    }
  };

  const handleCloseFrame = () => {
    setActiveFrame(null);
  };

  const handleFrameContentChange = (deckId: string, frameId: string, content: string, plainText: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === activeId && d.frameDecks) {
        const frameDecks = d.frameDecks.map(deck => {
          if (deck.id === deckId) {
            const frames = deck.frames.map(f => {
              if (f.id === frameId) {
                return { ...f, content, plainText, updatedAt: new Date().toISOString() };
              }
              return f;
            });
            return { ...deck, frames };
          }
          return deck;
        });
        return { ...d, frameDecks, isDirty: true, updatedAt: new Date().toISOString() };
      }
      return d;
    }));

    if (activeFrame && activeFrame.frameId === frameId) {
      setActiveFrame(prev => prev ? ({
        ...prev,
        frame: { ...prev.frame, content, plainText, updatedAt: new Date().toISOString() }
      }) : null);
    }
  };

  const handleFrameTitleChange = (deckId: string, frameId: string, title: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === activeId && d.frameDecks) {
        const frameDecks = d.frameDecks.map(deck => {
          if (deck.id === deckId) {
            const frames = deck.frames.map(f => {
              if (f.id === frameId) {
                return { ...f, title, updatedAt: new Date().toISOString() };
              }
              return f;
            });
            return { ...deck, frames };
          }
          return deck;
        });
        return { ...d, frameDecks, isDirty: true, updatedAt: new Date().toISOString() };
      }
      return d;
    }));

    if (activeFrame && activeFrame.frameId === frameId) {
      setActiveFrame(prev => prev ? ({
        ...prev,
        frame: { ...prev.frame, title, updatedAt: new Date().toISOString() }
      }) : null);
    }
  };

  const handleAddFrameToDeck = (deckId: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === activeId && d.frameDecks) {
        const frameDecks = d.frameDecks.map(deck => {
          if (deck.id === deckId) {
            const newIndex = deck.frames.length + 1;
            const newFrame: FrameItem = {
              id: `frame-${Date.now()}`,
              title: `Card ${newIndex}: New Frame`,
              content: `<h2>Frame ${newIndex} Notes</h2><p>Double-tap this card to edit its dedicated page.</p>`,
              plainText: `Frame ${newIndex} Notes\nDouble-tap this card to edit its dedicated page.`,
              color: 'blue',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            return { ...deck, frames: [...deck.frames, newFrame] };
          }
          return deck;
        });
        return { ...d, frameDecks, isDirty: true, updatedAt: new Date().toISOString() };
      }
      return d;
    }));
  };

  const handleDeleteFrameFromDeck = (deckId: string, frameId: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === activeId && d.frameDecks) {
        const frameDecks = d.frameDecks.map(deck => {
          if (deck.id === deckId) {
            const frames = deck.frames.filter(f => f.id !== frameId);
            return { ...deck, frames };
          }
          return deck;
        });
        return { ...d, frameDecks, isDirty: true, updatedAt: new Date().toISOString() };
      }
      return d;
    }));
    if (activeFrame?.frameId === frameId) {
      setActiveFrame(null);
    }
  };

  const handleToggleDeckOrientation = (deckId: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === activeId && d.frameDecks) {
        const frameDecks = d.frameDecks.map(deck => {
          if (deck.id === deckId) {
            const nextOrientation = deck.orientation === 'horizontal' ? 'vertical' : 'horizontal';
            return { ...deck, orientation: nextOrientation as any };
          }
          return deck;
        });
        return { ...d, frameDecks, isDirty: true, updatedAt: new Date().toISOString() };
      }
      return d;
    }));
  };

  const handleDeleteDeck = (deckId: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === activeId && d.frameDecks) {
        const frameDecks = d.frameDecks.filter(deck => deck.id !== deckId);
        return { ...d, frameDecks, isDirty: true, updatedAt: new Date().toISOString() };
      }
      return d;
    }));
  };

  const handleUpdateDeckTitle = (deckId: string, title: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === activeId && d.frameDecks) {
        const frameDecks = d.frameDecks.map(deck => {
          if (deck.id === deckId) {
            return { ...deck, title };
          }
          return deck;
        });
        return { ...d, frameDecks, isDirty: true, updatedAt: new Date().toISOString() };
      }
      return d;
    }));
  };

  // Folder Operations
  const handleCreateFolder = (name: string, isSmart: boolean = false, smartCriteria?: any, parentId?: string | null) => {
    const newFolder: NoteFolder = {
      id: `folder-${Date.now()}`,
      name,
      isSystem: false,
      isSmart,
      smartCriteria,
      parentId: parentId || undefined
    };
    setFolders(prev => [...prev, newFolder]);
    setSelectedFolderId(newFolder.id);
  };

  // Delete Request Handlers (opens confirmation prompt)
  const handleDeleteDocRequest = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    setDeleteModalState({
      isOpen: true,
      docId,
      noteTitle: doc?.title || 'Untitled',
      isPermanent: false
    });
  };

  const handlePermanentDeleteRequest = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    setDeleteModalState({
      isOpen: true,
      docId,
      noteTitle: doc?.title || 'Untitled',
      isPermanent: true
    });
  };

  const handleConfirmDelete = () => {
    const { docId, isPermanent } = deleteModalState;
    if (!docId) return;

    if (isPermanent) {
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } else {
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, folderId: 'trash' } : d));
    }

    // Deleting the note closes its tab!
    setOpenDocIds(prev => {
      const nextOpen = prev.filter(id => id !== docId);
      if (activeId === docId) {
        if (nextOpen.length > 0) {
          setActiveId(nextOpen[0]);
        } else {
          const remainingDocs = documents.filter(d => d.id !== docId && (isPermanent || d.folderId !== 'trash'));
          if (remainingDocs.length > 0) {
            nextOpen.push(remainingDocs[0].id);
            setActiveId(remainingDocs[0].id);
          } else {
            const fallbackId = `doc-${Date.now()}`;
            const fallbackDoc: NotepadDocument = {
              id: fallbackId,
              title: 'Untitled',
              content: '',
              plainText: '',
              isDirty: false,
              fileType: 'plain',
              encoding: 'UTF-8',
              lineEnding: 'CRLF',
              folderId: 'sandbox',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setDocuments(curr => [...curr, fallbackDoc]);
            nextOpen.push(fallbackId);
            setActiveId(fallbackId);
          }
        }
      }
      return nextOpen;
    });

    setDeleteModalState({
      isOpen: false,
      docId: null,
      noteTitle: '',
      isPermanent: false
    });
  };

  // Restore deleted note back into active circulation
  const handleRestoreDoc = (docId: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          folderId: d.isSandbox ? 'sandbox' : 'work'
        };
      }
      return d;
    }));
    setOpenDocIds(prev => prev.includes(docId) ? prev : [...prev, docId]);
    setActiveId(docId);
  };

  const handleTogglePinDoc = (docId: string) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, isPinned: !d.isPinned } : d));
  };

  // Formatting commands
  const handleFormatBlock = (tag: string) => {
    editorRef.current?.formatBlock(tag);
  };

  const handleFormatInline = (cmd: string, val?: string) => {
    editorRef.current?.execCommand(cmd, val);
  };

  const handleInsertTable = (rows: number, cols: number) => {
    editorRef.current?.insertTable(rows, cols);
  };

  const handleInsertCallout = (type: 'note' | 'tip' | 'warning' | 'quote' = 'note') => {
    editorRef.current?.insertCallout(type);
  };

  const handleIndent = () => {
    editorRef.current?.indent();
  };

  const handleOutdent = () => {
    editorRef.current?.outdent();
  };

  const handleInsertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editorRef.current?.insertLink(url);
    }
  };

  const handleInsertChecklist = () => {
    editorRef.current?.insertChecklist();
  };

  // Find & Replace handlers
  const handleFindNext = () => {
    if (!findReplaceState.findText) return;
    if (typeof (window as any).find === 'function') {
      (window as any).find(
        findReplaceState.findText,
        findReplaceState.matchCase,
        false,
        findReplaceState.wrapAround
      );
    }
  };

  const handleFindPrev = () => {
    if (!findReplaceState.findText) return;
    if (typeof (window as any).find === 'function') {
      (window as any).find(
        findReplaceState.findText,
        findReplaceState.matchCase,
        true,
        findReplaceState.wrapAround
      );
    }
  };

  const handleReplace = () => {
    if (!findReplaceState.findText) return;
    if (typeof (window as any).find === 'function') {
      (window as any).find(
        findReplaceState.findText,
        findReplaceState.matchCase,
        false,
        findReplaceState.wrapAround
      );
    }
    document.execCommand('insertText', false, findReplaceState.replaceText);
  };

  const handleReplaceAll = () => {
    if (!findReplaceState.findText) return;
    let content = activeDoc.content;
    const flags = findReplaceState.matchCase ? 'g' : 'gi';
    const regex = new RegExp(findReplaceState.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const newContent = content.replace(regex, findReplaceState.replaceText);
    const plainText = activeDoc.plainText.replace(regex, findReplaceState.replaceText);
    handleContentChange(newContent, plainText);
  };

  // Status Bar Format, Zoom, and Line Ending Switches
  const handleLineEndingToggle = () => {
    const nextLE = activeDoc.lineEnding === 'CRLF' ? 'LF' : 'CRLF';
    setDocuments(prev => prev.map(d => d.id === activeId ? { ...d, lineEnding: nextLE } : d));
  };

  const handleFileTypeChange = (type: 'plain' | 'rich' | 'markdown') => {
    setDocuments(prev => prev.map(d => d.id === activeId ? { ...d, fileType: type } : d));
  };

  // Active subpage object for drawer
  const currentSubpage = activeSubpageId && activeDoc.subpages 
    ? activeDoc.subpages[activeSubpageId] || null 
    : null;

  return (
    <div className={`w-full h-screen flex flex-col select-none overflow-hidden font-sans ${
      isDark ? 'bg-[#181818] text-[#f0f0f0]' : 'bg-[#f3f3f3] text-[#1a1a1a]'
    }`}>
      {/* Hidden File Input supporting all extensions */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUniversalFileImport}
        className="hidden"
        accept="*/*"
      />

      {/* 1. Windows 11 Title Bar with Document Tabs */}
      <NotepadTitleBar
        documents={openDocuments}
        activeId={activeId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={() => handleNewTab()}
        isDark={isDark}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isStandalone={pwaInfo.isStandalone}
      />

      {/* 2. Menu Bar & Formatting Toolbar */}
      <NotepadMenuBar
        isDark={isDark}
        settings={settings}
        sidebarOpen={settings.sidebarOpen}
        onToggleSidebar={() => setSettings(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
        onNewTab={() => handleNewTab()}
        onOpenFile={() => fileInputRef.current?.click()}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onExportAs={(format: ExportFormat) => exportDocument(activeDoc, format)}
        onPrint={() => window.print()}
        onCloseTab={() => handleCloseTab(activeId)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenFind={() => setFindReplaceState(prev => ({ ...prev, isOpen: true, isReplaceMode: false }))}
        onOpenReplace={() => setFindReplaceState(prev => ({ ...prev, isOpen: true, isReplaceMode: true }))}
        onOpenGoTo={() => setIsGoToOpen(true)}
        onInsertDateTime={() => {
          const now = new Date();
          const str = `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${now.toLocaleDateString()}`;
          editorRef.current?.insertText(str);
        }}
        onSelectAll={() => editorRef.current?.selectAll()}
        onUndo={() => editorRef.current?.execCommand('undo')}
        onRedo={() => editorRef.current?.execCommand('redo')}
        onCut={() => editorRef.current?.execCommand('cut')}
        onCopy={() => editorRef.current?.execCommand('copy')}
        onPaste={async () => {
          try {
            const text = await navigator.clipboard.readText();
            editorRef.current?.insertText(text);
          } catch (e) {
            console.error(e);
          }
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onFormatBlock={handleFormatBlock}
        onFormatInline={handleFormatInline}
        onInsertTable={handleInsertTable}
        onInsertCallout={handleInsertCallout}
        onIndent={handleIndent}
        onOutdent={handleOutdent}
        onInsertLink={handleInsertLink}
        onInsertChecklist={handleInsertChecklist}
        onInsertNestedPage={() => {
          const selText = editorRef.current?.getSelectionText() || 'New Subpage';
          handleCreateSubpageFromSelection(selText);
        }}
        onInsertFrameDeck={() => handleAddFrameDeck('New Frame Slider Roller')}
        onToggleWordWrap={() => setSettings(prev => ({ ...prev, wordWrap: !prev.wordWrap }))}
        onToggleStatusBar={() => setSettings(prev => ({ ...prev, showStatusBar: !prev.showStatusBar }))}
        zoomLevel={zoomLevel}
        onSetZoom={setZoomLevel}
      />

      {/* 3. Main Workspace: Full Screen / Unpartitioned Notepad Canvas (+ Optional Collapsible Sidebar) */}
      <div className="flex-1 flex w-full relative overflow-hidden">
        {/* Optional Collapsible Apple Notes Sidebar */}
        {settings.sidebarOpen && (
          <AppleNotesSidebar
            documents={documents}
            folders={folders}
            activeDocId={activeId}
            selectedFolderId={selectedFolderId}
            isDark={isDark}
            settings={settings}
            onSelectDoc={handleSelectDocFromSidebar}
            onSelectFolder={(fId) => setSelectedFolderId(fId)}
            onCreateDocInFolder={(fId) => handleNewTab(fId)}
            onCreateFolder={handleCreateFolder}
            onDeleteDocRequest={handleDeleteDocRequest}
            onRestoreDoc={handleRestoreDoc}
            onPermanentDeleteRequest={handlePermanentDeleteRequest}
            onTogglePinDoc={handleTogglePinDoc}
            onCloseSidebar={() => setSettings(prev => ({ ...prev, sidebarOpen: false }))}
          />
        )}

        {/* Central Full-Screen Editor Canvas */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          {/* Inline Find & Replace Bar (Ctrl+F / Ctrl+H) */}
          <NotepadFindReplace
            state={findReplaceState}
            isDark={isDark}
            onUpdateState={(updates: Partial<FindReplaceState>) => setFindReplaceState(prev => ({ ...prev, ...updates }))}
            onFindNext={handleFindNext}
            onFindPrev={handleFindPrev}
            onReplace={handleReplace}
            onReplaceAll={handleReplaceAll}
            onClose={() => setFindReplaceState(prev => ({ ...prev, isOpen: false }))}
          />

          {/* Document Parser Loader Indicator */}
          {isLoadingFile && (
            <div className="absolute top-2 right-4 z-30 px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs shadow-lg animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>Importing document contents...</span>
            </div>
          )}

          {/* Unpartitioned ContentEditable Notepad & Frame Subpage Editor */}
          <NotepadEditor
            ref={editorRef}
            document={activeDoc}
            settings={settings}
            isDark={isDark}
            zoomLevel={zoomLevel}
            activeFrame={activeFrame}
            onCloseFrame={handleCloseFrame}
            onFrameContentChange={handleFrameContentChange}
            onFrameTitleChange={handleFrameTitleChange}
            onContentChange={handleContentChange}
            onPositionChange={setPosition}
            onOpenCopilotWithSelection={(sel) => {
              setCopilotSelection(sel);
              setIsCopilotOpen(true);
            }}
            onOpenSubpage={handleOpenSubpage}
            onCreateSubpageFromSelection={handleCreateSubpageFromSelection}
            onAddFrameDeck={handleAddFrameDeck}
            onOpenFrame={handleOpenFrame}
            onAddFrameToDeck={handleAddFrameToDeck}
            onDeleteFrameFromDeck={handleDeleteFrameFromDeck}
            onUpdateFrameTitleInDeck={handleFrameTitleChange}
            onToggleDeckOrientation={handleToggleDeckOrientation}
            onDeleteDeck={handleDeleteDeck}
            onUpdateDeckTitle={handleUpdateDeckTitle}
          />
        </div>

        {/* 4. Notion-style Nested Page Drawer (pulls out smoothly from the right) */}
        <NestedPageDrawer
          isOpen={!!activeSubpageId && !!currentSubpage}
          subpage={currentSubpage}
          parentDocTitle={activeDoc.title || 'Untitled Document'}
          isDark={isDark}
          settings={settings}
          onClose={() => setActiveSubpageId(null)}
          onUpdateSubpage={handleUpdateSubpage}
          onDeleteSubpage={handleDeleteSubpage}
          onOpenAsTab={handleOpenSubpageAsTab}
        />
      </div>

      {/* 5. Windows 11 Fluent Status Bar */}
      {settings.showStatusBar && (
        <NotepadStatusBar
          position={position}
          zoomLevel={zoomLevel}
          lineEnding={activeDoc.lineEnding}
          encoding={activeDoc.encoding}
          fileType={activeDoc.fileType}
          saveStatus={saveStatus}
          isOnline={isOnline}
          isDark={isDark}
          onZoomClick={() => setZoomLevel(prev => (prev >= 200 ? 50 : prev + 25))}
          onLineEndingToggle={handleLineEndingToggle}
          onFileTypeChange={handleFileTypeChange}
        />
      )}

      {/* 6. Modals (Settings, Go To Line, Copilot AI, Confirm Delete) */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        title={deleteModalState.isPermanent ? 'Delete Note Permanently' : 'Move Note to Trash'}
        noteTitle={deleteModalState.noteTitle}
        isPermanent={deleteModalState.isPermanent}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, docId: null, noteTitle: '', isPermanent: false })}
        isDark={isDark}
      />

      <NotepadSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSet) => setSettings(prev => ({ ...prev, ...newSet }))}
        isDark={isDark}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      <InstallToPcModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isDark={isDark}
        pwaInfo={pwaInfo}
      />

      <NotepadGoToModal
        isOpen={isGoToOpen}
        onClose={() => setIsGoToOpen(false)}
        totalLines={position.totalLines}
        onGoToLine={(line) => editorRef.current?.goToLine(line)}
        isDark={isDark}
      />

      <NotepadCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        selectedText={copilotSelection}
        onReplaceWithAi={(newText: string) => editorRef.current?.insertText(newText)}
        onInsertBelow={(newText: string) => {
          editorRef.current?.insertText(`\n${newText}\n`);
        }}
        isDark={isDark}
      />

      {/* 7. Circulating Google AI Studio style Splash Page (resets every 24 hours) */}
      {showSplash && (
        <NotepadXRSplashScreen
          onDismiss={() => setShowSplash(false)}
          isDark={isDark}
        />
      )}
    </div>
  );
}
