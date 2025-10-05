// games-carousel.js - Общая логика карусели
let currentGame = 0;
const gamesPerView = 3;
let totalGames = 0;

// Инициализация карусели
function initGamesCarousel(gameCount) {
    totalGames = gameCount;
    createNavigationDots();
    updateCarousel();
}

// Создание навигационных точек
function createNavigationDots() {
    const navContainer = document.getElementById('carouselNav');
    const totalSlides = Math.ceil(totalGames / gamesPerView);
    
    navContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToSlide(i));
        navContainer.appendChild(dot);
    }
}

// Переход к конкретному слайду
function goToSlide(slideIndex) {
    currentGame = slideIndex * gamesPerView;
    updateCarousel();
}

// Следующий слайд
function nextGame() {
    if (currentGame < totalGames - gamesPerView) {
        currentGame += gamesPerView;
        updateCarousel();
    }
}

// Предыдущий слайд
function prevGame() {
    if (currentGame > 0) {
        currentGame -= gamesPerView;
        updateCarousel();
    }
}

// Обновление карусели
function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    const cardWidth = 100 / gamesPerView;
    const translateX = -(currentGame * cardWidth);
    track.style.transform = `translateX(${translateX}%)`;

    // Обновление активной точки
    const currentSlide = Math.floor(currentGame / gamesPerView);
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Обработчик свайпов для мобильных устройств
function initSwipe() {
    let startX = 0;
    let endX = 0;

    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    track.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextGame();
            } else {
                prevGame();
            }
        }
    }
}

// Адаптация при изменении размера окна
window.addEventListener('resize', function() {
    updateCarousel();
});

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', function() {
    initSwipe();
});

// Делаем функции глобальными для доступа из HTML
window.nextGame = nextGame;
window.prevGame = prevGame;
window.initGamesCarousel = initGamesCarousel;