import { Request, Response } from 'express';
import { AuthRequest } from '../types';
export declare const getAllFoods: (req: Request, res: Response) => Promise<void>;
export declare const getFoodById: (req: Request, res: Response) => Promise<void>;
export declare const createFood: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateFood: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteFood: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=foodController.d.ts.map