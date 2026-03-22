import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const createRider: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllRiders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAvailableRiders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateRider: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteRider: (req: AuthRequest, res: Response) => Promise<void>;
export declare const assignOrderToRider: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyDeliveries: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateLocation: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateDeliveryStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleAvailability: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=riderController.d.ts.map