const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const env = process.env.NODE_ENV || "development";

const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database:
    env === "test"
      ? process.env.DB_NAME_TEST
      : env === "production"
      ? process.env.DB_NAME_PROD
      : process.env.DB_NAME_DEV,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: process.env.DB_DIALECT || "postgres",
};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

module.exports = sequelize;
