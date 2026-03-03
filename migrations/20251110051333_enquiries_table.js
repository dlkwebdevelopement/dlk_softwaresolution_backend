exports.up = function (knex) {
  return knex.schema.createTable("enquiries", (table) => {
    table.uuid("id").primary();
    table.string("name").notNullable();
    table.string("email").notNullable();
    table.string("mobile").notNullable();
    table.string("course").notNullable();
    table.string("location").notNullable();
    table.string("timeslot").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("enquiries");
};
