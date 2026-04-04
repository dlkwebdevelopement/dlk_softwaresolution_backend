const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const courseCurriculumSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  course_id: { type: String, ref: "Course", required: true, index: true },
  title: { type: String, required: true, trim: true },
  lessons_info: { type: String, trim: true },
  description: { type: String, trim: true },
  link: { type: String, trim: true },
  order_index: { type: Number, default: 0 },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

courseCurriculumSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("CourseCurriculum", courseCurriculumSchema);
