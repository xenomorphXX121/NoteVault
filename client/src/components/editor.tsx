import { useState, useEffect, useCallback } from "react";
import { Share, MoreHorizontal, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useNotes } from "@/hooks/use-notes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type UpdateNote } from "@shared/schema";

interface EditorProps {
  noteId: string | null;
  categoryId: string | null;
  onNoteCreated: (noteId: string) => void;
}

export function Editor({ noteId, categoryId, onNoteCreated }: EditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: notes = [] } = useNotes(categoryId);
  
  const currentNote = notes.find(note => note.id === noteId);

  const createNoteMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; categoryId: string; tags: string[] }) => {
      const response = await apiRequest("POST", "/api/notes", data);
      return response.json();
    },
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      onNoteCreated(note.id);
      setLastSaved(new Date());
      toast({
        title: "Note created",
        description: "Your note has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (data: { id: string; updates: UpdateNote }) => {
      const response = await apiRequest("PUT", `/api/notes/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setLastSaved(new Date());
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    },
  });

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;
    
    setIsSaving(true);
    
    try {
      if (noteId && currentNote) {
        // Update existing note
        await updateNoteMutation.mutateAsync({
          id: noteId,
          updates: { title: title.trim(), content, tags },
        });
      } else if (categoryId) {
        // Create new note
        await createNoteMutation.mutateAsync({
          title: title.trim() || "Untitled",
          content,
          categoryId,
          tags,
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [title, content, tags, noteId, categoryId, currentNote, updateNoteMutation, createNoteMutation]);

  // Load note data when noteId changes
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setTags(currentNote.tags || []);
      setLastSaved(new Date(currentNote.updatedAt));
    } else {
      setTitle("");
      setContent("");
      setTags([]);
      setLastSaved(null);
    }
  }, [currentNote]);

  // Auto-save timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((title.trim() || content.trim()) && (noteId || categoryId)) {
        autoSave();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, tags, autoSave, noteId, categoryId]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getSaveStatus = () => {
    if (isSaving || createNoteMutation.isPending || updateNoteMutation.isPending) {
      return (
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Save className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </div>
      );
    }
    
    if (lastSaved) {
      return (
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Saved</span>
        </div>
      );
    }
    
    return null;
  };

  const getWordCount = () => {
    const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  };

  if (!categoryId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">Select a category to start writing</p>
          <p className="text-sm">Choose a category from the sidebar to create or view notes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="text-xl font-semibold bg-transparent border-none shadow-none px-0 focus-visible:ring-0"
            data-testid="input-note-title"
          />
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {getWordCount()} words
            </span>
            {getSaveStatus()}
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-share-note"
            >
              <Share className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-note-options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center space-x-4 mb-2">
          <span className="text-sm text-muted-foreground">Tags:</span>
          <div className="flex items-center space-x-1 flex-wrap">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
                data-testid={`tag-${tag}`}
              >
                {tag} ×
              </span>
            ))}
            <div className="flex items-center space-x-1">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="text-xs h-6 w-20 px-1"
                data-testid="input-new-tag"
              />
              <Button
                onClick={handleAddTag}
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                data-testid="button-add-tag"
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {lastSaved && (
          <div className="text-sm text-muted-foreground">
            Last modified: {lastSaved.toLocaleString()}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your note..."
        />
      </div>
    </div>
  );
}
