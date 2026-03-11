const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const { getFullUrl } = require("../../utils/urlHelper");

const testimonialSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  text: { type: String, required: true, trim: true },
  image: { type: String, trim: true, get: getFullUrl },
  is_active: { type: Boolean, default: true },
}, { 
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

testimonialSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Testimonial", testimonialSchema);