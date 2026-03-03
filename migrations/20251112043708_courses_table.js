exports.up = function (knex) {
  return knex.schema
    // 🧱 Courses Table
    .createTable("courses", (table) => {
      table.uuid("id").primary();
      table.string("title").notNullable();
      table.decimal("rating_score", 3, 2).defaultTo(0.0); 
      table.integer("review_count").defaultTo(0);
      table.text("description").notNullable();
      table.boolean("is_active").defaultTo(true);
    })

    // 🖼️ Course Photos
    .createTable("course_photos", (table) => {
      table.uuid("id").primary();
      table
        .uuid("course_id")
        .references("id")
        .inTable("courses")
        .onDelete("CASCADE");
      table.string("photoUrl").notNullable();
    })

    // ⭐ Course Reviews
    .createTable("course_reviews", (table) => {
      table.uuid("id").primary();
      table
        .uuid("course_id")
        .references("id")
        .inTable("courses")
        .onDelete("CASCADE");
      table.integer("rating").notNullable().checkBetween([1, 5]); 
      table.text("comment");
      table.string("reviewer_name");
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("course_reviews")
    .dropTableIfExists("course_photos")
    .dropTableIfExists("courses");
};
