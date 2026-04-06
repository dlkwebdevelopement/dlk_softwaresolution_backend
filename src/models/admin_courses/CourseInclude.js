const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const courseIncludeSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  course_id: { type: String, ref: "Course", required: true, index: true },
  icon_name: { type: String, default: "CheckCircle" }, // e.g. "Play", "Download", "Access", "Mobile", "Certificate"
  text: { type: String, required: true, trim: true },
  order_index: { type: Number, default: 0 },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

courseIncludeSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("CourseInclude", courseIncludeSchema);
