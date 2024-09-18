import type { Knex } from "knex";

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: {
      database: "orion",
      user: "postgres",
      password: "postgres"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      extension: "ts"
    },
    seeds: {
      directory: "./seeds"
    }
  },

  staging: {
    client: "postgresql",
    connection: {
      database: "orion",
      user: "postgres",
      password: "postgres"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      extension: "ts"
    }
  },

  production: {
    client: "postgresql",
    connection: {
      database: "orion",
      user: "postgres",
      password: "postgres"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      extension: "ts"
    }
  },

};

export default config;