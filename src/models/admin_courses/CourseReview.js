const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const courseReviewSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  course_id: { type: String, ref: "Course", required: true, index: true },
  student_name: { type: String, required: true, trim: true },
  student_avatar: { type: String, trim: true },
  rating: { type: Number, required: true },
  review: { type: String, trim: true },
  helpful_yes: { type: Number, default: 0 },
  helpful_no: { type: Number, default: 0 },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

courseReviewSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("CourseReview", courseReviewSchema);
