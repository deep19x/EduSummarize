const Upload = require("../models/upload");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

module.exports.getFlashcards = async (req, res) => {
    try {
        if (!req.user) {
            req.flash("error", "You must be logged in.");
            return res.redirect("/login");
        }

        const latestUpload = await Upload.findOne({ user: req.user._id }).sort({ createdAt: -1 });

        if (!latestUpload) {
            return res.render("flashcards", {
                flashcards: [],
                message: "Please upload a PDF first!",
                noNavbar: false
            });
        }

        const pdfText = latestUpload.text;

        const systemInstruction = `
        You are a helpful assistant. Generate 5 clear flashcards from the text.
Each flashcard should have:
- One question
- One answer
Return in plain text. Avoid numbering, bullets, or extra text.
`;;

        const userQuery = `Generate flashcards from this text:\n${pdfText}`;

        let flashcards = [];

        try {
            const aiResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: userQuery,
                systemInstruction: systemInstruction
            });

            const text = aiResponse.text || "";
            const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

            let currentCard = {};
            for (let line of lines) {
                // Flexible matching even if bullet or numbering is present
                const questionMatch = line.match(/question[:\-]\s*(.*)/i);
                const answerMatch = line.match(/answer[:\-]\s*(.*)/i);

                if (questionMatch) {
                    currentCard.question = questionMatch[1].trim();
                } else if (answerMatch) {
                    currentCard.answer = answerMatch[1].trim();
                    if (currentCard.question && currentCard.answer) {
                        flashcards.push({ ...currentCard });
                        currentCard = {};
                    }
                }
            }

            if (flashcards.length === 0) {
                flashcards = [{ question: "AI output unreadable", answer: "Please try again later." }];
            }

        } catch (err) {
            console.error("AI flashcards error:", err);
            flashcards = [{ question: "AI service unavailable", answer: "Please try again later." }];
        }

        res.render("flashcards", { flashcards, message: null, noNavbar: false });

    } catch (err) {
        console.error("Error generating flashcards:", err);
        res.render("flashcards", {
            flashcards: [],
            message: "Error generating flashcards. Try again.",
            noNavbar: false
        });
    }
};
