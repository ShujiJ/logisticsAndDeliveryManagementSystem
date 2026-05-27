import { Sequelize } from "sequelize";
import { env } from "../config/env";

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  dialect: "mysql",
  port: Number(env.DB_PORT),
  logging: false,
});

export default sequelize;
