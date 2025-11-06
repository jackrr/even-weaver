import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { Model } from "sequelize";
import User from "./user";
import { addDays } from "date-fns";

const TOKEN_EXPIRE_IN_DAYS = 180;

class AuthToken extends Model<
  InferAttributes<AuthToken>,
  InferCreationAttributes<AuthToken>
> {
  declare id: CreationOptional<number>;
  declare token: string;
  declare userId: ForeignKey<User["id"]>;
  declare expiresAt: CreationOptional<Date>;

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

    return AuthToken.create({
      token,
      userId: user.id,
      expiresAt: addDays(new Date(), TOKEN_EXPIRE_IN_DAYS),
    });
  }
}

export default AuthToken;
