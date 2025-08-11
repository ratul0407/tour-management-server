"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userTokens_1 = require("../../utils/userTokens");
const env_1 = require("../../config/env");
const sendEmail_1 = require("../../utils/sendEmail");
const credentialsLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password: pass } = payload;
    const isUserExists = yield user_model_1.User.findOne({ email });
    if (!isUserExists) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email does not exist");
    }
    const isPasswordMatched = yield bcryptjs_1.default.compare(pass, isUserExists.password);
    if (!isPasswordMatched) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Incorrect Password");
    }
    const userTokens = (0, userTokens_1.createUserTokens)(isUserExists);
    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
    };
});
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccessToken = yield (0, userTokens_1.createNewAccessTokenWithRefreshToken)(refreshToken);
    return { accessToken: newAccessToken };
});
const changePassword = (oldPassword, newPassword, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedToken.userId);
    const isOldPasswordMatch = yield bcryptjs_1.default.compare(oldPassword, user === null || user === void 0 ? void 0 : user.password);
    if (!isOldPasswordMatch) {
        throw new appError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Old password does not match");
    }
    user.password = yield bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    user === null || user === void 0 ? void 0 : user.save();
});
const setPassword = (userId, plainPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "User does not exist");
    }
    if (user.password &&
        user.auths.some((providerObj) => providerObj.provider === "google")) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "You have already set your password, now you can change your password from your profile");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(plainPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const auths = [
        ...user.auths,
        { provider: "credentials", providerId: user.email },
    ];
    user.password = hashedPassword;
    user.auths = auths;
    yield user.save();
});
const forgetPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExists = yield user_model_1.User.findOne({ email });
    if (!isUserExists) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "User does not exist");
    }
    if (!isUserExists.isVerified) {
        throw new appError_1.default(401, "User is not verified");
    }
    if (isUserExists.isDeleted) {
        throw new appError_1.default(401, "User is deleted");
    }
    if (isUserExists.isActive === user_interface_1.IsActive.BLOCKED ||
        isUserExists.isActive === user_interface_1.IsActive.INACTIVE) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, `User is ${isUserExists.isActive}`);
    }
    const JwtPayload = {
        userId: isUserExists._id,
        email: isUserExists.email,
        role: isUserExists.role,
    };
    const resetToken = jsonwebtoken_1.default.sign(JwtPayload, env_1.envVars.JWT_ACCESS_SECRET, {
        expiresIn: "10m",
    });
    const resetUILink = `${env_1.envVars.FRONTEND_URL}/reset-password?id=${isUserExists._id}&token=${resetToken}`;
    (0, sendEmail_1.sendEmail)({
        to: isUserExists.email,
        subject: "Password reset",
        templateName: "forgetPassword",
        templateData: {
            name: isUserExists.name,
            resetUILink,
        },
    });
});
const resetPassword = (newPassword, id, token) => __awaiter(void 0, void 0, void 0, function* () {
    if (id !== token.userId) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "You cannot reset your password");
    }
    const isUserExists = yield user_model_1.User.findById(token.userId);
    if (!isUserExists) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Your does not exist");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    isUserExists.password = hashedPassword;
    yield isUserExists.save();
});
exports.AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    changePassword,
    setPassword,
    forgetPassword,
    resetPassword,
};
//http://localhost:5173/reset-password?id=6878b55167ccccc419d02fd0&token=
