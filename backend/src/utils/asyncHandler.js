/**
 * asyncHandler - wraps async route handlers for Express 4 and 5.
 * Catches promise rejections and forwards them to next(err).
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export { asyncHandler };
