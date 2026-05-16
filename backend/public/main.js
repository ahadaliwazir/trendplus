const API_BASE = '/api'; // Relative path for deployment

async function fetchInsights() {
    try {
        const response = await fetch(`${API_BASE}/insights`);
        const data = await response.json();
        
        const container = document.getElementById('feed-items');
        container.innerHTML = '';
        
        data.forEach(insight => {
            const div = document.createElement('div');
            div.className = 'feed-item';
            const time = new Date(insight.created_at).toLocaleTimeString();
            const dramaTitle = insight.drama ? insight.drama.title : 'General';
            
            div.innerHTML = `
                <span style="color: #06b6d4">[${time}]</span> 
                <span style="color: #8b5cf6">${insight.type}</span> | 
                <strong>${dramaTitle}</strong>: ${insight.content}
            `;
            container.appendChild(div);
        });

        if (data.length === 0) {
            container.innerHTML = '<div class="feed-item">Waiting for fresh intelligence from the scrapers...</div>';
        }
    } catch (error) {
        console.error('❌ Failed to fetch insights:', error);
    }
}

fetchInsights();
setInterval(fetchInsights, 30000);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
