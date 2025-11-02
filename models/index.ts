import { Sequelize, DataTypes } from "sequelize";
import dbConfig from "../config/config";
import User from "./user";
import AuthToken from "./authtoken";

const env = (process.env.NODE_ENV || "development") as
  | "development"
  | "test"
  | "production";
const { database, user, password, ...config } = dbConfig[env];

const sequelize = new Sequelize(database, user, password, config);

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    password: {
      type: new DataTypes.STRING(128),
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "user" },
);

AuthToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: new DataTypes.STRING(16),
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "auth_token" },
);

User.hasMany(AuthToken, {
  sourceKey: "id",
  foreignKey: "userId",
  as: "authTokens",
});

AuthToken.belongsTo(User, { targetKey: "id" });

export default {
  sequelize,
  Sequelize,
  User,
  AuthToken,
};
