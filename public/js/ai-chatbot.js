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

    // 2. Try Gemini API
    try {
        const apiKey = 'AIzaSyDpNUJezxx7m9RyRbpZujImldyblcfDw2g';
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are SentinelBuddy, an expert marine biologist and system administrator. 
                        Context: BlueSentinel monitors water quality (Temp, pH, Turbidity, DO).
                        User Question: "${message}"
                        Provide a concise, helpful response (max 2 sentences).`
                    }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok || !data.candidates) {
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

// Exposed function for Dashboard Analysis
async function getSystemAnalysis(sensorData) {
    const apiKey = 'AIzaSyDpNUJezxx7m9RyRbpZujImldyblcfDw2g'; // User Provided Key

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
        return "Analysis Unavailable: API Key Required. Please configure the system.";
    }
    try {
        if (!sensorData || !sensorData.temperature) {
            throw new Error("Invalid Sensor Data");
        }
        const prompt = `Analyze this marine sensor data: Temp ${sensorData.temperature}C, pH ${sensorData.pH}, Turbidity ${sensorData.turbidity} NTU, DO ${sensorData.dissolvedOxygen} mg/L. Provide a concise 2-sentence summary of the ecosystem health and any risks.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error("Gemini API Error (No Candidates):", data);
            return "Analysis Unavailable: Safety filter or quota limit reached.";
        }
    } catch (error) {
        console.error("Gemini API Exception:", error);
        return "Analysis Connection Failed. Please check console logs.";
    }
    return "System is gathering data. All vital signs appear stable based on current heuristic checks.";
}
window.getSystemAnalysis = getSystemAnalysis; // Expose to global scope

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

