// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'; // Removed signInWithCustomToken if not used
import { getFirestore, collection, addDoc, doc, setDoc, deleteDoc, onSnapshot, query, Timestamp, writeBatch } from 'firebase/firestore';
import {
  Plus,
  RotateCcw,
  Palette as FormPalette,
  X as FormX,
  Loader2 as FormLoader,
  Sparkles as FormSparkles,
  Type as FormType,
  Droplet as FormDroplet,
} from 'lucide-react';
import NoteItem from './NoteItem'; 
import ErrorBoundary from './ErrorBoundary';

// Firebase configuration
const firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG || '{}');
const appId = process.env.REACT_APP_APP_ID_STICKY_NOTES || 'default-sticky-notes-app-local';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Appearance Constants
const NOTE_COLORS = [
  { name: 'Yellow', bg: 'bg-yellow-200', text: 'text-yellow-800', border: 'border-yellow-400' },
  { name: 'Pink', bg: 'bg-pink-200', text: 'text-pink-800', border: 'border-pink-400' },
  { name: 'Blue', bg: 'bg-blue-200', text: 'text-blue-800', border: 'border-blue-400' },
  { name: 'Green', bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-400' },
  { name: 'Purple', bg: 'bg-purple-200', text: 'text-purple-800', border: 'border-purple-400' },
  { name: 'Gray', bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-400' },
];
const DEFAULT_NOTE_COLOR = NOTE_COLORS[0];

// UPDATED PRESET_FONT_COLORS
const PRESET_FONT_COLORS = [
  { name: 'Black', textClass: 'text-black', bgClass: 'bg-black' },
  { name: 'Slate', textClass: 'text-slate-700', bgClass: 'bg-slate-700' },
  { name: 'Gray', textClass: 'text-gray-500', bgClass: 'bg-gray-500' },
  { name: 'Red', textClass: 'text-red-600', bgClass: 'bg-red-600' },
  { name: 'Orange', textClass: 'text-orange-600', bgClass: 'bg-orange-600' },
  { name: 'Amber', textClass: 'text-amber-600', bgClass: 'bg-amber-600' },
  { name: 'Yellow', textClass: 'text-yellow-600', bgClass: 'bg-yellow-600' },
  { name: 'Lime', textClass: 'text-lime-600', bgClass: 'bg-lime-600' },
  { name: 'Green', textClass: 'text-green-600', bgClass: 'bg-green-600' },
  { name: 'Emerald', textClass: 'text-emerald-600', bgClass: 'bg-emerald-600' },
  { name: 'Teal', textClass: 'text-teal-600', bgClass: 'bg-teal-600' },
  { name: 'Cyan', textClass: 'text-cyan-600', bgClass: 'bg-cyan-600' },
  { name: 'Sky', textClass: 'text-sky-600', bgClass: 'bg-sky-600' },
  { name: 'Blue', textClass: 'text-blue-600', bgClass: 'bg-blue-600' },
  { name: 'Indigo', textClass: 'text-indigo-600', bgClass: 'bg-indigo-600' },
  { name: 'Violet', textClass: 'text-violet-600', bgClass: 'bg-violet-600' },
  { name: 'Purple', textClass: 'text-purple-600', bgClass: 'bg-purple-600' },
  { name: 'Fuchsia', textClass: 'text-fuchsia-600', bgClass: 'bg-fuchsia-600' },
  { name: 'Pink', textClass: 'text-pink-600', bgClass: 'bg-pink-600' },
  { name: 'Rose', textClass: 'text-rose-600', bgClass: 'bg-rose-600' },
  { name: 'White', textClass: 'text-white', bgClass: 'bg-white' }, // Swatch for white will need border if on white bg
];
const DEFAULT_FONT_COLOR = PRESET_FONT_COLORS[0]; // Uses new structure

const PRESET_FONT_SIZES = [
  { name: 'Small', class: 'text-sm', value: 'sm' },
  { name: 'Medium', class: 'text-base', value: 'base' },
  { name: 'Large', class: 'text-lg', value: 'lg' },
  { name: 'XL', class: 'text-xl', value: 'xl' },
];
const DEFAULT_FONT_SIZE = PRESET_FONT_SIZES[1];

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-2xl max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100">
              <FormX size={22} />
            </button>
          </div>
          <div className="text-slate-600 text-sm leading-relaxed max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
              {children}
          </div>
        </div>
      </div>
    );
};

// Helper to render icons for App.js form/toolbar
const RenderIcon = ({ icon: IconComponent, size = 16, spin = false }) => (
  <IconComponent size={size} className={spin ? 'animate-spin' : ''} />
);

function App() {
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedNoteColor, setSelectedNoteColor] = useState(DEFAULT_NOTE_COLOR);
  const [selectedFontColor, setSelectedFontColor] = useState(DEFAULT_FONT_COLOR); // Uses new structure
  const [selectedFontSize, setSelectedFontSize] = useState(DEFAULT_FONT_SIZE);
  const [history, setHistory] = useState([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showNoteColorPicker, setShowNoteColorPicker] = useState(false);
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [focusedNoteId, setFocusedNoteId] = useState(null);
  const [isGeneratingInitialNote, setIsGeneratingInitialNote] = useState(false);
  const [summarizingNoteId, setSummarizingNoteId] = useState(null);
  const [summaryContent, setSummaryContent] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [expandingNoteId, setExpandingNoteId] = useState(null);
  const [apiError, setApiError] = useState('');
  const [firebaseError, setFirebaseError] = useState('');

  const notesCollectionName = 'stickyNotes';
  const notesCollectionPath = `artifacts/${appId}/users/${userId}/${notesCollectionName}`;
  const textareaRef = useRef(null);

  // Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Firebase Auth: Error during anonymous sign-in: ", error);
          setFirebaseError("Could not sign in. Some features may be unavailable.");
          setUserId(`fallback-${crypto.randomUUID()}`);
          setIsAuthReady(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore real-time listener for notes
  useEffect(() => {
    if (!isAuthReady || !userId) return;
    const q = query(collection(db, notesCollectionPath));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notesData = [];
      querySnapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() });
      });
      // Sort by createdAt ascending to ensure consistent initial stacking for x,y defaults
      notesData.sort((a, b) => (a.createdAt?.toDate() || 0) - (b.createdAt?.toDate() || 0)); 
      
      const notesWithPositions = notesData.map((note, index) => {
        const defaultX = (index % 10) * 20 + 10; 
        const defaultY = Math.floor(index / 10) * 20 + 10;
        // Assign zIndex based on original fetch order (older notes lower)
        // focusedNoteId will override this for the active note
        const originalZIndex = index + 1; 
        return {
          ...note,
          x: typeof note.x === 'number' ? note.x : defaultX,
          y: typeof note.y === 'number' ? note.y : defaultY,
          zIndex: note.id === focusedNoteId ? notesData.length + 100 : originalZIndex, // Apply focus zIndex here
          originalZIndex: originalZIndex, // Store for non-focused state
        };
      });
      // Re-sort by zIndex for rendering order if needed, or rely on CSS z-index
      // For simplicity, we'll rely on CSS z-index prop in NoteItem.
      setNotes(notesWithPositions);

      if (notesWithPositions.length > 0 && !focusedNoteId) {
        setFocusedNoteId(notesWithPositions[notesWithPositions.length - 1].id); 
      } else if (focusedNoteId) {
        // Ensure focused note still has highest zIndex after a data refresh
         setNotes(prevNotes => prevNotes.map(n => ({
            ...n,
            zIndex: n.id === focusedNoteId ? prevNotes.length + 100 : n.originalZIndex
        })));
      }
    }, (error) => {
      console.error("Error fetching notes: ", error);
      setFirebaseError("Could not load notes. Please check your connection.");
    });
    return () => unsubscribe();
  }, [isAuthReady, userId, notesCollectionPath, focusedNoteId]); // Added focusedNoteId to re-calc zIndex

  // Gemini API Call Helper
  const callGeminiAPI = async (promptText) => {
    setApiError('');
    const apiKeyFromEnv = process.env.REACT_APP_GEMINI_API_KEY || "";
    if (!apiKeyFromEnv) {
      const msg = "Gemini API Key is missing. Configure REACT_APP_GEMINI_API_KEY in .env and restart.";
      console.error(msg); setApiError(msg); throw new Error(msg);
    }
    let chatHistory = [{ role: "user", parts: [{ text: promptText }] }];
    const payload = { contents: chatHistory };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKeyFromEnv}`;
    try {
      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) {
        const errorData = await response.json(); console.error("Gemini API Error Response:", errorData);
        let userMessage = errorData.error?.message || `API Error: ${response.status} ${response.statusText}`;
        if (response.status === 429) userMessage = "AI service is busy. Please try again shortly.";
        else if (response.status === 400 && errorData.error?.message.includes("prompt was blocked")) userMessage = "Request blocked by content safety filters.";
        setApiError(userMessage); throw new Error(userMessage);
      }
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) return result.candidates[0].content.parts[0].text;
      else { const msg = "Unexpected AI response format."; console.error(msg, result); setApiError(msg); throw new Error(msg); }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      if (!apiError) setApiError(error.message || "Unknown error with AI service.");
      throw error;
    }
  };

  const handleGenerateInitialNote = async () => { /* ... as before ... */ 
    if (!newNoteText.trim()) { setApiError("Please enter a topic to generate a note."); setTimeout(() => setApiError(''), 3000); return; }
    setIsGeneratingInitialNote(true);
    try { 
      const prompt = `Generate detailed content for a sticky note based on the following topic: "${newNoteText}"`; 
      const generatedText = await callGeminiAPI(prompt); 
      setNewNoteText(generatedText); 
    } catch (error) { /* error already set by callGeminiAPI */ } 
    finally { setIsGeneratingInitialNote(false); }
  };
  const handleSummarizeNote = async (note) => { /* ... as before ... */ 
    setSummarizingNoteId(note.id); setShowSummaryModal(true); setSummaryContent("✨ Generating summary...");
    try { 
      const prompt = `Summarize this note concisely: "${note.text}"`; 
      const summary = await callGeminiAPI(prompt); 
      setSummaryContent(summary); 
    } catch (error) { setSummaryContent(`Could not generate summary: ${apiError || error.message}`); }
  };
  const closeSummaryModal = () => { /* ... as before ... */ 
    setShowSummaryModal(false); setSummaryContent(''); setSummarizingNoteId(null); setApiError(''); 
  };
  const handleExpandNote = async (note) => { /* ... as before, ensure note object structure is handled ... */ 
    setExpandingNoteId(note.id);
    try {
      const prompt = `Expand on this note, adding details or related ideas: "${note.text}"`;
      const expandedText = await callGeminiAPI(prompt);
      handleFocusNote(note.id); 
      setEditingNote(note); setNewNoteText(expandedText); 
      setSelectedNoteColor(note.noteColor || DEFAULT_NOTE_COLOR); 
      setSelectedFontColor(note.fontColor || DEFAULT_FONT_COLOR);
      setSelectedFontSize(note.fontSize || DEFAULT_FONT_SIZE);
      if (textareaRef.current) textareaRef.current.focus(); 
      setShowNoteColorPicker(true); 
    } catch (error) { /* error already set by callGeminiAPI */ } 
    finally { setExpandingNoteId(null); }
  };

  const addHistory = (action) => { setHistory(prevHistory => [action, ...prevHistory].slice(0, 10)); };

  const handleAddOrUpdateNote = async (e) => {
    if (e) e.preventDefault();
    if (!newNoteText.trim()) return;
    if (!isAuthReady || !userId) { console.error("Auth not ready."); return; }
    const now = Timestamp.now();
    const notePayloadBase = {
      text: newNoteText,
      noteColor: selectedNoteColor,
      fontColor: selectedFontColor, // Will be the full object e.g. {name: 'Red', textClass: '...', bgClass: '...'}
      fontSize: selectedFontSize,
      updatedAt: now,
    };
    if (editingNote) {
      const noteRef = doc(db, notesCollectionPath, editingNote.id);
      const oldNoteData = { ...notes.find(n => n.id === editingNote.id) };
      const updatedNoteData = { ...editingNote, ...notePayloadBase };
      try {
        await setDoc(noteRef, updatedNoteData, { merge: true });
        addHistory({ type: 'UPDATE_NOTE', payload: { noteId: editingNote.id, oldData: oldNoteData, newData: updatedNoteData } });
        setEditingNote(null);
      } catch (error) { console.error("Error updating note: ", error); setFirebaseError("Failed to update note."); }
    } else {
      const newNoteX = 20 + (notes.length % 10) * 25; 
      const newNoteY = 20 + Math.floor(notes.length / 10) * 25;
      const newNoteData = {
        ...notePayloadBase, isStruckThrough: false, createdAt: now, userId: userId,
        x: newNoteX, y: newNoteY, 
        originalZIndex: notes.length + 1, // Set originalZIndex
        zIndex: notes.length + 100, // New notes start on top
      };
      try {
        const docRef = await addDoc(collection(db, notesCollectionPath), newNoteData);
        addHistory({ type: 'ADD_NOTE', payload: { noteId: docRef.id, noteData: newNoteData } });
        // Firestore listener will pick it up, then focusedNoteId logic will apply for zIndex
        setFocusedNoteId(docRef.id); 
      } catch (error) { console.error("Error adding note: ", error); setFirebaseError("Failed to add note."); }
    }
    setNewNoteText(''); setSelectedNoteColor(DEFAULT_NOTE_COLOR); 
    setSelectedFontColor(DEFAULT_FONT_COLOR); setSelectedFontSize(DEFAULT_FONT_SIZE);
    setShowNoteColorPicker(false); setShowFontColorPicker(false); setShowFontSizePicker(false);
  };

  const handleFocusNote = (noteId) => {
    setFocusedNoteId(noteId);
    // Update zIndex for all notes: focused one highest, others based on original order or stored zIndex
    setNotes(prevNotes => {
        const maxZ = prevNotes.length + 100; // Ensure focused is always on top
        return prevNotes.map(n => ({
            ...n,
            // If note has an originalZIndex from fetch, use that, otherwise use its current index
            zIndex: n.id === noteId ? maxZ : (n.originalZIndex !== undefined ? n.originalZIndex : prevNotes.indexOf(n) + 1)
        }));
    });
  };

  const handleEditNote = (note) => { /* ... as before ... */ 
    handleFocusNote(note.id); setEditingNote(note); setNewNoteText(note.text);
    setSelectedNoteColor(note.noteColor || DEFAULT_NOTE_COLOR);
    setSelectedFontColor(note.fontColor || DEFAULT_FONT_COLOR);
    setSelectedFontSize(note.fontSize || DEFAULT_FONT_SIZE);
    if (textareaRef.current) textareaRef.current.focus();
    setShowNoteColorPicker(true); setShowFontColorPicker(false); setShowFontSizePicker(false);
  };
  const handleCancelEdit = () => { /* ... as before ... */ 
    setEditingNote(null); setNewNoteText('');
    setSelectedNoteColor(DEFAULT_NOTE_COLOR); setSelectedFontColor(DEFAULT_FONT_COLOR); setSelectedFontSize(DEFAULT_FONT_SIZE);
    setShowNoteColorPicker(false); setShowFontColorPicker(false); setShowFontSizePicker(false);
  };
  const handleDeleteNote = async (noteId) => { /* ... add setFirebaseError ... */ 
    if (!isAuthReady || !userId) return;
    const noteToDelete = notes.find(note => note.id === noteId);
    if (!noteToDelete) return;
    try {
      await deleteDoc(doc(db, notesCollectionPath, noteId));
      addHistory({ type: 'DELETE_NOTE', payload: { noteData: noteToDelete } });
      if (focusedNoteId === noteId) { 
        const remainingNotes = notes.filter(n => n.id !== noteId);
        // Sort remaining by originalZIndex to pick the "next highest" sensible one.
        // Or simply the last one if sorted by time.
        remainingNotes.sort((a,b) => (a.originalZIndex || 0) - (b.originalZIndex || 0));
        setFocusedNoteId(remainingNotes.length > 0 ? remainingNotes[remainingNotes.length -1].id : null);
      }
    } catch (error) { console.error("Error deleting note: ", error); setFirebaseError("Failed to delete note.");}
  };
  const handleToggleStrikeThrough = async (noteId) => { /* ... add setFirebaseError ... */ 
    if (!isAuthReady || !userId) return;
    const noteToUpdate = notes.find(note => note.id === noteId);
    if (!noteToUpdate) return;
    const oldData = { ...noteToUpdate };
    const updatedFields = { isStruckThrough: !noteToUpdate.isStruckThrough, updatedAt: Timestamp.now() };
    const newData = { ...noteToUpdate, ...updatedFields };
    try {
      const noteRef = doc(db, notesCollectionPath, noteId);
      await setDoc(noteRef, updatedFields, { merge: true });
      addHistory({ type: 'UPDATE_NOTE', payload: { noteId, oldData, newData } });
    } catch (error) { console.error("Error updating strike-through: ", error); setFirebaseError("Failed to update note status.");}
  };
  const handleChangeNoteBgColorOnItem = async (noteId, newNoteColor) => { /* ... add setFirebaseError ... */ 
    if (!isAuthReady || !userId) return;
    const noteToUpdate = notes.find(note => note.id === noteId);
    if (!noteToUpdate) return;
    const oldData = { ...noteToUpdate };
    const updatedFields = { noteColor: newNoteColor, updatedAt: Timestamp.now() };
    const newData = { ...noteToUpdate, ...updatedFields };
    try {
      const noteRef = doc(db, notesCollectionPath, noteId);
      await setDoc(noteRef, updatedFields, { merge: true });
      addHistory({ type: 'UPDATE_NOTE', payload: { noteId, oldData, newData } });
    } catch (error) { console.error("Error updating note color: ", error); setFirebaseError("Failed to update note color.");}
  };

  const handleDragStop = async (noteId, newX, newY) => {
    const noteToUpdate = notes.find(n => n.id === noteId);
    if (!noteToUpdate || (noteToUpdate.x === newX && noteToUpdate.y === newY)) return;
    const oldNoteData = { ...noteToUpdate };
    const updatedFields = { x: newX, y: newY, updatedAt: Timestamp.now() };
    setNotes(prevNotes => prevNotes.map(n => n.id === noteId ? { ...n, ...updatedFields } : n ));
    try {
      const noteRef = doc(db, notesCollectionPath, noteId);
      await setDoc(noteRef, updatedFields, { merge: true });
      const newData = { ...noteToUpdate, ...updatedFields };
      addHistory({ type: 'UPDATE_NOTE', payload: { noteId, oldData: oldNoteData, newData } });
    } catch (error) {
      console.error("Error updating note position:", error);
      setNotes(prevNotes => prevNotes.map(n => n.id === noteId ? { ...oldNoteData } : n ));
      setFirebaseError("Failed to save note position.");
    }
  };

  const handleUndo = async () => {
    if (history.length === 0 || !isAuthReady || !userId) return;
    const lastAction = history[0];
    setHistory(prevHistory => prevHistory.slice(1));
    const batch = writeBatch(db);
    let noteIdToFocusAfterUndo = focusedNoteId;

    try {
      if (lastAction.type === 'ADD_NOTE') {
        const noteRef = doc(db, notesCollectionPath, lastAction.payload.noteId);
        batch.delete(noteRef);
        noteIdToFocusAfterUndo = notes.length > 1 ? notes[notes.length - 2]?.id : null; // try to focus previous note
      } else if (lastAction.type === 'DELETE_NOTE') {
        let noteDataToRestore = { ...lastAction.payload.noteData };
        const originalId = noteDataToRestore.id; 
        delete noteDataToRestore.id;
        // Ensure Timestamps are correct
        if (noteDataToRestore.createdAt && !(noteDataToRestore.createdAt instanceof Timestamp) && noteDataToRestore.createdAt.seconds) {
          noteDataToRestore.createdAt = new Timestamp(noteDataToRestore.createdAt.seconds, noteDataToRestore.createdAt.nanoseconds);
        }
        if (noteDataToRestore.updatedAt && !(noteDataToRestore.updatedAt instanceof Timestamp) && noteDataToRestore.updatedAt.seconds) {
          noteDataToRestore.updatedAt = new Timestamp(noteDataToRestore.updatedAt.seconds, noteDataToRestore.updatedAt.nanoseconds);
        }
        const noteRef = doc(db, notesCollectionPath, originalId);
        batch.set(noteRef, noteDataToRestore);
        noteIdToFocusAfterUndo = originalId;
      } else if (lastAction.type === 'UPDATE_NOTE') {
        const noteRef = doc(db, notesCollectionPath, lastAction.payload.noteId);
        const fieldsToRestore = { ...lastAction.payload.oldData };
        delete fieldsToRestore.id; // Do not attempt to write the 'id' field itself during an update
        // delete fieldsToRestore.createdAt; // Usually createdAt should not be changed by an update undo
        fieldsToRestore.updatedAt = Timestamp.now();
        batch.set(noteRef, fieldsToRestore, { merge: true }); // Use merge to only update specified fields
        noteIdToFocusAfterUndo = lastAction.payload.noteId;
      }
      await batch.commit();
      // Firestore listener will eventually update local state. 
      // For more immediate UI feedback for UPDATE undo:
      if (lastAction.type === 'UPDATE_NOTE') {
        setNotes(prevNotes => prevNotes.map(n => 
            n.id === lastAction.payload.noteId ? { ...lastAction.payload.oldData, id: lastAction.payload.noteId } : n
        ));
      }
      if(noteIdToFocusAfterUndo) {
        handleFocusNote(noteIdToFocusAfterUndo);
      }

    } catch (error) {
      console.error("Error undoing action: ", error);
      setHistory(prevHistory => [lastAction, ...prevHistory]); 
      setFirebaseError("Failed to undo action.");
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 p-4 sm:p-6 font-sans flex flex-col overflow-hidden">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-slate-700">Sticky Notes AI ✨</h1>
          {userId && <p className="text-xs text-slate-500 mt-1">User ID: {userId.substring(0,10)}...</p>}
        </header>

        {(apiError || firebaseError) && (
          <div 
            className={`fixed top-5 right-5 max-w-md z-50 p-3 rounded-lg shadow-lg text-sm
                        ${apiError ? 'bg-red-100 border-red-400 text-red-700' : 'bg-orange-100 border-orange-400 text-orange-700'}`}
            role="alert"
          >
            <div className="flex">
              <div className="py-1"><svg className={`fill-current h-6 w-6 ${apiError ? 'text-red-500' : 'text-orange-500'} mr-4`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/></svg></div>
              <div>
                <p className="font-bold">Error</p>
                <p className="text-xs">{apiError || firebaseError}</p>
              </div>
              <button onClick={() => { setApiError(''); setFirebaseError(''); }} className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-current rounded-lg focus:ring-2 focus:ring-gray-400 p-1.5 hover:bg-gray-200 inline-flex h-8 w-8" aria-label="Dismiss">
                <span className="sr-only">Dismiss</span><FormX />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleAddOrUpdateNote} className="mb-8 p-4 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
            <textarea ref={textareaRef} value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} placeholder={editingNote ? "Edit your note..." : "Type a new note, or a topic to ✨generate..."} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow resize-none" rows="4"/>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                {/* BG Color Picker */}
                <div className="relative">
                    <button type="button" onClick={() => {setShowNoteColorPicker(p => !p); setShowFontColorPicker(false); setShowFontSizePicker(false);}} className={`w-full justify-center p-2 rounded-lg border flex items-center space-x-2 ${selectedNoteColor.border} ${selectedNoteColor.bg} ${selectedNoteColor.text} hover:opacity-90 transition-opacity`}><RenderIcon icon={FormPalette} size={18}/><span>BG: {selectedNoteColor.name}</span></button>
                    {showNoteColorPicker && (<div className="absolute top-full mt-1 z-20 bg-white p-2 rounded-md shadow-lg border border-gray-200 flex flex-wrap gap-1 w-48"> {NOTE_COLORS.map(color => (<button key={color.name} type="button" title={color.name} onClick={() => { setSelectedNoteColor(color); setShowNoteColorPicker(false); }} className={`w-7 h-7 rounded-full ${color.bg} border-2 ${selectedNoteColor.name === color.name ? color.border : 'border-transparent'} hover:opacity-80`}/>))}</div>)}
                </div>
                {/* Font Color Picker - UPDATED */}
                <div className="relative">
                    <button type="button" onClick={() => {setShowFontColorPicker(p => !p); setShowNoteColorPicker(false); setShowFontSizePicker(false);}} className={`w-full justify-center p-2 rounded-lg border border-gray-300 flex items-center space-x-2 hover:border-gray-400 transition-opacity ${selectedFontColor.textClass}`}><RenderIcon icon={FormDroplet} size={18}/><span>Font: {selectedFontColor.name}</span></button>
                    {showFontColorPicker && (<div className="absolute top-full mt-1 z-20 bg-white p-2 rounded-md shadow-lg border border-gray-200 grid grid-cols-5 gap-1.5 w-auto min-w-[150px] max-h-48 overflow-y-auto">
                        {PRESET_FONT_COLORS.map(colorOption => (<button key={colorOption.name} type="button" title={colorOption.name} onClick={() => { setSelectedFontColor(colorOption); setShowFontColorPicker(false); }} className={`w-6 h-6 rounded-full ${colorOption.bgClass} border hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 ${selectedFontColor.name === colorOption.name ? 'ring-2 ring-sky-500 ring-offset-1 border-sky-500' : (colorOption.name === 'White' ? 'border-gray-400' : 'border-transparent')}`}>{colorOption.name === 'White' && ! (selectedFontColor.name === 'White') && <span className="block w-full h-full rounded-full border border-gray-300"></span>}</button>))}
                    </div>)}
                </div>
                {/* Font Size Picker */}
                <div className="relative">
                    <button type="button" onClick={() => {setShowFontSizePicker(p => !p); setShowNoteColorPicker(false); setShowFontColorPicker(false);}} className="w-full justify-center p-2 rounded-lg border border-gray-300 flex items-center space-x-2 hover:border-gray-400 transition-opacity"><RenderIcon icon={FormType} size={18}/><span>Size: {selectedFontSize.name}</span></button>
                    {showFontSizePicker && (<div className="absolute top-full mt-1 z-20 bg-white p-2 rounded-md shadow-lg border border-gray-200 flex flex-col gap-1 w-full">{PRESET_FONT_SIZES.map(size => (<button key={size.name} type="button" title={size.name} onClick={() => { setSelectedFontSize(size); setShowFontSizePicker(false); }} className={`p-1 text-left rounded hover:bg-sky-100 ${selectedFontSize.name === size.name ? 'font-bold text-sky-600': ''} ${size.class}`}>{size.name}</button>))}</div>)}
                </div>
            </div>
            <div className="mt-4 flex space-x-2 w-full justify-end">
                {editingNote && (<button type="button" onClick={handleCancelEdit} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"><RenderIcon icon={FormX} size={18}/> Cancel</button>)}
                <button type="button" onClick={handleGenerateInitialNote} disabled={isGeneratingInitialNote || !newNoteText.trim() || editingNote} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center space-x-2 shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"> {isGeneratingInitialNote ? <RenderIcon icon={FormLoader} size={18} spin={true}/> : <RenderIcon icon={FormSparkles} size={18}/>} <span>Generate</span> </button>
                <button type="submit" className="px-5 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2 shadow hover:shadow-md"> <RenderIcon icon={Plus} size={18}/> <span>{editingNote ? 'Save Note' : 'Add Note'}</span> </button>
            </div>
        </form>

        <div className="mb-6 flex justify-center items-center max-w-2xl mx-auto">
          <button onClick={handleUndo} disabled={history.length === 0} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex items-center space-x-2 shadow hover:shadow-md"><RenderIcon icon={RotateCcw} size={18}/> <span>Undo</span></button>
        </div>

        <div className="flex-grow relative w-full max-w-6xl mx-auto min-h-[600px] p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50/30 overflow-auto">
          {!isAuthReady && (<div className="absolute inset-0 flex items-center justify-center text-gray-500"><RenderIcon icon={FormLoader} size={20} spin={true} /><span className="ml-2">Initializing...</span></div>)}
          {isAuthReady && notes.length === 0 && (<p className="absolute inset-0 flex items-center justify-center text-gray-500">No notes yet. Add one above!</p>)}
          
          {isAuthReady && notes.map((note) => (
              <NoteItem 
                  key={note.id} 
                  note={note} 
                  isFocused={focusedNoteId === note.id}
                  onFocusNote={handleFocusNote}
                  onDragStop={handleDragStop}
                  onEditNote={handleEditNote}
                  onDeleteNote={handleDeleteNote}
                  onToggleStrikeThrough={handleToggleStrikeThrough}
                  onChangeBgColor={handleChangeNoteBgColorOnItem}
                  onSummarizeNote={handleSummarizeNote}
                  onExpandNote={handleExpandNote}
                  isSummarizingThisNote={summarizingNoteId === note.id && showSummaryModal}
                  isExpandingThisNote={expandingNoteId === note.id}
              />
          ))}
        </div>
        
        <Modal isOpen={showSummaryModal} onClose={closeSummaryModal} title="✨ Note Summary">
          {summarizingNoteId && summaryContent.includes("Generating summary...") ? <div className="flex items-center justify-center p-4"><RenderIcon icon={FormLoader} size={24} spin={true} /><span className="ml-2">Loading...</span></div> : summaryContent }
        </Modal>

        <footer className="text-center mt-12 py-4 text-sm text-slate-500 border-t border-slate-200"> Sticky Notes App - Enhanced with Gemini AI ✨ </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;