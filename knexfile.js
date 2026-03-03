// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: "localhost",
      user: "root",
      password: "root",
      database: "dlk",
    },
  },

  production: {
    client: "mysql2",
    connection: {
      host: "your_production_host",
      user: "your_production_user",
      password: "Dlk@2026#Secure",
      database: "your_production_database",
      ssl: false, // change to true if using cloud DB
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
