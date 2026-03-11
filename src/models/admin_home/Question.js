const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const answerSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  answer: { type: String, required: true, trim: true },
  question_id: { type: String, ref: "Question", required: true, index: true },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

answerSchema.virtual("id").get(function() {
  return this._id;
});

const questionSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  question: { type: String, required: true, trim: true },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

questionSchema.virtual("answers", {
  ref: "Answer",
  localField: "_id",
  foreignField: "question_id"
});

questionSchema.virtual("id").get(function() {
  return this._id;
});

const Question = mongoose.model("Question", questionSchema);
const Answer = mongoose.model("Answer", answerSchema);

module.exports = { Question, Answer };
