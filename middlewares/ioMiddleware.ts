export const ioMiddleware = (io: any) => (req: any, res: any, next: any) => {
  try {
    req.io = io;
    next();
  } catch (error) {
    next(error);
  }
};
