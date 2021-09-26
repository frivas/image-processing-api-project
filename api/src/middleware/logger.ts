import { Request, Response, NextFunction } from 'express';

const logger = (req: Request, _: Response, next: NextFunction): void => {
  console.log(`${req.path} was visited`);
  next();
};

export default logger;
