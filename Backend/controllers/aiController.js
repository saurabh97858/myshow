import { GoogleGenerativeAI } from '@google/generative-ai';

// Controller to handle AI Movie concierge
export const chatWithAI = async (req, res) => {
    try {
        const { prompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        
        console.log(`🤖 [AI Chat] Request received. Key configured: ${!!apiKey}, Prompt length: ${prompt?.length}`);

        if (!apiKey) {
            return res.status(500).json({ success: false, message: "Gemini API key is not configured in .env" });
        }

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
        let lastError = null;

        for (const modelName of models) {
            try {
                console.log(`🤖 [AI Chat] Trying model: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                console.log(`✅ [AI Chat] Success with ${modelName}, response length: ${text.length}`);
                return res.json({ success: true, text });
            } catch (err) {
                console.warn(`⚠️ [AI Chat] ${modelName} failed:`, err.message);
                lastError = err;
            }
        }

        throw lastError || new Error('All AI models failed');
    } catch (error) {
        console.error("❌ AI Chat Critical Error:", error.message);
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
            console.log("🤖 [AI Generate] Attempting with gemini-2.5-flash...");
            model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            textResponse = result.response.text();
        } catch (f25Error) {
            console.warn("⚠️ [AI Generate] Gemini 2.5 Flash failed, falling back to gemini-2.0-flash:", f25Error.message);
            try {
                model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                const result = await model.generateContent(prompt);
                textResponse = result.response.text();
            } catch (f2Error) {
                console.warn("⚠️ [AI Generate] Gemini 2.0 Flash failed, falling back to gemini-1.5-flash:", f2Error.message);
                try {
                    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    const result = await model.generateContent(prompt);
                    textResponse = result.response.text();
                } catch (fError) {
                    console.warn("⚠️ [AI Generate] Flash 1.5 failed, fallback to Pro:", fError.message);
                    model = genAI.getGenerativeModel({ model: "gemini-pro" });
                    const result = await model.generateContent(prompt);
                    textResponse = result.response.text();
                }
            }
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
