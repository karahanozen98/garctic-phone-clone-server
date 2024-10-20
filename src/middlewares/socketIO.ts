export const socketIO = (io: any) => (req: any, res: any, next: any) => {
  try {
    req.io = io;
    next();
  } catch (error) {
    next(error);
  }
};
