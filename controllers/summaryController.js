require('dotenv').config();
const fs = require('fs');
const { PdfReader } = require('pdfreader'); // pdfreader
const Upload = require('../models/upload');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEYY });

module.exports.renderSummaryPage = (req, res) => {
    res.render('summary', { summary: null });
};

module.exports.uploadSummary = async (req, res) => {
    let summary = "Error generating summary.";

    try {
        if (!req.file || !req.file.path) {
            throw new Error("No file uploaded or file path missing.");
        }

        const filePath = req.file.path;
        let pdfText = "";

        // --- PDFReader parsing ---
        await new Promise((resolve, reject) => {
            new PdfReader().parseFileItems(filePath, (err, item) => {
                if (err) return reject(err);
                if (!item) return resolve(); // finished reading
                if (item.text) pdfText += item.text + " ";
            });
        });

        console.log("✅ PDF Text Extracted:", pdfText.substring(0, 500)); // first 500 chars

        // --- Gemini API Call for Summary ---
        const systemInstruction = `You are a professional summarization engine. Summarize the user-provided document text in clear, concise, and structured format.Use:
        - Paragraphs for main ideas
        - Bullet points for lists
        - **Bold** for key terms
        - Line breaks for readability
        The summary should be professional, easy to read, and suitable as study notes.`;


        const userQuery = `Please summarize the following document text:\n\nDOCUMENT TEXT:\n---\n${pdfText}\n---`;

        try {
            const geminiResponse = await ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: userQuery,
                systemInstruction: systemInstruction
            });

            summary = geminiResponse.text.trim();
        } catch (apiErr) {
            console.error("❌ Gemini API Error:", apiErr);
            // Handle 503 overload error gracefully
            if (apiErr.status === 503) {
                summary = "The AI service is currently busy. Please try again in a few moments.";
            }
        }

        // --- Save to DB ---
        const newUpload = new Upload({
            user: req.user._id,
            fileName: req.file.originalname,
            text: pdfText,
            summary
        });
        await newUpload.save();

        res.render("summary", { summary });

    } catch (err) {
        console.error("❌ Error during PDF parsing or summary generation:", err);
        res.render("summary", { summary });
    }
};
