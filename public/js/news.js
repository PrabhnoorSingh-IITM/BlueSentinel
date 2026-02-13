// News page functionality with API integration
document.addEventListener('DOMContentLoaded', function () {
    loadNewsFromAPI();
    setupCardInteractions();
});

// API Configuration
const NEWS_API_CONFIG = {
    // NewsAPI.org (Free tier available) - ACTIVE
    newsApi: {
        baseUrl: 'https://newsapi.org/v2/everything',
        apiKey: '74eaee257214422fb35ff737068795a9',
        queries: [
            'ocean pollution',
            'marine conservation',
            'coral reef',
            'water quality',
            'environmental protection'
        ]
    }
};

async function loadNewsFromAPI() {
    try {
        // Try loading from API first
        const apiNews = await fetchMarineNews();

        if (apiNews && apiNews.length > 0) {
            updateNewsCards(apiNews);
        } else {
            // Fallback to sample data
            console.log('API returned no data, using sample news');
            loadSampleNews();
        }
    } catch (error) {
        console.error('Error loading news from API:', error);
        // Fallback to sample data
        console.log('Falling back to sample news due to API error');
        loadSampleNews();
    }
}

async function fetchMarineNews() {
    try {
        // Use Firebase Cloud Function to avoid exposing API key
        if (!firebase.functions) {
            console.warn('Firebase Functions SDK not loaded, falling back to sample data');
            throw new Error('Firebase Functions Object not found');
        }

        const getNews = firebase.functions().httpsCallable('getNews');
        const result = await getNews();

        return result.data;
    } catch (error) {
        console.error('Cloud Function Error:', error);
        throw error;
    }
}

function loadSampleNews() {
    // Fallback sample data
    const sampleNews = [
        {
            title: "Coral Reef Recovery Initiative Shows Promise",
            content: "Recent monitoring data shows coral health scores improving by 15% in protected zones following new conservation measures.",
            date: "2 hours ago",
            url: "#",
            url: "#",
            source: "NOAA Marine Sanctuary"
        },
        {
            title: "Oil Spike Detected Near Industrial Zone",
            content: "Automated sensors detected unusual oil contamination levels. Authorities have been alerted and response teams deployed.",
            date: "5 hours ago",
            url: "#",
            url: "#",
            source: "Ocean Cleanup Project"
        },
        {
            title: "Marine Species Migration Patterns Change",
            content: "Water temperature shifts are causing changes in fish migration routes. Scientists recommend updated fishing regulations.",
            date: "1 day ago",
            url: "#",
            url: "#",
            source: "Marine Biology Weekly"
        },
        {
            title: "New Sensor Network Deployed",
            content: "Expanded monitoring coverage now includes 50 additional coastal zones, providing real-time data for previously unmonitored areas.",
            date: "2 days ago",
            url: "#",
            url: "#",
            source: "Coastal Watch"
        },
        {
            title: "Plastic Pollution Reduction Success",
            content: "Recent cleanup efforts combined with monitoring have reduced plastic waste in monitored areas by 40%.",
            date: "3 days ago",
            url: "#",
            url: "#",
            source: "UN Environment Program"
        },
        {
            title: "Breakthrough in Ocean Acidification Research",
            content: "Scientists discover new method to track ocean acidification patterns using satellite data and AI algorithms.",
            date: "4 days ago",
            url: "#",
            url: "#",
            source: "Science Daily"
        },
        {
            title: "Microplastics Found in Deepest Ocean Trench",
            content: "New submersible expedition confirms presence of microplastics at 11,000 meters depth, raising concerns about deep-sea ecosystem contamination.",
            date: "5 days ago",
            url: "#",
            source: "National Geographic"
        },
        {
            title: "Global Treaty on Plastic Pollution Advances",
            content: "UN member states agree on framework for legally binding international instrument to end plastic pollution by 2040.",
            date: "6 days ago",
            url: "#",
            source: "UN News"
        },
        {
            title: "AI-Powered Drones Clean Coastal Waters",
            content: "Autonomous solar-powered drones collect 500kg of floating debris daily in pilot program off the coast of California.",
            date: "1 week ago",
            url: "#",
            source: "TechCrunch"
        },
        {
            title: "Ocean Warming Impacts Fisheries",
            content: "Record high ocean temperatures are disrupting fish breeding cycles, leading to reduced catch yields in tropical regions.",
            date: "1 week ago",
            url: "#",
            source: "Reuters Environment"
        },
        {
            title: "Community-Led Mangrove Restoration Success",
            content: "Local communities in Southeast Asia restore 5,000 hectares of mangrove forest, boosting coastal resilience and biodiversity.",
            date: "2 weeks ago",
            url: "#",
            source: "World Bank Climate"
        }
    ];

    updateNewsCards(sampleNews);
}

function updateNewsCards(newsData) {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;

    // Clear existing cards
    newsGrid.innerHTML = '';

    // Create new cards
    newsData.forEach(news => {
        const card = createNewsCard(news);
        newsGrid.appendChild(card);
    });
}

function createNewsCard(newsData) {
    const card = document.createElement('div');
    card.className = 'bento-card'; // Changed from 'card' to 'bento-card'
    card.style.height = '100%'; // Ensure full height in grid

    card.innerHTML = `
        <div class="card-header">
             <span class="card-title" style="color: var(--color-cyan);">${newsData.source || 'BlueSentinel'}</span>
             <span class="status-pill status-normal" style="font-size: 0.7rem;">${newsData.date}</span>
        </div>
        <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 0.75rem; line-height: 1.4;">${newsData.title}</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; flex: 1;">${newsData.content}</p>
        
        <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
            <div class="btn-icon" style="width: 32px; height: 32px;">
                <img src="./assets/icons/arrow-right.svg" style="width: 14px; height: 14px; filter: invert(1);" alt="->">
            </div>
        </div>
    `;

    // Add click handler
    card.addEventListener('click', () => {
        if (newsData.url && newsData.url !== '#') {
            window.open(newsData.url, '_blank');
        }
    });

    // Add Hover Effect for interaction
    card.style.cursor = 'pointer';

    return card;
}

function setupCardInteractions() {
    // Add any additional card interactions here
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add hover effects if needed
        });

        card.addEventListener('mouseleave', () => {
            // Remove hover effects if needed
        });
    });
}

function formatRelativeTime(date) {
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Auto-refresh news every 30 minutes
setInterval(() => {
    loadNewsFromAPI();
}, 30 * 60 * 1000);
