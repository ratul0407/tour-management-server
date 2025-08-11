"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDuplicateError = void 0;
const handleDuplicateError = (err) => {
    return {
        statusCode: 400,
        message: `${err.keyValue.email} already exists`,
    };
};
exports.handleDuplicateError = handleDuplicateError;
