const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const flashcardSchema = new Schema({
  upload: {
    type: Schema.Types.ObjectId,
    ref: "Upload", // Links each flashcard set to a specific uploaded PDF
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Flashcard", flashcardSchema);
