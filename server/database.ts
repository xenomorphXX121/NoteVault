import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { categories, notes } from "@shared/schema";
import { randomUUID } from "crypto";

// Create SQLite database connection
export const sqlite = new Database("./database.sqlite");

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

// Create Drizzle instance
export const db = drizzle(sqlite);

// Initialize database with tables
export async function initializeDatabase() {
  try {
    // Create categories table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#3b82f6',
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

    // Create notes table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        tags TEXT NOT NULL DEFAULT '[]',
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

// Initialize default data
export async function seedDatabase() {
  try {
    // Check if we already have categories
    const existingCategories = db.select().from(categories).all();
    
    if (existingCategories.length === 0) {
      const defaultCategories = [
        { id: randomUUID(), name: "Work Notes", color: "#3b82f6" },
        { id: randomUUID(), name: "Personal", color: "#10b981" },
        { id: randomUUID(), name: "Ideas", color: "#ef4444" },
        { id: randomUUID(), name: "Prompts", color: "#8b5cf6" },
      ];

      for (const category of defaultCategories) {
        db.insert(categories).values({
          ...category,
          createdAt: new Date(),
        }).run();
      }

      console.log("Default categories seeded");
    }
  } catch (error) {
    console.error("Failed to seed database:", error);
    throw error;
  }
}