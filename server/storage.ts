import { eq, and, desc, asc, ilike, count, sql, ne, gte, lt, not, like, or, isNull } from "drizzle-orm";
import { 
  users, 
  pdfFiles, 
  purchases, 
  licenses, 
  discountCodes, 
  activityLogs,
  bankCards,
  userFilePermissions,
  type User, 
  type InsertUser,
  type PdfFile,
  type InsertPdfFile,
  type Purchase,
  type InsertPurchase,
  type License,
  type InsertLicense,
  type DiscountCode,
  type InsertDiscountCode,
  type ActivityLog,
  type InsertActivityLog,
  type BankCard,
  type InsertBankCard,
  type UserFilePermission,
  type InsertUserFilePermission
} from "@shared/schema";

import { db } from './db';
import fs from 'fs';
import path from 'path';

export interface IStorage {
   
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  permanentDeleteUser(id: number): Promise<boolean>;

   
  getPdfFiles(filters?: { search?: string; sort?: string }): Promise<PdfFile[]>;
  getPdfFile(id: number): Promise<PdfFile | undefined>;
  createPdfFile(file: InsertPdfFile): Promise<PdfFile>;
  updatePdfFile(id: number, updates: Partial<PdfFile>): Promise<PdfFile | undefined>;
  incrementViewCount(fileId: number): Promise<void>;

   
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  getUserPurchases(userId: number): Promise<Purchase[]>;
  updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined>;

   
  createLicense(license: InsertLicense): Promise<License>;
  getUserLicense(userId: number, fileId: number): Promise<License | undefined>;
  getUserLicenses(userId: number): Promise<License[]>;

   
  createDiscountCode(code: InsertDiscountCode): Promise<DiscountCode>;
  validateDiscountCode(code: string, fileId: number): Promise<{ isValid: boolean; type?: string; value?: number; amount?: number }>;
  getAllDiscountCodes(): Promise<DiscountCode[]>;
  getDiscountCode(id: number): Promise<DiscountCode | undefined>;
  updateDiscountCode(id: number, data: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined>;
  deleteDiscountCode(id: number): Promise<boolean>;
  incrementDiscountCodeUsage(code: string): Promise<void>;

   
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;

   
  getAdminStats(): Promise<{
    totalUsers: number;
    totalFiles: number;
    totalRevenue: number;
    pendingPayments: number;
    userGrowth: number;
    fileGrowth: number;
    revenueGrowth: number;
  }>;
  getAdminFiles(filters?: { search?: string; status?: string }): Promise<PdfFile[]>;
  getAdminUsers(filters?: { search?: string; role?: string; status?: string }): Promise<User[]>;
  getAdminPurchases(filters?: { search?: string; status?: string }): Promise<Array<{
    id: number;
    userId: number | null;
    fileId: number | null;
    amount: number;
    discountCode: string | null;
    discountAmount: number | null;
    finalAmount: number;
    status: string;
    paymentMethod: string;
    transactionId: string | null;
    adminNotes: string | null;
    createdAt: string;
    userName: string | null;
    userEmail: string | null;
    userFirstName: string | null;
    userLastName: string | null;
    fileName: string | null;
  }>>;
  getAdminActivities(limit?: number): Promise<ActivityLog[]>;
  updateFileStatus(id: number, isActive: boolean): Promise<PdfFile | undefined>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  
   
  getAllUsers(): Promise<User[]>;
  getAllFiles(): Promise<PdfFile[]>;
  getAllPurchases(): Promise<Purchase[]>;
  getRecentActivities(): Promise<ActivityLog[]>;
  updateUserStatus(id: number, isActive: boolean): Promise<User | undefined>;
  updatePurchaseStatusAdmin(id: number, status: string, adminNotes?: string): Promise<Purchase | undefined>;
  deleteFile(id: number): Promise<boolean>;
  getSalesData(): Promise<Array<{month: string, sales: number, files: number}>>;
  getPaymentStats(): Promise<{
    totalRevenue: number;
    pendingAmount: number;
    approvedCount: number;
    rejectedCount: number;
    revenueGrowth: number;
    transactionGrowth: number;
  }>;
  getUserSecurityLogs(userId: number, limit?: number): Promise<ActivityLog[]>;
   
  getAllBankCards(): Promise<BankCard[]>;
  getBankCard(id: number): Promise<BankCard | undefined>;
  createBankCard(data: InsertBankCard): Promise<BankCard>;
  updateBankCard(id: number, data: Partial<InsertBankCard>): Promise<BankCard | undefined>;
  deleteBankCard(id: number): Promise<boolean>;
  
   
  getUserFilePermissions(userId: number): Promise<{fileId: number, title: string, hasAccess: boolean}[]>;
  updateUserFilePermissions(userId: number, permissions: {fileId: number, hasAccess: boolean}[], grantedBy: number): Promise<void>;
  
   
  getAdminCount(): Promise<number>;
  getFirstAdmin(): Promise<User | undefined>;
}

export class DbStorage implements IStorage {
  constructor() {
     
  }

   
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
     
    const timestamp = Date.now();
    const [result] = await db
      .update(users)
      .set({
        isActive: false,
        email: `deleted_${id}_${timestamp}@deleted.local`,
        username: `deleted_${id}_${timestamp}`,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(users.id, id))
      .returning();
    
    return !!result;
  }

  async permanentDeleteUser(id: number): Promise<boolean> {
    return db.transaction((tx) => {
      try {
        // حذف licenses مرتبط با کاربر
        tx.delete(licenses).where(eq(licenses.userId, id)).run();
        
        // حذف user_file_permissions مرتبط با کاربر
        tx.delete(userFilePermissions).where(eq(userFilePermissions.userId, id)).run();
        
        // حذف activity_logs مرتبط با کاربر
        tx.delete(activityLogs).where(eq(activityLogs.userId, id)).run();
        
        // حذف purchases مرتبط با کاربر
        tx.delete(purchases).where(eq(purchases.userId, id)).run();
        
        // حذف کاربر
        const result = tx.delete(users).where(eq(users.id, id)).returning().all();
        
        return result.length > 0;
      } catch (error) {
        throw error;
      }
    });
  }

   
  async getPdfFiles(filters?: { search?: string; sort?: string }): Promise<PdfFile[]> {
    let query = db.select().from(pdfFiles).where(eq(pdfFiles.isActive, true));

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = db.select().from(pdfFiles).where(
        and(
          eq(pdfFiles.isActive, true),
          ilike(pdfFiles.title, searchTerm)
        )
      );
    }

    let files = await query;

    if (filters?.sort) {
      switch (filters.sort) {
        case 'newest':
          files = await db.select().from(pdfFiles)
            .where(eq(pdfFiles.isActive, true))
            .orderBy(desc(pdfFiles.createdAt));
          break;
        case 'popular':
          files = await db.select().from(pdfFiles)
            .where(eq(pdfFiles.isActive, true))
            .orderBy(desc(pdfFiles.viewCount));
          break;
        case 'price-low':
          files = await db.select().from(pdfFiles)
            .where(eq(pdfFiles.isActive, true))
            .orderBy(asc(pdfFiles.price));
          break;
        case 'price-high':
          files = await db.select().from(pdfFiles)
            .where(eq(pdfFiles.isActive, true))
            .orderBy(desc(pdfFiles.price));
          break;
      }
    }

    return files;
  }

  async getPdfFile(id: number): Promise<PdfFile | undefined> {
    const result = await db.select().from(pdfFiles).where(eq(pdfFiles.id, id)).limit(1);
    return result[0];
  }

  async createPdfFile(insertFile: InsertPdfFile): Promise<PdfFile> {
    const [file] = await db.insert(pdfFiles).values(insertFile).returning();
    return file;
  }

  async updatePdfFile(id: number, updates: Partial<PdfFile>): Promise<PdfFile | undefined> {
    const [file] = await db.update(pdfFiles).set(updates).where(eq(pdfFiles.id, id)).returning();
    return file;
  }

  async incrementViewCount(fileId: number): Promise<void> {
    const file = await this.getPdfFile(fileId);
    if (file) {
      await db.update(pdfFiles)
        .set({ viewCount: file.viewCount + 1 })
        .where(eq(pdfFiles.id, fileId));
    }
  }

   
  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db.insert(purchases).values(insertPurchase).returning();
    return purchase;
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const result = await db.select().from(purchases).where(eq(purchases.id, id)).limit(1);
    return result[0];
  }

  async getUserPurchases(userId: number): Promise<Purchase[]> {
    return await db.select().from(purchases).where(eq(purchases.userId, userId));
  }

  async updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined> {
    const [purchase] = await db.update(purchases)
      .set({ status })
      .where(eq(purchases.id, id))
      .returning();
    return purchase;
  }

   
  async createLicense(insertLicense: InsertLicense): Promise<License> {
    const [license] = await db.insert(licenses).values(insertLicense).returning();
    return license;
  }

  async getUserLicense(userId: number, fileId: number): Promise<License | undefined> {
    const result = await db.select().from(licenses)
      .where(and(
        eq(licenses.userId, userId), 
        eq(licenses.fileId, fileId), 
        eq(licenses.isActive, true)
      )).limit(1);
    return result[0];
  }

  async getUserLicenses(userId: number): Promise<License[]> {
    return await db.select().from(licenses)
      .where(and(eq(licenses.userId, userId), eq(licenses.isActive, true)));
  }

   
  async createDiscountCode(insertCode: InsertDiscountCode): Promise<DiscountCode> {
    const [code] = await db.insert(discountCodes).values(insertCode).returning();
    return code;
  }

  async validateDiscountCode(code: string, fileId: number): Promise<{ isValid: boolean; type?: string; value?: number; amount?: number }> {
    const discountCodeResult = await db.select().from(discountCodes)
      .where(eq(discountCodes.code, code))
      .limit(1);
    
    const discountCode = discountCodeResult[0];
    
    if (!discountCode || !discountCode.isActive) {
      return { isValid: false };
    }

    if (discountCode.expiresAt && new Date(discountCode.expiresAt) < new Date()) {
      return { isValid: false };
    }

    if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
      return { isValid: false };
    }

    const file = await this.getPdfFile(fileId);
    if (!file) {
      return { isValid: false };
    }

    let amount = 0;
    const filePrice = parseFloat(file.price.toString());

    switch (discountCode.type) {
      case 'percentage':
        amount = Math.round(filePrice * (parseFloat(discountCode.value.toString()) / 100));
        break;
      case 'fixed':
        amount = Math.min(parseFloat(discountCode.value.toString()), filePrice);
        break;
      case 'free':
        amount = filePrice;
        break;
    }

    return {
      isValid: true,
      type: discountCode.type,
      value: parseFloat(discountCode.value.toString()),
      amount,
    };
  }

   
  async logActivity(insertActivity: InsertActivityLog): Promise<ActivityLog> {
    const [activity] = await db.insert(activityLogs).values(insertActivity).returning();
    return activity;
  }

   
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalFiles: number;
    totalRevenue: number;
    pendingPayments: number;
    userGrowth: number;
    fileGrowth: number;
    revenueGrowth: number;
  }> {
    const activeUserCondition = and(
      eq(users.isActive, true),
      not(like(users.email, '%@deleted.local'))
    );

    const [usersCount] = await db.select({ count: count() }).from(users)
      .where(activeUserCondition);
    const [filesCount] = await db.select({ count: count() }).from(pdfFiles)
      .where(eq(pdfFiles.isActive, true));
    
    const approvedPurchases = await db.select().from(purchases)
      .where(eq(purchases.status, 'approved'));
    const totalRevenue = approvedPurchases.reduce((sum, p) => sum + parseFloat(p.finalAmount.toString()), 0);
    
    const [pendingCount] = await db.select({ count: count() }).from(purchases)
      .where(eq(purchases.status, 'pending'));

     
    const currentDate = new Date();
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const twoMonthsAgoStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);

     
    const [currentMonthUsers] = await db.select({ count: count() }).from(users)
      .where(and(
        activeUserCondition,
        gte(users.createdAt, lastMonthStart.toISOString())
      ));
    const [previousMonthUsers] = await db.select({ count: count() }).from(users)
      .where(and(
        activeUserCondition,
        gte(users.createdAt, twoMonthsAgoStart.toISOString()),
        lt(users.createdAt, lastMonthStart.toISOString())
      ));
    
     
    const [currentMonthFiles] = await db.select({ count: count() }).from(pdfFiles)
      .where(and(
        eq(pdfFiles.isActive, true),
        gte(pdfFiles.createdAt, lastMonthStart.toISOString())
      ));
    const [previousMonthFiles] = await db.select({ count: count() }).from(pdfFiles)
      .where(and(
        eq(pdfFiles.isActive, true),
        gte(pdfFiles.createdAt, twoMonthsAgoStart.toISOString()),
        lt(pdfFiles.createdAt, lastMonthStart.toISOString())
      ));

     
    const currentMonthRevenue = await db.select().from(purchases)
      .where(and(
        eq(purchases.status, 'approved'),
        gte(purchases.createdAt, lastMonthStart.toISOString())
      ));
    const currentRevenue = currentMonthRevenue.reduce((sum, p) => sum + parseFloat(p.finalAmount.toString()), 0);
    
    const previousMonthRevenue = await db.select().from(purchases)
      .where(and(
        eq(purchases.status, 'approved'),
        gte(purchases.createdAt, twoMonthsAgoStart.toISOString()),
        lt(purchases.createdAt, lastMonthStart.toISOString())
      ));
    const previousRevenue = previousMonthRevenue.reduce((sum, p) => sum + parseFloat(p.finalAmount.toString()), 0);

     
    const userGrowth = previousMonthUsers.count > 0 
      ? Math.round(((currentMonthUsers.count - previousMonthUsers.count) / previousMonthUsers.count) * 100)
      : currentMonthUsers.count > 0 ? 100 : 0;
    
    const fileGrowth = previousMonthFiles.count > 0
      ? Math.round(((currentMonthFiles.count - previousMonthFiles.count) / previousMonthFiles.count) * 100)
      : currentMonthFiles.count > 0 ? 100 : 0;
    
    const revenueGrowth = previousRevenue > 0
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : currentRevenue > 0 ? 100 : 0;

    return {
      totalUsers: usersCount.count,
      totalFiles: filesCount.count,
      totalRevenue,
      pendingPayments: pendingCount.count,
      userGrowth,
      fileGrowth,
      revenueGrowth,
    };
  }

  async getAdminFiles(filters?: { search?: string; status?: string }): Promise<PdfFile[]> {
    let whereConditions = [];

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      whereConditions.push(ilike(pdfFiles.title, searchTerm));
    }

    if (filters?.status === 'inactive') {
      whereConditions.push(eq(pdfFiles.isActive, false));
    } else if (filters?.status === 'active' || !filters?.status || filters?.status === 'all') {
      whereConditions.push(eq(pdfFiles.isActive, true));
    }

    if (whereConditions.length > 0) {
      return await db.select().from(pdfFiles).where(and(...whereConditions)).orderBy(desc(pdfFiles.createdAt));
    }

    return await db.select().from(pdfFiles).where(eq(pdfFiles.isActive, true)).orderBy(desc(pdfFiles.createdAt));
  }

  async getAdminUsers(filters?: { search?: string; role?: string; status?: string }): Promise<User[]> {
    let whereConditions = [];

    whereConditions.push(not(like(users.email, '%@deleted.local')));

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      whereConditions.push(
        or(
          ilike(users.email, searchTerm),
          ilike(users.username, searchTerm),
          ilike(users.firstName, searchTerm),
          ilike(users.lastName, searchTerm)
        )
      );
    }

    if (filters?.role && filters.role !== 'all') {
      whereConditions.push(eq(users.role, filters.role));
    }

    if (filters?.status && filters.status !== 'all') {
      whereConditions.push(eq(users.isActive, filters.status === 'active'));
    }

    return await db.select().from(users).where(and(...whereConditions)).orderBy(desc(users.createdAt));
  }

  async getAdminPurchases(filters?: { search?: string; status?: string }): Promise<Array<{
    id: number;
    userId: number | null;
    fileId: number | null;
    amount: number;
    discountCode: string | null;
    discountAmount: number | null;
    finalAmount: number;
    status: string;
    paymentMethod: string;
    transactionId: string | null;
    adminNotes: string | null;
    createdAt: string;
    userName: string | null;
    userEmail: string | null;
    userFirstName: string | null;
    userLastName: string | null;
    fileName: string | null;
  }>> {
    let whereConditions = [];

    if (filters?.status && filters.status !== 'all') {
      whereConditions.push(eq(purchases.status, filters.status));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      whereConditions.push(
         
        ilike(users.username, searchTerm)
      );
    }

    const baseQuery = db.select({
      id: purchases.id,
      userId: purchases.userId,
      fileId: purchases.fileId,
      amount: purchases.amount,
      discountCode: purchases.discountCode,
      discountAmount: purchases.discountAmount,
      finalAmount: purchases.finalAmount,
      status: purchases.status,
      paymentMethod: purchases.paymentMethod,
      transactionId: purchases.transactionId,
      adminNotes: purchases.adminNotes,
      createdAt: purchases.createdAt,
      userName: users.username,
      userEmail: users.email,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      fileName: pdfFiles.title
    }).from(purchases)
      .leftJoin(users, eq(purchases.userId, users.id))
      .leftJoin(pdfFiles, eq(purchases.fileId, pdfFiles.id));

    if (whereConditions.length > 0) {
      return await baseQuery.where(and(...whereConditions)).orderBy(desc(purchases.createdAt));
    }

    return await baseQuery.orderBy(desc(purchases.createdAt));
  }

  async getAdminActivities(limit = 50): Promise<Array<ActivityLog & { 
    userFirstName?: string | null; 
    userLastName?: string | null; 
    userUsername?: string | null;
    userEmail?: string | null;
  }>> {
    const results = await db.select({
      id: activityLogs.id,
      userId: activityLogs.userId,
      action: activityLogs.action,
      entity: activityLogs.entity,
      entityId: activityLogs.entityId,
      details: activityLogs.details,
      ipAddress: activityLogs.ipAddress,
      userAgent: activityLogs.userAgent,
      createdAt: activityLogs.createdAt,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      userUsername: users.username,
      userEmail: users.email,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(
      or(
        isNull(activityLogs.userId),
        and(
          eq(users.isActive, true),
          not(like(users.email, '%@deleted.local'))
        )
      )
    )
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);

    return results;
  }

  async updateFileStatus(id: number, isActive: boolean): Promise<PdfFile | undefined> {
    const [file] = await db.update(pdfFiles)
      .set({ isActive })
      .where(eq(pdfFiles.id, id))
      .returning();
    return file;
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ isActive })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updatePurchaseStatusAdmin(id: number, status: string, adminNotes?: string): Promise<Purchase | undefined> {
    return await db.transaction(async (tx) => {
      const updateData: { status: string; adminNotes?: string } = { status };
      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes;
      }

      const [purchase] = await tx.update(purchases)
        .set(updateData)
        .where(eq(purchases.id, id))
        .returning();

       
      if (status === 'approved' && purchase) {
         
        if (purchase.userId && purchase.fileId) {
          const existingLicense = await tx.select()
            .from(licenses)
            .where(and(
              eq(licenses.userId, purchase.userId),
              eq(licenses.fileId, purchase.fileId),
              eq(licenses.isActive, true)
            ))
            .limit(1);
          
          if (existingLicense.length === 0) {
            await tx.insert(licenses).values({
              userId: purchase.userId,
              fileId: purchase.fileId,
              purchaseId: purchase.id,
              isActive: true,
            });
          }
        }

         
        if (purchase.discountCode && parseFloat(purchase.discountAmount?.toString() || '0') > 0) {
          await tx.update(discountCodes)
            .set({ 
              usedCount: sql`${discountCodes.usedCount} + 1`,
              updatedAt: sql`CURRENT_TIMESTAMP`
            })
            .where(eq(discountCodes.code, purchase.discountCode));
        }
      }

      return purchase;
    });
  }

  async deleteFile(id: number): Promise<boolean> {
    try {
      const [file] = await db.select().from(pdfFiles).where(eq(pdfFiles.id, id)).limit(1);
      
      if (!file) {
        return false;
      }

      const uploadsDir = path.resolve('uploads');

      if (file.fileUrl) {
        if (file.fileUrl.includes('://')) {
        } else {
          const filePath = path.resolve(file.fileUrl.replace(/^\//, ''));
          const relative = path.relative(uploadsDir, filePath);
          
          if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
            try {
              await fs.promises.unlink(filePath);
            } catch (error) {
              if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') {
              }
            }
          } else {
          }
        }
      }

      if (file.thumbnailUrl) {
        if (file.thumbnailUrl.includes('://')) {
        } else {
          const thumbnailPath = path.resolve(file.thumbnailUrl.replace(/^\//, ''));
          const relative = path.relative(uploadsDir, thumbnailPath);
          
          if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
            try {
              await fs.promises.unlink(thumbnailPath);
            } catch (error) {
              if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') {
              }
            }
          } else {
          }
        }
      }

      const [result] = await db.update(pdfFiles)
        .set({ 
          isActive: false,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(pdfFiles.id, id))
        .returning();
      
      return !!result;
    } catch (error) {
      return false;
    }
  }

  async getSalesData(): Promise<Array<{month: string, sales: number, files: number}>> {
     
    const monthlyPurchases = await db.select({
      month: sql<string>`CAST(strftime('%m', ${purchases.createdAt}) AS INTEGER)`,
      year: sql<string>`CAST(strftime('%Y', ${purchases.createdAt}) AS INTEGER)`,
      sales: sql<number>`COALESCE(SUM(${purchases.finalAmount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(purchases)
    .where(eq(purchases.status, 'approved'))
    .groupBy(sql`strftime('%Y', ${purchases.createdAt}), strftime('%m', ${purchases.createdAt})`)
    .orderBy(sql`strftime('%Y', ${purchases.createdAt}) DESC, strftime('%m', ${purchases.createdAt}) DESC`)
    .limit(6);

    const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    
     
    const lastSixMonths: Array<{month: string, sales: number, files: number}> = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const targetMonth = targetDate.getMonth() + 1;
      const targetYear = targetDate.getFullYear();
      
      const monthData = monthlyPurchases.find(item => 
        parseInt(item.month) === targetMonth && parseInt(item.year) === targetYear
      );
      
      lastSixMonths.push({
        month: monthNames[targetMonth - 1],
        sales: monthData?.sales || 0,
        files: monthData?.count || 0,
      });
    }
    
    return lastSixMonths;
  }

  async getUserPurchasesWithFiles(userId: number): Promise<Array<{
    id: number;
    fileId: number | null;
    amount: number;
    discountCode: string | null;
    discountAmount: number | null;
    finalAmount: number;
    status: string;
    paymentMethod: string;
    transactionId: string | null;
    createdAt: string;
    fileName: string | null;
    fileDescription: string | null;
    filePrice: number | null;
    fileThumbnail: string | null;
  }>> {
    return await db.select({
      id: purchases.id,
      fileId: purchases.fileId,
      amount: purchases.amount,
      discountCode: purchases.discountCode,
      discountAmount: purchases.discountAmount,
      finalAmount: purchases.finalAmount,
      status: purchases.status,
      paymentMethod: purchases.paymentMethod,
      transactionId: purchases.transactionId,
      createdAt: purchases.createdAt,
      fileName: pdfFiles.title,
      fileDescription: pdfFiles.description,
      filePrice: pdfFiles.price,
      fileThumbnail: pdfFiles.thumbnailUrl
    }).from(purchases)
      .leftJoin(pdfFiles, eq(purchases.fileId, pdfFiles.id))
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt));
  }

  async getUserSecurityLogs(userId: number, limit = 20): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

   
  async getAllBankCards(): Promise<BankCard[]> {
    return await db.select().from(bankCards).orderBy(desc(bankCards.createdAt));
  }

  async getBankCard(id: number): Promise<BankCard | undefined> {
    const [card] = await db.select().from(bankCards).where(eq(bankCards.id, id));
    return card;
  }

  async createBankCard(data: InsertBankCard): Promise<BankCard> {
    return db.transaction((tx) => {
      if (data.isDefault) {
        tx.update(bankCards).set({ isDefault: false }).run();
      }

      const [card] = tx.insert(bankCards).values(data).returning().all();
      return card;
    });
  }

  async updateBankCard(id: number, data: Partial<InsertBankCard>): Promise<BankCard | undefined> {
    return db.transaction((tx) => {
      if (data.isDefault) {
        tx.update(bankCards).set({ isDefault: false }).where(ne(bankCards.id, id)).run();
      }

      const [card] = tx.update(bankCards)
        .set(data)
        .where(eq(bankCards.id, id))
        .returning()
        .all();
      return card;
    });
  }

  async deleteBankCard(id: number): Promise<boolean> {
    const result = await db.delete(bankCards).where(eq(bankCards.id, id));
    return result.changes > 0;
  }

  async getPaymentStats(): Promise<{
    totalRevenue: number;
    pendingAmount: number;
    approvedCount: number;
    rejectedCount: number;
    revenueGrowth: number;
    transactionGrowth: number;
  }> {
    const approvedPurchases = await db.select().from(purchases)
      .where(eq(purchases.status, 'approved'));
    const totalRevenue = approvedPurchases.reduce((sum, p) => sum + parseFloat(p.finalAmount.toString()), 0);

    const pendingPurchases = await db.select().from(purchases)
      .where(eq(purchases.status, 'pending'));
    const pendingAmount = pendingPurchases.reduce((sum, p) => sum + parseFloat(p.finalAmount.toString()), 0);

    const [approvedCount] = await db.select({ count: count() }).from(purchases)
      .where(eq(purchases.status, 'approved'));

    const [rejectedCount] = await db.select({ count: count() }).from(purchases)
      .where(eq(purchases.status, 'rejected'));

     
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const twoMonthsAgoStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);

     
    const lastMonthRevenue = await db.select().from(purchases)
      .where(and(
        eq(purchases.status, 'approved'),
        gte(purchases.createdAt, lastMonthStart.toISOString()),
        lt(purchases.createdAt, currentMonthStart.toISOString())
      ));
    const currentRevenue = lastMonthRevenue.reduce((sum, p) => sum + parseFloat(p.finalAmount.toString()), 0);
    
    const previousMonthRevenue = await db.select().from(purchases)
      .where(and(
        eq(purchases.status, 'approved'),
        gte(purchases.createdAt, twoMonthsAgoStart.toISOString()),
        lt(purchases.createdAt, lastMonthStart.toISOString())
      ));
    const previousRevenue = previousMonthRevenue.reduce((sum, p) => sum + parseFloat(p.finalAmount.toString()), 0);

     
    const [lastMonthTransactions] = await db.select({ count: count() }).from(purchases)
      .where(and(
        eq(purchases.status, 'approved'),
        gte(purchases.createdAt, lastMonthStart.toISOString()),
        lt(purchases.createdAt, currentMonthStart.toISOString())
      ));
    const [previousMonthTransactions] = await db.select({ count: count() }).from(purchases)
      .where(and(
        eq(purchases.status, 'approved'),
        gte(purchases.createdAt, twoMonthsAgoStart.toISOString()),
        lt(purchases.createdAt, lastMonthStart.toISOString())
      ));

     
    const revenueGrowth = previousRevenue > 0
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : currentRevenue > 0 ? 100 : 0;
    
    const transactionGrowth = previousMonthTransactions.count > 0
      ? Math.round(((lastMonthTransactions.count - previousMonthTransactions.count) / previousMonthTransactions.count) * 100)
      : lastMonthTransactions.count > 0 ? 100 : 0;

    return {
      totalRevenue,
      pendingAmount,
      approvedCount: approvedCount.count,
      rejectedCount: rejectedCount.count,
      revenueGrowth,
      transactionGrowth,
    };
  }

   
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users)
      .where(not(like(users.email, '%@deleted.local')))
      .orderBy(asc(users.id));
  }

  async getAllFiles(): Promise<PdfFile[]> {
    return await db.select().from(pdfFiles).orderBy(asc(pdfFiles.id));
  }

  async getAllPurchases(): Promise<Purchase[]> {
    return await db.select().from(purchases).orderBy(desc(purchases.createdAt));
  }

  async getRecentActivities(): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(50);
  }

   
  async getAllDiscountCodes(): Promise<DiscountCode[]> {
    return await db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
  }

  async getDiscountCode(id: number): Promise<DiscountCode | undefined> {
    const [code] = await db.select().from(discountCodes).where(eq(discountCodes.id, id));
    return code;
  }

  async updateDiscountCode(id: number, data: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined> {
    const [code] = await db.update(discountCodes)
      .set(data)
      .where(eq(discountCodes.id, id))
      .returning();
    return code;
  }

  async deleteDiscountCode(id: number): Promise<boolean> {
    const result = await db.delete(discountCodes).where(eq(discountCodes.id, id));
    return result.changes > 0;
  }

  async incrementDiscountCodeUsage(code: string): Promise<void> {
    const discountCodeResult = await db.select().from(discountCodes)
      .where(eq(discountCodes.code, code))
      .limit(1);
    
    const discountCode = discountCodeResult[0];
    if (discountCode) {
      await db.update(discountCodes)
        .set({ usedCount: discountCode.usedCount + 1 })
        .where(eq(discountCodes.id, discountCode.id));
    }
  }

   
  async getUserFilePermissions(userId: number): Promise<{fileId: number, title: string, hasAccess: boolean}[]> {
     
    const allFiles = await db.select({
      id: pdfFiles.id,
      title: pdfFiles.title
    }).from(pdfFiles).where(eq(pdfFiles.isActive, true));

     
    const userPermissions = await db.select({
      fileId: userFilePermissions.fileId
    }).from(userFilePermissions)
      .where(and(
        eq(userFilePermissions.userId, userId),
        eq(userFilePermissions.isActive, true)
      ));

    const permissionFileIds = new Set(userPermissions.map(p => p.fileId));

    return allFiles.map(file => ({
      fileId: file.id,
      title: file.title,
      hasAccess: permissionFileIds.has(file.id)
    }));
  }

  async updateUserFilePermissions(userId: number, permissions: {fileId: number, hasAccess: boolean}[], grantedBy: number): Promise<void> {
    await db.transaction(async (tx) => {
      for (const permission of permissions) {
         
        const existing = await tx.select()
          .from(userFilePermissions)
          .where(and(
            eq(userFilePermissions.userId, userId),
            eq(userFilePermissions.fileId, permission.fileId)
          ))
          .limit(1);

        if (existing.length > 0) {
           
          await tx.update(userFilePermissions)
            .set({ 
              isActive: permission.hasAccess,
              updatedAt: sql`CURRENT_TIMESTAMP`
            })
            .where(and(
              eq(userFilePermissions.userId, userId),
              eq(userFilePermissions.fileId, permission.fileId)
            ));
        } else if (permission.hasAccess) {
           
          await tx.insert(userFilePermissions).values({
            userId,
            fileId: permission.fileId,
            grantedBy,
            isActive: true
          });
        }
      }
    });
  }

   
  async getAdminCount(): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(users)
      .where(and(eq(users.role, 'admin'), eq(users.isActive, true)));
    return result.count;
  }

  async getFirstAdmin(): Promise<User | undefined> {
    const result = await db.select()
      .from(users)
      .where(eq(users.role, 'admin'))
      .limit(1);
    return result[0];
  }
}



 
export const storage = new DbStorage();
