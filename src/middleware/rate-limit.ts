import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitStore>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.limit = limit;
    this.windowMs = windowMs;

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  private getKey(req: Request): string {
    // Use IP address as key
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key);
      }
    }
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getKey(req);
      const now = Date.now();

      let record = this.store.get(key);

      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        this.store.set(key, record);
        return next();
      }

      if (record.count >= this.limit) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests. Please try again later.',
        });
      }

      record.count++;
      next();
    };
  }
}

export const registrationLimiter = new RateLimiter(3, 15 * 60 * 1000); // 3 per 15 minutes
