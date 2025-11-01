// script.js - PK Tool YouTube Analyzer

// ✅ YouTube API Key
const API_KEY = 'AIzaSyCrgbo0BqWOYIFAat1sBjHEnzIslwukcDo';

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const appsIcon = document.getElementById('appsIcon');
    const appsDropdown = document.getElementById('appsDropdown');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const videoUrl = document.getElementById('videoUrl');
    const results = document.getElementById('results');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');

    // Hamburger Menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    // Apps Dropdown
    appsIcon.addEventListener('click', () => {
        appsDropdown.classList.toggle('active');
    });

    // Close modals
    document.querySelectorAll('.close').forEach(close => {
        close.addEventListener('click', (e) => {
            e.target.closest('.login-modal, .signup-modal').style.display = 'none';
        });
    });

    // Login/Signup Logic (Local Storage)
    let currentUser = localStorage.getItem('pkUser');

    function updateMenu() {
        if (currentUser) {
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            logoutBtn.querySelector('a').textContent = `Logout (${currentUser})`;
        } else {
            loginBtn.style.display = 'block';
            signupBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    }

    updateMenu();

    // Signup
    document.getElementById('signupSubmit').addEventListener('click', () => {
        const user = document.getElementById('signupUser').value;
        const pass = document.getElementById('signupPass').value;
        if (user && pass) {
            localStorage.setItem('pkUser', user);
            localStorage.setItem('pkPass', btoa(pass)); // Simple hash
            currentUser = user;
            updateMenu();
            signupModal.style.display = 'none';
            alert('ID Ban Gaya! 🎉');
        }
    });

    // Login
    document.getElementById('loginSubmit').addEventListener('click', () => {
        const user = document.getElementById('loginUser').value;
        const pass = document.getElementById('loginPass').value;
        const storedPass = localStorage.getItem('pkPass');
        if (user === localStorage.getItem('pkUser') && btoa(pass) === storedPass) {
            currentUser = user;
            updateMenu();
            loginModal.style.display = 'none';
            alert('Login Success! 🚀');
        } else {
            alert('Galat ID/Password!');
        }
    });

    // Logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        currentUser = null;
        updateMenu();
        alert('Logout Ho Gaya!');
    });

    // Open Modals
    signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.style.display = 'flex';
    });

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'flex';
    });

    // Analyze Button
    analyzeBtn.addEventListener('click', async () => {
        const url = videoUrl.value.trim();
        if (!url) {
            alert('URL Daale!');
            return;
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            alert('Valid YouTube URL Daale!');
            return;
        }

        try {
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            analyzeBtn.disabled = true;

            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`
            );
            const data = await response.json();

            if (data.items.length === 0) {
                alert('Video Nahi Mila!');
                return;
            }

            const item = data.items[0];
            const snippet = item.snippet;
            const stats = item.statistics;

            displayResults(videoId, snippet, stats);
        } catch (error) {
            alert('Error! API Key Check Kare Ya Internet!');
            console.error(error);
        } finally {
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Karo!';
            analyzeBtn.disabled = false;
        }
    });

    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function formatNumber(num) {
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toString();
    }

    // ✅ Updated Function with Copy Buttons
    function displayResults(videoId, snippet, stats) {
        results.innerHTML = `
            <div class="video-embed">
                <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <h3><i class="fas fa-info-circle"></i> Title 
                        <button class="copy-btn" data-copy="${snippet.title}">📋 Copy</button>
                    </h3>
                    <p>${snippet.title}</p>
                </div>

                <div class="info-card">
                    <h3><i class="fas fa-calendar"></i> Published</h3>
                    <p>${new Date(snippet.publishedAt).toLocaleDateString('hi-IN')}</p>
                </div>

                <div class="info-card">
                    <h3><i class="fas fa-eye"></i> Views</h3>
                    <p>${formatNumber(parseInt(stats.viewCount))}</p>
                </div>

                <div class="info-card">
                    <h3><i class="fas fa-comment"></i> Comments</h3>
                    <p>${formatNumber(parseInt(stats.commentCount))}</p>
                </div>

                <div class="info-card">
                    <h3><i class="fas fa-th-list"></i> Tags 
                        <button class="copy-btn" data-copy="${snippet.tags ? snippet.tags.join(', ') : ''}">📋 Copy</button>
                    </h3>
                    <div class="tags">
                        ${snippet.tags ? snippet.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') : '<p>No Tags</p>'}
                    </div>
                </div>

                <div class="info-card">
                    <h3><i class="fas fa-align-left"></i> Description 
                        <button class="copy-btn" data-copy="${snippet.description.replace(/"/g, '&quot;')}">📋 Copy</button>
                    </h3>
                    <p>${snippet.description.substring(0, 300)}${snippet.description.length > 300 ? '...' : ''}</p>
                </div>
            </div>
        `;

        results.style.display = 'block';
        results.scrollIntoView({ behavior: 'smooth' });

        // ✅ Copy Button Functionality
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-copy');
                navigator.clipboard.writeText(text);
                btn.textContent = '✅ Copied!';
                setTimeout(() => (btn.textContent = '📋 Copy'), 1500);
            });
        });

        // Animate cards
        document.querySelectorAll('.info-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }
});
