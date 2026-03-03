const Admin = require("../../models/admin_home/Admin");
const Banner = require("../../models/admin_home/Banner");
const Navbar = require("../../models/admin_home/Navbar");
const Subcategory = require("../../models/admin_home/Subcategory");
const Company = require("../../models/admin_home/Company");
const Enquiry = require("../../models/admin_home/Enquiry");
const { Question, Answer } = require("../../models/admin_home/Question");
const HiringComps = require("../../models/admin_home/HiringComps");
const Registration = require("../../models/admin_home/Registration");
const LiveClass = require("../../models/admin_home/LiveClass");

const fs = require("fs");
const path = require("path");
const Blog = require("../../models/admin_home/Blog");
const slugify = require("slugify");
const sanitizeHtml = require("sanitize-html");
const Testimonial = require("../../models/admin_home/Testimonials");
const transporter = require("../../utils/mailsender");

// ✅ Admin login
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.query().findOne({ username, password });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });
    res.status(200).json({ message: "Login successful", admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   CREATE NAVBAR ITEM
========================= */
exports.createCategory = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { category, description } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const data = await Navbar.query().insert({
      category,
      description: description || null,
      image: req.file ? `uploads/${req.file.filename}` : null,
    });

    res.status(201).json({
      message: "Category created successfully",
      data,
    });
  } catch (err) {
    console.error("CREATE CATEGORY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET ALL NAVBAR ITEMS
========================= */
exports.getCategories = async (req, res) => {
  try {
    const data = await Navbar.query().select("*");
    res.status(200).json(data);
  } catch (err) {
    console.error("GET ALL CATEGORIES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   UPDATE NAVBAR ITEM
========================= */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description } = req.body;

    const existing = await Navbar.query().findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    let image = existing.image;
    if (req.file) {
      if (existing.image) {
        const oldPath = path.join("uploads", path.basename(existing.image));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image = `uploads/${req.file.filename}`;
    }

    const updated = await Navbar.query().patchAndFetchById(id, {
      category: category ?? existing.category,
      description: description ?? existing.description,
      image,
    });

    res.status(200).json({
      message: "Category updated successfully",
      updated,
    });
  } catch (err) {
    console.error("UPDATE CATEGORY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DELETE NAVBAR ITEM
========================= */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Navbar.query().findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    // delete image if exists
    if (existing.image) {
      const imgPath = path.join("uploads", path.basename(existing.image));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Navbar.query().deleteById(id);

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("DELETE CATEGORY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Create subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.query().insert({
      category_id: req.body.category_id,
      subcategory: req.body.subcategory,
    });
    res.json({ message: "Subcategory added", subcategory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all subcategories
exports.getSubcategories = async (req, res) => {
  try {
    const subcategories =
      await Subcategory.query().withGraphFetched("category");
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Edit subcategory
exports.updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { subcategory, category_id } = req.body;

    const updated = await Subcategory.query().patchAndFetchById(id, {
      subcategory,
      category_id,
    });

    if (!updated)
      return res.status(404).json({ message: "Subcategory not found" });
    res.json({ message: "Subcategory updated successfully", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Subcategory.query().deleteById(id);

    if (!deleted)
      return res.status(404).json({ message: "Subcategory not found" });
    res.json({ message: "Subcategory deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET CATEGORIES WITH SUBCATEGORIES
========================= */
exports.getCategoriesWithSubs = async (req, res) => {
  try {
    // Fetch all categories
    const categories = await Navbar.query().select("*");

    // Fetch all subcategories with category info
    const subcategories = await Subcategory.query().select("*");

    // Nest subcategories under their categories
    const result = categories.map((cat) => ({
      ...cat,
      subcategories: subcategories.filter((sub) => sub.category_id === cat.id),
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("GET CATEGORIES WITH SUBCATEGORIES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get enquiries
exports.getEnquiries = async (req, res) => {
  try {
    const data = await Enquiry.query();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create a new enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const { name, email, mobile, course, location, timeslot } = req.body;

    if (!name || !email || !mobile || !course || !location || !timeslot) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 1️⃣ Save to DB
    const newEnquiry = await Enquiry.query().insert({
      name,
      email,
      mobile,
      course,
      location,
      timeslot,
    });

    // 2️⃣ Send response immediately
    res.status(201).json({
      message: "Enquiry submitted successfully",
      data: newEnquiry,
    });

    // ==============================
    // 📩 ADMIN EMAIL TEMPLATE
    // ==============================

    const adminTemplate = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">📌 New Course Enquiry Received</h2>
        <p>You have received a new enquiry through the website.</p>
        
        <table style="border-collapse: collapse; width: 100%; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Mobile</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${mobile}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Course</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${course}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Location</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${location}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Preferred Timeslot</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${timeslot}</td>
          </tr>
        </table>

        <p style="margin-top: 20px;">
          Please follow up with the student at the earliest.
        </p>

        <hr/>
        <p style="font-size: 12px; color: gray;">
          This is an automated notification from your website enquiry system.
        </p>
      </div>
    `;

    transporter
      .sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `New Enquiry - ${course}`,
        html: adminTemplate,
      })
      .catch((err) => console.error("Admin email failed:", err.message));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Upload banner
exports.uploadBanner = async (req, res) => {
  try {
    // 🔎 Debug (you can remove later)
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title, highlight, subtitle, tagline, description, button } =
      req.body;

    // ✅ Basic validation (prevents MySQL crash)
    if (!title || !highlight || !subtitle) {
      return res.status(400).json({
        message: "Title, highlight, and subtitle are required",
      });
    }

    const banner = await Banner.query().insert({
      title,
      highlight,
      subtitle,
      tagline: tagline || null,
      description: description || null,
      button: button || null,
      photoUrl: `uploads/${req.file.filename}`, // ✅ safest path
    });

    res.status(201).json({
      message: "Banner uploaded successfully",
      banner,
    });
  } catch (err) {
    console.error("UPLOAD BANNER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.query();
    res.status(200).json(banners || []);
  } catch (err) {
    console.error("Error fetching banners:", err);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

// ✅ Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find the banner record
    const banner = await Banner.query().findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // 2️⃣ Delete the file from uploads folder (if it exists)
    const bannerPath = path.join(
      __dirname,
      "../../../uploads",
      path.basename(banner.photoUrl),
    );
    if (fs.existsSync(bannerPath)) {
      fs.unlinkSync(bannerPath);
      console.log("🗑️ Deleted banner file:", bannerPath);
    }

    // 3️⃣ Delete the record from DB
    await Banner.query().deleteById(id);

    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error("Error deleting banner:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Upload company photo
exports.uploadCompany = async (req, res) => {
  try {
    const company = await Company.query().insert({ photoUrl: req.file.path });
    res.json({ message: "Company photo uploaded", company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all company photos
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.query();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete company photo
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find the company record
    const company = await Company.query().findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // 2️⃣ Delete the file from uploads folder (if it exists)
    const companyPath = path.join(
      __dirname,
      "../../../uploads",
      path.basename(company.photoUrl),
    );
    if (fs.existsSync(companyPath)) {
      fs.unlinkSync(companyPath);
      console.log("🗑️ Deleted company file:", companyPath);
    }

    // 3️⃣ Delete from DB
    await Company.query().deleteById(id);

    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    console.error("Error deleting company:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Add a new question
exports.addQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const newQuestion = await Question.query().insert({ question });
    res.status(201).json({
      message: "Question added successfully",
      question: newQuestion,
    });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Add an answer for an existing question
exports.addAnswer = async (req, res) => {
  try {
    const { answer, question_id } = req.body;
    if (!answer || !question_id) {
      return res
        .status(400)
        .json({ message: "Both answer and question_id are required" });
    }

    const question = await Question.query().findById(question_id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const newAnswer = await Answer.query().insert({ answer, question_id });
    res.status(201).json({
      message: "Answer added successfully",
      answer: newAnswer,
    });
  } catch (error) {
    console.error("Error adding answer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get all questions (with answers)
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.query().withGraphFetched("answers");
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Update a question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;

    const updatedQuestion = await Question.query().patchAndFetchById(id, {
      question,
    });

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      message: "Question updated successfully",
      updatedQuestion,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Question.query().deleteById(id);

    if (!deleted) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Update an answer
exports.updateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const updatedAnswer = await Answer.query().patchAndFetchById(id, {
      answer,
    });

    if (!updatedAnswer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    res.status(200).json({
      message: "Answer updated successfully",
      updatedAnswer,
    });
  } catch (error) {
    console.error("Error updating answer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Delete an answer
exports.deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Answer.query().deleteById(id);

    if (!deleted) {
      return res.status(404).json({ message: "Answer not found" });
    }

    res.status(200).json({ message: "Answer deleted successfully" });
  } catch (error) {
    console.error("Error deleting answer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Create a new hiring company
exports.createHiring = async (req, res) => {
  try {
    const { companies } = req.body;
    if (!companies) {
      return res.status(400).json({ message: "Company name is required" });
    }

    const newHiring = await HiringComps.query().insert({ companies });
    res
      .status(201)
      .json({ message: "Company name created", hiring: newHiring });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all hiring companies
exports.getAllHiring = async (req, res) => {
  try {
    const hiringList = await HiringComps.query();
    res.status(200).json(hiringList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update a hiring company name
exports.updateHiring = async (req, res) => {
  try {
    const { id } = req.params;
    const { companies } = req.body;

    const updated = await HiringComps.query().patchAndFetchById(id, {
      companies,
    });
    if (!updated) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ message: "Company updated successfully", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete a hiring company
exports.deleteHiring = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await HiringComps.query().deleteById(id);

    if (!deleted) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ message: "Company deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//registration

/**
 * Create a new registration
 */
exports.createRegistration = async (req, res) => {
  try {
    const { fullName, email, phone, courseId } = req.body;

    // Validate input
    if (!fullName || !email || !phone || !courseId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if courseId exists
    const course = await Navbar.query().findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Selected course not found" });
    }

    const registration = await Registration.query().insert({
      fullName,
      email,
      phone,
      courseId,
    });

    return res.status(201).json({
      message: "Registration successful",
      registration,
      courseName: course.category, // Return course name too
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all registrations with course names
 */
exports.getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.query().withGraphFetched("course");

    // Format response
    const formatted = registrations.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      email: r.email,
      phone: r.phone,
      courseId: r.courseId,
      courseName: r.course?.category,
    }));

    return res.json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * CREATE Live Class
 * POST /api/live-classes
 */
exports.createLiveClass = async (req, res) => {
  try {
    const {
      courseId,
      title,
      startDate,
      durationDays,
      startTime,
      endTime,
      isActive,
    } = req.body;

    if (
      !courseId ||
      !title ||
      !startDate ||
      !durationDays ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const liveClass = await LiveClass.query().insert({
      courseId,
      title,
      startDate,
      durationDays,
      startTime,
      endTime,
      isActive,
    });

    return res.status(201).json(liveClass);
  } catch (error) {
    console.error("Create Live Class Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET All Live Classes
 * GET /api/live-classes
 */
exports.getAllLiveClasses = async (req, res) => {
  try {
    const liveClasses = await LiveClass.query()
      .withGraphFetched("category")
      .orderBy("createdAt", "desc");

    return res.status(200).json(liveClasses);
  } catch (error) {
    console.error("Get Live Classes Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET Single Live Class by ID
 * GET /api/live-classes/:id
 */
exports.getLiveClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const liveClass = await LiveClass.query()
      .findById(id)
      .withGraphFetched("category");

    if (!liveClass) {
      return res.status(404).json({ message: "Live class not found" });
    }

    return res.status(200).json(liveClass);
  } catch (error) {
    console.error("Get Live Class Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * UPDATE Live Class
 * PUT /api/live-classes/:id
 */
exports.updateLiveClass = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await LiveClass.query().patchAndFetchById(id, {
      ...req.body,
      updatedAt: new Date(),
    });

    if (!updated) {
      return res.status(404).json({ message: "Live class not found" });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Update Live Class Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE Live Class
 * DELETE /api/live-classes/:id
 */
exports.deleteLiveClass = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await LiveClass.query().deleteById(id);

    if (!deletedRows) {
      return res.status(404).json({ message: "Live class not found" });
    }

    return res.status(200).json({ message: "Live class deleted successfully" });
  } catch (error) {
    console.error("Delete Live Class Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * CREATE Blog
 * POST /api/blogs
 */
exports.createBlog = async (req, res) => {
  try {
    const { title, short_description, description } = req.body;

    // For create, an image is required
    if (!title || !short_description || !description || !req.file) {
      return res.status(400).json({
        success: false,
        message: "All required fields including image must be provided",
      });
    }

    // Sanitize description
    const cleanDescription = sanitizeHtml(description, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      allowedAttributes: {
        a: ["href", "name", "target"],
        img: ["src", "alt"],
        "*": ["style"],
      },
    });

    // Generate slug
    let slug = slugify(title, { lower: true, strict: true });
    const existingSlug = await Blog.query().findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Save blog
    const blog = await Blog.query().insert({
      title,
      slug,
      short_description,
      description: cleanDescription,
      image: `uploads/${req.file.filename}`, // Always use the uploaded file
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Create Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET All Blogs (Card Data)
 * GET /api/blogs
 */
exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const result = await Blog.query()
      .select("id", "title", "slug", "short_description", "image", "created_at")
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    return res.status(200).json({
      success: true,
      message: "Blog list fetched successfully",
      data: {
        current_page: page,
        data: result.results,
        total: result.total,
      },
    });
  } catch (error) {
    console.error("Get Blogs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET Blog By Slug
 * GET /api/blogs/:slug
 */
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.query().where("slug", slug).first();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog details fetched successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Get Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * UPDATE Blog
 * PUT /api/blogs/:id
 */
exports.updateBlog = async (req, res) => {
  try {
    console.log("=== Update Blog Request ===");
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    console.log("File:", req.file);
    const { id } = req.params;

    // Copy all text fields from req.body
    let updateData = { ...req.body };

    // ✅ Handle slug if title changes
    if (req.body.title) {
      let newSlug = slugify(req.body.title, { lower: true, strict: true });
      const existingSlug = await Blog.query()
        .where("slug", newSlug)
        .whereNot("id", id)
        .first();
      if (existingSlug) newSlug = `${newSlug}-${Date.now()}`;
      updateData.slug = newSlug;
    }

    // ✅ Sanitize description
    if (req.body.description) {
      updateData.description = sanitizeHtml(req.body.description, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        allowedAttributes: {
          a: ["href", "name", "target"],
          img: ["src", "alt"],
          "*": ["style"],
        },
      });
    }

    // ✅ Handle image
    if (req.file) {
      updateData.image = `uploads/${req.file.filename}`;

      // Optional: delete old image
      const oldBlog = await Blog.query().findById(id);
      if (oldBlog?.image) {
        const oldImagePath = path.join(__dirname, "../../", oldBlog.image);
        console.log("Deleting old image:", oldImagePath);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
    } else if (req.body.existingImage) {
      updateData.image = req.body.existingImage;
      delete updateData.existingImage; // <-- ADD THIS
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) =>
        updateData[key] == null ||
        (updateData[key] === "" && delete updateData[key]),
    );

    const updated = await Blog.query().patchAndFetchById(id, updateData);

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * DELETE Blog
 * DELETE /api/blogs/:id
 */
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await Blog.query().deleteById(id);

    if (!deletedRows) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET ALL ACTIVE TESTIMONIALS
 */
exports.getAllTestimonials = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const testimonials = await Testimonial.query()
      .where("is_active", true)
      .orderBy("id", "desc");

    const formattedTestimonials = testimonials.map((item) => ({
      ...item,
      image: item.image ? `${baseUrl}/uploads/${item.image}` : null,
    }));

    res.json({
      success: true,
      data: formattedTestimonials,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
/**
 * GET SINGLE
 */
exports.getTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.query().findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * CREATE (With Multer)
 */
exports.createTestimonial = async (req, res) => {
  try {
    const { name, role, text } = req.body;

    if (!name || !role || !text) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const image = req.file ? req.file.filename : null;

    const newTestimonial = await Testimonial.query().insert({
      name,
      role,
      text,
      image,
    });

    res.status(201).json({
      success: true,
      data: newTestimonial,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * UPDATE (With Multer)
 */
exports.updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.query().findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    const { name, role, text } = req.body;

    let updatedData = {
      name,
      role,
      text,
    };

    // If new image uploaded
    if (req.file) {
      updatedData.image = req.file.filename;
    }

    const updated = await Testimonial.query().patchAndFetchById(
      req.params.id,
      updatedData,
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * DELETE (Soft delete)
 */
exports.deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.query()
      .findById(req.params.id)
      .patch({ is_active: false });

    res.json({
      success: true,
      message: "Testimonial removed",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
