import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import jwt from 'jsonwebtoken'

const User = sequelize.define(
  "User",

  {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    refreshToken: {
      type: DataTypes.STRING,
    },
  },

  {
    timestamps: true,
  }
);

User.prototype.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this.id,
      email: this.email,
      username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

User.prototype.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this.id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

const modelSync = async () => {
  await sequelize.sync();
  console.log("models synchronized successfully !");
};

export { modelSync, User };
