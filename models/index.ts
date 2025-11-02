import { Sequelize } from "sequelize";
import dbConfig from "../config/config";
import User from "./user";

const env = (process.env.NODE_ENV || "development") as
  | "development"
  | "test"
  | "production";
const { database, user, password, ...config } = dbConfig[env];

const sequelize = new Sequelize(database, user, password, config);

const db = {
  sequelize,
  Sequelize,
  User,
};

// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

export default db;
