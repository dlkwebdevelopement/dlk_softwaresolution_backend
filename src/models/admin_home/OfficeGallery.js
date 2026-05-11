const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { getFullUrl } = require("../../utils/urlHelper");

const imageSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    url: { type: String, trim: true, get: getFullUrl },
    highlights: [{ type: String, trim: true }],
  },
  { _id: false, id: false }
);
imageSchema.add({ _id: { type: String, default: uuidv4 } });

const categorySchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    categoryName: { type: String, required: true, trim: true },
    images: [imageSchema],
  },
  { _id: false }
);
categorySchema.add({ _id: { type: String, default: uuidv4 } });

const officeGallerySchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    batchName: { type: String, required: true, trim: true },
    date: { type: Date },
    categories: [categorySchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

officeGallerySchema.virtual("id").get(function () {
  return this._id;
});

const OfficeGallery = mongoose.model("OfficeGallery", officeGallerySchema, "office_galleries");

module.exports = OfficeGallery;
