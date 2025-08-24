import {apiResponse} from '../utils/apiResponse.js'
import { User } from '../models/user.model.js'
import {asyncHandler} from "../utils/asyncHandler.js"
import bcrypt from "bcrypt"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findByPk(userId);

        if(!user) {
            return res
            .status(404)
            .json(
                {
                    success: false,
                    message: "User not found while generating tokens !!"
                }
            )
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken

        await user.save({validate: false})

        return {accessToken, refreshToken}
    } catch (error) {
        console.error("Token generation error : ", error);
        return res
        .status(500)
        .json(
            {
                success: false,
                message: "Something went wrong while generating access and refresh tokens !!"
            }
        )
    }
}

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

const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    if(
        [email, password].some((field) => field === undefined || field.trim() === '')
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

    if(!existingUser) {
        return res
        .status(400)
        .json(
            {
                success: false,
                message: "First signup then login !!"
            }
        )
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

    if(!isPasswordValid) {
        return res
        .status(400)
        .json(
            {
                success: false,
                message: "Wrong email or password !!"
            }
        )
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(existingUser.id);

    const loggedInUser = await User.findByPk(
        existingUser.id,
        {
            attributes: {exclude: ['password', 'refreshToken']}
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedInUser
            },
            "You are logged in successfully !!"
        )
    )
})

const logout = asyncHandler(async (req, res) => {
    await User.update(
        {refreshToken: null},
        {
            where: {
                id: req.user.id
            }
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new apiResponse(
            200,
            {},
            "You are logged out successfully !!"
        )
    )
})

export {
    register,
    login,
    logout
}