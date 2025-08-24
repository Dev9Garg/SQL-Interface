import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Aurhorization")?.replace("Bearer ", "")

        if(!token) {
            return res
            .status(401)
            .json(
                {
                    success: false,
                    message: "Uauthorized Access !!"
                }
            )
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findByPk(decodedToken?.id, {
            attributes: {exclude: ['password', 'refreshToken']}
        })

        if(!user) {
            return res
            .status(401)
            .json(
                {
                    success: false,
                    message: "Invalid access token !!"
                }
            )
        }

        req.user = user;
        next();
    } catch (error) {
        return res
        .status(401)
        .json(
            {
                success: false,
                message: error?.message || "Invalid access token !!"
            }
        )
    }
})
