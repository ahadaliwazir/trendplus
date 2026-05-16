const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('../models');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * The Trend Analyst Agent
 * Analyzes drama metadata to extract cultural trends and sentiment.
 */
async function analyzeEpisodeTrends(drama, episode, videoMetadata) {
    console.log(`🧠 [Trend Analyst] Analyzing Episode ${episode.episode_number} of ${drama.title}...`);

    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️ [Trend Analyst] GEMINI_API_KEY not set. Skipping AI analysis.');
        return;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            As a Market Intelligence Agent for TrendPulse AI, analyze the following metadata from a Pakistani Drama episode.
            Extract cultural trends, fashion shifts, decor styles, and audience sentiment.
            
            Drama: ${drama.title}
            Channel: ${drama.channel ? drama.channel.name : 'Unknown'}
            Episode: ${episode.episode_number}
            Description: ${videoMetadata.description}
            
            Return the results in a structured JSON format:
            {
                "insights": [
                    {
                        "type": "FASHION" | "DECOR" | "LIFESTYLE" | "SOCIAL" | "SENTIMENT",
                        "content": "Specific trend detail",
                        "confidence": 0.0 to 1.0,
                        "source_snippet": "Relevant text from description"
                    }
                ]
            }
            
            Focus on what brands or global trends might care about (e.g., clothing styles, home decor, societal topics).
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from response (handling potential markdown)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            
            for (const insight of data.insights) {
                await db.Insight.create({
                    drama_id: drama.id,
                    episode_id: episode.id,
                    type: insight.type,
                    content: insight.content,
                    confidence: insight.confidence,
                    source_data: insight.source_snippet
                });
                console.log(`✨ [Trend Analyst] New Insight: [${insight.type}] ${insight.content}`);
            }
            return data.insights;
        }
    } catch (error) {
        console.error('❌ [Trend Analyst] Analysis failed:', error.message);
    }
}

module.exports = {
    analyzeEpisodeTrends
};
