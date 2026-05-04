import { GoogleGenerativeAI } from '@google/generative-ai';

// Controller to handle AI Movie concierge
export const chatWithAI = async (req, res) => {
    try {
        const { prompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ success: false, message: "Gemini API key is not configured in .env" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const systemPrompt = `You are a helpful, enthusiastic, and knowledgeable movie concierge for the ticketing app "QuickShow". 
You help users find movies, choose seats, and discover interesting cinema facts.
Keep your responses concise, friendly, and formatted properly using markdown when necessary.
User Query: ${prompt}`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ success: true, text });
    } catch (error) {
        console.error("AI Chat Error:", error);
        res.json({ success: false, message: "Failed to communicate with AI" });
    }
};

// Auto-generate movie details based on title
export const generateMovieDetails = async (req, res) => {
    try {
        const { title } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.json({ success: false, message: "Gemini API key is not configured" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Generate a JSON object containing details for a hypothetical or real movie titled "${title}". 
The JSON must have the following keys exactly:
- description (string: engaging plot summary of 2-3 sentences)
- genres (string: comma separated list of 2 to 3 genres, e.g. "Action, Drama")
- duration (number: duration in minutes, between 90 and 180)
- language (string: standard language like "English" or "Hindi")
- casts (string: comma separated list of 3 fake or real actors)
Only return the raw JSON, do not wrap it in markdown code blocks.`;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        
        // Clean markdown backticks just in case
        const jsonStr = textResponse.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        const movieDetails = JSON.parse(jsonStr);

        res.json({ success: true, movieDetails });
    } catch (error) {
        console.error("AI Generate Error:", error);
        res.json({ success: false, message: "Failed to generate movie details: " + error.message });
    }
};
