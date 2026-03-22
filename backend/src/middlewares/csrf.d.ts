import { Request, Response, NextFunction } from 'express';
export declare const generateCsrfToken: (req: Request, res: Response) => string;
export declare const verifyCsrfToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const getCsrfToken: (req: Request, res: Response) => void;
//# sourceMappingURL=csrf.d.ts.map