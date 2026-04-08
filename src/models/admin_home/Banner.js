const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { getFullUrl } = require("../../utils/urlHelper");

const bannerSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  title: { type: String, required: true, trim: true },
  highlight: { type: String, required: true, trim: true },
  subtitle: { type: String, required: true, trim: true },
  tagline: { type: String, trim: true },
  description: { type: String, trim: true },
  button: { type: String, trim: true },
  photoUrl: { type: String, required: true, trim: true, get: getFullUrl },
  isActive: { type: Boolean, default: true },
  isContentActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

bannerSchema.virtual("id").get(function () {
  return this._id;
});

module.exports = mongoose.model("Banner", bannerSchema);