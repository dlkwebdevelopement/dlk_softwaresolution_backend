const express = require("express");
const router = express.Router();
const upload = require("../../multer/multerConfig");
const {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
  requestSyllabus,
} = require("./internshipController");

// Upload configuration for both syllabus PDF and thumbnail image
const internshipUpload = upload.fields([
  { name: "syllabus_pdf", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

// Public / Client endpoints
router.get("/internships", getAllInternships);
router.get("/internships/:id", getInternshipById);
router.post("/internships/syllabus-request", requestSyllabus);

// Admin CRUD endpoints
router.post("/internships", internshipUpload, createInternship);
router.put("/internships/:id", internshipUpload, updateInternship);
router.delete("/internships/:id", deleteInternship);

module.exports = router;

