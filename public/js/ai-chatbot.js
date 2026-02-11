// AI Chatbot Implementation

document.addEventListener('DOMContentLoaded', function() {
    initializeAIChatbot();
});

function initializeAIChatbot() {
    setupChatbotEventListeners();
    console.log('AI Chatbot initialized');
}

function setupChatbotEventListeners() {
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const send = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');
    
    if (!toggle || !close || !send || !input || !messagesContainer) return;
    
    // Toggle chatbot window
    toggle.addEventListener('click', function() {
        const window = document.getElementById('chatbot-window');
        window.style.display = window.style.display === 'block' ? 'none' : 'block';
        
        if (window.style.display === 'block') {
            input.focus();
        }
    });
    
    // Close chatbot window
    close.addEventListener('click', function() {
        const window = document.getElementById('chatbot-window');
        window.style.display = 'none';
    });
    
    // Send message
    send.addEventListener('click', function() {
        const message = input.value.trim();
        if (message) {
            addUserMessage(message);
            getAIResponse(message);
            input.value = '';
        }
    });
    
    // Enter key to send
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const message = input.value.trim();
            if (message) {
                addUserMessage(message);
                getAIResponse(message);
                input.value = '';
            }
        }
    });
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message';
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(message)}</div>
        <div class="message-time">${formatTime(new Date())}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addAIMessage(message) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message';
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(message)}</div>
        <div class="message-time">${formatTime(new Date())}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Gemini AI Integration
async function getAIResponse(userMessage) {
    const apiKey = 'AIzaSyDlLhaIEdU6rNq7neOsKivxgs7ExSYbeQw';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are BlueSentinel AI, a helpful assistant for an ocean monitoring platform. Respond to this user query about water quality, marine conservation, or the BlueSentinel platform: "${userMessage}". Keep responses concise and helpful.`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 150,
                }
            })
        });
        
        if (!response.ok) {
            throw new Error('AI service unavailable');
        }
        
        const data = await response.json();
        const aiResponse = data.candidates[0]?.content?.parts?.[0]?.text || 
            'I apologize, but I\'m having trouble processing your request right now. Please try again later.';
        
        addAIMessage(aiResponse);
        
    } catch (error) {
        console.error('AI Error:', error);
        
        // Fallback responses
        const fallbackResponses = getFallbackResponse(userMessage);
        addAIMessage(fallbackResponses);
    }
}

function getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Water quality related
    if (message.includes('temperature') || message.includes('ph') || message.includes('turbidity')) {
        return 'Current water quality parameters are monitored in real-time. Check the dashboard cards for the latest readings from our sensors.';
    }
    
    // Ocean conservation
    if (message.includes('conservation') || message.includes('protect')) {
        return 'BlueSentinel helps protect marine ecosystems through real-time monitoring and early detection of pollution events.';
    }
    
    // Platform help
    if (message.includes('how') || message.includes('help')) {
        return 'BlueSentinel uses IoT sensors to monitor water quality 24/7. Data is uploaded to Firebase and displayed in real-time graphs.';
    }
    
    // Default response
    return 'I\'m here to help with BlueSentinel! You can ask me about water quality monitoring, ocean conservation, or technical support.';
}

// Add typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div> AI is thinking...';
    
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Enhanced chatbot with project-specific knowledge
const projectKnowledge = {
    waterQuality: {
        temperature: 'Normal range: 20-30°C',
        ph: 'Normal range: 6.5-8.5',
        turbidity: 'Normal range: 0-5 NTU',
        dissolvedOxygen: 'Normal range: 6-8 mg/L',
        salinity: 'Normal range: 30-40 PSU'
    },
    features: [
        'Real-time monitoring with 5-second updates',
        'Firebase cloud integration for data storage',
        'Chart.js visualization for trends',
        'Automated alert system for threshold breaches',
        'Glass morphism UI design'
    ],
    emergency: 'For water quality emergencies, contact local environmental authorities immediately.'
};
