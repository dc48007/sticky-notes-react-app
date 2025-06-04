// src/NoteItem.js
import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import {
  CheckSquare,
  Square,
  Trash2,
  Palette,
  TextQuote,
  Brain,
  Edit3,
  Loader2,
} from 'lucide-react';

// Default appearance constants for fallback if not provided in note prop
// (App.js should ensure note.noteColor, note.fontColor, note.fontSize are populated)
const NOTE_COLORS_FALLBACK = [ // Renamed to avoid conflict if imported elsewhere
  { name: 'Yellow', bg: 'bg-yellow-200', text: 'text-yellow-800', border: 'border-yellow-400' },
  { name: 'Pink', bg: 'bg-pink-200', text: 'text-pink-800', border: 'border-pink-400' },
  // ... add all colors if robust fallback is needed here, or rely on App.js providing them
];
const DEFAULT_NOTE_COLOR_FALLBACK = NOTE_COLORS_FALLBACK[0];
const DEFAULT_FONT_COLOR_FALLBACK = { name: 'Black', textClass: 'text-black', bgClass: 'bg-black' };
const DEFAULT_FONT_SIZE_FALLBACK = { name: 'Medium', class: 'text-base', value: 'base' };

// Helper to render icons within NoteItem
const RenderIcon = ({ icon: IconComponent, size = 16, spin = false }) => (
  <IconComponent size={size} className={spin ? 'animate-spin' : ''} />
);

const NoteItem = ({
  note,
  isFocused,
  onFocusNote,
  onDragStop,
  onEditNote,
  onDeleteNote,
  onToggleStrikeThrough,
  onChangeBgColor,
  onSummarizeNote,
  onExpandNote,
  isSummarizingThisNote,
  isExpandingThisNote,
}) => {
  const [showNoteItemColorPicker, setShowNoteItemColorPicker] = useState(false);
  const nodeRef = useRef(null);

  const noteStyle = {
    zIndex: isFocused ? 1000 : (note.zIndex || 1),
    boxShadow: isFocused
      ? '0 10px 25px rgba(0,0,0,0.25), 0 8px 10px rgba(0,0,0,0.15)'
      : '0 4px 6px rgba(0,0,0,0.1)',
  };

  // Use defaults from App.js via note prop, with local fallbacks just in case
  const currentNoteColor = note.noteColor || DEFAULT_NOTE_COLOR_FALLBACK;
  const currentFontColor = note.fontColor || DEFAULT_FONT_COLOR_FALLBACK;
  const currentFontSize = note.fontSize || DEFAULT_FONT_SIZE_FALLBACK;

  const handleStopPropagation = (e) => e.stopPropagation();

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".note-drag-handle"
      position={{ x: note.x || 0, y: note.y || 0 }}
      bounds="parent"
      onStart={(e, data) => {
        if (e.target.closest('button') || e.target.closest('.color-picker-popup')) {
            return false; 
        }
        if (onFocusNote) onFocusNote(note.id);
        return true;
      }}
      onStop={(e, data) => {
        if (onDragStop) onDragStop(note.id, data.x, data.y);
      }}
    >
      <div
        ref={nodeRef}
        style={noteStyle}
        className={`absolute w-60 h-60 rounded-lg 
                    ${currentNoteColor.bg} border ${currentNoteColor.border} 
                    flex flex-col justify-between break-words shadow-lg`}
        onClick={() => {
            if (onFocusNote && !isFocused) onFocusNote(note.id);
        }}
      >
        <div
          className="note-drag-handle cursor-grab active:cursor-grabbing h-7 w-full rounded-t-lg flex items-center justify-center bg-black bg-opacity-5 hover:bg-opacity-10"
          onDoubleClick={handleStopPropagation}
          onClick={() => { 
            if (onFocusNote) onFocusNote(note.id);
          }}
        >
          <span className={`text-xs opacity-40 ${currentNoteColor.text}`}>Drag</span>
        </div>

        <div
          className="p-3 pt-1 flex-grow overflow-hidden"
          onDoubleClick={(e) => {
            handleStopPropagation(e);
            if (onEditNote) onEditNote(note);
          }}
        >
          <p
            className={`h-full text-sm mb-1.5 whitespace-pre-wrap overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent 
                        ${currentFontColor.textClass} ${currentFontSize.class} 
                        ${note.isStruckThrough ? 'line-through opacity-60' : ''}`}
          >
            {note.text}
          </p>
        </div>

        <div className="p-3 pt-0 mt-auto border-t border-black border-opacity-10 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            <button onClick={(e) => { handleStopPropagation(e); if(onToggleStrikeThrough) onToggleStrikeThrough(note.id); }} title={note.isStruckThrough ? "Unmark" : "Mark as done"} className={`p-1 rounded hover:bg-opacity-20 hover:bg-black focus:outline-none ${note.isStruckThrough ? 'text-green-600' : currentNoteColor.text}`}><RenderIcon icon={note.isStruckThrough ? CheckSquare : Square} size={14} /></button>
            <button onClick={(e) => { handleStopPropagation(e); if(onDeleteNote) onDeleteNote(note.id); }} title="Delete note" className="p-1 rounded hover:bg-red-500 hover:text-white focus:outline-none text-red-500"><RenderIcon icon={Trash2} size={14} /></button>
            <div className="relative">
                <button onClick={(e) => { handleStopPropagation(e); setShowNoteItemColorPicker(prev => !prev); }} title="Change background" className={`p-1 rounded hover:bg-opacity-20 hover:bg-black focus:outline-none ${currentNoteColor.text}`}><RenderIcon icon={Palette} size={14} /></button>
                {showNoteItemColorPicker && (
                    <div className="color-picker-popup absolute bottom-full mb-1 left-0 z-30 bg-white p-1.5 rounded shadow-lg border border-gray-300 flex space-x-1">
                        {/* Assuming NOTE_COLORS_FALLBACK or similar is defined for button mapping */}
                        {(NOTE_COLORS_FALLBACK || []).map(color => (<button key={color.name} title={color.name} onClick={(e) => { handleStopPropagation(e); if(onChangeBgColor) onChangeBgColor(note.id, color); setShowNoteItemColorPicker(false);}} className={`w-5 h-5 rounded-full ${color.bg} border-2 ${currentNoteColor.name === color.name ? color.border : 'border-transparent'} hover:opacity-80`}/>))}
                    </div>
                )}
            </div>
            <button onClick={(e) => { handleStopPropagation(e); if(onSummarizeNote) onSummarizeNote(note); }} title="✨ Summarize" disabled={isSummarizingThisNote} className={`p-1 rounded hover:bg-opacity-20 hover:bg-black focus:outline-none disabled:opacity-50 ${currentNoteColor.text}`}><RenderIcon icon={isSummarizingThisNote ? Loader2 : TextQuote} size={14} spin={isSummarizingThisNote} /></button>
            <button onClick={(e) => { handleStopPropagation(e); if(onExpandNote) onExpandNote(note); }} title="✨ Expand" disabled={isExpandingThisNote} className={`p-1 rounded hover:bg-opacity-20 hover:bg-black focus:outline-none disabled:opacity-50 ${currentNoteColor.text}`}><RenderIcon icon={isExpandingThisNote ? Loader2 : Brain} size={14} spin={isExpandingThisNote} /></button>
            <button onClick={(e) => { handleStopPropagation(e); if(onEditNote) onEditNote(note); }} title="Edit Note" className={`p-1 rounded hover:bg-opacity-20 hover:bg-black focus:outline-none ${currentNoteColor.text}`}><RenderIcon icon={Edit3} size={14} /></button>
          </div>
          <span className={`opacity-70 ${currentNoteColor.text} text-[10px]`}>
            {note.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </Draggable>
  );
};

export default NoteItem;