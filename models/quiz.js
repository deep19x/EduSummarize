const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const quizSchema = new Schema({
    upload: {
        type: Schema.Types.ObjectId,
        ref: "Upload", 
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    options: {
        type: [String], 
        required: true,
    },
    correctAnswer: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Quiz", quizSchema);
