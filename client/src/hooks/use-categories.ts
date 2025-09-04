import { useQuery } from "@tanstack/react-query";
import { type Category } from "@shared/schema";

interface CategoryWithCount extends Category {
  noteCount: number;
}

export function useCategories() {
  return useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories"],
  });
}
