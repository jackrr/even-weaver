import { Table, Model, Column, BelongsTo } from "sequelize-typescript";
import User from "./user";

@Table({ timestamps: true })
class AuthToken extends Model {
  @Column
  token: string;

  @BelongsTo(() => User)
  user: User;

  static async generate(user: User) {
    const possibleCharacters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz0123456789";

    let token = "";
    for (var i = 0; i < 15; i++) {
      token += possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length),
      );
    }

    return AuthToken.create({ token, user });
  }
}

export default AuthToken;
