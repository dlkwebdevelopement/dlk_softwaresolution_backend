const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const { getFullUrl } = require("../../utils/urlHelper");

const studentProjectSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  short_description: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  image: { type: String, required: true, trim: true, get: getFullUrl },
  views: { type: Number, default: 0 },
}, { 
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

studentProjectSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("StudentProject", studentProjectSchema);
