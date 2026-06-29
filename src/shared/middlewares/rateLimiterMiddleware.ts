import rateLimit from "express-rate-limit";

const rateLimitResponse = (message: string) => ({
  success: false,
  message,
});

// Applied to all /api/v1/* routes — generous limit for normal usage
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(rateLimitResponse("Too many requests, please try again later."));
  },
});

// Applied only to /api/v1/auth — stricter to prevent brute-force on login/OTP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(rateLimitResponse("Too many auth attempts, please try again in 15 minutes."));
  },
});
