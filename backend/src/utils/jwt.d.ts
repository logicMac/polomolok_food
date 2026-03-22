import { TokenPayload } from '../types';
export declare const generateAccessToken: (payload: Omit<TokenPayload, "iat" | "exp">) => string;
export declare const generateRefreshToken: (payload: Omit<TokenPayload, "iat" | "exp">) => string;
export declare const verifyToken: (token: string) => TokenPayload;
export declare const generateOTP: () => string;
//# sourceMappingURL=jwt.d.ts.map