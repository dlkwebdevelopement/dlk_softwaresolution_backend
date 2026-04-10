const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const questionSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

questionSchema.virtual("id").get(function() {
  return this._id;
});

const Question = mongoose.model("Question", questionSchema);

module.exports = { Question };
