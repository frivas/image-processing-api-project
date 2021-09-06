import { Request, Response, NextFunction } from 'express';

const validateReqQuery = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    for (const field of fields) {
      if (!req.query[field]) {
        // Field isn't present, end request
        return res.status(400).send(`The field: ${field} is required.`);
      }
    }
    next();
  };
};

export default validateReqQuery;
