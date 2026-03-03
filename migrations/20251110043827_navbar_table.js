exports.up = function (knex) {
  return knex.schema
    .createTable("navbar", (table) => {
      table.uuid("id").primary();
      table.string("category").notNullable();
      table.string("image").nullable();
      table.text("description").nullable();
    })

    .createTable("subcategories", (table) => {
      table.uuid("id").primary();
      table.string("subcategory").notNullable();
      table
        .uuid("category_id")
        .references("id")
        .inTable("navbar")
        .onDelete("CASCADE");
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("subcategories").dropTable("navbar");
};
