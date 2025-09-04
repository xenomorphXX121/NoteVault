import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { NotesPanel } from "@/components/notes-panel";
import { Editor } from "@/components/editor";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Notepad() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedNoteId(null);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteId(noteId);
  };

  const handleNewNote = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedNoteId(null);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <title>Online Notepad - Category-Based Note Taking</title>
      
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
          data-testid="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed left-0 top-0 h-full z-50' : 'relative'}
        w-80 bg-card border-r border-border flex-col
        ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        transition-transform duration-300 ease-in-out
        ${isMobile ? 'flex' : 'hidden md:flex'}
      `}>
        <Sidebar
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
          onNewNote={handleNewNote}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Notes Panel */}
        <div className="w-96 bg-card border-r border-border flex flex-col">
          <NotesPanel
            categoryId={selectedCategoryId}
            selectedNoteId={selectedNoteId}
            onNoteSelect={handleNoteSelect}
            searchQuery={searchQuery}
            onToggleSidebar={() => setSidebarOpen(true)}
            isMobile={isMobile}
          />
        </div>

        {/* Editor */}
        <div className="flex-1">
          <Editor
            noteId={selectedNoteId}
            categoryId={selectedCategoryId}
            onNoteCreated={setSelectedNoteId}
          />
        </div>
      </div>
    </div>
  );
}
