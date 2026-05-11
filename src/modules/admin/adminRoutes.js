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
  toggleBanner,
  toggleBannerContent,
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
  createGalleryAlbum,
  updateGalleryAlbum,
  deleteGalleryAlbum,
  addGalleryBatch,
  updateGalleryBatch,
  deleteGalleryBatch,
  addBatchImages,
  deleteBatchImage,
  updateBatchImageHighlights,
  createVideo,
  getAllVideos,
  updateVideo,
  deleteVideo,
  deleteSkill,
  createSkill,
  getAllSkills,
  updateSkill,
  getPlacements,
  uploadPlacement,
  updatePlacement,
  deletePlacement,
  togglePlacementActive,
  reorderPlacements,
  createGalleryEvent,
  getAllGalleryEvents,
  deleteGalleryEvent,
  updateGalleryEvent,
  updateGalleryEventImageHighlights,
  getAllWorkshops,
  postWorkshop,
  updateWorkshop,
  deleteWorkshop,
  getOfficeGallery,
  createOfficeGalleryBatch,
  updateOfficeGalleryBatch,
  deleteOfficeGalleryBatch,
  addOfficeGalleryCategory,
  updateOfficeGalleryCategory,
  deleteOfficeGalleryCategory,
  addOfficeCategoryImages,
  deleteOfficeCategoryImage,
  updateOfficeCategoryImageHighlights,
  generateBlogCode,
  getBlogCodes,
  deleteBlogCode,
  createStudentBlog,
  createStudentProjectForStudent,
  generateProjectCode,
  getProjectCodes,
  deleteProjectCode,
  updateImageHighlights,
} = require("./adminController");

// ✅ Admin Login
router.post("/login", adminLogin);

// 🔍 Diagnostic logging for all admin routes
router.use((req, res, next) => {
  console.log(`📡 ADMIN ROUTE HIT: [${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ Banner Routes
router.post("/upload-banner", upload.single("photo"), uploadBanner);
router.get("/banners", getBanners);
router.put("/banner/:id", upload.single("photo"), updateBanner);
router.delete("/banner/:id", deleteBanner);
router.patch("/banner/:id/toggle", toggleBanner);
router.patch("/banner-op/:id/toggle-visibility", toggleBannerContent);

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

// ✅ Registration
router.post("/register", createRegistration);
router.get("/register", getRegistrations);
router.patch("/register/:id/read", markRegistrationRead);
router.post("/register/reply", replyToRegistration);
router.delete("/register/:id", deleteRegistration);

// ✅ Live Classes
router.post("/liveclass", upload.single("image"), createLiveClass);
router.get("/liveclass", getAllLiveClasses);
router.get("/liveclass/:id", getLiveClassById);
router.put("/liveclass/:id", upload.single("image"), updateLiveClass);
router.delete("/liveclass/:id", deleteLiveClass);

// ✅ Blogs
router.post("/blogs", upload.single("image"), createBlog);
router.get("/blogs", getAllBlogs);
router.get("/blogs/:slug", getBlogBySlug);
router.put("/blogs/:id", upload.single("image"), updateBlog);
router.delete("/blogs/:id", deleteBlog);
router.post("/blogs/student", upload.fields([{ name: "image", maxCount: 1 }, { name: "studentProfilePic", maxCount: 1 }]), createStudentBlog);

// ✅ Blog Codes
router.post("/blog-codes/generate", generateBlogCode);
router.get("/blog-codes", getBlogCodes);
router.delete("/blog-codes/:id", deleteBlogCode);

// ✅ Student Projects
router.post("/student-projects", upload.single("image"), createStudentProject);
router.get("/student-projects", getAllStudentProjects);
router.get("/student-projects/:slug", getStudentProjectBySlug);
router.put("/student-projects/:id", upload.single("image"), updateStudentProject);
router.delete("/student-projects/:id", deleteStudentProject);
router.post("/student-projects/student", upload.fields([{ name: "image", maxCount: 1 }, { name: "studentProfilePic", maxCount: 1 }]), createStudentProjectForStudent);

// ✅ Project Codes
router.post("/project-codes/generate", generateProjectCode);
router.get("/project-codes", getProjectCodes);
router.delete("/project-codes/:id", deleteProjectCode);

// ✅ Testimonials
router.get("/testimonial", getAllTestimonials);
router.get("/testimonial/:id", getTestimonial);
router.post("/testimonial", upload.single("image"), createTestimonial);
router.put("/testimonial/:id", upload.single("image"), updateTestimonial);
router.delete("/testimonial/:id", deleteTestimonial);

// ✅ Gallery
router.get("/gallery", getGallery);
router.post("/gallery", upload.single("thumbnail"), createGalleryAlbum);
router.put("/gallery/:id", upload.single("thumbnail"), updateGalleryAlbum);
router.delete("/gallery/:id", deleteGalleryAlbum);

// Batches
router.post("/gallery/:id/batches", addGalleryBatch);
router.put("/gallery/:id/batches/:batchId", updateGalleryBatch);
router.delete("/gallery/:id/batches/:batchId", deleteGalleryBatch);

// Batch Images
router.post("/gallery/:id/batches/:batchId/images", upload.array("images", 20), addBatchImages);
router.delete("/gallery/:id/batches/:batchId/image", deleteBatchImage);
router.patch("/gallery/:id/batches/:batchId/image/highlights", updateBatchImageHighlights);

// ✅ Videos
router.get("/videos", getAllVideos);
router.post("/videos", createVideo);
router.put("/videos/:id", updateVideo);
router.delete("/videos/:id", deleteVideo);

// ✅ Skills
router.get("/skills", getAllSkills);
router.post("/skills", upload.single("icon"), createSkill);
router.put("/skills/:id", upload.single("icon"), updateSkill);
router.delete("/skills/:id", deleteSkill);

// ✅ Placements
router.get("/placements", getPlacements);
router.post("/placements", upload.single("image"), uploadPlacement);
router.put("/placements/reorder", reorderPlacements);
router.put("/placements/:id", upload.single("image"), updatePlacement);
router.delete("/placements/:id", deletePlacement);
router.patch("/placements/:id/toggle", togglePlacementActive);

// ✅ Gallery Events
router.post("/gallery-events", upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 20 },
]), createGalleryEvent);
router.get("/gallery-events", getAllGalleryEvents);
router.delete("/gallery-events/:id", deleteGalleryEvent);
router.put("/gallery-events/:id", upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]), updateGalleryEvent);
router.patch("/gallery-events/:id/image/highlights", updateGalleryEventImageHighlights);

// ✅ Workshops
router.get("/workshops", getAllWorkshops);
router.post("/workshops", upload.single("image"), postWorkshop);
router.put("/workshops/:id", upload.single("image"), updateWorkshop);
router.delete("/workshops/:id", deleteWorkshop);

// ✅ Office Gallery — Batch
router.get("/office-gallery", getOfficeGallery);
router.post("/office-gallery", createOfficeGalleryBatch);
router.put("/office-gallery/:batchId", updateOfficeGalleryBatch);
router.delete("/office-gallery/:batchId", deleteOfficeGalleryBatch);

// ✅ Office Gallery — Categories
router.post("/office-gallery/:batchId/categories", addOfficeGalleryCategory);
router.put("/office-gallery/:batchId/categories/:catId", updateOfficeGalleryCategory);
router.delete("/office-gallery/:batchId/categories/:catId", deleteOfficeGalleryCategory);

// ✅ Office Gallery — Images
router.post("/office-gallery/:batchId/categories/:catId/images", upload.array("images", 20), addOfficeCategoryImages);
router.delete("/office-gallery/:batchId/categories/:catId/image", deleteOfficeCategoryImage);
router.patch("/office-gallery/:batchId/categories/:catId/image/highlights", updateOfficeCategoryImageHighlights);

// End of Admin Routes
module.exports = router;