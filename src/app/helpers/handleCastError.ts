/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interfaces/errors.types";

export const handleCastError = (
  err: mongoose.Error.CastError
): TGenericErrorResponse => {
  return {
    statusCode: 400,
    message: "Invalid mongodb object Id. Please provide a valid Id",
  };
};
