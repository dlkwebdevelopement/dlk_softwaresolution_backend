const Admin = require("../../models/admin_home/Admin");
const Banner = require("../../models/admin_home/Banner");
const CourseCategory = require("../../models/admin_courses/CourseCategory");
const Course = require("../../models/admin_courses/Course");
const Company = require("../../models/admin_home/Company");
const Enquiry = require("../../models/admin_home/Enquiry");
const { Question, Answer } = require("../../models/admin_home/Question");
const Registration = require("../../models/admin_home/Registration");
const LiveClass = require("../../models/admin_home/LiveClass");

const fs = require("fs");
const path = require("path");
const Blog = require("../../models/admin_home/Blog");
const StudentProject = require("../../models/admin_home/StudentProject");
const Offer = require("../../models/admin_home/Offer");
const Gallery = require("../../models/admin_home/Gallery");
const GalleryEvent = require("../../models/admin_home/GalleryEvent");
const OfficeGallery = require("../../models/admin_home/OfficeGallery");
const OfficeGalleryEvent = require("../../models/admin_home/OfficeGalleryEvent");
const slugify = require("slugify");
const sanitizeHtml = require("sanitize-html");
const Testimonial = require("../../models/admin_home/Testimonials");
const transporter = require("../../utils/mailsender");
const mongoose = require("mongoose");
const Video = require("../../models/admin_home/Video");
const Skill = require("../../models/admin_home/Skill");
const Placement = require("../../models/admin_home/Placement");
const Workshop = require("../../models/admin_home/Workshop");
const { getFullUrl } = require("../../utils/urlHelper");
const { getIO } = require("../../utils/socket");

// ✅ Admin login
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username, password });
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
    const { categoryName, description } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const slug = slugify(categoryName, { lower: true, strict: true });

    const data = await CourseCategory.create({
      categoryName,
      slug,
      description: description || null,
      image: req.file ? getFullUrl(`uploads/${req.file.filename}`) : null,
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
    const data = await CourseCategory.aggregate([
      {
        $lookup: {
          from: "courses", // The name of the collection in MongoDB (usually lowercase plural)
          localField: "_id",
          foreignField: "category_id",
          as: "courses"
        }
      },
      {
        $addFields: {
          courseCount: { $size: "$courses" },
          id: "$_id" // Add 'id' field to match Mongoose virtuals behavior
        }
      },
      {
        $project: {
          courses: 0 // Remove the full courses array to save bandwidth
        }
      },
      {
        $sort: { updatedAt: -1 }
      }
    ]);
    res.status(200).json(data);
  } catch (err) {
    console.error("GET ALL CATEGORIES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET GALLERY ALBUMS
========================= */
exports.getGallery = async (req, res) => {
  try {
    const data = await Gallery.find();
    res.status(200).json(data);
  } catch (err) {
    console.error("GET GALLERY ALBUMS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   UPDATE GALLERY ALBUM
========================= */
exports.updateGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { albumName } = req.body;

    const existing = await Gallery.findById(id);
    if (!existing) return res.status(404).json({ message: "Album not found" });

    if (albumName) existing.albumName = albumName;

    await existing.save();
    res.status(200).json({ message: "Album updated successfully", data: existing });
  } catch (err) {
    console.error("UPDATE GALLERY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   ADD IMAGES TO GALLERY
========================= */
exports.addGalleryImages = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Gallery.findById(id);
    if (!existing) return res.status(404).json({ message: "Album not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Move files to album-specific folder if needed, but for now we use the unique suffix from multer
    // The user requested uploads/<albumName>/filename structure.
    // We can rename/move them now.

    const newImages = req.files.map(file => {
      const filename = file.filename;
      const albumDir = path.join("uploads", existing.albumName);
      if (!fs.existsSync(albumDir)) fs.mkdirSync(albumDir, { recursive: true });

      const oldPath = file.path;
      const newPath = path.join(albumDir, filename);
      fs.renameSync(oldPath, newPath);

      return getFullUrl(`uploads/${existing.albumName}/${filename}`);
    });

    existing.images.push(...newImages);
    await existing.save();

    res.status(200).json({ message: "Images added successfully", data: existing });
  } catch (err) {
    console.error("ADD GALLERY IMAGES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   CREATE GALLERY ALBUM
========================= */
exports.createGalleryAlbum = async (req, res) => {
  try {
    const { albumName } = req.body;
    if (!albumName) return res.status(400).json({ message: "Album name is required" });

    let thumbnail = "";
    if (req.file) {
      thumbnail = getFullUrl(`uploads/${req.file.filename}`);
    }

    const album = await Gallery.create({ albumName, thumbnail });
    res.status(201).json({ message: "Album created successfully", data: album });
  } catch (err) {
    console.error("CREATE GALLERY ALBUM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteGalleryAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const album = await Gallery.findById(id);
    if (!album) return res.status(404).json({ message: "Album not found" });

    // Delete thumbnail if exists
    if (album.thumbnail) {
      const thumbPath = path.join(process.cwd(), "uploads", path.basename(album.thumbnail));
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    // Delete all images in album folder
    const albumDir = path.join(process.cwd(), "uploads", album.albumName);
    if (fs.existsSync(albumDir)) {
      fs.rmSync(albumDir, { recursive: true, force: true });
    }

    await Gallery.findByIdAndDelete(id);
    res.status(200).json({ message: "Album and all its images deleted successfully" });
  } catch (err) {
    console.error("DELETE GALLERY ALBUM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateGalleryAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { albumName } = req.body;

    const album = await Gallery.findById(id);
    if (!album) return res.status(404).json({ message: "Album not found" });

    let thumbnail = album.thumbnail;
    if (req.file) {
      // Delete old thumbnail
      if (album.thumbnail) {
        const oldPath = path.join(process.cwd(), "uploads", path.basename(album.thumbnail));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      thumbnail = getFullUrl(`uploads/${req.file.filename}`);
    }

    const updatedAlbum = await Gallery.findByIdAndUpdate(id, {
      albumName: albumName || album.albumName,
      thumbnail
    }, { new: true });

    res.status(200).json({ message: "Album updated successfully", data: updatedAlbum });
  } catch (err) {
    console.error("UPDATE GALLERY ALBUM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DELETE GALLERY IMAGE
========================= */
exports.deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.body || !req.body.imageUrl) {
      return res.status(400).json({ message: "Image URL is required for deletion" });
    }
    const { imageUrl } = req.body;

    const existing = await Gallery.findById(id);
    if (!existing) return res.status(404).json({ message: "Album not found" });

    // Remove from array
    existing.images = existing.images.filter(img => img !== imageUrl);

    // Delete physical file
    try {
      const urlObj = new URL(imageUrl);
      const relativePath = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
      const physicalPath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
    } catch (e) {
      console.warn("Could not delete physical file:", e.message);
    }

    await existing.save();
    res.status(200).json({ message: "Image deleted successfully", data: existing });
  } catch (err) {
    console.error("DELETE GALLERY IMAGE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GALLERY EVENT CRUD
========================= */

exports.createGalleryEvent = async (req, res) => {
  try {
    const { categoryId, title, eventDate, eventTime } = req.body;
    if (!categoryId || !title || !eventDate || !eventTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let mainImage = "";
    if (req.files && req.files.mainImage) {
      mainImage = `uploads/${req.files.mainImage[0].filename}`;
    }

    let galleryImages = [];
    if (req.files && req.files.galleryImages) {
      galleryImages = req.files.galleryImages.map(file => `uploads/${file.filename}`);
    }

    const newEvent = await GalleryEvent.create({
      categoryId,
      title,
      mainImage,
      galleryImages,
      eventDate,
      eventTime,
    });

    res.status(201).json({ success: true, message: "Gallery event created successfully", data: newEvent });
  } catch (err) {
    console.error("CREATE GALLERY EVENT ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllGalleryEvents = async (req, res) => {
  try {
    const events = await GalleryEvent.find()
      .populate("categoryId", "albumName")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    console.error("GET ALL GALLERY EVENTS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteGalleryEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await GalleryEvent.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // Physical deletion of main image
    if (event.mainImage) {
      const physicalPath = path.join(process.cwd(), "uploads", path.basename(event.mainImage));
      if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
    }

    // Physical deletion of gallery images
    if (event.galleryImages && event.galleryImages.length > 0) {
      event.galleryImages.forEach(img => {
        const physicalPath = path.join(process.cwd(), "uploads", path.basename(img));
        if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
      });
    }

    await GalleryEvent.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Gallery event deleted successfully" });
  } catch (err) {
    console.error("DELETE GALLERY EVENT ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateGalleryEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, title, eventDate, eventTime } = req.body;

    const event = await GalleryEvent.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    let mainImage = event.mainImage;
    if (req.files && req.files.mainImage) {
      // Delete old main image
      if (event.mainImage) {
        const oldPath = path.join(process.cwd(), "uploads", path.basename(event.mainImage));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      mainImage = `uploads/${req.files.mainImage[0].filename}`;
    }

    let galleryImages = [...event.galleryImages];

    // If keepImages is provided, compute what was removed and delete those files
    if (req.body.keepImages !== undefined) {
      let keepImages = [];
      try { keepImages = JSON.parse(req.body.keepImages); } catch (e) { keepImages = galleryImages; }

      // Physically delete removed images
      const removed = galleryImages.filter(img => !keepImages.includes(img));
      removed.forEach(img => {
        const physicalPath = path.join(process.cwd(), "uploads", path.basename(img));
        if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
      });
      galleryImages = keepImages;
    }

    // Append any newly uploaded images
    if (req.files && req.files.galleryImages) {
      const newImages = req.files.galleryImages.map(file => `uploads/${file.filename}`);
      galleryImages = [...galleryImages, ...newImages];
    }

    const updatedEvent = await GalleryEvent.findByIdAndUpdate(id, {
      categoryId: categoryId || event.categoryId,
      title: title || event.title,
      eventDate: eventDate || event.eventDate,
      eventTime: eventTime || event.eventTime,
      mainImage,
      galleryImages,
    }, { new: true });

    res.status(200).json({ success: true, message: "Gallery event updated successfully", data: updatedEvent });
  } catch (err) {
    console.error("UPDATE GALLERY EVENT ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
   OFFICE GALLERY ALBUMS (New Special Vertical)
========================= */

exports.getOfficeGallery = async (req, res) => {
  try {
    const data = await OfficeGallery.find();
    res.status(200).json(data);
  } catch (err) {
    console.error("GET OFFICE GALLERY ALBUMS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.createOfficeGalleryAlbum = async (req, res) => {
  try {
    const { albumName } = req.body;
    if (!albumName) return res.status(400).json({ message: "Album name is required" });

    let thumbnail = "";
    if (req.file) {
      thumbnail = getFullUrl(`uploads/${req.file.filename}`);
    }

    const album = await OfficeGallery.create({ albumName, thumbnail });
    res.status(201).json({ message: "Office Album created successfully", data: album });
  } catch (err) {
    console.error("CREATE OFFICE GALLERY ALBUM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateOfficeGalleryAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { albumName } = req.body;

    const album = await OfficeGallery.findById(id);
    if (!album) return res.status(404).json({ message: "Office Album not found" });

    let thumbnail = album.thumbnail;
    if (req.file) {
      if (album.thumbnail) {
        const oldPath = path.join(process.cwd(), "uploads", path.basename(album.thumbnail));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      thumbnail = getFullUrl(`uploads/${req.file.filename}`);
    }

    const updatedAlbum = await OfficeGallery.findByIdAndUpdate(id, {
      albumName: albumName || album.albumName,
      thumbnail
    }, { new: true });

    res.status(200).json({ message: "Office Album updated successfully", data: updatedAlbum });
  } catch (err) {
    console.error("UPDATE OFFICE GALLERY ALBUM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteOfficeGalleryAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const album = await OfficeGallery.findById(id);
    if (!album) return res.status(404).json({ message: "Office Album not found" });

    if (album.thumbnail) {
      const thumbPath = path.join(process.cwd(), "uploads", path.basename(album.thumbnail));
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    const albumDir = path.join(process.cwd(), "uploads", `office_${album.albumName}`);
    if (fs.existsSync(albumDir)) {
      fs.rmSync(albumDir, { recursive: true, force: true });
    }

    await OfficeGallery.findByIdAndDelete(id);
    res.status(200).json({ message: "Office Album deleted successfully" });
  } catch (err) {
    console.error("DELETE OFFICE GALLERY ALBUM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.addOfficeGalleryImages = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await OfficeGallery.findById(id);
    if (!existing) return res.status(404).json({ message: "Office Album not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const newImages = req.files.map(file => {
      const filename = file.filename;
      const albumDir = path.join("uploads", `office_${existing.albumName}`);
      if (!fs.existsSync(albumDir)) fs.mkdirSync(albumDir, { recursive: true });

      const oldPath = file.path;
      const newPath = path.join(albumDir, filename);
      fs.renameSync(oldPath, newPath);

      return getFullUrl(`uploads/office_${existing.albumName}/${filename}`);
    });

    existing.images.push(...newImages);
    await existing.save();

    res.status(200).json({ message: "Images added successfully to Office Album", data: existing });
  } catch (err) {
    console.error("ADD OFFICE GALLERY IMAGES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteOfficeGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "Image URL is required" });

    const existing = await OfficeGallery.findById(id);
    if (!existing) return res.status(404).json({ message: "Office Album not found" });

    existing.images = existing.images.filter(img => img !== imageUrl);

    try {
      const urlObj = new URL(imageUrl);
      const relativePath = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
      const physicalPath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
    } catch (e) {
      console.warn("Could not delete physical file:", e.message);
    }

    await existing.save();
    res.status(200).json({ message: "Office image deleted successfully", data: existing });
  } catch (err) {
    console.error("DELETE OFFICE GALLERY IMAGE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   OFFICE GALLERY EVENTS
========================= */

exports.createOfficeGalleryEvent = async (req, res) => {
  try {
    const { categoryId, title, eventDate, eventTime } = req.body;
    if (!categoryId || !title || !eventDate || !eventTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let mainImage = "";
    if (req.files && req.files.mainImage) {
      mainImage = `uploads/${req.files.mainImage[0].filename}`;
    }

    let galleryImages = [];
    if (req.files && req.files.galleryImages) {
      galleryImages = req.files.galleryImages.map(file => `uploads/${file.filename}`);
    }

    const newEvent = await OfficeGalleryEvent.create({
      categoryId,
      title,
      mainImage,
      galleryImages,
      eventDate,
      eventTime,
    });

    res.status(201).json({ success: true, message: "Office Gallery event created successfully", data: newEvent });
  } catch (err) {
    console.error("CREATE OFFICE GALLERY EVENT ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllOfficeGalleryEvents = async (req, res) => {
  try {
    const events = await OfficeGalleryEvent.find()
      .populate("categoryId", "albumName")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    console.error("GET ALL OFFICE GALLERY EVENTS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteOfficeGalleryEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await OfficeGalleryEvent.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Office Event not found" });

    if (event.mainImage) {
      const physicalPath = path.join(process.cwd(), "uploads", path.basename(event.mainImage));
      if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
    }

    if (event.galleryImages && event.galleryImages.length > 0) {
      event.galleryImages.forEach(img => {
        const physicalPath = path.join(process.cwd(), "uploads", path.basename(img));
        if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
      });
    }

    await OfficeGalleryEvent.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Office Gallery event deleted successfully" });
  } catch (err) {
    console.error("DELETE OFFICE GALLERY EVENT ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOfficeGalleryEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, title, eventDate, eventTime } = req.body;

    const event = await OfficeGalleryEvent.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Office Event not found" });

    let mainImage = event.mainImage;
    if (req.files && req.files.mainImage) {
      if (event.mainImage) {
        const oldPath = path.join(process.cwd(), "uploads", path.basename(event.mainImage));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      mainImage = `uploads/${req.files.mainImage[0].filename}`;
    }

    let galleryImages = [...event.galleryImages];

    if (req.body.keepImages !== undefined) {
      let keepImages = [];
      try { keepImages = JSON.parse(req.body.keepImages); } catch (e) { keepImages = galleryImages; }
      const removed = galleryImages.filter(img => !keepImages.includes(img));
      removed.forEach(img => {
        const physicalPath = path.join(process.cwd(), "uploads", path.basename(img));
        if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
      });
      galleryImages = keepImages;
    }

    if (req.files && req.files.galleryImages) {
      const newImages = req.files.galleryImages.map(file => `uploads/${file.filename}`);
      galleryImages = [...galleryImages, ...newImages];
    }

    const updatedEvent = await OfficeGalleryEvent.findByIdAndUpdate(id, {
      categoryId: categoryId || event.categoryId,
      title: title || event.title,
      eventDate: eventDate || event.eventDate,
      eventTime: eventTime || event.eventTime,
      mainImage,
      galleryImages,
    }, { new: true });

    res.status(200).json({ success: true, message: "Office Gallery event updated successfully", data: updatedEvent });
  } catch (err) {
    console.error("UPDATE OFFICE GALLERY EVENT ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
/* =========================
   UPDATE NAVBAR ITEM
 ========================= */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, description } = req.body;

    const existing = await CourseCategory.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    let image = existing.image;
    if (req.file) {
      if (existing.image) {
        const oldPath = path.join("uploads", path.basename(existing.image));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image = getFullUrl(`uploads/${req.file.filename}`);
    }

    const updateData = {
      categoryName: categoryName ?? existing.categoryName,
      description: description ?? existing.description,
      image,
    };

    if (categoryName) {
      updateData.slug = slugify(categoryName, { lower: true, strict: true });
    }

    const updated = await CourseCategory.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });

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

    const existing = await CourseCategory.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    // delete image if exists
    if (existing.image) {
      const imgPath = path.join("uploads", path.basename(existing.image));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await CourseCategory.findByIdAndDelete(id);

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("DELETE CATEGORY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET CATEGORIES WITH SUBCATEGORIES
========================= */
exports.getCategoriesWithSubs = async (req, res) => {
  try {
    // Fetch all categories
    const categories = await CourseCategory.find();

    // Fetch all courses
    const courses = await Course.find({}, "title slug category_id");

    // Nest courses under their categories (acting as subcategories)
    const result = categories.map((cat) => {
      const c = cat.toObject();
      return {
        ...c,
        category: c.categoryName, // For backward compatibility with frontend if needed
        subcategories: courses
          .filter((course) => String(course.category_id) === String(cat._id))
          .map((course) => ({
            id: course._id,
            subcategory: course.title, // Treat course title as subcategory name
            slug: course.slug,
          })),
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("GET CATEGORIES WITH COURSES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Mark enquiry as read
exports.markEnquiryRead = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findByIdAndUpdate(id, { isRead: true }, { returnDocument: 'after' });
    if (!enquiry) return res.status(404).json({ message: "Enquiry not found" });
    res.status(200).json({ message: "Enquiry marked as read", data: enquiry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Reply to enquiry via email
exports.replyToEnquiry = async (req, res) => {
  try {
    const { id, replyMessage } = req.body;
    if (!id || !replyMessage) return res.status(400).json({ error: "ID and reply message required" });

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) return res.status(404).json({ message: "Enquiry not found" });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: enquiry.email,
      subject: `Response to your Inquiry - DLK Software Solutions`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2c3e50;">Hello ${enquiry.name},</h2>
          <p>Thank you for reaching out to us regarding <strong>${enquiry.course}</strong>.</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #27ae60;">
            ${replyMessage.replace(/\n/g, '<br/>')}
          </div>
          <p>If you have any further questions, feel free to reply to this email or call us at ${process.env.PHONE || '+91-XXXXXXXXXX'}.</p>
          <hr/>
          <p style="font-size: 12px; color: gray;">Best Regards,<br/>Admission Team<br/>DLK Software Solutions</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    enquiry.isReply = true;
    enquiry.isRead = true;
    await enquiry.save();

    res.status(200).json({ message: "Reply sent successfully" });
  } catch (err) {
    console.error("REPLY ENQUIRY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete enquiry
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Enquiry.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Enquiry not found" });
    res.status(200).json({ message: "Enquiry deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get enquiries
exports.getEnquiries = async (req, res) => {
  try {
    const data = await Enquiry.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create a new enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const { name, email, mobile, course, location, timeslot, captchaToken } = req.body;

    if (!name || !email || !mobile || !course || !location || !timeslot) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!captchaToken) {
      return res.status(400).json({ error: "CAPTCHA verification is required" });
    }

    const secretKey = "6Lc_DJAsAAAAAJ9YR4Z2typnfOHeIjF30l-Lse5B";
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

    const response = await fetch(verificationUrl, { method: 'POST' });
    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({ error: "Failed CAPTCHA verification. Please try again." });
    }

    // 1️⃣ Save to DB
    const newEnquiry = await Enquiry.create({
      name,
      email,
      mobile,
      course,
      location,
      timeslot,
    });

    // 📩 User Auto-Reply Template
    const userAutoReply = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Enquiry Received - DLK Software Solutions",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3DB843;">Hello ${name},</h2>
          <p>Thank you for your interest in our <strong>${course}</strong> course. We have received your enquiry and our team will contact you shortly.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Preferred Timeslot:</strong> ${timeslot}</p>
            <p><strong>Location:</strong> ${location}</p>
          </div>
          <p>Best Regards,<br/><strong>DLK Support Team</strong></p>
        </div>
      `,
    };

    // 📩 Admin Notification Template
    const adminTemplate = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">📌 New Course Enquiry Received</h2>
        <table style="border-collapse: collapse; width: 100%; margin-top: 15px;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Mobile</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${mobile}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Course</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${course}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Location</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${location}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Preferred Timeslot</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${timeslot}</td></tr>
        </table>
      </div>
    `;

    // Send Emails asynchronously
    transporter.sendMail(userAutoReply).catch(err => console.error("User auto-reply failed:", err.message));
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Enquiry Alert - ${course}`,
      html: adminTemplate,
    }).catch(err => console.error("Admin notification failed:", err.message));

    // ⚡ Emit Socket Event
    try {
      getIO().emit("newEnquiry", {
        id: newEnquiry._id,
        name: name,
        course: course,
        type: "Enquiry",
        time: new Date()
      });
    } catch (err) {
      console.error("Socket emission failed:", err.message);
    }

    return res.status(201).json({
      message: "Enquiry submitted successfully!",
      data: newEnquiry,
    });
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

    // ✅ Basic validation
    if (!title || !highlight || !subtitle) {
      return res.status(400).json({
        message: "Title, highlight, and subtitle are required",
      });
    }

    const banner = await Banner.create({
      title,
      highlight,
      subtitle,
      tagline: tagline || null,
      description: description || null,
      button: button || null,
      photoUrl: getFullUrl(`uploads/${req.file.filename}`),
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

// ✅ Update banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, highlight, subtitle, tagline, description, button } = req.body;

    const existing = await Banner.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Banner not found" });
    }

    let photoUrl = existing.photoUrl;

    if (req.file) {
      // Delete old photo
      const oldPath = path.join(
        __dirname,
        "../../../uploads",
        path.basename(existing.photoUrl)
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      photoUrl = getFullUrl(`uploads/${req.file.filename}`);
    }

    existing.title = title ?? existing.title;
    existing.highlight = highlight ?? existing.highlight;
    existing.subtitle = subtitle ?? existing.subtitle;
    existing.tagline = tagline ?? existing.tagline;
    existing.description = description ?? existing.description;
    existing.button = button ?? existing.button;
    if (req.body.isContentActive !== undefined) {
      existing.isContentActive = req.body.isContentActive === "true" || req.body.isContentActive === true;
    }
    existing.photoUrl = photoUrl;

    await existing.save();

    res.status(200).json({
      message: "Banner updated successfully",
      banner: existing,
    });
  } catch (err) {
    console.error("UPDATE BANNER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all banners
exports.getBanners = async (req, res) => {
  try {
    const { admin } = req.query;
    let query = {};
    if (admin !== "true") {
      query.isActive = true;
    }
    const banners = await Banner.find(query);
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
    const banner = await Banner.findById(id);
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
    await Banner.findByIdAndDelete(id);

    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error("Error deleting banner:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Upload offer
exports.uploadOffer = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Offer title is required" });
    }

    const offer = await Offer.create({
      title,
      photoUrl: getFullUrl(`uploads/${req.file.filename}`),
    });

    res.status(201).json({
      message: "Offer created successfully",
      offer,
    });
  } catch (err) {
    console.error("UPLOAD OFFER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all offers
exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.status(200).json(offers || []);
  } catch (err) {
    console.error("GET OFFERS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch offers" });
  }
};

// ✅ Update offer
exports.updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const existing = await Offer.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Offer not found" });
    }

    let photoUrl = existing.photoUrl;

    if (req.file) {
      // Delete old photo
      const oldFileName = path.basename(existing.photoUrl);
      const oldPath = path.join(__dirname, "../../../uploads", oldFileName);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      photoUrl = getFullUrl(`uploads/${req.file.filename}`);
    }

    existing.title = title ?? existing.title;
    existing.photoUrl = photoUrl;

    await existing.save();

    res.status(200).json({
      message: "Offer updated successfully",
      offer: existing,
    });
  } catch (err) {
    console.error("UPDATE OFFER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete offer
exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Delete photo file
    const fileName = path.basename(offer.photoUrl);
    const photoPath = path.join(__dirname, "../../../uploads", fileName);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    await Offer.findByIdAndDelete(id);

    res.json({ message: "Offer deleted successfully" });
  } catch (err) {
    console.error("DELETE OFFER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Upload company photo
exports.uploadCompany = async (req, res) => {
  try {
    const company = await Company.create({ photoUrl: getFullUrl(`uploads/${req.file.filename}`) });
    res.json({ message: "Company photo uploaded", company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all company photos
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
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
    const company = await Company.findById(id);
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
    await Company.findByIdAndDelete(id);

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

    const newQuestion = await Question.create({ question });
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

    const question = await Question.findById(question_id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const newAnswer = await Answer.create({ answer, question_id });
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
    const questions = await Question.find().populate("answers");
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

    const updatedQuestion = await Question.findByIdAndUpdate(id, {
      question,
    }, { returnDocument: 'after' });

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
    const deleted = await Question.findByIdAndDelete(id);

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

    const updatedAnswer = await Answer.findByIdAndUpdate(id, {
      answer,
    }, { returnDocument: 'after' });

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
    const deleted = await Answer.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Answer not found" });
    }

    res.status(200).json({ message: "Answer deleted successfully" });
  } catch (error) {
    console.error("Error deleting answer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


//registration

/**
 * Create a new registration
 */
exports.createRegistration = async (req, res) => {
  try {
    const { fullName, email, phone, courseId, inquiryType } = req.body;

    if (!fullName || !email || !phone || !courseId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("Registration request received for courseId:", courseId);

    let course = await CourseCategory.findById(courseId);
    if (!course) {
      console.log("Course not found in CourseCategory, checking Course model...");
      course = await Course.findById(courseId);
    }

    if (!course) {
      console.error("Selected course/category not found in DB for ID:", courseId);
      return res.status(404).json({ message: "Selected course not found" });
    }

    console.log("Course/Category found:", course.categoryName || course.title);

    const registration = await Registration.create({
      name: fullName,
      email,
      mobile: phone,
      courseId,
      inquiryType,
    });

    const courseName = course.categoryName || course.category || course.title;

    const isCurriculumRequest = inquiryType?.toLowerCase().includes("curriculum download");

    // 📩 User Auto-Reply
    const userReply = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: isCurriculumRequest
        ? `Your Curriculum PDF - ${courseName}`
        : "Registration Successful - DLK Software Solutions",
      html: isCurriculumRequest
        ? `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981;">Hello,</h2>
            <p>Thank you for your interest in our <strong>${courseName}</strong> course. Please find the curriculum PDF attached to this email.</p>
            <p>Best Regards,<br/><strong>The DLK Academy Team</strong></p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #3DB843;">Hello ${fullName},</h2>
            <p>You have successfully registered for our <strong>${courseName}</strong> course. We're excited to have you on board!</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Inquiry Type:</strong> ${inquiryType || 'General Registration'}</p>
            </div>
            <p>Our training advisors will reach out to you shortly with more details.</p>
            <p>Best Regards,<br/><strong>The DLK Academy Team</strong></p>
          </div>
        `,
      attachments: (isCurriculumRequest && course?.syllabus_pdf) ? [
        {
          filename: `${courseName.replace(/\s+/g, '_')}_Curriculum.pdf`,
          path: course.syllabus_pdf
        }
      ] : []
    };

    // 📩 Admin Notification
    const adminNotif = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Course Registration - ${courseName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2c3e50;">🎓 New Registration Received</h2>
          <table style="border-collapse: collapse; width: 100%; margin-top: 15px;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Student Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${fullName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Mobile</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${phone}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Course</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${courseName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Inquiry Type</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${inquiryType || 'N/A'}</td></tr>
          </table>
        </div>
      `,
    };

    // ⚡ Emit Socket Event (Real-time update)
    try {
      getIO().emit("newRegistration", {
        id: registration._id,
        name: fullName,
        course: courseName,
        type: "Registration",
        inquiryType: inquiryType || "General",
        time: new Date()
      });
      console.log("Socket event emitted: newRegistration");
    } catch (err) {
      console.error("Socket emission failed:", err.message);
    }

    // Send Emails asynchronously
    transporter.sendMail(userReply)
      .then(() => console.log("Success: Student confirmation email sent"))
      .catch(err => console.error("Reg user mail failed:", err.message));

    transporter.sendMail(adminNotif)
      .then(() => console.log("Success: Admin notification email sent"))
      .catch(err => console.error("Reg admin mail failed:", err.message));

    return res.status(201).json({
      message: "Registration successful",
      registration,
      courseName,
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
    const registrations = await Registration.find().populate("courseId");

    // Format response and enrich with names if populate failed
    const formatted = await Promise.all(registrations.map(async (r) => {
      const robj = r.toObject();
      let courseName = "Unknown";

      if (robj.courseId) {
        if (typeof robj.courseId === 'object') {
          courseName = robj.courseId.categoryName || robj.courseId.title || "Unknown";
        } else {
          // If populate failed (robj.courseId is still a string), try manual lookup
          const cat = await CourseCategory.findById(robj.courseId);
          if (cat) {
            courseName = cat.categoryName;
          } else {
            const course = await Course.findById(robj.courseId);
            courseName = course ? course.title : "Unknown";
          }
        }
      }

      return {
        id: robj._id,
        fullName: robj.name,
        email: robj.email,
        phone: robj.mobile,
        courseName,
        isRead: robj.isRead,
        isReply: robj.isReply,
        inquiryType: robj.inquiryType,
        createdAt: robj.createdAt
      };
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Mark registration as read
 */
exports.markRegistrationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Registration.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reply to registration via email
 */
exports.replyToRegistration = async (req, res) => {
  try {
    const { id, replyMessage } = req.body;
    const registration = await Registration.findById(id);
    if (!registration) return res.status(404).json({ message: "Not found" });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: registration.email,
      subject: "Update Regarding Your Course Registration",
      text: replyMessage,
    };

    await transporter.sendMail(mailOptions);
    await Registration.findByIdAndUpdate(id, { isReply: true, isRead: true });

    res.status(200).json({ success: true, message: "Reply sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete registration
 */
exports.deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    await Registration.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    const image = req.file ? req.file.path.replace(/\\/g, "/") : "";

    const liveClass = await LiveClass.create({
      courseId,
      title,
      startDate,
      durationDays,
      startTime,
      endTime,
      isActive,
      image,
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
    const liveClasses = await LiveClass.find()
      .populate("courseId")
      .sort({ createdAt: -1 });

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

    const liveClass = await LiveClass.findById(id)
      .populate("courseId");

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

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/");
    }

    const updated = await LiveClass.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });

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

    const deletedRows = await LiveClass.findByIdAndDelete(id);

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
    const existingSlug = await Blog.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Save blog
    const blog = await Blog.create({
      title,
      slug,
      short_description,
      description: cleanDescription,
      image: getFullUrl(`uploads/${req.file.filename}`), // Always use the uploaded file
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
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Blog.countDocuments();
    const results = await Blog.find()
      .select("_id title slug short_description image createdAt views")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Blog list fetched successfully",
      data: {
        current_page: page,
        data: results,
        total: total,
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

    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    );

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
      const existingSlug = await Blog.findOne({
        slug: newSlug,
        _id: { $ne: id }
      });
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
      updateData.image = getFullUrl(`uploads/${req.file.filename}`);

      // Optional: delete old image
      const oldBlog = await Blog.findById(id);
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

    const updated = await Blog.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });

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

    const deletedRows = await Blog.findByIdAndDelete(id);

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

/* =========================================================
   STUDENT PROJECTS CRUD CONTROLLERS
========================================================= */

/**
 * CREATE Student Project
 * POST /api/student-projects
 */
exports.createStudentProject = async (req, res) => {
  try {
    console.log("=== Create Student Project Request ===");
    const { title, short_description, description } = req.body;

    if (!title || !short_description || !description || !req.file) {
      console.log("❌ Create Failed: Missing required fields");
      return res.status(400).json({
        success: false,
        message: "All required fields including image must be provided",
      });
    }

    const cleanDescription = sanitizeHtml(description, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      allowedAttributes: {
        a: ["href", "name", "target"],
        img: ["src", "alt"],
        "*": ["style"],
      },
    });

    let slug = slugify(title, { lower: true, strict: true });
    const existingSlug = await StudentProject.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const project = await StudentProject.create({
      title,
      slug,
      short_description,
      description: cleanDescription,
      image: getFullUrl(`uploads/${req.file.filename}`),
    });

    console.log("✅ Student Project Created:", project._id);

    return res.status(201).json({
      success: true,
      message: "Student Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Create Student Project Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET All Student Projects (Card Data)
 * GET /api/student-projects
 */
exports.getAllStudentProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await StudentProject.countDocuments();
    const results = await StudentProject.find()
      .select("_id title slug short_description image createdAt views")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Student Projects fetched successfully",
      data: {
        current_page: page,
        data: results,
        total: total,
      },
    });
  } catch (error) {
    console.error("Get Student Projects Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET Student Project By Slug
 * GET /api/student-projects/:slug
 */
exports.getStudentProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const project = await StudentProject.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Student Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student Project details fetched successfully",
      data: project,
    });
  } catch (error) {
    console.error("Get Student Project Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * UPDATE Student Project
 * PUT /api/student-projects/:id
 */
exports.updateStudentProject = async (req, res) => {
  try {
    console.log("=== Update Student Project Request ===");
    console.log("ID:", req.params.id);
    const { id } = req.params;
    let updateData = { ...req.body };

    if (req.body.title) {
      let newSlug = slugify(req.body.title, { lower: true, strict: true });
      const existingSlug = await StudentProject.findOne({
        slug: newSlug,
        _id: { $ne: id }
      });
      if (existingSlug) newSlug = `${newSlug}-${Date.now()}`;
      updateData.slug = newSlug;
    }

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

    if (req.file) {
      updateData.image = getFullUrl(`uploads/${req.file.filename}`);
      const oldProject = await StudentProject.findById(id);
      if (oldProject?.image) {
        // Correctly handle full URLs in image paths
        let relativePath = oldProject.image;
        if (oldProject.image.includes("/uploads/")) {
          relativePath = "uploads/" + oldProject.image.split("/uploads/")[1];
        }

        const oldImagePath = path.join(__dirname, "../../", relativePath);
        console.log("Deleting old project image:", oldImagePath);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
    } else if (req.body.existingImage) {
      updateData.image = req.body.existingImage;
      delete updateData.existingImage;
    }

    Object.keys(updateData).forEach(
      (key) =>
        updateData[key] == null ||
        (updateData[key] === "" && delete updateData[key]),
    );

    const updated = await StudentProject.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });

    if (!updated) {
      console.log("❌ Update Failed: Project not found");
      return res.status(404).json({ success: false, message: "Student Project not found" });
    }

    console.log("✅ Student Project Updated:", updated._id);

    return res.status(200).json({
      success: true,
      message: "Student Project updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Student Project Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * DELETE Student Project
 * DELETE /api/student-projects/:id
 */
exports.deleteStudentProject = async (req, res) => {
  try {
    console.log("=== Delete Student Project Request ===");
    console.log("ID:", req.params.id);
    const { id } = req.params;

    // Optional: delete image file before deleting record
    const project = await StudentProject.findById(id);
    if (project?.image) {
      let relativePath = project.image;
      if (project.image.includes("/uploads/")) {
        relativePath = "uploads/" + project.image.split("/uploads/")[1];
      }
      const imagePath = path.join(__dirname, "../../", relativePath);
      console.log("Deleting associated image file:", imagePath);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    const deletedRows = await StudentProject.findByIdAndDelete(id);

    if (!deletedRows) {
      console.log("❌ Delete Failed: Project not found");
      return res.status(404).json({
        success: false,
        message: "Student Project not found",
      });
    }

    console.log("✅ Student Project Deleted");

    return res.status(200).json({
      success: true,
      message: "Student Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete Student Project Error:", error);
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

    const testimonials = await Testimonial.find({ is_active: true })
      .sort({ _id: -1 });

    const formattedTestimonials = testimonials.map((item) => ({
      ...item,
      image: getFullUrl(item.image),
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
    const testimonial = await Testimonial.findById(req.params.id);

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

    const newTestimonial = await Testimonial.create({
      name,
      role,
      text,
      image: getFullUrl(`uploads/${image}`),
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
    const testimonial = await Testimonial.findById(req.params.id);

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
      updatedData.image = getFullUrl(`uploads/${req.file.filename}`);
    }

    const updated = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { returnDocument: 'after' }
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
    await Testimonial.findByIdAndUpdate(req.params.id, { is_active: false });

    res.json({
      success: true,
      message: "Testimonial removed",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * CREATE Video
 * POST /api/videos
 */
exports.createVideo = async (req, res) => {
  try {
    const { title, link, category, duration, thumbnail } = req.body;

    if (!title || !link || !category) {
      return res.status(400).json({ success: false, message: "Title, Link, and Category are required" });
    }

    const video = await Video.create({
      title,
      link,
      category,
      duration,
      thumbnail
    });

    return res.status(201).json({
      success: true,
      message: "Video created successfully",
      data: video
    });
  } catch (error) {
    console.error("Create Video Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET All Videos
 * GET /api/videos
 */
exports.getAllVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const total = await Video.countDocuments();
    const results = await Video.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Videos fetched successfully",
      data: {
        current_page: page,
        data: results,
        total: total
      }
    });
  } catch (error) {
    console.error("Get Videos Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * UPDATE Video
 * PUT /api/videos/:id
 */
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Video.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Video updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Update Video Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * DELETE Video
 * DELETE /api/videos/:id
 */
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Video.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Video deleted successfully"
    });
  } catch (error) {
    console.error("Delete Video Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * ==========================================
 *               SKILLS CRUD 
 * ==========================================
 */

// 1. Create Skill
exports.createSkill = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Skill name is required" });

    const newSkill = await Skill.create({
      name,
      icon: req.file ? getFullUrl(`uploads/${req.file.filename}`) : null
    });

    return res.status(201).json({
      success: true,
      message: "Skill created successfully",
      data: newSkill
    });
  } catch (error) {
    console.error("Create Skill Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get All Skills
exports.getAllSkills = async (req, res) => {
  try {
    const data = await Skill.find().sort({ createdAt: -1 });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Skill
exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const skill = await Skill.findById(id);
    if (!skill) return res.status(404).json({ success: false, message: "Skill not found" });

    if (name) skill.name = name;
    if (req.file) skill.icon = getFullUrl(`uploads/${req.file.filename}`);

    const updated = await skill.save();

    return res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete Skill
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Skill.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ success: false, message: "Skill not found" });

    return res.status(200).json({
      success: true,
      message: "Skill deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
/* =========================
   PLACEMENT CRUD
========================= */

// ✅ Get all placements
exports.getPlacements = async (req, res) => {
  try {
    const placements = await Placement.find().sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json(placements || []);
  } catch (err) {
    console.error("GET PLACEMENTS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch placements" });
  }
};

// ✅ Upload new placement
exports.uploadPlacement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No placement image uploaded" });
    }

    const { isActive, displayOrder } = req.body;

    // Convert string "true"/"false" from FormData to Boolean
    const isActiveBool = isActive === 'true' || isActive === true;

    const placement = await Placement.create({
      photoUrl: getFullUrl(`uploads/${req.file.filename}`),
      isActive: isActiveBool,
      displayOrder: displayOrder || 0,
    });

    res.status(201).json({
      message: "Placement created successfully",
      placement,
    });
  } catch (err) {
    console.error("UPLOAD PLACEMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update placement
exports.updatePlacement = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, displayOrder } = req.body;

    const existing = await Placement.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Placement not found" });
    }

    let photoUrl = existing.photoUrl;
    if (req.file) {
      // Delete old photo
      const oldFileName = path.basename(existing.photoUrl);
      const oldPath = path.join(__dirname, "../../../uploads", oldFileName);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      photoUrl = getFullUrl(`uploads/${req.file.filename}`);
    }

    const isActiveBool = isActive !== undefined ? (isActive === 'true' || isActive === true) : existing.isActive;

    existing.isActive = isActiveBool;
    existing.displayOrder = displayOrder ?? existing.displayOrder;
    existing.photoUrl = photoUrl;

    await existing.save();

    res.status(200).json({
      message: "Placement updated successfully",
      placement: existing,
    });
  } catch (err) {
    console.error("UPDATE PLACEMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Toggle placement status
exports.togglePlacementActive = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Placement.findById(id);
    if (!existing) return res.status(404).json({ message: "Placement not found" });

    existing.isActive = !existing.isActive;
    await existing.save();

    res.status(200).json({ message: "Status toggled", data: existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete placement
exports.deletePlacement = async (req, res) => {
  try {
    const { id } = req.params;

    const placement = await Placement.findById(id);
    if (!placement) {
      return res.status(404).json({ message: "Placement not found" });
    }

    // Delete photo file
    const fileName = path.basename(placement.photoUrl);
    const photoPath = path.join(__dirname, "../../../uploads", fileName);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    await Placement.findByIdAndDelete(id);

    res.json({ message: "Placement deleted successfully" });
  } catch (err) {
    console.error("DELETE PLACEMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Reorder placements
exports.reorderPlacements = async (req, res) => {
  try {
    const { orders } = req.body; // Array of {id, displayOrder}

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ message: "Orders array is required" });
    }

    const updatePromises = orders.map(item =>
      Placement.findByIdAndUpdate(item.id, { displayOrder: item.displayOrder })
    );

    await Promise.all(updatePromises);

    res.status(200).json({ message: "Placements reordered successfully" });
  } catch (err) {
    console.error("REORDER PLACEMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   WORKSHOP CRUD
========================= */

exports.getAllWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: workshops });
  } catch (err) {
    console.error("GET ALL WORKSHOPS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.postWorkshop = async (req, res) => {
  try {
    const { title, duration, date, startTime, endTime, categoryName, expertName } = req.body;
    let image = "";
    if (req.file) {
      image = `uploads/${req.file.filename}`;
    }
    const workshop = new Workshop({ title, image, duration, date, startTime, endTime, categoryName, expertName });
    await workshop.save();
    res.status(201).json({ success: true, message: "Workshop added successfully", data: workshop });
  } catch (err) {
    console.error("POST WORKSHOP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, duration, date, startTime, endTime, categoryName, expertName } = req.body;
    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ success: false, message: "Workshop not found" });

    let image = workshop.image;
    if (req.file) {
      if (workshop.image) {
        const oldPath = path.join(process.cwd(), "uploads", path.basename(workshop.image));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image = `uploads/${req.file.filename}`;
    }

    const updated = await Workshop.findByIdAndUpdate(id, {
      title, duration, date, startTime, endTime, categoryName, expertName, image
    }, { new: true });

    res.status(200).json({ success: true, message: "Workshop updated successfully", data: updated });
  } catch (err) {
    console.error("UPDATE WORKSHOP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const workshop = await Workshop.findById(id);
    if (!workshop) return res.status(404).json({ success: false, message: "Workshop not found" });

    if (workshop.image) {
      const physicalPath = path.join(process.cwd(), "uploads", path.basename(workshop.image));
      if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
    }

    await Workshop.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Workshop deleted successfully" });
  } catch (err) {
    console.error("DELETE WORKSHOP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// ✅ Upload banner
exports.uploadBanner = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title, highlight, subtitle, tagline, description, button } = req.body;

    if (!title || !highlight || !subtitle) {
      return res.status(400).json({
        message: "Title, highlight, and subtitle are required",
      });
    }

    const banner = await Banner.create({
      title,
      highlight,
      subtitle,
      tagline: tagline || null,
      description: description || null,
      button: button || null,
      photoUrl: getFullUrl(`uploads/${req.file.filename}`),
      isActive: true,
    });

    res.status(201).json({ message: "Banner uploaded successfully", banner });
  } catch (err) {
    console.error("UPLOAD BANNER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, highlight, subtitle, tagline, description, button } = req.body;

    const existing = await Banner.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Banner not found" });
    }

    let photoUrl = existing.photoUrl;

    if (req.file) {
      const oldPath = path.join(
        __dirname,
        "../../../uploads",
        path.basename(existing.photoUrl)
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      photoUrl = getFullUrl(`uploads/${req.file.filename}`);
    }

    existing.title = title ?? existing.title;
    existing.highlight = highlight ?? existing.highlight;
    existing.subtitle = subtitle ?? existing.subtitle;
    existing.tagline = tagline ?? existing.tagline;
    existing.description = description ?? existing.description;
    existing.button = button ?? existing.button;
    existing.photoUrl = photoUrl;

    await existing.save();

    res.status(200).json({ message: "Banner updated successfully", banner: existing });
  } catch (err) {
    console.error("UPDATE BANNER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all banners
exports.getBanners = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const filter = req.query.admin === "true" ? {} : { isActive: true };
    const banners = await Banner.find(filter).sort({ createdAt: -1 });
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

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const bannerPath = path.join(
      __dirname,
      "../../../uploads",
      path.basename(banner.photoUrl)
    );
    if (fs.existsSync(bannerPath)) {
      fs.unlinkSync(bannerPath);
      console.log("🗑️ Deleted banner file:", bannerPath);
    }

    await Banner.findByIdAndDelete(id);
    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error("Error deleting banner:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Toggle banner active/inactive
exports.toggleBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findOne({ _id: id });
    if (!banner) {
      console.error("❌ Banner toggle failed: Banner not found for id:", id);
      return res.status(404).json({ message: "Banner not found" });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json({
      message: `Banner ${banner.isActive ? "activated" : "deactivated"} successfully`,
      banner,
    });
  } catch (err) {
    console.error("TOGGLE BANNER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add/Update these functions in your adminController.js

// ✅ Toggle banner content active/inactive
exports.toggleBannerContent = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      console.warn(`⚠️ Banners-OP [${req.method}]: Attempted toggle without ID`);
      return res.status(400).json({
        success: false,
        message: "Banner ID is required (must be in query params or body)"
      });
    }

    const banner = await Banner.findOne({ _id: id });
    if (!banner) {
      console.error(`❌ Banners-OP [${req.method}]: Banner not found with ID:`, id);
      return res.status(404).json({
        success: false,
        message: "Banner not found in database"
      });
    }

    // Toggle the content active status
    banner.isContentActive = !banner.isContentActive;
    await banner.save();

    console.log(`✅ Banners-OP [${req.method}]: Content ${banner.isContentActive ? "activated" : "deactivated"} for ID:`, id);

    const bannerObj = banner.toObject();
    bannerObj.id = bannerObj._id;
    delete bannerObj._id;

    res.status(200).json({
      success: true,
      message: `Banner content ${banner.isContentActive ? "activated" : "deactivated"} successfully`,
      banner: bannerObj
    });
  } catch (err) {
    console.error(`💥 Banners-OP [${req.method}] ERROR:`, err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ✅ Toggle banner active/inactive
exports.toggleBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findOne({ _id: id });
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json({
      success: true,
      message: `Banner ${banner.isActive ? "activated" : "deactivated"} successfully`,
      banner: {
        id: banner._id,
        ...banner.toObject()
      }
    });
  } catch (err) {
    console.error("TOGGLE BANNER ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// ✅ Get all banners (with cache control)
exports.getBanners = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const filter = req.query.admin === "true" ? {} : { isActive: true };
    const banners = await Banner.find(filter).sort({ createdAt: -1 });

    // Transform _id to id for frontend consistency
    const transformedBanners = banners.map(banner => ({
      id: banner._id,
      ...banner.toObject(),
      _id: undefined
    }));

    res.status(200).json(transformedBanners || []);
  } catch (err) {
    console.error("Error fetching banners:", err);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

// ✅ Upload banner
exports.uploadBanner = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { title, highlight, subtitle, tagline, description, button, isContentActive } = req.body;

    if (!title || !highlight || !subtitle) {
      return res.status(400).json({
        message: "Title, highlight, and subtitle are required",
      });
    }

    const banner = await Banner.create({
      title,
      highlight,
      subtitle,
      tagline: tagline || null,
      description: description || null,
      button: button || null,
      photoUrl: getFullUrl(`uploads/${req.file.filename}`),
      isActive: true,
      isContentActive: isContentActive === 'true' || isContentActive === true,
    });

    res.status(201).json({
      message: "Banner uploaded successfully",
      banner: {
        id: banner._id,
        ...banner.toObject()
      }
    });
  } catch (err) {
    console.error("UPLOAD BANNER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, highlight, subtitle, tagline, description, button, isContentActive } = req.body;

    const existing = await Banner.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Banner not found" });
    }

    let photoUrl = existing.photoUrl;

    if (req.file) {
      const oldPath = path.join(
        __dirname,
        "../../../uploads",
        path.basename(existing.photoUrl)
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      photoUrl = getFullUrl(`uploads/${req.file.filename}`);
    }

    existing.title = title ?? existing.title;
    existing.highlight = highlight ?? existing.highlight;
    existing.subtitle = subtitle ?? existing.subtitle;
    existing.tagline = tagline ?? existing.tagline;
    existing.description = description ?? existing.description;
    existing.button = button ?? existing.button;
    existing.photoUrl = photoUrl;
    if (isContentActive !== undefined) {
      existing.isContentActive = isContentActive === 'true' || isContentActive === true;
    }

    await existing.save();

    res.status(200).json({
      message: "Banner updated successfully",
      banner: {
        id: existing._id,
        ...existing.toObject()
      }
    });
  } catch (err) {
    console.error("UPDATE BANNER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const bannerPath = path.join(
      __dirname,
      "../../../uploads",
      path.basename(banner.photoUrl)
    );
    if (fs.existsSync(bannerPath)) {
      fs.unlinkSync(bannerPath);
      console.log("🗑️ Deleted banner file:", bannerPath);
    }

    await Banner.findByIdAndDelete(id);
    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error("Error deleting banner:", err);
    res.status(500).json({ error: err.message });
  }
};