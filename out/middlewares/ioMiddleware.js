export const ioMiddleware = (io) => (req, res, next) => {
    try {
        req.io = io;
        next();
    }
    catch (error) {
        next(error);
    }
};
