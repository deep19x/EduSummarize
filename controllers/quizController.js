const Quiz = require("../models/quiz");
const Upload = require("../models/upload");
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// GET Quiz Page
module.exports.getQuiz = async (req, res) => {
    try {
        const latestUpload = await Upload.findOne({ user: req.user._id }).sort({ createdAt: -1 });

        if (!latestUpload) {
            return res.render("quiz", { questions: [], message: "Please upload a PDF first!", noNavbar: false });
        }

        const pdfText = latestUpload.text;

        const prompt = `
You are an expert teacher. From the following text, generate 5 multiple-choice questions.
Each question should have 4 options (A, B, C, D) and indicate the correct answer.
Return in JSON format: [{question: "...", options: ["...","...","...","..."], correctAnswer: "A"}, ...]
Text:
${pdfText}
        `;

        let questions = [];
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });
            questions = JSON.parse(response.text);
        } catch (err) {
            console.error("❌ Error generating quiz via AI:", err);
            questions = [];
        }

        await Quiz.deleteMany({ upload: latestUpload._id });
        questions.forEach(q => q.upload = latestUpload._id);
        await Quiz.insertMany(questions);

        res.render("quiz", { questions, message: null, score: undefined, noNavbar: false });

    } catch (err) {
        console.error("❌ Error loading quiz:", err);
        res.render("quiz", { questions: [], message: "Something went wrong.", score: undefined, noNavbar: false });
    }
};

// POST Quiz submission
module.exports.submitQuiz = async (req, res) => {
    try {
        const latestUpload = await Upload.findOne({ user: req.user._id }).sort({ createdAt: -1 });
        const questions = await Quiz.find({ upload: latestUpload._id });

        let score = 0;
        const submittedAnswers = [];

        questions.forEach((q, idx) => {
            const ans = req.body[`answer${idx}`];
            submittedAnswers.push(ans);
            if (ans === q.correctAnswer) score++;
        });

        res.render("quiz", {
            questions,
            submittedAnswers,
            score,
            total: questions.length,
            message: null,
            noNavbar: false
        });

    } catch (err) {
        console.error("❌ Error submitting quiz:", err);
        res.render("quiz", { questions: [], score: undefined, total: 0, message: "Submission failed.", noNavbar: false });
    }
};
