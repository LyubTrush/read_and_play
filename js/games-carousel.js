// games-carousel.js - Общая логика карусели
let currentGame = 0;
let gamesPerView = 3; // Будет меняться в зависимости от размера экрана
let totalGames = 0;

// Инициализация карусели
function initGamesCarousel(gameCount) {
    totalGames = gameCount;
    updateGamesPerView();
    createNavigationDots();
    updateCarousel();
}

// Обновление количества видимых игр в зависимости от размера экрана
function updateGamesPerView() {
    const width = window.innerWidth;
    if (width <= 768) {
        gamesPerView = 1; // На мобильных - 1 карточка
    } else if (width <= 1024) {
        gamesPerView = 2; // На планшетах - 2 карточки
    } else {
        gamesPerView = 3; // На десктопе - 3 карточки
    }
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
    const maxSlide = Math.floor((totalGames - 1) / gamesPerView) * gamesPerView;
    if (currentGame < maxSlide) {
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
    
    // Рассчитываем смещение в процентах
    const cardWidthPercentage = 100 / gamesPerView;
    const translateX = -(currentGame * cardWidthPercentage);
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
    const oldGamesPerView = gamesPerView;
    updateGamesPerView();
    
    // Если изменилось количество видимых игр, пересчитываем позицию
    if (oldGamesPerView !== gamesPerView) {
        createNavigationDots();
        updateCarousel();
    }
});

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', function() {
    initSwipe();
});

// Делаем функции глобальными для доступа из HTML
window.nextGame = nextGame;
window.prevGame = prevGame;
window.initGamesCarousel = initGamesCarousel;