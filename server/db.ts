import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import path from 'path';
import bcrypt from 'bcryptjs';

 
const DATABASE_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'database.sqlite');

const sqlite = new Database(DATABASE_PATH);
export const db = drizzle(sqlite, { schema });

 
export async function initializeDatabase() {
  try {
    
     
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "first_name" TEXT NOT NULL,
        "last_name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "phone_number" TEXT,
        "role" TEXT NOT NULL DEFAULT 'user',
        "is_active" INTEGER NOT NULL DEFAULT 1,
        "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS "pdf_files" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "file_name" TEXT NOT NULL,
        "file_url" TEXT NOT NULL,
        "file_size" INTEGER NOT NULL,
        "total_pages" INTEGER NOT NULL,
        "free_pages" INTEGER NOT NULL DEFAULT 3,
        "price" REAL NOT NULL,
        "thumbnail_url" TEXT,
        "uploader_id" INTEGER REFERENCES "users"("id"),
        "view_count" INTEGER NOT NULL DEFAULT 0,
        "purchase_count" INTEGER NOT NULL DEFAULT 0,
        "is_active" INTEGER NOT NULL DEFAULT 1,
        "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS "purchases" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "user_id" INTEGER REFERENCES "users"("id"),
        "file_id" INTEGER REFERENCES "pdf_files"("id"),
        "amount" REAL NOT NULL,
        "discount_code" TEXT,
        "discount_amount" REAL DEFAULT 0,
        "final_amount" REAL NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "payment_method" TEXT NOT NULL DEFAULT 'card_to_card',
        "transaction_id" TEXT,
        "admin_notes" TEXT,
        "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS "licenses" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "user_id" INTEGER REFERENCES "users"("id"),
        "file_id" INTEGER REFERENCES "pdf_files"("id"),
        "purchase_id" INTEGER REFERENCES "purchases"("id"),
        "is_active" INTEGER NOT NULL DEFAULT 1,
        "expires_at" TEXT,
        "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS "discount_codes" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "code" TEXT NOT NULL UNIQUE,
        "type" TEXT NOT NULL,
        "value" REAL NOT NULL,
        "max_uses" INTEGER DEFAULT 1,
        "used_count" INTEGER NOT NULL DEFAULT 0,
        "is_active" INTEGER NOT NULL DEFAULT 1,
        "expires_at" TEXT,
        "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS "activity_logs" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "user_id" INTEGER REFERENCES "users"("id"),
        "action" TEXT NOT NULL,
        "entity" TEXT NOT NULL,
        "entity_id" INTEGER,
        "details" TEXT,
        "ip_address" TEXT,
        "user_agent" TEXT,
        "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS "bank_cards" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "account_holder_name" TEXT NOT NULL,
        "account_holder_family" TEXT NOT NULL,
        "card_number" TEXT NOT NULL UNIQUE,
        "bank_name" TEXT NOT NULL,
        "is_active" INTEGER NOT NULL DEFAULT 1,
        "is_default" INTEGER NOT NULL DEFAULT 0,
        "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS "user_file_permissions" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "file_id" INTEGER NOT NULL REFERENCES "pdf_files"("id") ON DELETE CASCADE,
        "granted_by" INTEGER NOT NULL REFERENCES "users"("id"),
        "is_active" INTEGER NOT NULL DEFAULT 1,
        "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("user_id", "file_id")
      );
    `);
    
    
     
    if (process.env.NODE_ENV === 'development') {
      try {
        const existingAdmin = sqlite.prepare("SELECT * FROM users WHERE email = ?").get('admin@localhost.dev');
        
        if (!existingAdmin) {
          const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
          
          if (!process.env.ADMIN_PASSWORD) {
          }
          
          const hashedPassword = await bcrypt.hash(adminPassword, 12);
          sqlite.prepare(`
            INSERT INTO users (first_name, last_name, email, username, password, phone_number, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            'مدیر سیستم',
            'توسعه', 
            'admin@localhost.dev',
            'admin',
            hashedPassword,
            null,
            'admin',
            1
          );
        }
      } catch (error) {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

 
export async function testDatabaseConnection() {
  try {
    const result = db.all("SELECT 1 as test, datetime('now') as time");
    return true;
  } catch (error) {
    return false;
  }
}