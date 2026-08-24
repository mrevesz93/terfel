// Fejléc stílus görgetéskor
const header = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Hamburger menü
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('toggle');
});

function scrollToTarget(targetId) {
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        const headerHeight = document.getElementById('navbar').offsetHeight;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
}

const links = document.querySelectorAll('.nav-links a, .logo');
links.forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault(); 
            navLinks.classList.remove('active');
            hamburger.classList.remove('toggle');
            const targetId = this.getAttribute('href');
            history.pushState(null, null, targetId);
            scrollToTarget(targetId);
        }
    });
});

window.addEventListener('load', () => {
    if (window.location.hash) {
        setTimeout(() => {
            scrollToTarget(window.location.hash);
        }, 100);
    }
});

// Fade-in animációk
const fadeElements = document.querySelectorAll('.fade-in-element');
const appearOptions = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };
const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        appearOnScroll.unobserve(entry.target); 
    });
}, appearOptions);

fadeElements.forEach(el => {
    appearOnScroll.observe(el);
});

// --- YOUTUBE API VIDEÓK BETÖLTÉSE ---

// 1. Ide írd majd be a Google Cloudból kapott API kulcsot (idézőjelek közé!)
const YOUTUBE_API_KEY = 'AIzaSyC_a09IguEQEDsFcaxkobSMgfmf43tmjNg';

// 2. Ide jön a csatornád azonosítója (UC-vel kezdődik)
const CHANNEL_ID = 'UCACAa788SkpZo7wiw1S68MQ'; 

async function fetchYouTubeVideos() {
    const feedContainer = document.getElementById('youtube-feed');
    if (!feedContainer) return; 
    
    // Védelem: ha nincs még kulcs megadva
    if (YOUTUBE_API_KEY === 'IDE_JÖN_AZ_API_KULCS' || CHANNEL_ID === 'IDE_JÖN_A_CHANNEL_ID') {
        feedContainer.innerHTML = '<p style="text-align: center; width: 100%;">A videók megjelenítéséhez állítsd be az API kulcsot és a Channel ID-t a main.js fájlban!</p>';
        return;
    }

    // A KVÓTAKÍMÉLŐ TRÜKK: Az "Uploads" (Feltöltések) lejátszási lista ID-ja megegyezik 
    // a Channel ID-val, csak "UC" helyett "UU" betűkkel kezdődik.
    const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace(/^UC/, 'UU');
    
    // 3 videót kérünk le (maxResults=3)
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=10&key=${YOUTUBE_API_KEY}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items) {
            let htmlContent = ''; // Ide gyűjtjük a videókat
            
            data.items.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;
                const title = item.snippet.title;
                
                htmlContent += `
                    <div class="youtube-video fade-in-element">
                        <div class="video-container">
                            <iframe src="https://www.youtube.com/embed/${videoId}" 
                                    title="${title}" 
                                    loading="lazy" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                            </iframe>
                        </div>
                        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="youtube-title">
                            ${title}
                        </a>
                    </div>
                `;
            });
            
            // TRÜKK: Kétszer fűzzük be a tartalmat, hogy a végtelen görgetés folyamatos (zökkenőmentes) legyen
            feedContainer.innerHTML = htmlContent + htmlContent;
            
            // Az új elemeken is aktiváljuk a fade-in effektet
            const newFadeElements = document.querySelectorAll('#youtube-feed .fade-in-element');
            newFadeElements.forEach(el => appearOnScroll.observe(el));

        } else {
            feedContainer.innerHTML = '<p>Sajnos nem sikerült betölteni a videókat.</p>';
            console.error('YouTube API válasz hiba:', data);
        }
    } catch (error) {
        console.error('Hiba a YouTube videók lekérésekor:', error);
        feedContainer.innerHTML = '<p>Hálózat hiba történt a videók betöltése során.</p>';
    }
}

// Ha az oldal betöltött, elindítjuk a lekérést
window.addEventListener('DOMContentLoaded', fetchYouTubeVideos);

// --- BŐVEBBEN GOMBOK MŰKÖDÉSE ---
document.addEventListener('DOMContentLoaded', () => {
    const readMoreBtns = document.querySelectorAll('.read-more-btn');

    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Megkeressük a gomb előtti rejtett tartalmat
            const wrapper = this.previousElementSibling;
            
            // "expanded" osztály hozzáadása / elvétele
            const isExpanded = wrapper.classList.toggle('expanded');
            
            // Ikon és szöveg megfordítása
            if (isExpanded) {
                this.innerHTML = 'Kevesebb <i class="fa-solid fa-chevron-up"></i>';
            } else {
                this.innerHTML = 'Bővebben <i class="fa-solid fa-chevron-down"></i>';
            }
        });
    });
});