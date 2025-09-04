import { useQuery } from "@tanstack/react-query";
import { type Note } from "@shared/schema";

export function useNotes(categoryId?: string | null, search?: string) {
  const params = new URLSearchParams();
  if (categoryId) params.append("categoryId", categoryId);
  if (search) params.append("search", search);
  
  const queryString = params.toString();
  const url = `/api/notes${queryString ? `?${queryString}` : ""}`;
  
  return useQuery<Note[]>({
    queryKey: ["/api/notes", categoryId, search],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }
      return response.json();
    },
    enabled: true,
  });
}
