const express = require("express");
const router = express.Router();
const upload = require("../../multer/multerConfig");

const {
  adminLogin,
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getEnquiries,
  uploadBanner,
  updateBanner,
  getBanners,
  deleteBanner,
  uploadOffer,
  getOffers,
  updateOffer,
  deleteOffer,
  uploadCompany,
  getCompanies,
  deleteCompany,
  addQuestion,
  addAnswer,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
  updateAnswer,
  deleteAnswer,

  createEnquiry,
  getCategoriesWithSubs,
  createRegistration,
  getRegistrations,
  markRegistrationRead,
  replyToRegistration,
  deleteRegistration,
  markEnquiryRead,
  replyToEnquiry,
  deleteEnquiry,
  createLiveClass,
  getAllLiveClasses,
  getLiveClassById,
  updateLiveClass,
  deleteLiveClass,
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  createStudentProject,
  getAllStudentProjects,
  getStudentProjectBySlug,
  updateStudentProject,
  deleteStudentProject,
  getAllTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getGallery,
  updateGallery,
  addGalleryImages,
  deleteGalleryImage,
  createVideo,
  getAllVideos,
  updateVideo,
  deleteVideo,
  createSkill,
  getAllSkills,
  updateSkill,
  deleteSkill,
  getPlacements,
  uploadPlacement,
  updatePlacement,
  deletePlacement,
  togglePlacementActive,
  reorderPlacements,
} = require("./adminController");

// ✅ Admin Login
router.post("/login", adminLogin);

// ✅ Navbar (Category) Routes
router.post("/category", upload.single("image"), createCategory);
router.get("/categories", getCategories);
router.put("/category/:id", upload.single("image"), updateCategory);
router.delete("/category/:id", deleteCategory);
router.get("/categorywithsub", getCategoriesWithSubs);

// ✅ Enquiries
router.get("/enquiries", getEnquiries);
router.post("/enquiries", createEnquiry);
router.patch("/enquiries/:id/read", markEnquiryRead);
router.post("/enquiries/reply", replyToEnquiry);
router.delete("/enquiries/:id", deleteEnquiry);

// ✅ Banner Upload, Get, Update & Delete
router.post("/upload-banner", upload.single("photo"), uploadBanner);
router.get("/banners", getBanners);
router.put("/banner/:id", upload.single("photo"), updateBanner);
router.delete("/banner/:id", deleteBanner);

// ✅ Offer Routes
router.post("/offers", upload.single("photo"), uploadOffer);
router.get("/offers", getOffers);
router.put("/offers/:id", upload.single("photo"), updateOffer);
router.delete("/offers/:id", deleteOffer);

// ✅ Company Upload, Get & Delete
router.post("/upload-company", upload.single("photo"), uploadCompany);
router.get("/companies", getCompanies);
router.delete("/company/:id", deleteCompany);

// ✅ FAQ Section (Questions & Answers)
router.post("/faq/question", addQuestion);
router.post("/faq/answer", addAnswer);
router.get("/faq/questions", getAllQuestions);
router.put("/faq/question/:id", updateQuestion);
router.delete("/faq/question/:id", deleteQuestion);
router.put("/faq/answer/:id", updateAnswer);
router.delete("/faq/answer/:id", deleteAnswer);


// for registration
router.post("/register", createRegistration);
router.get("/register", getRegistrations);
router.patch("/register/:id/read", markRegistrationRead);
router.post("/register/reply", replyToRegistration);
router.delete("/register/:id", deleteRegistration);

//for upcoming live classes
router.post("/liveclass", createLiveClass);
router.get("/liveclass", getAllLiveClasses);
router.get("/liveclass/:id", getLiveClassById);
router.put("/liveclass/:id", updateLiveClass);
router.delete("/liveclass/:id", deleteLiveClass);

// ===============================
// 📝 Blogs
// ===============================

// ✅ Blog Routes
router.post("/blogs", upload.single("image"), createBlog);
router.get("/blogs", getAllBlogs);
router.get("/blogs/:slug", getBlogBySlug);
router.put("/blogs/:id", upload.single("image"), updateBlog);
router.delete("/blogs/:id", deleteBlog);

// ✅ Student Projects Routes
router.post("/student-projects", upload.single("image"), createStudentProject);
router.get("/student-projects", getAllStudentProjects);
router.get("/student-projects/:slug", getStudentProjectBySlug);
router.put("/student-projects/:id", upload.single("image"), updateStudentProject);
router.delete("/student-projects/:id", deleteStudentProject);

//testimonial
router.get("/testimonial", getAllTestimonials);
router.get("/testimonial/:id", getTestimonial);
router.post("/testimonial", upload.single("image"), createTestimonial);
router.put("/testimonial/:id", upload.single("image"), updateTestimonial);
router.delete("/testimonial/:id", deleteTestimonial);

// ✅ Gallery Routes
router.get("/gallery", getGallery);
router.patch("/gallery/:id", updateGallery);
router.post("/gallery/:id/images", upload.array("images"), addGalleryImages);
router.delete("/gallery/:id/image", deleteGalleryImage);

// ✅ Video Routes
router.get("/videos", getAllVideos);
router.post("/videos", createVideo);
router.put("/videos/:id", updateVideo);
router.delete("/videos/:id", deleteVideo);

// ✅ Skill Routes
router.get("/skills", getAllSkills);
router.post("/skills", upload.single("icon"), createSkill);
router.put("/skills/:id", upload.single("icon"), updateSkill);
router.delete("/skills/:id", deleteSkill);

// ✅ Placement Routes
router.get("/placements", getPlacements);
router.post("/placements", upload.single("image"), uploadPlacement);
router.put("/placements/reorder", reorderPlacements);
router.put("/placements/:id", upload.single("image"), updatePlacement);
router.delete("/placements/:id", deletePlacement);
router.patch("/placements/:id/toggle", togglePlacementActive);

module.exports = router;
