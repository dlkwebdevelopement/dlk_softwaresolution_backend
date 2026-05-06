const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const { getFullUrl } = require("../../utils/urlHelper");

const gallerySchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  albumName: { 
    type: String, 
    required: true, 
    trim: true,
  },
  thumbnail: { type: String, trim: true, get: getFullUrl },
  batches: [{
    _id: { type: String, default: uuidv4 },
    batchName: { type: String, required: true, trim: true },
    images: [{ 
      url: { type: String, trim: true, get: getFullUrl },
      highlights: [{ type: String, trim: true }]
    }],
  }],
}, { 
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

gallerySchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Gallery", gallerySchema);
