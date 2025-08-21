import { Request } from 'express';

export interface JwtPayload {
  email: string;
  role?: string;
  orgId?: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
