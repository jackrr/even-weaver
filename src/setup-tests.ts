import { afterAll, beforeAll, beforeEach } from "bun:test";
import db from "@/models/index";
import umzug from "@/umzug";
import { server } from "./index";

beforeAll(async () => {
  await umzug.up();
});

beforeEach(async () => {
  // Drop all model tables except colors
  const { sequelize } = db;
  const tablesToEmpty = ["weave", "auth_token", "user"];

  for (const table of tablesToEmpty) {
    try {
      await sequelize.query("DELETE FROM ?;", {
        replacements: [table],
      });
    } catch (error) {
      console.error(`Error truncating ${table}:`, error);
    }
  }
});

afterAll(() => {
  server.stop();
});
