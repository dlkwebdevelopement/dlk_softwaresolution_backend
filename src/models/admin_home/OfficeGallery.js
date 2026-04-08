const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const officeGallerySchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    albumName: { type: String, required: true },
    thumbnail: { type: String },
    images: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

officeGallerySchema.virtual("id").get(function () {
  return this._id;
});

const OfficeGallery = mongoose.model("OfficeGallery", officeGallerySchema, "office_galleries");

module.exports = OfficeGallery;
