exports.up = function (knex) {
  return knex.schema.alterTable("course", function (table) {
    table.string("syllabus_pdf").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("course", function (table) {
    table.dropColumn("syllabus_pdf");
  });
};