exports.up = function (knex) {
  return knex.schema.createTable("testimonials", function (table) {
    table.uuid("id").primary();

    table.string("name").notNullable();
    table.string("role").notNullable();

    table.text("text").notNullable();

    table.string("image"); // store image path or URL

    table.boolean("is_active").defaultTo(true);

   
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("testimonials");
};