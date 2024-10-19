export const exceptionMiddleware = (error, req, res, next) => {
    res.status(error.statusCode || 400).json({
        isSuccess: false,
        result: error.message,
        stack: error.stack,
    });
};
//# sourceMappingURL=exceptionMiddleware.js.map