exports.up = function (knex) {
  return knex.schema.createTable("contact_messages", function (table) {
    table.uuid("id").primary();

    table.string("first_name", 100).notNullable();
    table.string("last_name", 100).notNullable();
    table.string("email", 150).notNullable();
    table.string("phone", 20).nullable();
    table.text("message").notNullable();

    table.boolean("accept_terms").notNullable().defaultTo(true);

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("contact_messages");
};