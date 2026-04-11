const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { getFullUrl } = require("../../utils/urlHelper");

const officeGalleryEventSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  categoryId: { type: String, ref: "OfficeGallery", required: true, index: true },
  title: { type: String, required: true, trim: true },
  mainImage: { type: String, trim: true, get: getFullUrl },
  galleryImages: [{ type: String, trim: true, get: getFullUrl }],
  eventDate: { type: Date, required: true },
  eventTime: { type: String, trim: true },
}, { 
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

officeGalleryEventSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("OfficeGalleryEvent", officeGalleryEventSchema);
