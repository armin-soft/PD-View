import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

 
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  phoneNumber: text("phone_number"),
  role: text("role").notNull().default("user"),  
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

 
export const pdfFiles = sqliteTable("pdf_files", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  totalPages: integer("total_pages").notNull(),
  freePages: integer("free_pages").notNull().default(3),
  price: real("price").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  uploaderId: integer("uploader_id").references(() => users.id),
  viewCount: integer("view_count").notNull().default(0),
  purchaseCount: integer("purchase_count").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

 
export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  fileId: integer("file_id").references(() => pdfFiles.id),
  amount: real("amount").notNull(),
  discountCode: text("discount_code"),
  discountAmount: real("discount_amount").default(0),
  finalAmount: real("final_amount").notNull(),
  status: text("status").notNull().default("pending"),  
  paymentMethod: text("payment_method").notNull().default("card_to_card"),
  transactionId: text("transaction_id"),
  adminNotes: text("admin_notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

 
export const licenses = sqliteTable("licenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  fileId: integer("file_id").references(() => pdfFiles.id),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  expiresAt: text("expires_at"),  
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});



 
export const discountCodes = sqliteTable("discount_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  type: text("type").notNull(),  
  value: real("value").notNull(),
  maxUses: integer("max_uses").default(1),
  usedCount: integer("used_count").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

 
export const activityLogs = sqliteTable("activity_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  entity: text("entity").notNull(),  
  entityId: integer("entity_id"),
  details: text("details"),  
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

 
export const bankCards = sqliteTable("bank_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountHolderName: text("account_holder_name").notNull(),
  accountHolderFamily: text("account_holder_family").notNull(),
  cardNumber: text("card_number").notNull().unique(),
  bankName: text("bank_name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

 
export const userFilePermissions = sqliteTable("user_file_permissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileId: integer("file_id").notNull().references(() => pdfFiles.id, { onDelete: "cascade" }),
  grantedBy: integer("granted_by").notNull().references(() => users.id),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

 
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPdfFileSchema = createInsertSchema(pdfFiles).omit({
  id: true,
  viewCount: true,
  purchaseCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  createdAt: true,
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  usedCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export const insertBankCardSchema = createInsertSchema(bankCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserFilePermissionSchema = createInsertSchema(userFilePermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

 
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PublicUser = Omit<User, 'password'>;
export type PdfFile = typeof pdfFiles.$inferSelect;
export type InsertPdfFile = z.infer<typeof insertPdfFileSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type License = typeof licenses.$inferSelect;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type BankCard = typeof bankCards.$inferSelect;
export type InsertBankCard = z.infer<typeof insertBankCardSchema>;
export type UserFilePermission = typeof userFilePermissions.$inferSelect;
export type InsertUserFilePermission = z.infer<typeof insertUserFilePermissionSchema>;
