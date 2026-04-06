const Course = require("../../models/admin_courses/Course");
const CourseWhoShouldEnroll = require("../../models/admin_courses/CourseWhoShouldEnroll");
const CourseLearningPoint = require("../../models/admin_courses/CourseLearningPoint");
const CourseCurriculum = require("../../models/admin_courses/CourseCurriculum");
const CourseReview = require("../../models/admin_courses/CourseReview");
const CourseInclude = require("../../models/admin_courses/CourseInclude");
const Skill = require("../../models/admin_home/Skill");
const Enquiry = require("../../models/admin_home/Enquiry");
const Registration = require("../../models/admin_home/Registration");
const slugify = require("slugify");
const mongoose = require("mongoose");
const { getFullUrl } = require("../../utils/urlHelper");

// get by slug
exports.getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const course = await Course.findOne({ slug })
      .populate({
        path: "category_id",
        model: "CourseCategory"
      })
      .populate({
        path: "skills",
        model: "Skill"
      });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Fetch related data manually as Mongoose doesn't do "graphs" as easily as Objection
    const whoShouldEnroll = await CourseWhoShouldEnroll.find({ course_id: course._id }).sort({ order_index: 1 });
    const learningPoints = await CourseLearningPoint.find({ course_id: course._id }).sort({ order_index: 1 });
    const curriculum = await CourseCurriculum.find({ course_id: course._id }).sort({ order_index: 1 });
    const courseIncludes = await CourseInclude.find({ course_id: course._id }).sort({ order_index: 1 });
    const reviews = await CourseReview.find({ course_id: course._id }).sort({ createdAt: -1 });

    // Fetch Enquiry counts
    const enquiryCount = await Enquiry.countDocuments({ course: course.title });
    const registrationCount = await Registration.countDocuments({ courseId: course._id });

    const courseObj = course.toObject();
    courseObj.whoShouldEnroll = whoShouldEnroll;
    courseObj.learningPoints = learningPoints;
    courseObj.curriculum = curriculum;
    courseObj.courseIncludes = courseIncludes;
    courseObj.reviews = reviews;
    courseObj.enquiryCount = (enquiryCount || 0) + (registrationCount || 0);

    // Convert decimals/numbers
    courseObj.price = Number(courseObj.price);
    courseObj.original_price = Number(courseObj.original_price);
    courseObj.rating = Number(courseObj.rating);

    // ✅ Add URLs
    courseObj.thumbnail_url = getFullUrl(courseObj.thumbnail);

    courseObj.syllabus_pdf_url = courseObj.syllabus_pdf
      ? getFullUrl(courseObj.syllabus_pdf)
      : null;

    return res.status(200).json({
      success: true,
      data: courseObj,
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { whoShouldEnroll, learningPoints, curriculum, courseIncludes, skills, ...courseData } =
      req.body;
      
    if (skills) {
      courseData.skills = safeParse(skills);
    }

    if (!courseData.title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // ✅ Generate slug using slugify
    let baseSlug = slugify(courseData.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    let finalSlug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness
    while (await Course.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    courseData.slug = finalSlug;

    // Save thumbnail if uploaded
    if (req.files?.thumbnail) {
      courseData.thumbnail = getFullUrl(`uploads/${req.files.thumbnail[0].filename}`);
    }

    if (req.files?.syllabus_pdf) {
      courseData.syllabus_pdf = getFullUrl(`uploads/syllabus/${req.files.syllabus_pdf[0].filename}`);
    }

    // ✅ Parse numeric fields to prevent ValidationError from FormData string values
    if (courseData.duration_months !== undefined) courseData.duration_months = parseFloat(courseData.duration_months) || undefined;
    if (courseData.price !== undefined) courseData.price = parseFloat(courseData.price) || undefined;
    if (courseData.original_price !== undefined) courseData.original_price = parseFloat(courseData.original_price) || undefined;
    if (courseData.discount_percentage !== undefined) courseData.discount_percentage = parseFloat(courseData.discount_percentage) || undefined;
    if (courseData.rating !== undefined) courseData.rating = parseFloat(courseData.rating) || 0;
    if (courseData.total_ratings !== undefined) courseData.total_ratings = parseInt(courseData.total_ratings) || 0;
    if (courseData.total_students !== undefined) courseData.total_students = parseInt(courseData.total_students) || 0;

    const newCourse = await Course.create([courseData], { session });
    const courseId = newCourse[0]._id;

    if (whoShouldEnroll) {
      const parsed = safeParse(whoShouldEnroll);
      if (parsed.length > 0) {
        await CourseWhoShouldEnroll.insertMany(parsed.map(item => ({ ...item, course_id: courseId })), { session });
      }
    }

    if (learningPoints) {
      const parsed = safeParse(learningPoints);
      if (parsed.length > 0) {
        await CourseLearningPoint.insertMany(parsed.map(item => ({ ...item, course_id: courseId })), { session });
      }
    }

    if (curriculum) {
      const parsed = safeParse(curriculum);
      if (parsed.length > 0) {
        await CourseCurriculum.insertMany(parsed.map(item => ({ ...item, course_id: courseId })), { session });
      }
    }

    if (courseIncludes) {
      const parsed = safeParse(courseIncludes);
      if (parsed.length > 0) {
        await CourseInclude.insertMany(parsed.map(item => ({ ...item, course_id: courseId })), { session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      data: newCourse[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

// delete
exports.deleteCourse = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    const deleted = await Course.findByIdAndDelete(id, { session });

    if (!deleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Delete related items
    await CourseWhoShouldEnroll.deleteMany({ course_id: id }, { session });
    await CourseLearningPoint.deleteMany({ course_id: id }, { session });
    await CourseCurriculum.deleteMany({ course_id: id }, { session });
    await CourseInclude.deleteMany({ course_id: id }, { session });
    await CourseReview.deleteMany({ course_id: id }, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    const { whoShouldEnroll, learningPoints, curriculum, courseIncludes, skills, ...courseData } =
      req.body;

    if (typeof skills !== "undefined") {
      courseData.skills = safeParse(skills);
    }

    const course = await Course.findById(id).session(session);

    if (!course) {
      await session.abortTransaction();
      session.endSession();
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
        await Course.findOne({ slug: finalSlug, _id: { $ne: id } }).session(session)
      ) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      courseData.slug = finalSlug;
    }

    if (req.files?.thumbnail?.length > 0) {
      courseData.thumbnail = getFullUrl(`uploads/${req.files.thumbnail[0].filename}`);
    }

    if (req.files?.syllabus_pdf?.length > 0) {
      courseData.syllabus_pdf = getFullUrl(`uploads/syllabus/${req.files.syllabus_pdf[0].filename}`);
    }

    // ✅ Parse numeric fields to prevent ValidationError from FormData string values
    if (courseData.duration_months !== undefined) courseData.duration_months = parseFloat(courseData.duration_months) || undefined;
    if (courseData.price !== undefined) courseData.price = parseFloat(courseData.price) || undefined;
    if (courseData.original_price !== undefined) courseData.original_price = parseFloat(courseData.original_price) || undefined;
    if (courseData.discount_percentage !== undefined) courseData.discount_percentage = parseFloat(courseData.discount_percentage) || undefined;
    if (courseData.rating !== undefined) courseData.rating = parseFloat(courseData.rating) || 0;
    if (courseData.total_ratings !== undefined) courseData.total_ratings = parseInt(courseData.total_ratings) || 0;
    if (courseData.total_students !== undefined) courseData.total_students = parseInt(courseData.total_students) || 0;

    if (Object.keys(courseData).length > 0) {
      await Course.findByIdAndUpdate(id, courseData, { session });
    }

    const parsedWhoShouldEnroll =
      typeof whoShouldEnroll !== "undefined"
        ? safeParse(whoShouldEnroll)
        : null;

    const parsedLearningPoints =
      typeof learningPoints !== "undefined" ? safeParse(learningPoints) : null;

    const parsedCurriculum =
      typeof curriculum !== "undefined" ? safeParse(curriculum) : null;

    const parsedCourseIncludes =
      typeof courseIncludes !== "undefined" ? safeParse(courseIncludes) : null;

    if (parsedWhoShouldEnroll !== null) {
      await CourseWhoShouldEnroll.deleteMany({ course_id: id }, { session });
      if (parsedWhoShouldEnroll.length > 0) {
        await CourseWhoShouldEnroll.insertMany(parsedWhoShouldEnroll.map(item => ({ ...item, course_id: id })), { session });
      }
    }

    if (parsedLearningPoints !== null) {
      await CourseLearningPoint.deleteMany({ course_id: id }, { session });
      if (parsedLearningPoints.length > 0) {
        await CourseLearningPoint.insertMany(parsedLearningPoints.map(item => ({ ...item, course_id: id })), { session });
      }
    }

    if (parsedCurriculum !== null) {
      await CourseCurriculum.deleteMany({ course_id: id }, { session });
      if (parsedCurriculum.length > 0) {
        await CourseCurriculum.insertMany(parsedCurriculum.map(item => ({ ...item, course_id: id })), { session });
      }
    }

    if (parsedCourseIncludes !== null) {
      await CourseInclude.deleteMany({ course_id: id }, { session });
      if (parsedCourseIncludes.length > 0) {
        await CourseInclude.insertMany(parsedCourseIncludes.map(item => ({ ...item, course_id: id })), { session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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

    const total = await Course.countDocuments();
    const courses = await Course.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    // Convert decimal fields to numbers
    const formattedCourses = courses.map((course) => {
      const c = course.toObject();
      return {
        ...c,
        id: c._id,
        price: Number(c.price),
        original_price: Number(c.original_price),
        rating: Number(c.rating),
        thumbnail_url: getFullUrl(c.thumbnail),
        syllabus_pdf_url: getFullUrl(c.syllabus_pdf),
      };
    });

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

    const courses = await Course.find({ category_id: categoryId })
      .sort({ createdAt: -1 });

    const formattedCourses = courses.map((course) => {
      const c = course.toObject();
      return {
        ...c,
        id: c._id,
        price: Number(c.price),
        original_price: Number(c.original_price),
        rating: Number(c.rating),
        thumbnail_url: getFullUrl(c.thumbnail),
        syllabus_pdf_url: getFullUrl(c.syllabus_pdf),
      };
    });

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
