import { Request } from 'express';
export const getLocalURL = (req: Request): string => {
    
    return `${req.protocol}://${req.get('host')}`
}