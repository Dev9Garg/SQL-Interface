
import { Sequelize } from "sequelize";

import {
  DATABASE_NAME,
  PASSWORD,
  SERVER_HOSTNAME,
  DATABASE_USERNAME,
} from "../config/config.js";

// WOW NOTE - when i wrote the variable name as USERNAME in env instead of (DATABASE_USERNAME),
// it was printing my username (Dev.9.Garg) , but when i changed it to something other than USERNAME
// then it took the right name which i provided in the env file.

const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, PASSWORD, {
  host: SERVER_HOSTNAME,
  dialect: "mssql",
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
    acquire: 25000,
    requestTimeout: 300000,
  },
  logging: false,
});

// const sequelizeDynamic (async(dynamicDbName) => { 
//   await new Sequelize(dynamicDbName, DATABASE_USERNAME, PASSWORD, {
//     host: SERVER_HOSTNAME,
//     dialect: "mssql",
//     dialectOptions: {
//       options: {
//         encrypt: false,
//         trustServerCertificate: true,
//       },
//     },
//     pool: {
//       max: 5,
//       min: 0,
//       idle: 10000,
//       acquire: 25000,
//       requestTimeout: 300000,
//     },
//     logging: false,
//   }).authenticate();
// });

const connectdb = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to SQL Server has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// const dynamicConnectdb = async () => {
//   try {
//     await sequelize.close();

//     await sequelizeDynamic();
//     console.log("Connection to another SQL Server has been established successfully.")
//   } catch (error) {
//     console.error("Unable to connect to another database, pls try again : ", error);
//   } 
// };

export { connectdb, sequelize };
