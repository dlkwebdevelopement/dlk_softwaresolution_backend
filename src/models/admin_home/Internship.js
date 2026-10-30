const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { getFullUrl } = require("../../utils/urlHelper");

const internshipSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    duration: { type: String, default: "3 Months", trim: true },
    mode: { type: String, default: "Online / Offline Classroom", trim: true },
    description: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    syllabus_pdf: { type: String, trim: true, get: getFullUrl },
    image: { type: String, trim: true, get: getFullUrl },
    isActive: { type: Boolean, default: true },
    order_index: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

internshipSchema.virtual("id").get(function () {
  return this._id;
});

module.exports = mongoose.model("Internship", internshipSchema);

