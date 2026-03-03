exports.up = function (knex) {
  return knex.schema.createTable('admins', (table) => {
    table.uuid('id').primary();
    table.string('username').unique().notNullable();
    table.string('password').notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('admins');
};