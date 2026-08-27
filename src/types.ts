import { AccentColorKey } from './types/accentColors';

export interface NestedSubPage {
  id: string;
  parentId: string; // docId or parent subpage id
  title: string;
  icon?: string;
  content: string;
  plainText: string;
  createdAt: string;
  updatedAt: string;
}

export interface FrameItem {
  id: string;
  title: string;
  description?: string;
  content: string;
  plainText: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FrameDeck {
  id: string;
  title: string;
  orientation: 'horizontal' | 'vertical'; // Horizontal slider roller or vertical stack
  frames: FrameItem[];
}

export interface NotepadDocument {
  id: string;
  title: string;
  content: string; // HTML / rich text or plain text
  plainText: string;
  isDirty: boolean;
  fileType: 'plain' | 'rich' | 'markdown';
  encoding: string;
  lineEnding: 'CRLF' | 'LF';
  createdAt: string;
  updatedAt: string;
  folderId?: string; // e.g. 'all', 'notes', 'work', 'personal', 'trash', or custom
  isPinned?: boolean;
  tags?: string[];
  isLocked?: boolean;
  colorTag?: string;
  subpages?: Record<string, NestedSubPage>;
  frameDecks?: FrameDeck[];
  isSandbox?: boolean;
}

export interface NoteFolder {
  id: string;
  name: string;
  parentId?: string | null; // For nested subfolders
  iconName?: string;
  color?: string;
  isSystem?: boolean;
  isSandbox?: boolean; // Sandbox folder for showcase and exploration
  filterType?: 'all' | 'pinned' | 'quick' | 'today' | 'trash' | 'tag' | 'custom';
  filterTag?: string;
  isSmart?: boolean; // Apple Notes Smart Folder filter (e.g. has checklists, has tables, modified today)
  smartCriteria?: 'all' | 'checklist' | 'table' | 'pinned' | 'today' | 'callout';
}

export interface NotepadSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: AccentColorKey;
  fontFamily: string;
  fontStyle: 'regular' | 'bold' | 'italic';
  fontSize: number;
  wordWrap: boolean;
  showStatusBar: boolean;
  openFilesBehavior: 'tab' | 'window';
  spellCheck: boolean;
  sidebarOpen: boolean;
  sidebarWidth: number;
  smartFolderReducedClutter: boolean;
  fullWidthEditor?: boolean;
}

export interface EditorPosition {
  line: number;
  col: number;
  selectedChars: number;
  totalChars: number;
  totalWords: number;
  totalLines: number;
}

export interface FindReplaceState {
  isOpen: boolean;
  isReplaceMode: boolean;
  findText: string;
  replaceText: string;
  matchCase: boolean;
  wrapAround: boolean;
  upDown: 'down' | 'up';
  matchIndex: number;
  totalMatches: number;
}
