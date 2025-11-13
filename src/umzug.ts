import { Umzug, SequelizeStorage } from "umzug";
import DB from "@/models/index";
const { sequelize, Sequelize } = DB;

const umzug = new Umzug({
  migrations: {
    glob: "src/migrations/*.ts",
    resolve: ({ name, path, context }) => {
      const migration = require(path!).default;
      return {
        // adjust the parameters Umzug will
        // pass to migration methods when called
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export default umzug;
