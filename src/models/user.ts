import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Association,
} from "sequelize";
import { Model } from "sequelize";
import AuthToken from "./authtoken";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare password: string;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;

  declare static associations: {
    authTokens: Association<User, AuthToken>;
  };

  static validatePassword(password: string): string | null {
    if (password.length < 6) {
      return "Too short. Must be at least 6 characters";
    }
    return null;
  }

  async updatePassword(password: string) {
    const error = User.validatePassword(password);
    if (error) {
      return Promise.reject(error);
    }

    const hashed = await Bun.password.hash(password);
    this.password = hashed;
    return this.save();
  }

  verifyPassword(password: string) {
    return Bun.password.verify(password, this.password);
  }

  static async createWithPassword(username: string, password: string) {
    const error = this.validatePassword(password);
    if (error) {
      return Promise.reject(error);
    }

    const hashed = await Bun.password.hash(password);
    return User.create({ username, password: hashed });
  }
}

export default User;
