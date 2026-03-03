exports.up = function (knex) {
  return knex.schema
    .createTable("questions", (table) => {
      table.uuid("id").primary();
      table.string("question").notNullable();
    })



    .createTable("answers", (table) => {
      table.uuid("id").primary();
      table.text("answer").notNullable();
      table
        .uuid("question_id")
        .references("id")
        .inTable("questions")
        .onDelete("CASCADE");
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("answers").dropTable("questions");
};
