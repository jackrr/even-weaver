import { Table, Model, Column, HasMany } from "sequelize-typescript";
import AuthToken from "./authtoken";

const SPECIAL_CHARS = new Set("_-*!?=<>()[]".split(""));

@Table({ timestamps: true })
class User extends Model {
  @Column
  username: string;

  @Column
  password: string;

  @HasMany(() => AuthToken)
  authTokens: AuthToken[];

  static validatePassword(password: string): string | null {
    if (password.length < 8) {
      return "Too short. Must be at least 8 characters";
    }

    const setted = new Set(password.split(""));
    if (setted.intersection(SPECIAL_CHARS).size === 0) {
      return `Missing special char: '${Array.from(SPECIAL_CHARS).join("")}'`;
    }

    if (!password.match(/\d/)) {
      return "Missing at least one number";
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
