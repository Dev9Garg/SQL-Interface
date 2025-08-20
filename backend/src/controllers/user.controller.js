import {apiResponse} from '../utils/apiResponse.js'
import { User } from '../models/user.model.js'
import {asyncHandler} from "../utils/asyncHandler.js"
import bcrypt from "bcrypt"
import { where } from 'sequelize'

const register = asyncHandler(async (req, res) => {
    const {username, email, fullName, password} = req.body;

    if(
        [username, email, fullName, password].some((field) => field === undefined || field.trim() === "")
    ) {
        return res
        .status(400)
        .json(
            {
                success: false,
                message: "All fields are required !!"
            }
        )
    }

    const existingUser = await User.findOne({
        where: {
            email: email
        }
    })

    if(existingUser) {
        return res
        .status(400)
        .json(
            {
                success: false,
                message: "This Email already exists !!"
            }
        )
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
        username: username,
        email: email,
        fullName: fullName,
        password: hashedPassword
    })

    if(!createdUser) {
        return res
        .status(500)
        .json(
            {
                success: false,
                message: "Something went wrong while registering you !!"
            }
        )
    }

    return res
    .status(201)
    .json(
        new apiResponse(
            200,
            createdUser,
            "User registered successfully !!"
        )
    )
})

export {
    register
}