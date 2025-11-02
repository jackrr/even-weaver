const DB_PATH = process.env.DB_PATH || "./tmp/";

const DEFAULT_CONFIG = {
  database: "even_weaver",
  user: "root",
  password: "",
  dialect: "sqlite" as "sqlite",
};

export default {
  development: { ...DEFAULT_CONFIG, storage: DB_PATH + "dev_db.sqlite" },
  test: { ...DEFAULT_CONFIG, storage: ":memory:" },
  production: { ...DEFAULT_CONFIG, storage: DB_PATH + "db.sqlite" },
};
