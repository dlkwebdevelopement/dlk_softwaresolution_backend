/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("registrations", (table) => {
    table.uuid("id").primary(); // Primary key
    table.string("fullName").notNullable(); // Full name
    table.string("email").notNullable(); // Email
    table.string("phone").notNullable(); // Phone
    table
      .uuid("courseId") // store navbar id here
      .notNullable()
      .references("id")
      .inTable("navbar")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("registrations");
};
