const Course = require("../../models/admin_courses/Course");
const slugify = require("slugify");

// get by slug
exports.getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const course = await Course.query()
      .select(
        "id",
        "category_id",
        "title",
        "slug",
        "short_description",
        "full_description",
        "thumbnail",
        "syllabus_pdf",
        "rating",
        "total_ratings",
        "total_students",
        "mode",
        "duration_months",
        "level",
        "price",
        "original_price",
        "discount_percentage",
      )
      .findOne({ slug })
      .withGraphFetched(
        `
        [
          whoShouldEnroll(orderByOrder),
          learningPoints(orderByOrder),
          curriculum(orderByOrder),
          reviews(orderByCreated)
        ]
      `,
      )
      .modifiers({
        orderByOrder(builder) {
          builder.orderBy("order_index", "asc");
        },
        orderByCreated(builder) {
          builder.orderBy("created_at", "desc");
        },
      });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Convert decimals
    course.price = Number(course.price);
    course.original_price = Number(course.original_price);
    course.rating = Number(course.rating);

    // ✅ Add thumbnail_url
    course.thumbnail_url = course.thumbnail
      ? `${baseUrl}/uploads/${course.thumbnail}`
      : null;

    course.syllabus_pdf_url = course.syllabus_pdf
      ? `${baseUrl}/uploads/syllabus/${course.syllabus_pdf}`
      : null;

    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Get Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// create
exports.createCourse = async (req, res) => {
  try {
    const { whoShouldEnroll, learningPoints, curriculum, ...courseData } =
      req.body;

    if (!courseData.title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // ✅ Generate slug using slugify
    let baseSlug = slugify(courseData.title, {
      lower: true,
      strict: true, // removes special characters
      trim: true,
    });

    let finalSlug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness
    while (await Course.query().findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    courseData.slug = finalSlug;

    // Save thumbnail if uploaded
    if (req.files?.thumbnail) {
      courseData.thumbnail = req.files.thumbnail[0].filename;
    }

    if (req.files?.syllabus_pdf) {
      courseData.syllabus_pdf = req.files.syllabus_pdf[0].filename;
    }

    const newCourse = await Course.query().insertGraph({
      ...courseData,
      whoShouldEnroll: whoShouldEnroll ? safeParse(whoShouldEnroll) : [],
      learningPoints: safeParse(learningPoints),
      curriculum: safeParse(curriculum),
    });

    return res.status(201).json({
      success: true,
      data: newCourse,
    });
  } catch (error) {
    console.error("Create Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

// delete
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Course.query().deleteById(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};

const safeParse = (data) => {
  try {
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};


// update
exports.updateCourse = async (req, res) => {
  const trx = await Course.knex().transaction();
  try {
    const { id } = req.params;

    const { whoShouldEnroll, learningPoints, curriculum, ...courseData } =
      req.body;

    const course = await Course.query(trx).findById(id);

    if (!course) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Regenerate slug if title changed
    if (courseData.title && courseData.title !== course.title) {
      let baseSlug = slugify(courseData.title, {
        lower: true,
        strict: true,
        trim: true,
      });

      let finalSlug = baseSlug;
      let counter = 1;

      while (
        await Course.query(trx)
          .where("slug", finalSlug)
          .whereNot("id", id)
          .first()
      ) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      courseData.slug = finalSlug;
    }

    if (req.files?.thumbnail?.length > 0) {
      courseData.thumbnail = req.files.thumbnail[0].filename;
    }

    if (req.files?.syllabus_pdf?.length > 0) {
      courseData.syllabus_pdf = req.files.syllabus_pdf[0].filename;
    }

    if (Object.keys(courseData).length > 0) {
      await Course.query(trx).patchAndFetchById(id, {
        ...courseData,
        updated_at: new Date(),
      });
    }

    const parsedWhoShouldEnroll =
      typeof whoShouldEnroll !== "undefined"
        ? safeParse(whoShouldEnroll)
        : null;

    const parsedLearningPoints =
      typeof learningPoints !== "undefined" ? safeParse(learningPoints) : null;

    const parsedCurriculum =
      typeof curriculum !== "undefined" ? safeParse(curriculum) : null;

    if (parsedWhoShouldEnroll !== null) {
      await course.$relatedQuery("whoShouldEnroll", trx).delete();
      if (parsedWhoShouldEnroll.length > 0) {
        for (const item of parsedWhoShouldEnroll) {
          await course.$relatedQuery("whoShouldEnroll", trx).insert(item);
        }
      }
    }

    if (parsedLearningPoints !== null) {
      await course.$relatedQuery("learningPoints", trx).delete();
      if (parsedLearningPoints.length > 0) {
        for (const item of parsedLearningPoints) {
          await course.$relatedQuery("learningPoints", trx).insert(item);
        }
      }
    }

    if (parsedCurriculum !== null) {
      await course.$relatedQuery("curriculum", trx).delete();
      if (parsedCurriculum.length > 0) {
        for (const item of parsedCurriculum) {
          await course.$relatedQuery("curriculum", trx).insert(item);
        }
      }
    }

    await trx.commit();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
    });
  } catch (error) {
    await trx.rollback();
    console.error("Update Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};

//get all
// get all courses (with pagination)
exports.getAllCourses = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    const coursesQuery = Course.query()
      .select(
        "id",
        "category_id",
        "title",
        "slug",
        "thumbnail",
        "syllabus_pdf",
        "rating",
        "total_ratings",
        "total_students",
        "mode",
        "duration_months",
        "level",
        "price",
        "original_price",
        "discount_percentage",
        "created_at",
      )
      .orderBy("created_at", "desc");

    const total = await coursesQuery.resultSize();

    const courses = await coursesQuery.limit(limit).offset(offset);

    // Convert decimal fields to numbers
    const formattedCourses = courses.map((course) => ({
      ...course,
      price: Number(course.price),
      original_price: Number(course.original_price),
      rating: Number(course.rating),
      thumbnail_url: course.thumbnail
        ? `${baseUrl}/uploads/${course.thumbnail}`
        : null,

      syllabus_pdf_url: course.syllabus_pdf
        ? `${baseUrl}/uploads/syllabus/${course.syllabus_pdf}`
        : null,
    }));

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: formattedCourses,
    });
  } catch (error) {
    console.error("Get All Courses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

//get courses by category id
// get courses by category
exports.getCoursesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const courses = await Course.query()
      .where("category_id", categoryId)
      .orderBy("created_at", "desc");

    const formattedCourses = courses.map((course) => ({
      ...course,
      price: Number(course.price),
      original_price: Number(course.original_price),
      rating: Number(course.rating),
      thumbnail_url: course.thumbnail
        ? `${baseUrl}/uploads/${course.thumbnail}`
        : null,
      syllabus_pdf_url: course.syllabus_pdf
        ? `${baseUrl}/uploads/syllabus/${course.syllabus_pdf}`
        : null,
    }));

    return res.status(200).json({
      success: true,
      data: formattedCourses,
    });
  } catch (error) {
    console.error("Get Courses By Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};
