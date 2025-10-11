// js/main.js

// Данные модулей
const modules = [
    {
        id: 1,
        title: "Алфавит",
        description: "Изучение букв и звуков английского алфавита. Первые шаги в чтении.",
        image: "assets/images/modules/alphabet.png",
        link: "modules/alphabet/index.html"
    },
    {
        id: 2,
        title: "Буквосочетания",
        description: "CH, SH, TH - изучаем сочетания букв и их звучание.",
        image: "assets/images/modules/consonant-teams.png", 
        link: "modules/consonant-teams/index.html"
    },
    {
        id: 3,
        title: "Буква A",
        description: "Разные звуки буквы A в словах. Закрытый и открытый слог.",
        image: "assets/images/modules/letter-a.png",
        link: "modules/magic-letter-a/index.html"
    },
    {
        id: 4,
        title: "Буква E",
        description: "Правила чтения буквы E. Сочетания EE, EA.",
        image: "assets/images/modules/letter-e.png",
        link: "modules/letter-e/index.html"
    },
    {
        id: 5,
        title: "Буква I",
        description: "Звуки буквы I в разных позициях. Правила чтения.",
        image: "assets/images/modules/letter-i.png",
        link: "modules/letter-i/index.html"
    },
    {
        id: 6,
        title: "Буква O",
        description: "Изучение различных звуков буквы O в словах.",
        image: "assets/images/modules/letter-o.png",
        link: "modules/letter-o/index.html"
    },
     {
        id: 7,
        title: "Местоимения ",
        description: "Изучение обычных и притяжательных местоимений.",
        image: "assets/images/modules/pronouns.png",
        link: "modules/pronouns/index.html"
    }
];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadModules();
});

// Инициализация навигации
function initializeNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });
    }

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-content')) {
            navMenu.classList.remove('active');
        }
    });

    // Закрытие меню при клике на ссылку
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// Загрузка модулей на главной странице
function loadModules() {
    const modulesGrid = document.getElementById('modulesGrid');
    if (!modulesGrid) return;

    modulesGrid.innerHTML = '';
    
    modules.forEach(module => {
        const card = createModuleCard(module);
        modulesGrid.appendChild(card);
    });
}

// Создание карточки модуля
function createModuleCard(module) {
    const card = document.createElement('div');
    card.className = 'module-card';
    
    card.innerHTML = `
        <div class="module-image">
            <img src="${module.image}" alt="${module.title}" onerror="this.style.display='none'; this.parentNode.innerHTML='🖼️'; this.parentNode.className='module-icon'">
        </div>
        <h3 class="module-title">${module.title}</h3>
        <p class="module-desc">${module.description}</p>
        <button class="module-button">
            Начать обучение
        </button>
    `;
    
    // Добавляем обработчик клика
    const button = card.querySelector('.module-button');
    button.addEventListener('click', () => {
        window.location.href = module.link;
    });
    
    return card;
}