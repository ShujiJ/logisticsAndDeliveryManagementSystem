import app from "./app";
import sequelize from "./config/dataBase";
import { env } from "./config/env";
import { startCronJobs } from "./cron";

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
        startCronJobs();

      
    });

  } catch (error) {

    console.error(error);
  }
}

startServer();