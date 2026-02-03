import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Note, NoteCategory } from '../types';
import { Plus, Search, Tag, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { NOTE_CATEGORIES, NOTE_CATEGORY_COLORS } from '../constants';

interface NotesProps {
  notes: Note[];
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (id: string, content: string) => void;
  updateNoteTitle: (id: string, title: string) => void;
  deleteNote: (id: string) => void;
}

// Custom hook for debouncing
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

const Notes: React.FC<NotesProps> = ({ notes, addNote, updateNote, updateNoteTitle, deleteNote }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<NoteCategory>('Geral');

  // Local state for the editor (prevents lag while typing)
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');

  const activeNote = notes.find(n => n.id === selectedNoteId);

  // Sync local state when a different note is selected
  useEffect(() => {
    if (activeNote) {
      setLocalTitle(activeNote.title);
      setLocalContent(activeNote.content);
    }
  }, [selectedNoteId, activeNote?.id]);

  // Debounced save functions (saves 500ms after user stops typing)
  const debouncedSaveTitle = useDebounce((id: string, title: string) => {
    updateNoteTitle(id, title);
  }, 500);

  const debouncedSaveContent = useDebounce((id: string, content: string) => {
    updateNote(id, content);
  }, 500);

  // Handle title change - update local state immediately, debounce API call
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);
    if (activeNote) {
      debouncedSaveTitle(activeNote.id, newTitle);
    }
  };

  // Handle content change - update local state immediately, debounce API call
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    if (activeNote) {
      debouncedSaveContent(activeNote.id, newContent);
    }
  };

  const handleCreateNote = () => {
    const newNote = {
      title: 'Nova Nota',
      content: '',
      updatedAt: new Date(),
      tags: [],
      category: newNoteCategory
    };
    addNote(newNote);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in max-h-[calc(100vh-6rem)]">
      <h2 className="text-2xl font-bold text-sys-text-main dark:text-dark-text tracking-tight shrink-0 pl-2">Notas</h2>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Sidebar List */}
        <div className="w-80 flex flex-col bg-sys-card dark:bg-dark-card rounded-3xl border border-sys-border dark:border-dark-border shadow-soft overflow-hidden">
          <div className="p-6 border-b border-sys-border dark:border-dark-border">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 text-sys-text-sub" size={18} />
              <input
                type="text"
                placeholder="Buscar notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-sys-bg dark:bg-dark-bg rounded-xl text-sm outline-none focus:ring-1 ring-soft-lilac dark:text-dark-text border border-transparent placeholder-sys-text-sub transition-all"
              />
            </div>
            <div className="flex gap-2 mb-4">
              <select
                value={newNoteCategory}
                onChange={(e) => setNewNoteCategory(e.target.value as NoteCategory)}
                className="flex-1 bg-sys-bg dark:bg-dark-bg px-3 py-2.5 rounded-xl text-sm outline-none dark:text-dark-text border border-transparent focus:border-soft-lilac"
              >
                {NOTE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreateNote}
              className="w-full flex items-center justify-center gap-2 bg-soft-lilac hover:bg-soft-lilac/90 text-white py-2.5 rounded-xl transition-colors font-semibold text-sm"
            >
              <Plus size={18} />
              Criar Nota
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={`w-full text-left p-4 rounded-xl transition-all border relative group cursor-pointer ${selectedNoteId === note.id ? 'bg-sys-bg dark:bg-dark-bg border-soft-lilac' : 'border-transparent hover:bg-sys-bg/50 dark:hover:bg-dark-bg/50 text-sys-text-sec dark:text-sys-text-sub'}`}
                onClick={() => setSelectedNoteId(note.id)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold truncate text-sm text-sys-text-main dark:text-dark-text mb-1 pr-6">{note.title}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                      if (selectedNoteId === note.id) setSelectedNoteId(null);
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-sys-text-sub hover:text-calm-coral transition-all p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className={`flex items-center gap-1 mb-1 ${NOTE_CATEGORY_COLORS[note.category]}`}>
                  <Tag size={10} />
                  <span className="text-[10px] font-semibold">{note.category}</span>
                </div>
                <p className="text-xs text-sys-text-sub truncate">
                  {note.content || "Sem conteúdo..."}
                </p>
                <span className="text-[10px] text-sys-text-sub mt-2 block font-medium opacity-80">
                  {format(note.updatedAt, 'dd/MM/yyyy')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 bg-sys-card dark:bg-dark-card rounded-3xl border border-sys-border dark:border-dark-border shadow-soft overflow-hidden flex flex-col relative">
          {/* Soft Background Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-soft-lilac/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>

          {activeNote ? (
            <>
              <div className="p-8 pb-4 border-b border-sys-border dark:border-dark-border flex justify-between items-center z-10">
                <input
                  value={localTitle}
                  onChange={handleTitleChange}
                  className="text-3xl font-bold text-sys-text-main dark:text-dark-text outline-none bg-transparent w-full"
                />
              </div>
              <div className={`px-8 py-2 flex items-center gap-2 text-xs uppercase tracking-wide font-bold z-10 ${NOTE_CATEGORY_COLORS[activeNote.category]}`}>
                <Tag size={14} />
                <span>{activeNote.category}</span>
              </div>
              <textarea
                value={localContent}
                onChange={handleContentChange}
                placeholder="Comece a digitar..."
                className="flex-1 w-full p-8 pt-6 outline-none resize-none text-sys-text-main dark:text-dark-text leading-relaxed bg-transparent z-10 custom-scrollbar text-base"
              />
              <div className="p-4 border-t border-sys-border dark:border-dark-border text-right text-xs text-sys-text-sub z-10 font-medium bg-sys-card dark:bg-dark-card">
                {localContent.length} caracteres
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-sys-text-sub z-10">
              <FileText size={64} className="mb-4 opacity-20 text-soft-lilac" strokeWidth={1} />
              <p className="font-medium">Selecione ou crie uma nota para começar.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Notes;