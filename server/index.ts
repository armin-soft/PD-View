import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import SqliteStore from "better-sqlite3-session-store";
import Database from "better-sqlite3";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase, testDatabaseConnection } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

 
const sessionsDb = new Database('./sessions.db');
const SqliteSessionStore = SqliteStore(session);

 
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-dev-secret-should-not-be-used-in-production';

if (process.env.NODE_ENV === 'production' && SESSION_SECRET === 'fallback-dev-secret-should-not-be-used-in-production') {
  throw new Error('SESSION_SECRET environment variable is required in production');
}

app.use(session({
  store: new SqliteSessionStore({
    client: sessionsDb,
    expired: {
      clear: true,
      intervalMs: 900000  
    }
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,  
    sameSite: 'strict',  
  },
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
   
  await initializeDatabase();
  await testDatabaseConnection();
  
  const server = await registerRoutes(app);

  app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    if (process.env.NODE_ENV !== 'production') {
    }
  });

   
   
   
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

   
   
   
   
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
