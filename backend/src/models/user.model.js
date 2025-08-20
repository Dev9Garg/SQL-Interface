import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

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

const modelSync = async () => {
  await sequelize.sync();
  console.log("models synchronized successfully !");
};

export { modelSync, User };
