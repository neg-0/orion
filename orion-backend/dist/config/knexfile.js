// Update with your config settings.
const config = {
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
            tableName: "knex_migrations"
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
            tableName: "knex_migrations"
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
            tableName: "knex_migrations"
        }
    },
};
export default config;
