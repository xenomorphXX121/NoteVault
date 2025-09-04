import { Menu, MoreHorizontal, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/use-notes";
import { useCategories } from "@/hooks/use-categories";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotesPanelProps {
  categoryId: string | null;
  selectedNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  searchQuery: string;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

export function NotesPanel({
  categoryId,
  selectedNoteId,
  onNoteSelect,
  searchQuery,
  onToggleSidebar,
  isMobile,
}: NotesPanelProps) {
  const { data: notes = [], isLoading } = useNotes(categoryId, searchQuery);
  const { data: categories = [] } = useCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentCategory = categories.find(cat => cat.id === categoryId);

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Note deleted",
        description: "Note has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const getPreviewText = (content: string) => {
    // Strip HTML tags and get first 100 characters
    const stripped = content.replace(/<[^>]*>/g, '');
    return stripped.length > 100 ? stripped.substring(0, 100) + '...' : stripped;
  };

  const getRelativeTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              data-testid="button-toggle-sidebar"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-lg font-semibold flex-1">
            {currentCategory?.name || "All Notes"}
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-sort-notes"
            >
              <SortAsc className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-filter-notes"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {notes.length} notes
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading notes...</div>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-muted-foreground">
              <p>No notes found</p>
              {searchQuery && (
                <p className="text-sm mt-1">Try adjusting your search</p>
              )}
            </div>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "border-b border-border p-4 cursor-pointer transition-colors hover:bg-accent group",
                selectedNoteId === note.id && "bg-accent"
              )}
              onClick={() => onNoteSelect(note.id)}
              data-testid={`note-item-${note.id}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-foreground truncate flex-1">
                  {note.title || "Untitled"}
                </h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {getRelativeTime(note.updatedAt)}
                </span>
              </div>
              
              {note.content && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {getPreviewText(note.content)}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {note.tags && note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`button-note-menu-${note.id}`}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete "${note.title || 'Untitled'}"?`)) {
                          deleteNoteMutation.mutate(note.id);
                        }
                      }}
                      data-testid={`button-delete-note-${note.id}`}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
