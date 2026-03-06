// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
// Update with your config settings.

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
      host: "localhost",

      user: "dlkuser",

      password: "Dlk@2026#Secure",

      database: "dlksoftware_db",
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
