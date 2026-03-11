const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const { getFullUrl } = require("../../utils/urlHelper");

const courseSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  category_id: { type: String, ref: "Navbar", required: true, index: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  short_description: { type: String, trim: true },
  full_description: { type: String, trim: true },
  thumbnail: { type: String, trim: true, get: getFullUrl },
  rating: { type: Number, default: 0 },
  total_ratings: { type: Number, default: 0 },
  total_students: { type: Number, default: 0 },
  mode: { type: String, trim: true },
  duration_months: { type: Number },
  level: { type: String, trim: true },
  price: { type: Number },
  original_price: { type: Number },
  discount_percentage: { type: Number },
  syllabus_pdf: { type: String, trim: true },
}, { 
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

courseSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Course", courseSchema);
