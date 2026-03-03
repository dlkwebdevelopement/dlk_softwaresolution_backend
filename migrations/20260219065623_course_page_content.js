exports.up = function (knex) {
  return knex.schema

    // ===============================
    // COURSES TABLE
    // ===============================
    .createTable("course", function (table) {
      table.uuid("id").primary();

      table
        .uuid("category_id")
        .references("id")
        .inTable("navbar")
        .onDelete("CASCADE");

      table.string("title").notNullable();
      table.string("slug").unique().notNullable();

      table.text("short_description");
      table.text("full_description");
      table.string("thumbnail");

      table.decimal("rating", 3, 2).defaultTo(0);
      table.integer("total_ratings").defaultTo(0);
      table.integer("total_students").defaultTo(0);

      table.string("mode");
      table.integer("duration_months");
      table.string("level");

      table.decimal("price", 10, 2);
      table.decimal("original_price", 10, 2);
      table.integer("discount_percentage");

      // OLD MYSQL SAFE TIMESTAMPS
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").nullable();
    })

    // ===============================
    // WHO SHOULD ENROLL
    // ===============================
    .createTable("course_who_should_enroll", function (table) {
      table.uuid("id").primary();

      table
        .uuid("course_id")
        .references("id")
        .inTable("course")
        .onDelete("CASCADE");

      table.text("content").notNullable();
      table.integer("order_index").defaultTo(0);
    })

    // ===============================
    // LEARNING POINTS
    // ===============================
    .createTable("course_learning_points", function (table) {
      table.uuid("id").primary();

      table
        .uuid("course_id")
        .references("id")
        .inTable("course")
        .onDelete("CASCADE");

      table.text("content").notNullable();
      table.integer("order_index").defaultTo(0);
    })

    // ===============================
    // CURRICULUM
    // ===============================
    .createTable("course_curriculum", function (table) {
      table.uuid("id").primary();

      table
        .uuid("course_id")
        .references("id")
        .inTable("course")
        .onDelete("CASCADE");

      table.string("title").notNullable();
      table.string("lessons_info");
      table.integer("order_index").defaultTo(0);
    })

    // ===============================
    // REVIEWS
    // ===============================
    .createTable("course_reviews", function (table) {
      table.uuid("id").primary();

      table
        .uuid("course_id")
        .references("id")
        .inTable("course")
        .onDelete("CASCADE");

      table.string("student_name").notNullable();
      table.string("student_avatar");
      table.integer("rating").notNullable();
      table.text("review");

      table.integer("helpful_yes").defaultTo(0);
      table.integer("helpful_no").defaultTo(0);

      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").nullable();
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("course_reviews")
    .dropTableIfExists("course_curriculum")
    .dropTableIfExists("course_learning_points")
    .dropTableIfExists("course_who_should_enroll")
    .dropTableIfExists("course");
};
