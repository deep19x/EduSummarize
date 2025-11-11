const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const quizSchema = new Schema({
    upload: {
        type: Schema.Types.ObjectId,
        ref: "Upload", // Links this quiz to the uploaded PDF
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    options: {
        type: [String], // Multiple-choice options
        required: true,
    },
    correctAnswer: {
        type: String, // The right answer among the options
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Quiz", quizSchema);
