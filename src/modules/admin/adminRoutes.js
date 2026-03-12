const express = require("express");
const router = express.Router();
const upload = require("../../multer/multerConfig");

const {
  adminLogin,
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  createSubcategory,
  getSubcategories,
  updateSubcategory,
  deleteSubcategory,
  getEnquiries,
  uploadBanner,
  getBanners,
  deleteBanner,
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

  // ✅ Hiring Company Functions (from controller)
  createHiring,
  getAllHiring,
  updateHiring,
  deleteHiring,
  createEnquiry,
  getCategoriesWithSubs,
  createRegistration,
  getRegistrations,
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
  getAllTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getGallery,
  updateGallery,
  addGalleryImages,
  deleteGalleryImage,
} = require("./adminController");

// ✅ Admin Login
router.post("/login", adminLogin);

// ✅ Navbar (Category) Routes
router.post("/category", upload.single("image"), createCategory);
router.get("/categories", getCategories);
router.put("/category/:id", upload.single("image"), updateCategory);
router.delete("/category/:id", deleteCategory);
router.get("/categorywithsub", getCategoriesWithSubs);

// ✅ Subcategory Routes
router.post("/subcategory", createSubcategory);
router.get("/subcategories", getSubcategories);
router.put("/subcategory/:id", updateSubcategory);
router.delete("/subcategory/:id", deleteSubcategory);

// ✅ Enquiries
router.get("/enquiries", getEnquiries);
router.post("/enquiries", createEnquiry);

// ✅ Banner Upload, Get & Delete
router.post("/upload-banner", upload.single("photo"), uploadBanner);
router.get("/banners", getBanners);
router.delete("/banner/:id", deleteBanner);

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

// ✅ Hiring Companies Routes
router.post("/hiring", createHiring);
router.get("/hiring", getAllHiring);
router.put("/hiring/:id", updateHiring);
router.delete("/hiring/:id", deleteHiring);

// for registration
router.post("/register", createRegistration);
router.get("/register", getRegistrations);

//for upcoming live classes
router.post("/liveclass", createLiveClass);
router.get("/liveclass", getAllLiveClasses);
router.get("/liveclass/:id", getLiveClassById);
router.put("/liveclass/:id", updateLiveClass);
router.delete("/liveclass/:id", deleteLiveClass);

// ===============================
// 📝 Blogs
// ===============================

// Create Blog (with image upload)
router.post("/blogs", upload.single("image"), createBlog);

// Update Blog (optional image update)
router.put("/blogs/:id", upload.single("image"), updateBlog);

router.get("/blogs", getAllBlogs);
router.get("/blogs/:slug", getBlogBySlug);
router.delete("/blogs/:id", deleteBlog);


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

module.exports = router;
