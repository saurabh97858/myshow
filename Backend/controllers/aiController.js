import { GoogleGenerativeAI } from '@google/generative-ai';

// Controller to handle AI Movie concierge
export const chatWithAI = async (req, res) => {
    try {
        const { prompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        
        console.log(`🤖 [AI Chat] Request received. Key configured: ${!!apiKey}`);

        if (!apiKey) {
            return res.status(500).json({ success: false, message: "Gemini API key is not configured in .env" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Try Flash first, fallback to Pro if it fails
        let model;
        try {
            console.log("🤖 [AI Chat] Attempting with gemini-1.5-flash...");
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return res.json({ success: true, text });
        } catch (flashError) {
            console.warn("⚠️ [AI Chat] Flash model failed, falling back to gemini-pro:", flashError.message);
            model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return res.json({ success: true, text });
        }
    } catch (error) {
        console.error("❌ AI Chat Critical Error:", error);
        res.json({ success: false, message: "Failed to communicate with AI: " + error.message });
    }
};

// Auto-generate movie details based on title
export const generateMovieDetails = async (req, res) => {
    try {
        const { title } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        console.log(`🤖 [AI Generate] Request for "${title}". Key configured: ${!!apiKey}`);

        if (!apiKey) {
            return res.json({ success: false, message: "Gemini API key is not configured" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const prompt = `Generate a JSON object containing details for a hypothetical or real movie titled "${title}". 
The JSON must have the following keys exactly:
- description (string: engaging plot summary of 2-3 sentences)
- genres (string: comma separated list of 2 to 3 genres, e.g. "Action, Drama")
- duration (number: duration in minutes, between 90 and 180)
- language (string: standard language like "English" or "Hindi")
- casts (string: comma separated list of 3 fake or real actors)
Only return the raw JSON, do not wrap it in markdown code blocks.`;

        let model;
        let textResponse;
        try {
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            textResponse = result.response.text();
        } catch (fError) {
            console.warn("⚠️ [AI Generate] Flash failed, fallback to Pro:", fError.message);
            model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            textResponse = result.response.text();
        }
        
        // Clean markdown backticks just in case
        const jsonStr = textResponse.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        const movieDetails = JSON.parse(jsonStr);

        res.json({ success: true, movieDetails });
    } catch (error) {
        console.error("❌ AI Generate Critical Error:", error);
        res.json({ success: false, message: "Failed to generate movie details: " + error.message });
    }
};
