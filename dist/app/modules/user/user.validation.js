"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.updateZodSchema = exports.createZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "Name must be string" })
        .min(2, {
        message: "Name too short minimum 2 characters long required!",
    })
        .max(50, { message: "Name too long " }),
    email: zod_1.default
        .string({ invalid_type_error: "Email must be string" })
        .email({ message: "Invalid email address format" })
        .min(5, { message: "Email is too short!" })
        .max(36, { message: "Email is too long" }),
    password: zod_1.default
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
    phone: zod_1.default
        .string({ invalid_type_error: "Phone number must be a string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    address: zod_1.default
        .string({ invalid_type_error: "Address must be a string" })
        .max(200, { message: "Address cannot exceed 200 characters" })
        .optional(),
    IsActive: zod_1.default.boolean().optional(),
});
exports.updateZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "Name must be string" })
        .min(2, {
        message: "Name too short minimum 2 characters long required!",
    })
        .max(50, { message: "Name too long " })
        .optional(),
    phone: zod_1.default
        .string({ invalid_type_error: "Phone number must be a string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    address: zod_1.default
        .string({ invalid_type_error: "Address must be a string" })
        .max(200, { message: "Address cannot exceed 200 characters" })
        .optional(),
    role: zod_1.default.enum(Object.keys(user_interface_1.Role)).optional(),
    isActive: zod_1.default.enum(Object.keys(user_interface_1.IsActive)).optional(),
    isDeleted: zod_1.default
        .boolean({ invalid_type_error: "isDeleted must be true or false" })
        .optional(),
    isVerified: zod_1.default
        .boolean({ invalid_type_error: "isVerified must be true or false" })
        .optional(),
});
exports.updateUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ invalid_type_error: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." })
        .optional(),
    password: zod_1.default
        .string({ invalid_type_error: "Password must be string" })
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/^(?=.*[A-Z])/, {
        message: "Password must contain at least 1 uppercase letter.",
    })
        .regex(/^(?=.*[!@#$%^&*])/, {
        message: "Password must contain at least 1 special character.",
    })
        .regex(/^(?=.*\d)/, {
        message: "Password must contain at least 1 number.",
    })
        .optional(),
    phone: zod_1.default
        .string({ invalid_type_error: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    role: zod_1.default
        // .enum(["ADMIN", "GUIDE", "USER", "SUPER_ADMIN"])
        .enum(Object.values(user_interface_1.Role))
        .optional(),
    isActive: zod_1.default.enum(Object.values(user_interface_1.IsActive)).optional(),
    isDeleted: zod_1.default
        .boolean({ invalid_type_error: "isDeleted must be true or false" })
        .optional(),
    isVerified: zod_1.default
        .boolean({ invalid_type_error: "isVerified must be true or false" })
        .optional(),
    address: zod_1.default
        .string({ invalid_type_error: "Address must be string" })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(),
});
