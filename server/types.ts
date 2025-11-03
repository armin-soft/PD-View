import { Request } from "express";

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

 
export interface AuthenticatedRequest extends Request {
  session: Request['session'] & {
    userId?: number;
  };
}

 
export function getUserIdFromSession(req: Request): number | undefined {
  return req.session?.userId;
}

 
export function setUserIdInSession(req: Request, userId: number): void {
  if (req.session) {
    req.session.userId = userId;
  }
}