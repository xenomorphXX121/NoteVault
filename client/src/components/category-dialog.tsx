import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/use-categories";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId?: string | null;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#ef4444", // red
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#ec4899", // pink
];

export function CategoryDialog({ open, onOpenChange, categoryId, onClose }: CategoryDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: categories = [] } = useCategories();
  
  const existingCategory = categories.find(cat => cat.id === categoryId);
  const isEditing = !!categoryId;

  useEffect(() => {
    if (existingCategory) {
      setName(existingCategory.name);
      setColor(existingCategory.color);
    } else {
      setName("");
      setColor(PRESET_COLORS[0]);
    }
  }, [existingCategory]);

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category created",
        description: "Your category has been created successfully",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; color: string }) => {
      const response = await apiRequest("PUT", `/api/categories/${data.id}`, {
        name: data.name,
        color: data.color,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category updated",
        description: "Your category has been updated successfully",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Category deleted",
        description: "Your category and all its notes have been deleted",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setName("");
    setColor(PRESET_COLORS[0]);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && categoryId) {
      updateCategoryMutation.mutate({ id: categoryId, name: name.trim(), color });
    } else {
      createCategoryMutation.mutate({ name: name.trim(), color });
    }
  };

  const handleDelete = () => {
    if (categoryId) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-category">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your category details" 
              : "Create a new category to organize your notes"
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                className="col-span-3"
                data-testid="input-category-name"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Color</Label>
              <div className="col-span-3 flex space-x-2 flex-wrap">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => setColor(presetColor)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === presetColor ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: presetColor }}
                    data-testid={`color-${presetColor}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteCategoryMutation.isPending}
                data-testid="button-delete-category"
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              data-testid="button-cancel-category"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              data-testid="button-save-category"
            >
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
