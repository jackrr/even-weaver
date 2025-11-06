import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { Model } from "sequelize";

class Color extends Model<
  InferAttributes<Color>,
  InferCreationAttributes<Color>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare key: string;
  declare r: number;
  declare g: number;
  declare b: number;
  declare hex: string;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

export default Color;
