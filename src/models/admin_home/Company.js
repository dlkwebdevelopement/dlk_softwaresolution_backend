const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const { getFullUrl } = require("../../utils/urlHelper");

const companySchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  photoUrl: { type: String, required: true, trim: true, get: getFullUrl },
}, { 
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

companySchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Company", companySchema);
