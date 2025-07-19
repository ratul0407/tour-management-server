import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string" })
    .min(2, {
      message: "Name too short minimum 2 characters long required!",
    })
    .max(50, { message: "Name too long " }),
  email: z
    .string({ invalid_type_error: "Email must be string" })
    .email({ message: "Invalid email address format" })
    .min(5, { message: "Email is too short!" })
    .max(36, { message: "Email is too long" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  // .regex(/^(?=.*[A-Z])/, {
  //   message: "Password must contain at least 1 uppercase letter.",
  // })
  // .regex(/^(?=.*[!@#$%^&*])/, {
  //   message: "Password must contain at least 1 special character.",
  // })
  // .regex(/^(?=.*\d)/, {
  //   message: "Password must contain at least 1 number",
  // }),
  phone: z
    .string({ invalid_type_error: "Phone number must be a string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  address: z
    .string({ invalid_type_error: "Address must be a string" })
    .max(200, { message: "Address cannot exceed 200 characters" })
    .optional(),
  IsActive: z.boolean(),
});

export const updateZodSchema = z.object({
  name: z
    .string({ invalid_type_error: "Name must be string" })
    .min(2, {
      message: "Name too short minimum 2 characters long required!",
    })
    .max(50, { message: "Name too long " })
    .optional(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number",
    })
    .optional(),
  phone: z
    .string({ invalid_type_error: "Phone number must be a string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  address: z
    .string({ invalid_type_error: "Address must be a string" })
    .max(200, { message: "Address cannot exceed 200 characters" })
    .optional(),
  role: z.enum(Object.keys(Role) as [string]).optional(),
  isActive: z.enum(Object.keys(IsActive) as [string]).optional(),
  isDeleted: z
    .boolean({ invalid_type_error: "isDeleted must be true or false" })
    .optional(),
  isVerified: z
    .boolean({ invalid_type_error: "isVerified must be true or false" })
    .optional(),
});
