const express = require("express");
const router = express.Router();
const upload = require("../../multer/multerConfig");
const {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseBySlug,
  getAllCourses,
  getCoursesByCategory,
} = require("./admin_CoursesController");

// CREATE COURSE
router.post(
  "/course",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "syllabus_pdf", maxCount: 1 },
  ]),
  createCourse,
);

// UPDATE COURSE
router.put(
  "/course/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "syllabus_pdf", maxCount: 1 },
  ]),
  updateCourse,
);


// GET COURSE BY SLUG
router.get("/course/:slug", getCourseBySlug);

// DELETE COURSE
router.delete("/course/:id", deleteCourse);

//getall 
router.get("/course", getAllCourses);

//get courses with category id
router.get("/course/category/:categoryId", getCoursesByCategory);


module.exports = router;
