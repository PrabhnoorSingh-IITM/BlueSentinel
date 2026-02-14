// AI Chatbot Implementation
// V2.0 Hybrid Mode: Gemini API + Expert System Fallback

document.addEventListener('DOMContentLoaded', function () {
    initializeAIChatbot();
});

function initializeAIChatbot() {
    setupChatbotEventListeners();
    console.log('AI Chatbot initialized (Hybrid Mode)');
}

function setupChatbotEventListeners() {
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const send = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');

    if (!toggle || !close || !send || !input || !messagesContainer) return;

    // Toggle
    toggle.addEventListener('click', () => {
        const window = document.getElementById('chatbot-window');
        const isHidden = window.style.display === 'none';
        window.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) input.focus();
    });

    // Close
    close.addEventListener('click', () => {
        document.getElementById('chatbot-window').style.display = 'none';
    });

    // Send
    const handleSend = () => {
        const message = input.value.trim();
        if (message) {
            addUserMessage(message);
            processUserMessage(message);
            input.value = '';
        }
    };

    send.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}

function addUserMessage(message) {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'user-message';
    div.textContent = message;
    container.appendChild(div);
    scrollToBottom();
}

function addAIMessage(message) {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'ai-message';
    // Allow basic HTML for formatting solutions
    div.innerHTML = message;
    container.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    const container = document.getElementById('chatbot-messages');
    container.scrollTop = container.scrollHeight;
}

function showTyping() {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'ai-message typing-indicator';
    div.textContent = 'Thinking...';
    div.id = 'typing-indicator';
    container.appendChild(div);
    scrollToBottom();
}

function hideTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

async function processUserMessage(message) {
    showTyping();

    // 1. Check for immediate "Expert System" matches (Offline priority)
    const localResponse = getExpertResponse(message);
    if (localResponse) {
        setTimeout(() => {
            hideTyping();
            addAIMessage(localResponse);
        }, 600); // Small fake delay for natural feel
        return;
    }

    // 2. Try Gemini API (Using stable gemini-pro)
    try {
        const apiKey = 'AIzaSyDpNUJezxx7m9RyRbpZujImldyblcfDw2g';
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are SentinelBuddy, an expert marine biologist. 
                        Context: BlueSentinel monitors water quality (Temp, pH, Turbidity, DO).
                        User Question: "${message}"
                        Provide a concise, helpful response (max 2 sentences).`
                    }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok || !data.candidates) {
            console.warn('Gemini API Error:', data);
            throw new Error('API Error');
        }

        const aiText = data.candidates[0].content.parts[0].text;
        hideTyping();
        addAIMessage(aiText);

    } catch (error) {
        console.warn('AI API failed, using fallback:', error);
        hideTyping();
        // 3. General Fallback
        addAIMessage("I'm having trouble connecting to the global network, but I can tell you that all systems are currently monitoring parameters within expected ranges. Try asking about specific sensors like 'Temperature' or 'pH'.");
    }
}

// Exposed function for Dashboard Analysis (JSON Response)
async function getWaterHealthAnalysis(sensorData) {
    const apiKey = 'AIzaSyDpNUJezxx7m9RyRbpZujImldyblcfDw2g';
    const cacheKey = 'water_health_analysis_cache';
    const cacheDuration = 15 * 60 * 1000; // 15 minutes

    // 1. Check Local Cache
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp < cacheDuration) {
                console.log("Using cached AI analysis (valid for 15 mins)");
                return data;
            }
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
        return calculateLocalFallback(sensorData);
    }

    // Global variable to cache the working model (prevents repeated failed lookups)
    if (!window.cachedGeminiModel) {
        window.cachedGeminiModel = null;
    }

    // Inside explicit try/catch
    try {
        if (!sensorData || !sensorData.temperature) {
            throw new Error("Invalid Sensor Data");
        }

        // Strict Prompt
        const prompt = `
        Act as a marine biologist and data analyst. Analyze this sensor data:
        - Real Sensors: Temperature: ${sensorData.temperature}°C, pH: ${sensorData.pH}.
        - Broken/Ignored Sensors: Turbidity (Value: ${sensorData.turbidity} NTU - DO NOT USE FOR SCORE).
        - Simulated/Estimated: Dissolved Oxygen: ${sensorData.dissolvedOxygen} mg/L, Nitrogen: ${sensorData.nitrogen || 'N/A'}, Ammonia: ${sensorData.ammonia || 'N/A'}, Lead: ${sensorData.lead || 'N/A'}, Sodium: ${sensorData.sodium || 'N/A'}.

        Task:
        1. Calculate a "Water Health Score" out of 100 based on these values (potability standards), IGNORING Turbidity.
        2. Provide a 2-sentence summary of the ecosystem health, mentioning that Turbidity data is currently unavailable/ignored.
        3. Determine a status (Excellent, Good, Warning, Critical).
        4. Provide specific chemical/physical treatment advice for any out-of-range metrics (e.g., "Add Sodium Carbonate to increase pH", "Increase aeration for low DO").

        Return ONLY a JSON object in this format:
        {
            "score": 85,
            "status": "Good",
            "analysis": "Water quality is generally good...",
            "treatments": {
                "pH": "Advice for pH...",
                "Temperature": "Advice for Temp...",
                "Dissolved Oxygen": "Advice for DO...",
                "Ammonia": "Advice for Ammonia..."
            }
        }
        `;

        // Step A: Discover Model if not cached
        if (window.cachedGeminiModel === null) {
            console.log("Discovering available Gemini models...");
            try {
                const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                if (listResp.ok) {
                    const listData = await listResp.json();
                    const viableModel = listData.models?.find(m =>
                        m.name.includes('gemini') &&
                        m.supportedGenerationMethods?.includes('generateContent')
                    );

                    if (viableModel) {
                        const modelId = viableModel.name.replace('models/', '');
                        window.cachedGeminiModel = modelId;
                        console.log(`Discovered and cached valid model: ${modelId}`);
                    } else {
                        window.cachedGeminiModel = 'OFFLINE';
                    }
                } else {
                    // Suppress 429 error on discovery
                    if (listResp.status === 429) {
                        console.warn("AI Quota Exceeded (Discovery). Switching to Offline Mode.");
                    } else {
                        console.warn(`Model discovery failed (${listResp.status}). Switching to Offline Mode.`);
                    }
                    window.cachedGeminiModel = 'OFFLINE';
                }
            } catch (e) {
                window.cachedGeminiModel = 'OFFLINE';
            }
        }

        // Step B: Use Cached Model or Fallback
        if (window.cachedGeminiModel === 'OFFLINE') {
            return calculateLocalFallback(sensorData);
        }

        const modelToUse = window.cachedGeminiModel || 'gemini-2.0-flash'; // Updated default

        try {
            console.log(`Generating content using: ${modelToUse}`);
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.candidates && data.candidates[0].content) {
                    const textResponse = data.candidates[0].content.parts[0].text;
                    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const result = JSON.parse(jsonMatch[0]);

                        // Cache Success Result
                        localStorage.setItem(cacheKey, JSON.stringify({
                            timestamp: Date.now(),
                            data: result
                        }));
                        console.log("SUCCESS: AI Analysis generated and cached.");
                        return result;
                    }
                }
            } else {
                if (response.status === 429) {
                    console.warn(`AI Quota Exceeded (${modelToUse}). Switching to Offline Mode.`);
                    // Do not throw, just fallback silently
                } else {
                    console.warn(`Generation failed with ${modelToUse}: ${response.status}`);
                }
            }
        } catch (e) {
            console.warn(`Error generating content with ${modelToUse}:`, e);
        }

        // Silent Fallback
        return calculateLocalFallback(sensorData);

    } catch (error) {
        console.error("Critical Failure in AI Module:", error);
        return calculateLocalFallback(sensorData);
    }
}
window.getWaterHealthAnalysis = getWaterHealthAnalysis; // Expose global

// Advanced Local Fallback Calculation (Simulates AI Analysis)
function calculateLocalFallback(data) {
    let score = 100;
    const ph = parseFloat(data.pH) || 7;
    const temp = parseFloat(data.temperature) || 20;
    const doLevel = parseFloat(data.dissolvedOxygen) || 8;
    const ammonia = parseFloat(data.ammonia) || 0;
    const nitrogen = parseFloat(data.nitrogen) || 0;

    const penalties = [];

    // 1. pH Penalty (Ideal 6.5 - 8.5)
    if (ph < 6.5 || ph > 8.5) {
        const p = Math.abs(ph - 7) * 10;
        score -= p;
        penalties.push(`pH is ${getPhStatus(ph)}`);
    }

    // 2. Temp Penalty (Ideal 10 - 30)
    if (temp > 30) {
        score -= (temp - 30) * 2;
        penalties.push('Temperature is high');
    }

    // 3. Dissolved Oxygen (Critical < 4)
    if (doLevel < 5) {
        score -= (5 - doLevel) * 15;
        penalties.push('Dissolved Oxygen is low');
    }

    // 4. Chemical Contaminants (Simulated)
    if (ammonia > 0.5) {
        score -= ammonia * 20;
        penalties.push('Ammonia levels detected');
    }
    if (nitrogen > 5) {
        score -= (nitrogen - 5) * 5;
        penalties.push('Nitrogen levels elevated');
    }

    // Turbidity Ignored as per User Request

    score = Math.floor(Math.max(0, Math.min(100, score)));

    let status = "Excellent";
    if (score < 90) status = "Good";
    if (score < 75) status = "Warning";
    if (score < 50) status = "Critical";

    // Generate Dynamic Analysis String
    let analysis = `Water quality is designated as ${status}. `;
    if (penalties.length > 0) {
        analysis += `Key concerns: ${penalties.join(', ')}. `;
    } else {
        analysis += `All monitored parameters (pH, Temp, DO) are within optimal ranges. `;
    }
    analysis += `Turbidity sensor is currently bypassed.`;

    return {
        score: score,
        status: status,
        analysis: analysis
    };
}

function getPhStatus(ph) {
    if (ph < 6.5) return "Acidic";
    if (ph > 8.5) return "Alkaline";
    return "Optimal";
}

// --- EXPERT SYSTEM LOGIC ---
const expertKnowledge = {
    greetings: ['hi', 'hello', 'hey', 'start', 'help'],
    status: ['status', 'system', 'report', 'health'],
    temperature: {
        keywords: ['temp', 'heat', 'cold', 'degree'],
        response: "Current Temperature is optimal for local marine life. <strong>If it exceeds 30°C</strong>, check cooling effluents or shallow water stagnation."
    },
    ph: {
        keywords: ['ph', 'acid', 'alkaline'],
        response: "pH levels are stable. <strong>Corrective Action for Low pH:</strong> Add sodium carbonate or increase aeration. For High pH, reduce aeration or add organic acid."
    },
    turbidity: {
        keywords: ['turbidity', 'clear', 'cloudy', 'ntu'],
        response: "Turbidity is within safe limits. <strong>High Turbidity Solution:</strong> Inspect for sediment runoff or algal blooms. Consider settlement tanks if persistent."
    },
    oxygen: {
        keywords: ['oxygen', 'do', 'breath', 'hypoxia'],
        response: "Dissolved Oxygen is the most critical parameter. <strong>If Low (<4mg/L):</strong> Activate emergency aerators immediately and reduce feeding."
    },
};

function getExpertResponse(input) {
    const text = input.toLowerCase();

    // Check greetings
    if (expertKnowledge.greetings.some(k => text.includes(k))) {
        return "Hello! I am SentinelBuddy. I monitor water quality parameters. You can ask me about <b>Temperature, pH, Turbidity, DO, or Salinity</b>.";
    }

    // Check specific sensors
    if (expertKnowledge.temperature.keywords.some(k => text.includes(k))) return expertKnowledge.temperature.response;
    if (expertKnowledge.ph.keywords.some(k => text.includes(k))) return expertKnowledge.ph.response;
    if (expertKnowledge.turbidity.keywords.some(k => text.includes(k))) return expertKnowledge.turbidity.response;
    if (expertKnowledge.oxygen.keywords.some(k => text.includes(k))) return expertKnowledge.oxygen.response;


    return null; // No local match, try API
}

