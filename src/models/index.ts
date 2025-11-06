import { Sequelize, DataTypes } from "sequelize";
import dbConfig from "../../sequelize-config";
import User from "./user";
import AuthToken from "./authtoken";
import Color from "./color";
import Weave from "./weave";

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

Color.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(32),
      allowNull: false,
    },
    key: {
      type: new DataTypes.STRING(8),
      allowNull: false,
    },
    r: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    g: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    b: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hex: {
      type: new DataTypes.STRING(6),
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "color" },
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
    expiresAt: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "auth_token" },
);

Weave.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    pattern: {
      type: DataTypes.BLOB,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "weave" },
);

// Associations
User.hasMany(AuthToken, {
  sourceKey: "id",
  foreignKey: "userId",
  as: "authTokens",
});
User.hasMany(Weave, {
  sourceKey: "id",
  foreignKey: "userId",
  as: "weaves",
});

AuthToken.belongsTo(User, { targetKey: "id", foreignKey: "userId" });
Weave.belongsTo(User, { targetKey: "id", foreignKey: "userId" });

export default {
  sequelize,
  Sequelize,
  User,
  AuthToken,
  Weave,
  Color,
};
