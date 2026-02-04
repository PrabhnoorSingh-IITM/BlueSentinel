// News page functionality with API integration
document.addEventListener('DOMContentLoaded', function() {
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
    // Example using NewsAPI.org
    const response = await fetch(`${NEWS_API_CONFIG.newsApi.baseUrl}?q=ocean%20pollution%20OR%20marine%20conservation%20OR%20coral%20reef&apiKey=${NEWS_API_CONFIG.newsApi.apiKey}&pageSize=6&sortBy=publishedAt&language=en`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch news');
    }
    
    const data = await response.json();
    
    // Transform API data to our format
    return data.articles.map(article => ({
        title: article.title,
        content: article.description,
        date: formatRelativeTime(new Date(article.publishedAt)),
        url: article.url,
        source: article.source.name
    }));
}

function loadSampleNews() {
    // Fallback sample data
    const sampleNews = [
        {
            title: "Coral Reef Recovery Initiative Shows Promise",
            content: "Recent monitoring data shows coral health scores improving by 15% in protected zones following new conservation measures.",
            date: "2 hours ago",
            url: "#",
            source: "BlueSentinel"
        },
        {
            title: "Oil Spike Detected Near Industrial Zone",
            content: "Automated sensors detected unusual oil contamination levels. Authorities have been alerted and response teams deployed.",
            date: "5 hours ago",
            url: "#",
            source: "BlueSentinel"
        },
        {
            title: "Marine Species Migration Patterns Change",
            content: "Water temperature shifts are causing changes in fish migration routes. Scientists recommend updated fishing regulations.",
            date: "1 day ago",
            url: "#",
            source: "BlueSentinel"
        },
        {
            title: "New Sensor Network Deployed",
            content: "Expanded monitoring coverage now includes 50 additional coastal zones, providing real-time data for previously unmonitored areas.",
            date: "2 days ago",
            url: "#",
            source: "BlueSentinel"
        },
        {
            title: "Plastic Pollution Reduction Success",
            content: "Recent cleanup efforts combined with monitoring have reduced plastic waste in monitored areas by 40%.",
            date: "3 days ago",
            url: "#",
            source: "BlueSentinel"
        },
        {
            title: "Breakthrough in Ocean Acidification Research",
            content: "Scientists discover new method to track ocean acidification patterns using satellite data and AI algorithms.",
            date: "4 days ago",
            url: "#",
            source: "BlueSentinel"
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
    card.className = 'card';
    card.innerHTML = `
        <h3 class="card__title">${newsData.title}</h3>
        <p class="card__content">${newsData.content}</p>
        <div class="card__date">${newsData.date}</div>
        <div class="card__arrow">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="15" width="15">
                <path fill="#fff" d="M13.4697 17.9697C13.1768 18.2626 13.1768 18.7374 13.4697 19.0303C13.7626 19.3232 14.2374 19.3232 14.5303 19.0303L20.3232 13.2374C21.0066 12.554 21.0066 11.446 20.3232 10.7626L14.5303 4.96967C14.2374 4.67678 13.7626 4.67678 13.4697 4.96967C13.1768 5.26256 13.1768 5.73744 13.4697 6.03033L18.6893 11.25H4C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H18.6893L13.4697 17.9697Z"></path>
            </svg>
        </div>
    `;
    
    // Add click handler
    card.addEventListener('click', () => {
        if (newsData.url && newsData.url !== '#') {
            window.open(newsData.url, '_blank');
        }
    });
    
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
