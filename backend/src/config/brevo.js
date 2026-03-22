"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brevoConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.brevoConfig = {
    apiKey: process.env.BREVO_API_KEY,
    senderEmail: process.env.BREVO_EMAIL,
    senderName: 'Polomolok Food Ordering'
};
if (!exports.brevoConfig.apiKey || !exports.brevoConfig.senderEmail) {
    throw new Error('Brevo configuration is missing. Check your .env file.');
}
//# sourceMappingURL=brevo.js.map