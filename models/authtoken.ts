import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { Model } from "sequelize";
import User from "./user";

class AuthToken extends Model<
  InferAttributes<AuthToken>,
  InferCreationAttributes<AuthToken>
> {
  declare id: CreationOptional<number>;
  declare token: string;
  declare userId: ForeignKey<User["id"]>;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;

  static async generate(user: User) {
    const possibleCharacters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz0123456789";

    let token = "";
    for (var i = 0; i < 15; i++) {
      token += possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length),
      );
    }

    return AuthToken.create({ token, userId: user.id });
  }
}

export default AuthToken;
