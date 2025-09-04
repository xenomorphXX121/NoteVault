import { useState } from "react";
import { Search, Plus, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryDialog } from "@/components/category-dialog";
import { useCategories } from "@/hooks/use-categories";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SidebarProps {
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
  onNewNote: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  isMobile: boolean;
}

export function Sidebar({
  selectedCategoryId,
  onCategorySelect,
  onNewNote,
  searchQuery,
  onSearchChange,
  onClose,
  isMobile,
}: SidebarProps) {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const { data: categories = [], isLoading } = useCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Category deleted",
        description: "Category and all its notes have been deleted",
      });
      // If the deleted category was selected, clear selection
      if (selectedCategoryId && categories.find(c => c.id === selectedCategoryId)) {
        onCategorySelect(categories[0]?.id || "");
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const handleNewNote = () => {
    if (!selectedCategoryId && categories.length > 0) {
      onCategorySelect(categories[0].id);
      onNewNote(categories[0].id);
    } else if (selectedCategoryId) {
      onNewNote(selectedCategoryId);
    } else {
      toast({
        title: "No categories",
        description: "Please create a category first",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">My Notepad</h1>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            data-testid="input-search-notes"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Categories
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCategoryDialogOpen(true)}
            className="h-6 w-6"
            data-testid="button-add-category"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-1">
          {categories.map((category) => (
            <div
              key={category.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-md cursor-pointer group transition-colors hover:bg-accent",
                selectedCategoryId === category.id && "bg-accent"
              )}
              onClick={() => onCategorySelect(category.id)}
              data-testid={`category-item-${category.id}`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium truncate">{category.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  ({category.noteCount})
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`button-category-menu-${category.id}`}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setEditingCategory(category.id)}
                    data-testid={`button-edit-category-${category.id}`}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${category.name}"? This will also delete all notes in this category.`)) {
                        deleteCategoryMutation.mutate(category.id);
                      }
                    }}
                    data-testid={`button-delete-category-${category.id}`}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={handleNewNote}
          className="w-full"
          data-testid="button-new-note"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Category Dialog */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        categoryId={editingCategory}
        onClose={() => {
          setCategoryDialogOpen(false);
          setEditingCategory(null);
        }}
      />
    </div>
  );
}
