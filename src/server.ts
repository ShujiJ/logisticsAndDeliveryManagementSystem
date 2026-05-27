import app from "./app";
import sequelize from "./config/dataBase";
import { env } from "./config/env";

async function startServer() {
  try {

    await sequelize.authenticate();

    console.log("Database connected");

    // await sequelize.sync();

    // console.log("Database synced");

    app.listen(env.PORT, () => {
      console.log(
        `Server running on port ${env.PORT}`
      );
    });

  } catch (error) {

    console.error(error);
  }
}

startServer();