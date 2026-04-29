const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const { getFullUrl } = require("../../utils/urlHelper");

const blogSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  short_description: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  image: { type: String, required: true, trim: true, get: getFullUrl },
  authorType: { type: String, enum: ["Admin", "Student"], default: "Admin" },
  studentName: { type: String, trim: true },
  studentProfilePic: { type: String, trim: true },
  category: { type: String, default: "General", trim: true },
  isApproved: { type: Boolean, default: true },
  time: { type: String, default: () => new Date().toLocaleTimeString() },
  views: { type: Number, default: 0 },
}, { 
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

blogSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Blog", blogSchema);
