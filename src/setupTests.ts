import { afterAll, beforeAll, beforeEach } from "bun:test";
import Sequelize from "sequelize";
import { server } from "./index";
import db from "./models/index";
import seedColors from "./seeders/colors";

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
  await seedColors.up(db.sequelize.getQueryInterface(), Sequelize);
});

beforeEach(async () => {
  // Drop all model tables except colors
  const { sequelize } = db;
  const tables = await sequelize.getQueryInterface().showAllTables();
  const tablesToEmpty = tables.filter((table) => table !== "color");

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
