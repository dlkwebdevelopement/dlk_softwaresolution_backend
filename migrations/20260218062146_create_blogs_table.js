/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("blogs", function (table) {
    table.uuid("id").primary();

    table.string("title").notNullable();
    table.string("slug").notNullable().unique();
    table.string("short_description").notNullable();
    table.text("description").notNullable();
    table.string("image").notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Do NOT use defaultTo(now()) here
    table.timestamp("updated_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("blogs");
};
