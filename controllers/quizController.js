const Quiz = require("../models/quiz");
const Upload = require("../models/upload");

module.exports.getQuiz = async (req, res) => {
    const latestUpload = await Upload.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    if (!latestUpload) {
        return res.render("quiz", { questions: [], message: "Please upload a PDF first!" });
    }

    const sentences = latestUpload.text.split(". ").slice(0, 5);
    const questions = sentences.map((s) => ({
        upload: latestUpload._id,
        question: s.slice(0, 60) + "?",
        options: ["True", "False"],
        correctAnswer: "True",
    }));

    await Quiz.insertMany(questions);

    res.render("quiz", { questions, message: null });
};

module.exports.submitQuiz = async (req, res) => {
    // Basic scoring logic (to be refined later)
    const total = Object.keys(req.body).length;
    const score = Math.floor(Math.random() * (total + 1)); // placeholder for real checking
    res.render("quiz", { score, total, questions: [], message: null });
};
