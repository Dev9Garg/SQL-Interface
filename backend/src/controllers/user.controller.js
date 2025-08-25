import {apiResponse} from '../utils/apiResponse.js'
import { User } from '../models/user.model.js'
import {asyncHandler} from "../utils/asyncHandler.js"
import bcrypt from "bcrypt"
import { sequelize } from '../db/index.js'

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

    try {
        await sequelize.transaction(async (t) => {
            await User.create({
                username: username,
                email: email,
                fullName: fullName,
                password: hashedPassword
            },
            {
                transaction: t
            })
    
            // 1. Create database user principal
            await sequelize.query(
                `CREATE USER [app_user_${username}] WITHOUT LOGIN;`,
                { transaction: t }
            )
    
            // 2. Create schema owned by that principal(user)
            await sequelize.query(
                `CREATE SCHEMA [user_${username}] AUTHORIZATION [app_user_${username}];`,
                { transaction: t }
            )
    
            // 3. Grant rights on the new schema
            await sequelize.query(
                `GRANT SELECT, INSERT, UPDATE, DELETE, ALTER ON SCHEMA::[user_${username}] TO [app_user_${username}];`,
                { transaction: t }
            );

            // 4. Grant CREATE TABLE right at the database level
            await sequelize.query(
                `GRANT CREATE TABLE TO [app_user_${username}];`,
                { transaction: t }
            );
    
            // 5. Deny access to dbo
            await sequelize.query(
                `DENY SELECT, INSERT, UPDATE, DELETE, ALTER ON SCHEMA::dbo TO [app_user_${username}];`,
                { transaction: t }
            );
    
            // 6. (Optional) Set default schema for easier queries
            await sequelize.query(
                `ALTER USER [app_user_${username}] WITH DEFAULT_SCHEMA = [user_${username}];`,
                { transaction: t }
            );
        })
    } catch (err) {
        console.error("Schema setup failed:", err.original?.message || err.message);
        throw err;
    }

    return res
    .status(201)
    .json(
        new apiResponse(
            200,
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

    if(!loggedInUser) {
        return res
        .status(500)
        .json(
            {
                success: false,
                message: "Something went wrong while logging you in, pls try again !!"
            }
        )
    }

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

const SQLQueryExecutor = asyncHandler(async (req, res) => {
    const {SQLQuery} = req.body;

    const [rows] = await sequelize.query(SQLQuery)

    return res
    .json(
        new apiResponse(
            200,
            rows,
            "query executed successfully !!"
        )
    )
})

export {
    register,
    login,
    logout,
    SQLQueryExecutor
}