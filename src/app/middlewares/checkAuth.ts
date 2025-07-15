import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/appError";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";

export const checkAuth =
  (...authRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization;
    console.log(accessToken);
    try {
      if (!accessToken) {
        throw new AppError(403, "Not token received");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;
      console.log(verifiedToken);

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route!");
      }
      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
