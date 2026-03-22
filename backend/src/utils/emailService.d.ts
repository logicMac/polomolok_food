interface EmailOptions {
    to: string;
    subject: string;
    htmlContent: string;
}
export declare const sendEmail: (options: EmailOptions) => Promise<boolean>;
export declare const sendOTPEmail: (email: string, otp: string) => Promise<boolean>;
export {};
//# sourceMappingURL=emailService.d.ts.map