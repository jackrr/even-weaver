import { afterAll, beforeEach } from "bun:test";
import { server } from "./index";
import db from "./models/index";

beforeEach(async () => {
  await db.sequelize.sync({ force: true });
});

afterAll(() => {
  server.stop();
});
