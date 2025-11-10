import { ErrorCode } from "@/util/error";

import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { Model } from "sequelize";
import User from "./user";

class Weave extends Model<
  InferAttributes<Weave>,
  InferCreationAttributes<Weave>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare pattern: Buffer;
  declare userId: ForeignKey<User["id"]>;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;

  serialize() {
    return {
      id: this.id,
      name: this.name,
      pattern: this.pattern.toString(),
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export type Pattern = {
  [y: number]: {
    [x: number]: {
      c: number;
      s: "todo" | "done";
    };
  };
};

export type WeavePayload = {
  name: string;
  pattern: Buffer;
};

const PATTERN_DANGER_SIZE = 500 * 500 * 10;

export function parseWeavePayload(json: any): Promise<WeavePayload> {
  function error(message: string) {
    return Promise.reject({ status: ErrorCode.BadRequest, message });
  }
  if (typeof json !== "object")
    return error("Invalid JSON. Please provide a weave object");

  if (!("name" in json))
    return error("Invalid Weave. Missing required key 'name'");
  if (!("pattern" in json))
    return error("Invalid Weave. Missing required key 'pattern'");

  if (typeof json.name !== "string")
    return error("Invalid Weave. Expected a string value for name");

  if (json.name.length > 256) return error("Invalid Weave. Name too long");

  if (typeof json.pattern !== "string")
    return error("Invalid Weave. Pattern should be an encoded string.");

  if (json.pattern.length > PATTERN_DANGER_SIZE)
    return error("Invalid Weave. Pattern looks malicious to me....");

  // NOTE: Permissive, not validating pattern structure
  return Promise.resolve({
    name: json.name,
    pattern: Buffer.from(json.pattern),
  });
}

export default Weave;
