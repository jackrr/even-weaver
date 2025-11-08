import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { Model, type BlobDataType } from "sequelize";
import User from "./user";

class Weave extends Model<
  InferAttributes<Weave>,
  InferCreationAttributes<Weave>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare pattern: BlobDataType;
  declare userId: ForeignKey<User["id"]>;
  declare expiresAt: CreationOptional<Date>;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

export type Pattern = {
  [y: number]: {
    [x: number]: {
      c: number;
      s: "todo" | "done";
    };
  };
};

export default Weave;
