// src/middleware/debounce.middleware.js

/**
 * ⏱️ Debounce Middleware
 * Prevents duplicate POST/PUT/PATCH requests with the same body from the same IP
 * within a defined time window (default 3 seconds).
 */

const recentRequests = new Map();

export function debounceRequests(windowMs = 3000) {
  return (req, res, next) => {
    // Only debounce for write operations (POST, PUT, PATCH)
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
      return next();
    }

    const key = `${req.ip}-${req.path}-${JSON.stringify(req.body)}`;
    const now = Date.now();
    const lastTime = recentRequests.get(key);

    if (lastTime && now - lastTime < windowMs) {
      const remaining = Math.ceil((windowMs - (now - lastTime)) / 1000);
      return res.status(429).json({
        error: `Duplicate request detected. Please wait ${remaining}s before retrying.`,
      });
    }

    recentRequests.set(key, now);

    // Cleanup old entries asynchronously
    setTimeout(() => recentRequests.delete(key), windowMs * 2);

    next();
  };
}