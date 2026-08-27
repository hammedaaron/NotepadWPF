import React, { useRef, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  LayoutGrid, 
  SlidersHorizontal, 
  ExternalLink,
  Edit2
} from 'lucide-react';
import { FrameDeck } from '../types';

interface FrameDeckBlockProps {
  deck: FrameDeck;
  isDark: boolean;
  onOpenFrame: (deckId: string, frameId: string) => void;
  onAddFrame: (deckId: string) => void;
  onDeleteFrame: (deckId: string, frameId: string) => void;
  onUpdateFrameTitle: (deckId: string, frameId: string, newTitle: string) => void;
  onToggleOrientation: (deckId: string) => void;
  onDeleteDeck: (deckId: string) => void;
  onUpdateDeckTitle: (deckId: string, newTitle: string) => void;
}

const COLOR_ACCENTS = [
  { name: 'Silver', border: 'border-slate-400', bg: 'bg-slate-500/10', text: 'text-slate-400', dot: '#94a3b8' },
  { name: 'Blue', border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400', dot: '#3b82f6' },
  { name: 'Emerald', border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: '#10b981' },
  { name: 'Purple', border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400', dot: '#a855f7' },
  { name: 'Amber', border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400', dot: '#f59e0b' },
  { name: 'Rose', border: 'border-rose-500', bg: 'bg-rose-500/10', text: 'text-rose-400', dot: '#f43f5e' }
];

export const FrameDeckBlock: React.FC<FrameDeckBlockProps> = ({
  deck,
  isDark,
  onOpenFrame,
  onAddFrame,
  onDeleteFrame,
  onUpdateFrameTitle,
  onToggleOrientation,
  onDeleteDeck,
  onUpdateDeckTitle
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingDeckTitle, setEditingDeckTitle] = useState(false);
  const [deckTitleInput, setDeckTitleInput] = useState(deck.title);

  const isHorizontal = deck.orientation === 'horizontal';

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      className={`my-6 rounded-xl border p-4 select-none transition-all shadow-sm ${
        isDark 
          ? 'bg-[#1e1e1e]/90 border-[#333]' 
          : 'bg-[#fafafa] border-[#e0e0e0]'
      }`}
    >
      {/* 1. Frame Deck Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-inherit">
        <div className="flex items-center gap-2">
          <span className="text-base">🖼️</span>
          {editingDeckTitle ? (
            <input
              type="text"
              autoFocus
              value={deckTitleInput}
              onChange={(e) => setDeckTitleInput(e.target.value)}
              onBlur={() => {
                setEditingDeckTitle(false);
                onUpdateDeckTitle(deck.id, deckTitleInput || 'Frame Deck');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setEditingDeckTitle(false);
                  onUpdateDeckTitle(deck.id, deckTitleInput || 'Frame Deck');
                }
              }}
              className="text-sm font-bold bg-transparent border-b border-blue-500 outline-none px-1 py-0.5"
            />
          ) : (
            <button
              onClick={() => setEditingDeckTitle(true)}
              className="text-sm font-bold hover:underline flex items-center gap-1.5 opacity-90 text-left"
              title="Click to rename deck"
            >
              <span>{deck.title}</span>
              <Edit2 className="w-3 h-3 opacity-40 hover:opacity-100" />
            </button>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 opacity-70 font-medium">
            {deck.frames.length} {deck.frames.length === 1 ? 'frame' : 'frames'}
          </span>
        </div>

        {/* Roller Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          {/* Orientation Toggle */}
          <button
            onClick={() => onToggleOrientation(deck.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors font-medium opacity-80 hover:opacity-100"
            title={isHorizontal ? "Switch to Vertical Stack" : "Switch to Horizontal Slider Roller"}
          >
            {isHorizontal ? (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Slider Roller</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Vertical Stack</span>
              </>
            )}
          </button>

          {/* Horizontal Navigation Arrows */}
          {isHorizontal && deck.frames.length > 2 && (
            <div className="flex items-center gap-0.5 bg-black/5 dark:bg-white/5 rounded-md p-0.5">
              <button
                onClick={() => handleScroll('left')}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Add Frame Button */}
          <button
            onClick={() => onAddFrame(deck.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Frame</span>
          </button>

          {/* Delete Deck */}
          <button
            onClick={() => {
              if (confirm('Delete this frame deck and all its frames?')) {
                onDeleteDeck(deck.id);
              }
            }}
            className="p-1.5 rounded-md hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
            title="Delete Deck"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Frames Container (Horizontal Roller or Vertical Grid) */}
      <div
        ref={scrollContainerRef}
        className={
          isHorizontal
            ? "flex items-stretch gap-4 overflow-x-auto pb-2 scroll-smooth no-scrollbar snap-x snap-mandatory"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        }
      >
        {deck.frames.map((frame, idx) => {
          const colorObj = COLOR_ACCENTS[idx % COLOR_ACCENTS.length];
          const isEditingTitle = editingTitleId === frame.id;
          const snippetText = frame.plainText 
            ? frame.plainText.trim().substring(0, 100) 
            : 'Double-tap to write notes inside this frame page...';

          return (
            <div
              key={frame.id}
              onDoubleClick={() => onOpenFrame(deck.id, frame.id)}
              className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer snap-start hover:shadow-lg ${
                isHorizontal ? 'w-[280px] sm:w-[320px] flex-shrink-0' : 'w-full'
              } ${
                isDark 
                  ? 'bg-[#252525] border-[#383838] hover:border-neutral-500 hover:bg-[#2a2a2a]' 
                  : 'bg-white border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/80'
              }`}
            >
              {/* Card Top: Tag + Color + Delete */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: colorObj.dot }}
                    />
                    <span className="text-[11px] font-semibold tracking-wide uppercase opacity-60">
                      Frame {idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTitleId(frame.id);
                      }}
                      className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-neutral-400"
                      title="Rename frame"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFrame(deck.id, frame.id);
                      }}
                      className="p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
                      title="Delete frame"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Bold Editable Title */}
                {isEditingTitle ? (
                  <input
                    type="text"
                    autoFocus
                    defaultValue={frame.title}
                    onBlur={(e) => {
                      setEditingTitleId(null);
                      onUpdateFrameTitle(deck.id, frame.id, e.target.value || `Frame ${idx + 1}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingTitleId(null);
                        onUpdateFrameTitle(deck.id, frame.id, (e.target as HTMLInputElement).value || `Frame ${idx + 1}`);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-base font-bold bg-transparent border-b border-blue-500 outline-none mb-1.5"
                  />
                ) : (
                  <h4 className="text-base font-bold tracking-tight mb-1.5 truncate group-hover:text-blue-400 transition-colors">
                    {frame.title}
                  </h4>
                )}

                {/* Content Snippet */}
                <p className="text-xs opacity-70 line-clamp-3 leading-relaxed">
                  {snippetText}
                </p>
              </div>

              {/* Card Footer: Open button & hint */}
              <div className="pt-3 mt-3 border-t border-inherit flex items-center justify-between text-[11px] text-neutral-400">
                <span className="italic opacity-60 text-[10px]">
                  Double-tap to open
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenFrame(deck.id, frame.id);
                  }}
                  className="flex items-center gap-1 font-semibold text-blue-500 dark:text-blue-400 hover:underline"
                >
                  <span>Open Page</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Ghost Add Frame Card */}
        <button
          onClick={() => onAddFrame(deck.id)}
          className={`flex flex-col items-center justify-center p-6 rounded-xl border border-dashed hover:border-solid transition-all select-none group ${
            isHorizontal ? 'w-[200px] flex-shrink-0' : 'w-full min-h-[140px]'
          } ${
            isDark 
              ? 'border-neutral-700 hover:border-blue-500/60 hover:bg-white/[0.02]' 
              : 'border-neutral-300 hover:border-blue-500/60 hover:bg-black/[0.02]'
          }`}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all mb-2">
            <Plus className="w-4 h-4 opacity-70 group-hover:opacity-100" />
          </div>
          <span className="text-xs font-semibold opacity-70 group-hover:opacity-100 group-hover:text-blue-400">
            + Add Frame
          </span>
        </button>
      </div>
    </div>
  );
};
