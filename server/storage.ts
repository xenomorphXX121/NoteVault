import { type Category, type Note, type InsertCategory, type InsertNote, type UpdateNote, categories, notes } from "@shared/schema";
import { randomUUID } from "crypto";
import { db, initializeDatabase, seedDatabase } from "./database";
import { eq, like, and, or } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Notes
  getNotes(categoryId?: string, search?: string): Promise<Note[]>;
  getNote(id: string): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: string, note: UpdateNote): Promise<Note | undefined>;
  deleteNote(id: string): Promise<boolean>;
  
  // Stats
  getCategoryNoteCounts(): Promise<Record<string, number>>;
}

export class SqliteStorage implements IStorage {
  constructor() {
    this.initialize();
  }

  private async initialize() {
    await initializeDatabase();
    await seedDatabase();
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.createdAt).all();
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = db.select().from(categories).where(eq(categories.id, id)).get();
    return result || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      color: insertCategory.color || "#3b82f6",
      createdAt: new Date(),
    };
    
    db.insert(categories).values(category).run();
    return category;
  }

  async updateCategory(id: string, categoryUpdate: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = await this.getCategory(id);
    if (!existing) return undefined;

    const updated: Category = { ...existing, ...categoryUpdate };
    db.update(categories).set(categoryUpdate).where(eq(categories.id, id)).run();
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    // Delete all notes in this category first (CASCADE will handle this, but let's be explicit)
    db.delete(notes).where(eq(notes.categoryId, id)).run();
    
    const result = db.delete(categories).where(eq(categories.id, id)).run();
    return result.changes > 0;
  }

  async getNotes(categoryId?: string, search?: string): Promise<Note[]> {
    let whereConditions: any[] = [];
    
    if (categoryId) {
      whereConditions.push(eq(notes.categoryId, categoryId));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      whereConditions.push(
        or(
          like(notes.title, `%${searchLower}%`),
          like(notes.content, `%${searchLower}%`),
          like(notes.tags, `%${searchLower}%`)
        )
      );
    }
    
    let result: any[];
    if (whereConditions.length > 0) {
      result = db.select().from(notes).where(and(...whereConditions)).orderBy(notes.updatedAt).all();
    } else {
      result = db.select().from(notes).orderBy(notes.updatedAt).all();
    }
    
    // Parse tags from JSON strings and reverse order for newest first
    return result.map(note => ({
      ...note,
      tags: typeof note.tags === 'string' ? JSON.parse(note.tags) : (note.tags || [])
    })).reverse();
  }

  async getNote(id: string): Promise<Note | undefined> {
    const result = db.select().from(notes).where(eq(notes.id, id)).get();
    if (!result) return undefined;
    
    return {
      ...result,
      tags: typeof result.tags === 'string' ? JSON.parse(result.tags) : result.tags
    };
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = randomUUID();
    const now = new Date();
    const note: Note = {
      ...insertNote,
      id,
      content: insertNote.content || "",
      tags: insertNote.tags || [],
      createdAt: now,
      updatedAt: now,
    };
    
    // Convert tags to JSON string for SQLite storage
    const noteForDb = {
      id: note.id,
      title: note.title,
      content: note.content,
      categoryId: note.categoryId,
      tags: JSON.stringify(note.tags),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
    
    db.insert(notes).values(noteForDb).run();
    return note;
  }

  async updateNote(id: string, noteUpdate: UpdateNote): Promise<Note | undefined> {
    const existing = await this.getNote(id);
    if (!existing) return undefined;

    const updated: Note = {
      ...existing,
      ...noteUpdate,
      updatedAt: new Date(),
    };
    
    // Convert tags to JSON string for SQLite storage
    const updateForDb: any = {
      updatedAt: updated.updatedAt,
    };
    
    if (noteUpdate.title !== undefined) updateForDb.title = noteUpdate.title;
    if (noteUpdate.content !== undefined) updateForDb.content = noteUpdate.content;
    if (noteUpdate.categoryId !== undefined) updateForDb.categoryId = noteUpdate.categoryId;
    if (noteUpdate.tags !== undefined) updateForDb.tags = JSON.stringify(noteUpdate.tags);
    
    db.update(notes).set(updateForDb).where(eq(notes.id, id)).run();
    return updated;
  }

  async deleteNote(id: string): Promise<boolean> {
    const result = db.delete(notes).where(eq(notes.id, id)).run();
    return result.changes > 0;
  }

  async getCategoryNoteCounts(): Promise<Record<string, number>> {
    const allNotes = db.select({ categoryId: notes.categoryId }).from(notes).all();
    const counts: Record<string, number> = {};
    for (const note of allNotes) {
      counts[note.categoryId] = (counts[note.categoryId] || 0) + 1;
    }
    return counts;
  }
}

export const storage = new SqliteStorage();
