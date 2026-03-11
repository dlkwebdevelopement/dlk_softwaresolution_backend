const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const courseLearningPointSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  course_id: { type: String, ref: "Course", required: true, index: true },
  content: { type: String, required: true, trim: true },
  order_index: { type: Number, default: 0 },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

courseLearningPointSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("CourseLearningPoint", courseLearningPointSchema);
