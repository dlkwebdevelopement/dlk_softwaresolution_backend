/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("liveClasses", (table) => {
    table.uuid("id").primary();

    table
      .uuid("courseId")
      .notNullable()
      .references("id")
      .inTable("navbar")
      .onDelete("CASCADE");

    table.string("title").notNullable();
    table.date("startDate").notNullable();
    table.integer("durationDays").notNullable();

    table.time("startTime").notNullable();
    table.time("endTime").notNullable();

    table.boolean("isActive").defaultTo(true);

    // ✅ FIX HERE
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("liveClasses");
};
