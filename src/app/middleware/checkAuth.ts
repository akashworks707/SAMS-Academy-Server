/* eslint-disable no-console */
import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import { verifyToken } from '../utils/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../modules/user/user.model';
import AppError from '../errorHelpers/appError';
import { envVars } from '../config/env';


export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {

    try {
        const accessToken = req.headers.authorization || req.cookies.accessToken

        if (!accessToken) {
            throw new AppError(httpStatus.NOT_FOUND, "Token not received.")
        }

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload;

        const isUserExist = await User.findOne({ email: verifiedToken.email })

        if (!isUserExist) {
            throw new AppError(httpStatus.NOT_FOUND, "User does not exist! Please register.")
        }

        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(httpStatus.UNAUTHORIZED, "You are not permitted to access this route")
        }

        req.user = verifiedToken;

        next()

    } catch (error) {
        console.log(error);
        next(error)
    }
}