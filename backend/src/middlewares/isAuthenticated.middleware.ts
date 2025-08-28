import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/appError";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    console.log("isAuthenticated middleware - Session:", req.session);
    console.log("isAuthenticated middleware - User:", req.user);
    console.log("isAuthenticated middleware - Is Authenticated:", req.isAuthenticated());
    
    if(!req.user || !req.user._id){
        console.log("Authentication failed - No user or user._id");
        throw new UnauthorizedException("Unauthorized");
    }
    next();
}

export default isAuthenticated;