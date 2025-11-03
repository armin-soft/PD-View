import type { Express, Request, Response, NextFunction } from "express";
import { getUserIdFromSession, setUserIdInSession } from "./types";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import fs from "fs";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
 
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import { insertUserSchema, insertBankCardSchema, insertDiscountCodeSchema, type User, type PublicUser } from "@shared/schema";
import { PDFDocument } from "pdf-lib";

 
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

 
const registerSchema = insertUserSchema
  .pick({ firstName: true, lastName: true, email: true, username: true, password: true, phoneNumber: true })
  .extend({
    email: z.string().trim().toLowerCase().email(),
    username: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد').max(20, 'نام کاربری باید حداکثر ۲۰ کاراکتر باشد'),
    password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
  });

 
const purchaseSchema = z.object({
  fileId: z.coerce.number().int().positive(),
  discountCode: z.string().optional(),
  paymentMethod: z.enum(['card_to_card']),
});

const discountValidationSchema = z.object({
  code: z.string(),
  fileId: z.number(),
});

const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().optional(),
  phoneNumber: z.string().nullable().optional().transform(val => val === '' ? null : val),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد').optional(),
});

 
const multerStorage = multer.diskStorage({
  destination: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    const uploadPath = 'uploads/';
     
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
     
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 50 * 1024 * 1024,  
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('فقط فایل های PDF مجاز هستند'));
    }
  }
});

 
function sanitizeUser(user: User): PublicUser {
  const { password, ...publicUser } = user;
  return publicUser;
}

 
function sanitizeUsers(users: User[]): PublicUser[] {
  return users.map(sanitizeUser);
}

 
async function extractPdfPages(pdfPath: string, maxPages: number): Promise<Buffer> {
  try {
    const pdfBytes = await fs.promises.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();
    
     
    const newPdf = await PDFDocument.create();
    const pagesToExtract = Math.min(maxPages, totalPages);
    
     
    const copiedPages = await newPdf.copyPages(pdfDoc, Array.from({ length: pagesToExtract }, (_, i) => i));
    copiedPages.forEach(page => newPdf.addPage(page));
    
     
    const pdfBuffer = await newPdf.save();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    throw new Error('خطا در پردازش فایل PDF');
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
   
  app.use('/uploads', (req, res, next) => {
    if (req.path.toLowerCase().endsWith('.pdf')) {
      return res.status(403).json({ 
        message: "دسترسی مستقیم به فایل های PDF مجاز نیست. محتوا فقط از طریق ناظر امن قابل مشاهده است.",
        error: "PDF_DOWNLOAD_FORBIDDEN"
      });
    }
    next();
  });

   
  app.use('/static/uploads', (req, res) => {
    return res.status(403).json({ 
      message: "دسترسی به فایل های آپلود شده مجاز نیست.",
      error: "STATIC_ACCESS_FORBIDDEN"
    });
  });

   
  async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const userId = getUserIdFromSession(req);
    if (!userId) {
      return res.status(401).json({ message: "احراز هویت انجام نشده" });
    }
    
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.isActive) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "حساب کاربری غیرفعال است" });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: "خطا در بررسی وضعیت کاربر" });
    }
  }

   
  async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const userId = getUserIdFromSession(req);
    if (!userId) {
      return res.status(401).json({ message: "احراز هویت انجام نشده" });
    }
    
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.isActive) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "حساب کاربری غیرفعال است" });
      }
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "دسترسی محدود به مدیران" });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: "خطا در بررسی دسترسی" });
    }
  }

   
  async function verifyAdmin(req: Request, res: Response): Promise<{userId: number, user: User} | null> {
    const userId = getUserIdFromSession(req);
    if (!userId) {
      res.status(401).json({ message: "احراز هویت انجام نشده" });
      return null;
    }

    const user = await storage.getUser(userId);
    if (!user || !user.isActive) {
      req.session.destroy(() => {});
      res.status(401).json({ message: "حساب کاربری غیرفعال است" });
      return null;
    }
    if (user.role !== 'admin') {
      res.status(403).json({ message: "دسترسی مجاز نیست" });
      return null;
    }

    return { userId, user };
  }

   
  app.use('/api/admin/*', requireAuth, requireAdmin);

   
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { firstName, lastName, email, username, password, phoneNumber } = registerSchema.parse(req.body);
      
       
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "کاربری با این ایمیل قبلاً ثبت شده است" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "این نام کاربری قبلاً انتخاب شده است" });
      }

       
      const hashedPassword = await bcrypt.hash(password, 12);

       
      const newUser = await storage.createUser({
        firstName,
        lastName,
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        role: "user",
        isActive: true,
      });

       
      setUserIdInSession(req, newUser.id);

      res.json({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneNumber: newUser.phoneNumber,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      }
      
       
      if (error instanceof Error) {
        if (error.message.includes('UNIQUE constraint failed: users.email')) {
          return res.status(400).json({ message: "کاربری با این ایمیل قبلاً ثبت شده است" });
        }
        if (error.message.includes('UNIQUE constraint failed: users.username')) {
          return res.status(400).json({ message: "این نام کاربری قبلاً انتخاب شده است" });
        }
      }
      
      res.status(500).json({ message: "خطا در ثبت نام" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "ایمیل یا رمز عبور اشتباه است" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "ایمیل یا رمز عبور اشتباه است" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "حساب کاربری شما غیرفعال است" });
      }

       
      setUserIdInSession(req, user.id);

       
      void storage.logActivity({
        userId: user.id,
        action: "login",
        entity: "user",
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      }).catch(err => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to log login activity:', err);
        }
      });

      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      }
      res.status(500).json({ message: "خطا در ورود" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "خطا در خروج" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "با موفقیت خارج شدید" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "کاربر یافت نشد" });
      }

      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
      }
      res.status(500).json({ message: "خطا در بررسی احراز هویت" });
    }
  });

   
  app.get("/api/pdf-files", async (req, res) => {
    try {
      const { search, sort } = req.query;
      const files = await storage.getPdfFiles({
        search: search as string,
        sort: sort as string,
      });
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت فایل ها" });
    }
  });

   
  app.get("/api/files", async (req, res) => {
    try {
      const { search, sort } = req.query;
      const files = await storage.getPdfFiles({
        search: search as string,
        sort: sort as string,
      });
      
       
      const transformedFiles = files.map(file => ({
        id: file.id,
        title: file.title,
        description: file.description || '',
        price: parseFloat(file.price.toString()),
        totalPages: file.totalPages,
        freePages: file.freePages,
        rating: 4.5,  
        thumbnailUrl: file.thumbnailUrl || '',
        fileUrl: file.fileUrl,
        isNew: false,  
        discount: 0,
        tags: [],
        author: 'نویسنده',
        publishedAt: file.createdAt,
        difficulty: 'intermediate',
        language: 'فارسی',
        fileSize: `${Math.round(file.fileSize / 1024)} KB`,
        lastUpdated: file.updatedAt,
        isBestseller: file.purchaseCount > 10,
        isFeatured: file.viewCount > 50,
        previewUrl: file.fileUrl
      }));
      
      res.json(transformedFiles);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت فایل ها" });
    }
  });



  app.get("/api/files/:id", async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getPdfFile(fileId);
      
      if (!file || !file.isActive) {
        return res.status(404).json({ message: "فایل یافت نشد" });
      }

       
      await storage.incrementViewCount(fileId);

      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت فایل" });
    }
  });

   
  app.get("/api/files/:id/view", async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getPdfFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "فایل یافت نشد" });
      }

      const userId = getUserIdFromSession(req);
      let isAdmin = false;
      
      if (userId) {
        const user = await storage.getUser(userId);
        isAdmin = user?.role === 'admin';
      }
      
      if (!file.isActive && !isAdmin) {
        return res.status(404).json({ message: "فایل یافت نشد" });
      }

       
      const { preview } = req.query;  

       
      if (!userId) {
        if (file.freePages && file.freePages > 0) {
           
          const filePath = path.resolve(file.fileUrl.replace('/uploads/', 'uploads/'));
          
          try {
            await fs.promises.access(filePath, fs.constants.R_OK);
          } catch {
            return res.status(404).json({ message: "فایل فیزیکی یافت نشد" });
          }

          try {
             
            const limitedPdfBuffer = await extractPdfPages(filePath, file.freePages);
            
             
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'self'; object-src 'self'");
            res.setHeader('X-Preview-Mode', 'true');
            res.setHeader('X-Free-Pages', file.freePages.toString());
            res.setHeader('X-Total-Pages', file.totalPages.toString());
            res.setHeader('Content-Disposition', 'inline');  
            
             
            await storage.logActivity({
              userId: null,
              action: "guest_preview",
              entity: "file",
              entityId: fileId,
              details: JSON.stringify({ freePages: file.freePages, totalPages: file.totalPages }),
              ipAddress: req.ip,
              userAgent: req.get("User-Agent"),
            });
            
             
            return res.send(limitedPdfBuffer);
          } catch (error) {
            return res.status(500).json({ message: "خطا در پردازش پیش نمایش" });
          }
        } else {
          return res.status(401).json({ 
            message: "برای مشاهده فایل باید وارد شوید",
            error: "AUTHENTICATION_REQUIRED"
          });
        }
      }

       
      const license = await storage.getUserLicense(userId, fileId);
      if (!license) {
         
         
        if (file.freePages && file.freePages > 0) {
          const filePath = path.resolve(file.fileUrl.replace('/uploads/', 'uploads/'));
          
          try {
            await fs.promises.access(filePath, fs.constants.R_OK);
          } catch {
            return res.status(404).json({ message: "فایل فیزیکی یافت نشد" });
          }

          try {
             
            const limitedPdfBuffer = await extractPdfPages(filePath, file.freePages);
            
             
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'self'; object-src 'self'");
            res.setHeader('X-Preview-Mode', 'true');
            res.setHeader('X-Free-Pages', file.freePages.toString());
            res.setHeader('X-Total-Pages', file.totalPages.toString());
            res.setHeader('Content-Disposition', 'inline');
            
             
            await storage.logActivity({
              userId,
              action: "preview_without_license",
              entity: "file",
              entityId: fileId,
              details: JSON.stringify({ freePages: file.freePages, totalPages: file.totalPages }),
              ipAddress: req.ip,
              userAgent: req.get("User-Agent"),
            });
            
             
            return res.send(limitedPdfBuffer);
          } catch (error) {
            return res.status(500).json({ message: "خطا در پردازش پیش نمایش" });
          }
        }
        
         
        return res.status(403).json({ 
          message: "شما مجوز دسترسی به این فایل را ندارید. لطفاً ابتدا فایل را خریداری کنید.",
          error: "LICENSE_REQUIRED",
          freePages: file.freePages || 0,
          totalPages: file.totalPages
        });
      }

       
      if (!license.isActive || (license.expiresAt && new Date(license.expiresAt) < new Date())) {
        return res.status(403).json({ 
          message: "مجوز دسترسی به این فایل منقضی شده است.",
          error: "LICENSE_EXPIRED"
        });
      }

       
      await storage.incrementViewCount(fileId);

       
      await storage.logActivity({
        userId,
        action: "file_viewed",
        entity: "file",
        entityId: fileId,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

       
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'self'; object-src 'self'");
      
       
      res.removeHeader('Content-Disposition');
      
       
      const filePath = path.resolve(file.fileUrl.replace('/uploads/', 'uploads/'));
      
      try {
        await fs.promises.access(filePath, fs.constants.R_OK);
        res.sendFile(filePath);
      } catch {
        res.status(404).json({ message: "فایل فیزیکی یافت نشد" });
      }
    } catch (error) {
      res.status(500).json({ message: "خطا در نمایش فایل" });
    }
  });



   
  app.get("/api/bank-cards/public", async (req, res) => {
    try {
      const cards = await storage.getAllBankCards();
       
      const publicCards = cards
        .filter(card => card.isActive)
        .map(card => ({
          cardNumber: card.cardNumber,
          accountHolderName: card.accountHolderName,
          bankName: card.bankName
        }));
      res.json(publicCards);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت اطلاعات پرداخت" });
    }
  });

   
  app.post("/api/purchases", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const { fileId, discountCode, paymentMethod } = purchaseSchema.parse(req.body);
      
      const file = await storage.getPdfFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "فایل یافت نشد" });
      }

       
      const existingLicense = await storage.getUserLicense(userId, fileId);
      if (existingLicense) {
        return res.status(400).json({ message: "شما قبلاً این فایل را خریداری کرده اید" });
      }

       
      let discountAmount = 0;
      if (discountCode) {
        const discount = await storage.validateDiscountCode(discountCode, fileId);
        if (discount.isValid && discount.amount) {
          discountAmount = discount.amount;
        }
      }

       
      const baseAmount = parseFloat(file.price.toString());
      const finalAmount = Math.max(0, baseAmount - discountAmount);

      const purchase = await storage.createPurchase({
        userId,
        fileId,
        amount: baseAmount,
        discountCode,
        discountAmount,
        finalAmount,
        paymentMethod,
        status: "pending",
      });

       
      if (finalAmount === 0) {
         
         
        await storage.updatePurchaseStatusAdmin(purchase.id, "approved");
      }

       
      await storage.logActivity({
        userId,
        action: "purchase_created",
        entity: "purchase",
        entityId: purchase.id,
        details: JSON.stringify({ fileId, amount: finalAmount }),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json(purchase);
    } catch (error) {
      res.status(500).json({ message: "خطا در ثبت خرید" });
    }
  });

  app.get("/api/purchases", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const purchases = await storage.getUserPurchases(userId);
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت خریدها" });
    }
  });

   
  app.post("/api/discount-codes/validate", async (req, res) => {
    try {
      const { code, fileId } = discountValidationSchema.parse(req.body);
      
      const result = await storage.validateDiscountCode(code, fileId);
      
      if (!result.isValid) {
        return res.status(400).json({ message: "کد تخفیف نامعتبر است" });
      }

      res.json({
        code,
        type: result.type,
        value: result.value,
        isValid: true,
      });
    } catch (error) {
      res.status(500).json({ message: "خطا در بررسی کد تخفیف" });
    }
  });

   
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const auth = await verifyAdmin(req, res);
      if (!auth) return;

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت آمار" });
    }
  });

   
  app.get("/api/admin/sales-data", async (req, res) => {
    try {
      const auth = await verifyAdmin(req, res);
      if (!auth) return;

      const salesData = await storage.getSalesData();
      res.json(salesData);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت داده های فروش" });
    }
  });

   
  app.get("/api/admin/activities", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const activities = await storage.getAdminActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت فعالیت ها" });
    }
  });

   
  app.get("/api/admin/files", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const { search, status } = req.query;
      const files = await storage.getAdminFiles({ 
        search: search as string,
        status: status as string
      });
      
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت فایل ها" });
    }
  });

   
  app.get("/api/admin/users", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const { search, role, status } = req.query;
      const users = await storage.getAdminUsers({
        search: search as string,
        role: role as string,
        status: status as string
      });
      
      res.json(sanitizeUsers(users));
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت کاربران" });
    }
  });

   
  app.get("/api/admin/purchases", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const { search, status } = req.query;
      const purchases = await storage.getAdminPurchases({
        search: search as string,
        status: status as string
      });
      
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت خریدها" });
    }
  });

   
  app.get("/api/user/stats", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const userPurchases = await storage.getUserPurchases(userId);
      const approvedPurchases = userPurchases.filter(p => p.status === 'approved');
      const userLicenses = await storage.getUserLicenses(userId);
      const activeLicenses = userLicenses.filter(l => l.isActive);
      
      const totalSpent = approvedPurchases.reduce((sum, p) => sum + parseFloat(p.finalAmount.toString()), 0);

      const stats = {
        totalPurchases: approvedPurchases.length,
        totalSpent,
        activeLicenses: activeLicenses.length,
        totalViews: activeLicenses.length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت آمار کاربر" });
    }
  });

   
  app.get("/api/user/purchased-files", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const userLicenses = await storage.getUserLicenses(userId);
      const licensesWithFiles = await Promise.all(
        userLicenses.map(async (license) => {
          const file = license.fileId ? await storage.getPdfFile(license.fileId) : null;
          const purchase = license.purchaseId ? await storage.getPurchase(license.purchaseId) : null;
          return {
            id: license.id,
            title: file?.title || 'نامشخص',
            price: file?.price || 0,
            purchaseDate: purchase?.createdAt || new Date(),
            status: license.isActive ? 'active' : 'expired',
            totalPages: file?.totalPages || 0
          };
        })
      );
      
      res.json(licensesWithFiles);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت فایل های خریداری شده" });
    }
  });

   
  app.get("/api/user/purchase-stats", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const userPurchases = await storage.getUserPurchases(userId);
      const approvedPurchases = userPurchases.filter(p => p.status === 'approved');
      const pendingPurchases = userPurchases.filter(p => p.status === 'pending');
      const totalSpent = approvedPurchases.reduce((sum, p) => sum + parseFloat(p.finalAmount.toString()), 0);

      const stats = {
        totalPurchases: userPurchases.length,
        totalSpent,
        approvedPurchases: approvedPurchases.length,
        pendingPurchases: pendingPurchases.length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت آمار خریدها" });
    }
  });

   
  app.get("/api/user/purchases", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const purchases = await storage.getUserPurchasesWithFiles(userId);
      
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت خریدها" });
    }
  });

   
  app.get("/api/user/profile-stats", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }

      const userPurchases = await storage.getUserPurchases(userId);
      const approvedPurchases = userPurchases.filter(p => p.status === 'approved');
      const totalSpent = approvedPurchases.reduce((sum, p) => sum + parseFloat(p.finalAmount.toString()), 0);

      const stats = {
        totalPurchases: approvedPurchases.length,
        totalSpent,
        memberSince: user.createdAt,
        lastLogin: user.updatedAt
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت آمار پروفایل" });
    }
  });

   
  app.get("/api/user/security-logs", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const logs = await storage.getUserSecurityLogs(userId);
      
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت لاگ های امنیتی" });
    }
  });

   
  app.put("/api/user/profile", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const profileUpdateSchema = z.object({
        firstName: z.string().min(1, 'نام الزامی است'),
        lastName: z.string().min(1, 'نام خانوادگی الزامی است'),
        phoneNumber: z.string().optional(),
        username: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد'),
        email: z.string().email('ایمیل معتبر وارد کنید'),
        currentPassword: z.string().optional(),
        newPassword: z.string().optional(),
      });

      const validatedData = profileUpdateSchema.parse(req.body);
      
       
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }

       
      if (validatedData.email && validatedData.email !== currentUser.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "کاربری با این ایمیل قبلاً ثبت شده است" });
        }
      }

       
      if (validatedData.username && validatedData.username !== currentUser.username) {
        const existingUsername = await storage.getUserByUsername(validatedData.username);
        if (existingUsername && existingUsername.id !== userId) {
          return res.status(400).json({ message: "این نام کاربری قبلاً انتخاب شده است" });
        }
      }

      const updateData: {
        firstName: string;
        lastName: string;
        email: string;
        username: string;
        phoneNumber: string | null;
        password?: string;
      } = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        username: validatedData.username,
        phoneNumber: validatedData.phoneNumber || null,
      };

       
      if (validatedData.currentPassword && validatedData.newPassword) {
         
        const isValidPassword = await bcrypt.compare(validatedData.currentPassword, currentUser.password);
        if (!isValidPassword) {
          return res.status(400).json({ message: "رمز عبور فعلی اشتباه است" });
        }

         
        if (validatedData.newPassword.length < 8) {
          return res.status(400).json({ message: "رمز عبور جدید باید حداقل ۸ کاراکتر باشد" });
        }

         
        updateData.password = await bcrypt.hash(validatedData.newPassword, 12);
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "خطا در به روزرسانی پروفایل" });
      }

       
      await storage.logActivity({
        userId,
        action: "profile_updated",
        entity: "user",
        entityId: userId,
        details: JSON.stringify({ email: updatedUser.email, username: updatedUser.username }),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map((e) => e.message).join(', ');
        return res.status(400).json({ message: `خطا در اعتبارسنجی: ${errorMessage}` });
      }
      res.status(500).json({ message: "خطا در به روزرسانی پروفایل" });
    }
  });

   
  app.post("/api/security/log", async (req, res) => {
     
     
    res.json({ success: true });
  });

   
  app.get("/api/admin/bank-cards", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const cards = await storage.getAllBankCards();
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت کارت های بانکی" });
    }
  });

  app.get("/api/admin/bank-cards/:id", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const cardId = parseInt(req.params.id);
      const card = await storage.getBankCard(cardId);
      
      if (!card) {
        return res.status(404).json({ message: "کارت بانکی یافت نشد" });
      }

      res.json(card);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت کارت بانکی" });
    }
  });

  app.post("/api/admin/bank-cards", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

       
      if (req.body.cardNumber) {
        req.body.cardNumber = req.body.cardNumber.replace(/\D/g, '');
      }

      const bankCardCreateSchema = z.object({
        accountHolderName: z.string().min(1, "نام دارنده حساب الزامی است"),
        accountHolderFamily: z.string().min(1, "نام خانوادگی دارنده حساب الزامی است"),
        cardNumber: z.string().min(1, "شماره کارت الزامی است"),
        bankName: z.string().min(1, "نام بانک الزامی است"),
        isActive: z.boolean().optional().default(true),
        isDefault: z.boolean().optional().default(false)
      }).superRefine((data, ctx) => {
        const cleaned = data.cardNumber.replace(/\D/g, '');
        if (cleaned.length !== 16) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['cardNumber'],
            message: "شماره کارت باید دقیقاً ۱۶ رقم باشد"
          });
        }
      });

      const parsedData = bankCardCreateSchema.parse(req.body);
      const cleanedCardNumber = parsedData.cardNumber.replace(/\D/g, '');

      const existingCard = await storage.getAllBankCards();
      if (existingCard.some(card => card.cardNumber === cleanedCardNumber)) {
        return res.status(400).json({ message: "این شماره کارت قبلاً ثبت شده است" });
      }

      const validatedData = {
        ...parsedData,
        cardNumber: cleanedCardNumber
      };

      const card = await storage.createBankCard(validatedData);

      await storage.logActivity({
        userId,
        action: "bank_card_created",
        entity: "bank_card",
        entityId: card.id,
        details: JSON.stringify({ 
          cardNumber: `**** **** **** ${cleanedCardNumber.slice(-4)}`,
          bankName: card.bankName 
        }),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({ 
        message: "کارت بانکی با موفقیت ایجاد شد",
        card 
      });
    } catch (error) {
      console.error('Bank card creation error:', error);
      
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map((e) => e.message).join(', ');
        return res.status(400).json({ message: `خطا در اعتبارسنجی: ${errorMessage}` });
      }
      
       
      if (error && typeof error === 'object' && 'code' in error && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ message: "این شماره کارت قبلاً ثبت شده است" });
      }
      
      res.status(500).json({ message: "خطا در ایجاد کارت بانکی. لطفاً دوباره تلاش کنید." });
    }
  });

  app.put("/api/admin/bank-cards/:id", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      if (req.body.cardNumber) {
        req.body.cardNumber = req.body.cardNumber.replace(/\D/g, '');
      }

      const bankCardUpdateSchema = z.object({
        accountHolderName: z.string().min(1, "نام دارنده حساب الزامی است").optional(),
        accountHolderFamily: z.string().min(1, "نام خانوادگی دارنده حساب الزامی است").optional(),
        cardNumber: z.string().optional(),
        bankName: z.string().min(1, "نام بانک الزامی است").optional(),
        isActive: z.boolean().optional(),
        isDefault: z.boolean().optional()
      }).superRefine((data, ctx) => {
        if (data.cardNumber) {
          const cleaned = data.cardNumber.replace(/\D/g, '');
          if (cleaned.length !== 16) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['cardNumber'],
              message: "شماره کارت باید دقیقاً ۱۶ رقم باشد"
            });
          }
        }
      });

      const parsedData = bankCardUpdateSchema.parse(req.body);
      const cardId = parseInt(req.params.id);

      const validatedData: Partial<typeof parsedData> = { ...parsedData };
      if (parsedData.cardNumber) {
        validatedData.cardNumber = parsedData.cardNumber.replace(/\D/g, '');
      }

      const card = await storage.updateBankCard(cardId, validatedData);
      
      if (!card) {
        return res.status(404).json({ message: "کارت بانکی یافت نشد" });
      }

      await storage.logActivity({
        userId,
        action: "bank_card_updated",
        entity: "bank_card",
        entityId: card.id,
        details: JSON.stringify({ 
          cardNumber: card.cardNumber ? `**** **** **** ${card.cardNumber.slice(-4)}` : undefined,
          bankName: card.bankName,
          isActive: card.isActive,
          isDefault: card.isDefault
        }),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json(card);
    } catch (error) {
      console.error('Bank card update error:', error);
      
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map((e) => e.message).join(', ');
        return res.status(400).json({ message: `خطا در اعتبارسنجی: ${errorMessage}` });
      }
      
      res.status(500).json({ message: "خطا در به روزرسانی کارت بانکی. لطفاً دوباره تلاش کنید." });
    }
  });

  app.delete("/api/admin/bank-cards/:id", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const cardId = parseInt(req.params.id);
      const card = await storage.getBankCard(cardId);

      if (!card) {
        return res.status(404).json({ message: "کارت بانکی یافت نشد" });
      }

      const success = await storage.deleteBankCard(cardId);
      
      if (!success) {
        return res.status(404).json({ message: "کارت بانکی یافت نشد" });
      }

      await storage.logActivity({
        userId,
        action: "bank_card_deleted",
        entity: "bank_card",
        entityId: cardId,
        details: JSON.stringify({ 
          cardNumber: `**** **** **** ${card.cardNumber.slice(-4)}`,
          bankName: card.bankName 
        }),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({ message: "کارت بانکی با موفقیت حذف شد" });
    } catch (error) {
      console.error('Bank card deletion error:', error);
      
      res.status(500).json({ message: "خطا در حذف کارت بانکی. لطفاً دوباره تلاش کنید." });
    }
  });

   
  app.get("/api/admin/discount-codes", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const codes = await storage.getAllDiscountCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت کدهای تخفیف" });
    }
  });

  app.get("/api/admin/discount-codes/:id", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const codeId = parseInt(req.params.id);
      const code = await storage.getDiscountCode(codeId);
      
      if (!code) {
        return res.status(404).json({ message: "کد تخفیف یافت نشد" });
      }

      res.json(code);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت کد تخفیف" });
    }
  });

  app.post("/api/admin/discount-codes", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const discountCodeSchema = insertDiscountCodeSchema.extend({
        code: z.string().min(3, "کد تخفیف باید حداقل ۳ کاراکتر باشد").max(20, "کد تخفیف باید حداکثر ۲۰ کاراکتر باشد"),
        type: z.enum(['percentage', 'fixed', 'free'], { message: "نوع تخفیف نامعتبر است" }),
        value: z.number().min(0, "مقدار تخفیف نمی تواند منفی باشد"),
      });

      const validatedData = discountCodeSchema.parse(req.body);

      const code = await storage.createDiscountCode(validatedData);
      
      await storage.logActivity({
        userId,
        action: "discount_code_created",
        entity: "discount_code",
        entityId: code.id,
        details: JSON.stringify({ code: code.code, type: code.type }),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({ 
        message: "کد تخفیف با موفقیت ایجاد شد",
        code 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map((e) => e.message).join(', ');
        return res.status(400).json({ message: `خطا در اعتبارسنجی: ${errorMessage}` });
      }
      res.status(500).json({ message: "خطا در ایجاد کد تخفیف" });
    }
  });

  app.put("/api/admin/discount-codes/:id", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const codeId = parseInt(req.params.id);
      const code = await storage.updateDiscountCode(codeId, req.body);
      
      if (!code) {
        return res.status(404).json({ message: "کد تخفیف یافت نشد" });
      }

      res.json(code);
    } catch (error) {
      res.status(500).json({ message: "خطا در به روزرسانی کد تخفیف" });
    }
  });

  app.delete("/api/admin/discount-codes/:id", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const codeId = parseInt(req.params.id);
      const success = await storage.deleteDiscountCode(codeId);
      
      if (!success) {
        return res.status(404).json({ message: "کد تخفیف یافت نشد" });
      }

      res.json({ message: "کد تخفیف با موفقیت حذف شد" });
    } catch (error) {
      res.status(500).json({ message: "خطا در حذف کد تخفیف" });
    }
  });

   
  app.delete("/api/admin/files/:id", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const fileId = parseInt(req.params.id);
      const success = await storage.deleteFile(fileId);
      
      if (success) {
        res.json({ message: "فایل با موفقیت حذف شد" });
      } else {
        res.status(500).json({ message: "خطا در حذف فایل" });
      }
    } catch (error) {
      res.status(500).json({ message: "خطا در حذف فایل" });
    }
  });

   
  app.post("/api/admin/files", upload.single('file'), async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

       
      if (!req.file) {
        return res.status(400).json({ message: "فایل آپلود نشده است" });
      }

       
      const fileUploadSchema = z.object({
        title: z.string().min(1, "عنوان فایل الزامی است").max(255, "عنوان فایل خیلی طولانی است"),
        description: z.string().optional(),
        price: z.coerce.number().min(0, "قیمت نمی تواند منفی باشد"),
        freePages: z.coerce.number().int().min(1, "تعداد صفحات رایگان باید حداقل ۱ باشد").max(50, "تعداد صفحات رایگان خیلی زیاد است")
      });

      const validatedData = fileUploadSchema.parse(req.body);

       
      try {
        await fs.promises.access(req.file.path, fs.constants.R_OK);
      } catch (accessError) {
        console.error('File access error:', accessError);
        return res.status(500).json({ message: "فایل آپلود شده یافت نشد" });
      }

       
      const fileStats = await fs.promises.stat(req.file.path);
      const fileSizeInBytes = fileStats.size;
      
       
      if (fileSizeInBytes > 50 * 1024 * 1024) {
        await fs.promises.unlink(req.file.path);  
        return res.status(400).json({ message: "حجم فایل نباید بیشتر از ۵۰ مگابایت باشد" });
      }

       
      if (fileSizeInBytes < 1024) {
        await fs.promises.unlink(req.file.path);  
        return res.status(400).json({ message: "فایل آپلود شده خیلی کوچک است" });
      }
      
       
      const estimatedPages = Math.max(1, Math.floor(fileSizeInBytes / 15000) + 10);

       
      const uploadPath = 'uploads/';
      try {
        await fs.promises.access(uploadPath);
      } catch {
        await fs.promises.mkdir(uploadPath, { recursive: true });
      }

       
      const newFile = await storage.createPdfFile({
        title: validatedData.title.trim(),
        description: validatedData.description?.trim() || null,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: fileSizeInBytes,
        totalPages: estimatedPages,
        freePages: validatedData.freePages,
        price: validatedData.price,
        thumbnailUrl: null,
        uploaderId: userId,
        isActive: true
      });

      res.json({ 
        message: "فایل با موفقیت آپلود شد",
        file: newFile
      });
    } catch (error) {
      console.error('PDF upload error:', error);
      
       
      if (req.file?.path) {
        try {
          await fs.promises.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }
      
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map((e) => e.message).join(', ');
        return res.status(400).json({ message: `خطا در اعتبارسنجی: ${errorMessage}` });
      }
      
      res.status(500).json({ message: "خطا در آپلود فایل. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید." });
    }
  });

   
  app.patch("/api/admin/files/:id", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const fileId = parseInt(req.params.id);
      
       
      const fileUpdateSchema = z.object({
        title: z.string().min(1, "عنوان فایل الزامی است").max(255, "عنوان فایل خیلی طولانی است").optional(),
        description: z.string().optional(),
        price: z.coerce.number().min(0, "قیمت نمی تواند منفی باشد").optional(),
        freePages: z.coerce.number().int().min(1, "تعداد صفحات رایگان باید حداقل ۱ باشد").max(50, "تعداد صفحات رایگان خیلی زیاد است").optional(),
        isActive: z.boolean().optional()
      });

      const validatedData = fileUpdateSchema.parse(req.body);
      
      const file = await storage.updatePdfFile(fileId, validatedData);
      
      if (!file) {
        return res.status(404).json({ message: "فایل یافت نشد" });
      }

      res.json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map((e) => e.message).join(', ');
        return res.status(400).json({ message: `خطا در اعتبارسنجی: ${errorMessage}` });
      }
      
      res.status(500).json({ message: "خطا در ویرایش فایل" });
    }
  });

  app.patch("/api/admin/files/:id/toggle", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const fileId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const updatedFile = await storage.updateFileStatus(fileId, isActive);
      
      if (updatedFile) {
        res.json(updatedFile);
      } else {
        res.status(404).json({ message: "فایل یافت نشد" });
      }
    } catch (error) {
      res.status(500).json({ message: "خطا در تغییر وضعیت فایل" });
    }
  });

   
  app.patch("/api/admin/users/:id/role", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const targetUserId = parseInt(req.params.id);
      const { role } = req.body;

       
      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: "نقش نامعتبر است" });
      }

       
      if (role === 'admin') {
         
        await storage.logActivity({
          userId: userId,
          action: "admin_promotion_blocked",
          entity: "user",
          entityId: targetUserId,
          details: JSON.stringify({ 
            targetUserId,
            attemptedRole: role,
            reason: "single_admin_policy"
          }),
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
        
        return res.status(403).json({ 
          message: "تغییر نقش به مدیر مجاز نیست. سیستم فقط یک مدیر دارد و نمی توان مدیر جدید ایجاد کرد."
        });
      }

       
      if (targetUserId === userId) {
        return res.status(400).json({ message: "نمی توانید نقش خود را تغییر دهید" });
      }

       
      const targetUser = await storage.getUser(targetUserId);
      if (targetUser && targetUser.role === 'admin') {
         
        await storage.logActivity({
          userId: userId,
          action: "admin_demotion_blocked",
          entity: "user",
          entityId: targetUserId,
          details: JSON.stringify({ 
            targetUserId,
            currentRole: targetUser.role,
            attemptedRole: role,
            reason: "single_admin_policy"
          }),
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
        
        return res.status(403).json({ 
          message: "نمی توانید نقش مدیر را تغییر دهید. سیستم باید حداقل یک مدیر داشته باشد."
        });
      }

      const updatedUser = await storage.updateUserRole(targetUserId, role);
      
      if (updatedUser) {
         
        await storage.logActivity({
          userId: userId,
          action: "user_role_updated",
          entity: "user",
          entityId: targetUserId,
          details: JSON.stringify({ newRole: role }),
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });

        res.json(sanitizeUser(updatedUser));
      } else {
        res.status(404).json({ message: "کاربر یافت نشد" });
      }
    } catch (error) {
      res.status(500).json({ message: "خطا در تغییر نقش کاربر" });
    }
  });

  app.patch("/api/admin/users/:id/status", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const targetUserId = parseInt(req.params.id);
      const { isActive } = req.body;
      
       
      if (!isActive) {
        const targetUser = await storage.getUser(targetUserId);
        if (targetUser && targetUser.role === 'admin') {
           
          await storage.logActivity({
            userId: userId,
            action: "admin_deactivation_blocked",
            entity: "user",
            entityId: targetUserId,
            details: JSON.stringify({ 
              targetUserId,
              targetRole: targetUser.role,
              reason: "single_admin_policy"
            }),
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          });
          
          return res.status(403).json({ 
            message: "نمی توانید مدیر را غیرفعال کنید. سیستم باید حداقل یک مدیر فعال داشته باشد."
          });
        }
      }
      
      const updatedUser = await storage.updateUserStatus(targetUserId, isActive);
      
      if (updatedUser) {
        res.json(sanitizeUser(updatedUser));
      } else {
        res.status(404).json({ message: "کاربر یافت نشد" });
      }
    } catch (error) {
      res.status(500).json({ message: "خطا در تغییر وضعیت کاربر" });
    }
  });

   
  app.patch("/api/admin/purchases/:id/status", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const purchaseId = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      
      const updatedPurchase = await storage.updatePurchaseStatusAdmin(purchaseId, status, adminNotes);
      
      if (updatedPurchase) {
        res.json(updatedPurchase);
      } else {
        res.status(404).json({ message: "خرید یافت نشد" });
      }
    } catch (error) {
      res.status(500).json({ message: "خطا در تغییر وضعیت خرید" });
    }
  });

   
  app.get("/api/admin/payment-stats", async (req, res) => {
    try {
      const auth = await verifyAdmin(req, res);
      if (!auth) return;

      const stats = await storage.getPaymentStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت آمار پرداخت ها" });
    }
  });

   
  app.post("/api/admin/users", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const { firstName, lastName, email, username, password, role, phoneNumber } = req.body;
      
       
      if (role && role === 'admin') {
         
        await storage.logActivity({
          userId: userId,
          action: "admin_creation_blocked",
          entity: "user",
          entityId: null,
          details: JSON.stringify({ 
            attemptedEmail: email, 
            attemptedUsername: username,
            reason: "single_admin_policy"
          }),
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
        
        return res.status(403).json({ 
          message: "ایجاد کاربر با نقش مدیر مجاز نیست. سیستم فقط یک مدیر دارد و نمی توان مدیر جدید اضافه کرد."
        });
      }
      
       
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "کاربری با این ایمیل قبلاً ثبت شده است" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "این نام کاربری قبلاً انتخاب شده است" });
      }

       
      const hashedPassword = await bcrypt.hash(password, 12);

       
      const newUser = await storage.createUser({
        firstName,
        lastName,
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        role: "user",  
        isActive: true,
      });

       
      await storage.logActivity({
        userId: userId,
        action: "user_created",
        entity: "user",
        entityId: newUser.id,
        details: JSON.stringify({ email, username, role }),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneNumber: newUser.phoneNumber,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        isActive: newUser.isActive,
      });
    } catch (error) {
      
       
      if (error instanceof Error) {
        if (error.message.includes('UNIQUE constraint failed: users.email')) {
          return res.status(400).json({ message: "کاربری با این ایمیل قبلاً ثبت شده است" });
        }
        if (error.message.includes('UNIQUE constraint failed: users.username')) {
          return res.status(400).json({ message: "این نام کاربری قبلاً انتخاب شده است" });
        }
      }
      
      res.status(500).json({ message: "خطا در ایجاد کاربر" });
    }
  });

   
  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const targetUserId = parseInt(req.params.id);
      
       
      if (targetUserId === userId) {
        return res.status(400).json({ message: "نمی توانید حساب کاربری خود را حذف کنید" });
      }

       
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }

       
      if (targetUser.role === 'admin') {
        const adminCount = await storage.getAdminCount();
        
        if (adminCount <= 1) {
          await storage.logActivity({
            userId: userId,
            action: "admin_deletion_blocked",
            entity: "user",
            entityId: targetUserId,
            details: JSON.stringify({ 
              targetUserId,
              targetRole: targetUser.role,
              reason: "last_admin_protection",
              adminCount
            }),
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          });
          
          return res.status(403).json({ 
            message: "نمی توانید آخرین مدیر سیستم را حذف کنید. سیستم باید حداقل یک مدیر داشته باشد."
          });
        }
        
        await storage.logActivity({
          userId: userId,
          action: "admin_deletion_attempt",
          entity: "user",
          entityId: targetUserId,
          details: JSON.stringify({ 
            targetUserId,
            targetEmail: targetUser.email,
            targetRole: targetUser.role,
            adminCount
          }),
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
      }

      const deleted = await storage.deleteUser(targetUserId);
      
      if (deleted) {
         
        await storage.logActivity({
          userId: userId,
          action: "user_deactivated",
          entity: "user",
          entityId: targetUserId,
          details: JSON.stringify({ email: targetUser.email, username: targetUser.username }),
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });

        res.json({ message: "کاربر با موفقیت غیرفعال شد" });
      } else {
        res.status(404).json({ message: "کاربر یافت نشد" });
      }
    } catch (error) {
      res.status(500).json({ message: "خطا در حذف کاربر" });
    }
  });

   
  app.delete("/api/admin/users/:id/permanent", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const targetUserId = parseInt(req.params.id);
      
       
      if (targetUserId === userId) {
        return res.status(400).json({ message: "نمی توانید حساب کاربری خود را حذف کنید" });
      }

       
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }

       
      if (targetUser.role === 'admin') {
        const adminCount = await storage.getAdminCount();
        
        if (adminCount <= 1) {
          await storage.logActivity({
            userId: userId,
            action: "admin_permanent_deletion_blocked",
            entity: "user",
            entityId: targetUserId,
            details: JSON.stringify({ 
              targetUserId,
              targetRole: targetUser.role,
              reason: "last_admin_protection",
              adminCount
            }),
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          });
          
          return res.status(403).json({ 
            message: "نمی توانید آخرین مدیر سیستم را حذف کنید. سیستم باید حداقل یک مدیر داشته باشد."
          });
        }
      }

      const deleted = await storage.permanentDeleteUser(targetUserId);
      
      if (deleted) {
         
        await storage.logActivity({
          userId: userId,
          action: "user_permanently_deleted",
          entity: "user",
          entityId: targetUserId,
          details: JSON.stringify({ 
            email: targetUser.email, 
            username: targetUser.username,
            firstName: targetUser.firstName,
            lastName: targetUser.lastName
          }),
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });

        res.json({ message: "کاربر به طور دائم از دیتابیس حذف شد" });
      } else {
        res.status(404).json({ message: "کاربر یافت نشد" });
      }
    } catch (error) {
      res.status(500).json({ message: "خطا در حذف دائمی کاربر" });
    }
  });

   
  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const targetUserId = parseInt(req.params.id);
      
       
      const validatedData = updateUserSchema.parse(req.body);
      
       
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "کاربر یافت نشد" });
      }

       
      if (validatedData.email && validatedData.email !== targetUser.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser && existingUser.id !== targetUserId) {
          return res.status(400).json({ message: "کاربری با این ایمیل قبلاً ثبت شده است" });
        }
      }

       
      if (validatedData.username && validatedData.username !== targetUser.username) {
        const existingUsername = await storage.getUserByUsername(validatedData.username);
        if (existingUsername && existingUsername.id !== targetUserId) {
          return res.status(400).json({ message: "این نام کاربری قبلاً انتخاب شده است" });
        }
      }

       
      const updateData: Partial<User> = {};
      
      if (validatedData.firstName !== undefined) updateData.firstName = validatedData.firstName;
      if (validatedData.lastName !== undefined) updateData.lastName = validatedData.lastName;
      if (validatedData.email !== undefined) updateData.email = validatedData.email;
      if (validatedData.username !== undefined) updateData.username = validatedData.username;
      if (validatedData.phoneNumber !== undefined) {
        updateData.phoneNumber = validatedData.phoneNumber || null;
      }
      
       
      if (validatedData.password && validatedData.password.trim() !== "") {
        updateData.password = await bcrypt.hash(validatedData.password, 12);
      }

      const updatedUser = await storage.updateUser(targetUserId, updateData);
      
      if (updatedUser) {
         
        await storage.logActivity({
          userId: userId,
          action: "user_updated",
          entity: "user",
          entityId: targetUserId,
          details: JSON.stringify({ email: updatedUser.email, username: updatedUser.username }),
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });

        res.json({
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phoneNumber: updatedUser.phoneNumber,
          email: updatedUser.email,
          username: updatedUser.username,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
        });
      } else {
        res.status(404).json({ message: "کاربر یافت نشد" });
      }
    } catch (error) {
      res.status(500).json({ message: "خطا در ویرایش کاربر" });
    }
  });


   
  app.get("/api/admin/reports/excel", async (req, res) => {
    try {
      const userId = getUserIdFromSession(req);
      if (!userId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

       
      const [stats, users, files, purchases, activities] = await Promise.all([
        storage.getAdminStats(),
        storage.getAllUsers(),
        storage.getAllFiles(),
        storage.getAllPurchases(),
        storage.getRecentActivities()
      ]);

       
      const workbook = new ExcelJS.Workbook();
      
       
      const statsSheet = workbook.addWorksheet('آمار کلی');
      statsSheet.addRow(['نوع آمار', 'مقدار']);
      statsSheet.addRow(['تعداد کاربران', stats.totalUsers]);
      statsSheet.addRow(['تعداد فایل ها', stats.totalFiles]);
      statsSheet.addRow(['درآمد کل', `${stats.totalRevenue} تومان`]);
      statsSheet.addRow(['پرداخت های در انتظار', stats.pendingPayments]);
      
       
      const usersSheet = workbook.addWorksheet('کاربران');
      usersSheet.addRow(['شناسه', 'نام', 'نام خانوادگی', 'ایمیل', 'نام کاربری', 'نقش', 'وضعیت', 'شماره تلفن']);
      users.forEach((user) => {
        usersSheet.addRow([
          user.id,
          user.firstName,
          user.lastName,
          user.email,
          user.username,
          user.role === 'admin' ? 'مدیر' : 'کاربر',
          user.isActive ? 'فعال' : 'غیرفعال',
          user.phoneNumber || 'ندارد'
        ]);
      });

       
      const filesSheet = workbook.addWorksheet('فایل ها');
      filesSheet.addRow(['شناسه', 'عنوان', 'توضیحات', 'قیمت', 'وضعیت', 'تعداد بازدید']);
      files.forEach((file) => {
        filesSheet.addRow([
          file.id,
          file.title,
          file.description,
          `${file.price} تومان`,
          file.isActive ? 'فعال' : 'غیرفعال',
          file.viewCount,
        ]);
      });

       
      const purchasesSheet = workbook.addWorksheet('خریدها');
      purchasesSheet.addRow(['شناسه', 'کاربر', 'فایل', 'مبلغ نهایی', 'وضعیت', 'تاریخ ایجاد']);
      purchases.forEach((purchase) => {
        purchasesSheet.addRow([
          purchase.id,
          purchase.userId,
          purchase.fileId,
          `${purchase.finalAmount} تومان`,
          purchase.status === 'approved' ? 'تایید شده' : purchase.status === 'pending' ? 'در انتظار' : 'رد شده',
          new Date(purchase.createdAt).toLocaleDateString('fa-IR')
        ]);
      });

       
      const activitiesSheet = workbook.addWorksheet('فعالیت ها');
      activitiesSheet.addRow(['شناسه', 'کاربر', 'عملیات', 'موجودیت', 'شناسه موجودیت', 'تاریخ']);
      activities.forEach((activity) => {
        activitiesSheet.addRow([
          activity.id,
          activity.userId,
          activity.action,
          activity.entity || 'ندارد',
          activity.entityId || 'ندارد',
          new Date(activity.createdAt).toLocaleDateString('fa-IR')
        ]);
      });

       
      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="admin-report.xlsx"');
      res.send(buffer);
      
    } catch (error) {
      res.status(500).json({ message: "خطا در تولید گزارش اکسل" });
    }
  });

   
  app.get("/api/admin/users/:userId/permissions", async (req, res) => {
    try {
      const adminId = getUserIdFromSession(req);
      if (!adminId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const admin = await storage.getUser(adminId);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const userId = parseInt(req.params.userId);
      const permissions = await storage.getUserFilePermissions(userId);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: "خطا در دریافت مجوزها" });
    }
  });

   
  app.post("/api/admin/users/:userId/permissions", async (req, res) => {
    try {
      const adminId = getUserIdFromSession(req);
      if (!adminId) {
        return res.status(401).json({ message: "احراز هویت انجام نشده" });
      }

      const admin = await storage.getUser(adminId);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ message: "دسترسی مجاز نیست" });
      }

      const userId = parseInt(req.params.userId);
      const { filePermissions } = req.body;  
      
      await storage.updateUserFilePermissions(userId, filePermissions, adminId);
      
       
      await storage.logActivity({
        userId: adminId,
        action: 'update_permissions',
        entity: 'user',
        entityId: userId,
        details: `مجوزهای فایل کاربر به روزرسانی شد`
      });
      
      res.json({ message: "مجوزها با موفقیت به روزرسانی شد" });
    } catch (error) {
      res.status(500).json({ message: "خطا در به روزرسانی مجوزها" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
