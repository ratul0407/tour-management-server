import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

export const validateRequest =
  (zodSchema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    try {
      req.body = await zodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
