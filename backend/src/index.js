
import dotenv from "dotenv";
dotenv.config({
  path: "./env",
});

import { connectdb } from "./db/index.js";
import { app } from "./app.js";

connectdb()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`server is running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Something went wrong while connecting to database : ", err);
  });
