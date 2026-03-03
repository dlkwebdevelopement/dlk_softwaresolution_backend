exports.up = function (knex) {
  return knex.schema
    .createTable("banners", (table) => {
      table.uuid("id").primary();
     table.string("title").notNullable(); // PERSONALIZED
      table.string("highlight").notNullable(); // CAREER
      table.string("subtitle").notNullable(); // GUIDANCE
      table.string("tagline"); // Your Career, Our

      table.text("description"); // Long text
      table.string("button"); // Book a Session

      table.string("photoUrl").notNullable();
    })
    .createTable("companies", (table) => {
      table.uuid("id").primary();
      table.string("photoUrl");
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("banners").dropTable("companies");
};
