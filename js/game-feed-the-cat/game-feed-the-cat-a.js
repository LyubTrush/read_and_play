// game-feed-the-cat-a.js - Игра "Покорми кота" для слов с коротким звуком [æ]

let score = 0;
let gameData = {
    correctWords: [],    // Слова с коротким звуком [æ]
    incorrectWords: []   // Слова с другими звуками A
};
let fallingWords = [];
let gameInterval = null;
let wordInterval = null;
let soundEnabled = true;
let gameActive = false;

// Загрузка данных игры из всех JSON файлов
async function loadGameData() {
    try {
        // Загружаем все три файла
        const [aWordsResponse, arWordsResponse, aeWordsResponse] = await Promise.all([
            fetch('../../data/a-words-data.json'),
            fetch('../../data/ar-words-data.json'),
            fetch('../../data/a-e-words-data.json')
        ]);

        const aWordsData = await aWordsResponse.json();
        const arWordsData = await arWordsResponse.json();
        const aeWordsData = await aeWordsResponse.json();

        // Собираем правильные слова (короткий звук [æ])
        gameData.correctWords = [];
        aWordsData.levels.forEach(level => {
            level.words.forEach(word => {
                gameData.correctWords.push({
                    word: word.word,
                    lowercase: word.lowercase,
                    displayWord: word.word,
                    rule: 'short-a'
                });
            });
        });

        // Собираем неправильные слова (другие звуки A)
        gameData.incorrectWords = [];
        
        // Слова с AR
        arWordsData.levels.forEach(level => {
            level.words.forEach(word => {
                gameData.incorrectWords.push({
                    word: word.word,
                    lowercase: word.lowercase,
                    displayWord: word.word,
                    rule: 'ar'
                });
            });
        });

        // Слова с Magic E
        aeWordsData.levels.forEach(level => {
            level.words.forEach(word => {
                gameData.incorrectWords.push({
                    word: word.word,
                    lowercase: word.lowercase,
                    displayWord: word.word,
                    rule: 'magic-e'
                });
            });
        });

        console.log('Game data loaded:', {
            correct: gameData.correctWords.length,
            incorrect: gameData.incorrectWords.length
        });

    } catch (error) {
        console.error('Error loading game data:', error);
        // Fallback данные
        gameData = {
            correctWords: [
                {word: "CAT", lowercase: "cat", displayWord: "CAT", rule: 'short-a'},
                {word: "HAT", lowercase: "hat", displayWord: "HAT", rule: 'short-a'},
                {word: "RAT", lowercase: "rat", displayWord: "RAT", rule: 'short-a'},
                {word: "BAT", lowercase: "bat", displayWord: "BAT", rule: 'short-a'},
                {word: "MAT", lowercase: "mat", displayWord: "MAT", rule: 'short-a'},
                {word: "FAT", lowercase: "fat", displayWord: "FAT", rule: 'short-a'},
                {word: "DAD", lowercase: "dad", displayWord: "DAD", rule: 'short-a'},
                {word: "BAD", lowercase: "bad", displayWord: "BAD", rule: 'short-a'}
            ],
            incorrectWords: [
                {word: "CAR", lowercase: "car", displayWord: "CAR", rule: 'ar'},
                {word: "STAR", lowercase: "star", displayWord: "STAR", rule: 'ar'},
                {word: "FAR", lowercase: "far", displayWord: "FAR", rule: 'ar'},
                {word: "CAKE", lowercase: "cake", displayWord: "CAKE", rule: 'magic-e'},
                {word: "LAKE", lowercase: "lake", displayWord: "LAKE", rule: 'magic-e'},
                {word: "NAME", lowercase: "name", displayWord: "NAME", rule: 'magic-e'},
                {word: "GAME", lowercase: "game", displayWord: "GAME", rule: 'magic-e'},
                {word: "PLANE", lowercase: "plane", displayWord: "PLANE", rule: 'magic-e'}
            ]
        };
    }

    // Проверяем загрузку фона
    checkBackgroundImage();
}

// Проверка загрузки фона
function checkBackgroundImage() {
    const background = document.querySelector('.game-background');
    const img = new Image();
    img.src = '../../assets/images/games/feed-the-cat-background.png';
    
    img.onload = function() {
        console.log('Фон успешно загружен');
    };
    
    img.onerror = function() {
        console.log('Фон не загружен, используем fallback');
        background.classList.add('fallback');
    };
}

// Начало игры
function startGame() {
    score = 0;
    fallingWords = [];
    gameActive = true;

    // Обновляем интерфейс
    document.getElementById('levelSelect').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    updateUI();

    // Запускаем игру
    startGameLoop();
}

// Запуск игрового процесса
function startGameLoop() {
    // Очищаем контейнер
    const container = document.getElementById('fallingWordsContainer');
    container.innerHTML = '';

    // Запускаем создание слов (ОЧЕНЬ МЕДЛЕННО - каждые 3 секунды)
    wordInterval = setInterval(createFallingWord, 3000);

    // Игровой цикл
    gameInterval = setInterval(updateGame, 50);
}

// Создание падающего слова
function createFallingWord() {
    if (!gameActive) return;

    const container = document.getElementById('fallingWordsContainer');
    
    // Определяем тип слова (70% правильных, 30% неправильных)
    const isCorrectWord = Math.random() > 0.3;
    const wordPool = isCorrectWord ? gameData.correctWords : gameData.incorrectWords;
    
    if (wordPool.length === 0) return;
    
    // Выбираем случайное слово
    const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
    
    // Создаем элемент слова
    const wordElement = document.createElement('div');
    wordElement.className = isCorrectWord ? 'falling-word correct-word' : 'falling-word incorrect-word';
    
    // Форматируем слово с выделением букв согласно правилу
    const formattedWord = formatWordWithRuleHighlight(randomWord);
    wordElement.innerHTML = formattedWord;
    
    // Случайная позиция по X
    const maxX = container.offsetWidth - 140;
    const randomX = Math.max(20, Math.floor(Math.random() * maxX));
    
    wordElement.style.left = randomX + 'px';
    wordElement.style.top = '-120px'; // Начинают СВЕРХУ за пределами экрана
    
    // Сохраняем данные слова
    wordElement.dataset.correct = isCorrectWord.toString();
    wordElement.dataset.word = randomWord.lowercase;
    wordElement.dataset.rule = randomWord.rule;
    
    // Устанавливаем случайную скорость (ОЧЕНЬ МЕДЛЕННО)
    const animationDuration = 10 + Math.random() * 4; // 10-14 секунд для падения
    wordElement.style.animationDuration = animationDuration + 's';
    
    // Добавляем обработчик клика - УЛУЧШЕННАЯ ОБРАБОТКА
    wordElement.addEventListener('mousedown', handleWordClick);
    wordElement.addEventListener('touchstart', handleWordClick, { passive: false });
    
    // Добавляем в контейнер и массив
    container.appendChild(wordElement);
    fallingWords.push({
        element: wordElement,
        speed: 0.5 + Math.random() * 0.3, // ОЧЕНЬ МЕДЛЕННАЯ скорость
        y: -120,
        x: randomX,
        correct: isCorrectWord,
        rule: randomWord.rule
    });
}

// Форматирование слова с выделением букв согласно правилу
function formatWordWithRuleHighlight(wordData) {
    const word = wordData.displayWord;
    const wordLower = word.toLowerCase();
    
    switch(wordData.rule) {
        case 'short-a':
            // Выделяем букву A в коротком слоге
            return word.replace(/a/gi, '<span class="sound-a">$&</span>');
            
        case 'ar':
            // Выделяем буквосочетание AR
            return word.replace(/ar/gi, '<span class="sound-ar">$&</span>');
            
        case 'magic-e':
            // Выделяем гласную и окончание E
            if (wordLower.endsWith('e') && wordLower.length > 2) {
                const base = wordLower.slice(0, -1);
                const vowelIndex = base.length - 2;
                
                if (vowelIndex >= 0) {
                    const beforeVowel = word.substring(0, vowelIndex);
                    const vowel = word.substring(vowelIndex, vowelIndex + 1);
                    const afterVowel = word.substring(vowelIndex + 1, word.length - 1);
                    const finalE = word.substring(word.length - 1);
                    
                    return beforeVowel + 
                           `<span class="sound-a">${vowel}</span>` +
                           afterVowel +
                           `<span class="sound-e">${finalE}</span>`;
                }
            }
            return word.replace(/a/gi, '<span class="sound-a">$&</span>');
            
        default:
            return word;
    }
}

// Обработка клика по слову - УЛУЧШЕННАЯ ВЕРСИЯ
function handleWordClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!gameActive) return;
    
    const wordElement = event.currentTarget;
    
    // Проверяем, не обрабатывается ли уже это слово
    if (wordElement.classList.contains('caught') || wordElement.classList.contains('missed')) {
        return;
    }
    
    const isCorrect = wordElement.dataset.correct === 'true';
    
    if (isCorrect) {
        // Правильное слово
        score += 1; // Считаем количество слов, а не очки
        wordElement.classList.add('caught');
        playPurrSound(); // МУРЛЫКАНЬЕ вместо обычного звука
        
        // Анимация кота
        feedCat();
        
        // Создаем эффект частиц
        createParticles(wordElement, true);
        
        // Проверяем конец игры
        checkGameEnd();
        
    } else {
        // Неправильное слово - просто исчезает без последствий
        wordElement.classList.add('caught');
        playSound('wrong');
    }
    
    // Удаляем слово из массива
    const wordIndex = fallingWords.findIndex(w => w.element === wordElement);
    if (wordIndex > -1) {
        fallingWords.splice(wordIndex, 1);
    }
    
    // Удаляем элемент через секунду
    setTimeout(() => {
        if (wordElement.parentNode) {
            wordElement.parentNode.removeChild(wordElement);
        }
    }, 500);
    
    updateUI();
}

// Воспроизведение мурлыканья
function playPurrSound() {
    if (!soundEnabled) return;
    
    // Создаем несколько вариантов мурлыканья для разнообразия
    const purrSounds = [
        '../../assets/audio/sounds/cat-purr-1.mp3'
    ];
    
    // Выбираем случайный звук мурлыканья
    const randomPurr = purrSounds[Math.floor(Math.random() * purrSounds.length)];
    const audio = new Audio(randomPurr);
    audio.volume = 0.6; // Немного тише обычных звуков
    audio.play().catch(e => {
        console.log('Purr sound error, fallback to correct sound:', e);
        // Fallback на обычный звук, если мурлыканье не загрузилось
        playSound('correct');
    });
}

// Обновление игрового состояния
function updateGame() {
    if (!gameActive) return;
    
    const container = document.getElementById('fallingWordsContainer');
    const cat = document.getElementById('cat');
    const catRect = cat.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    for (let i = fallingWords.length - 1; i >= 0; i--) {
        const word = fallingWords[i];
        word.y += word.speed; // МЕДЛЕННОЕ движение
        word.element.style.top = word.y + 'px';
        
        // Проверяем столкновение с котом
        const wordRect = word.element.getBoundingClientRect();
        
        if (isColliding(wordRect, catRect)) {
            // Слово достигло кота - просто удаляем его
            word.element.classList.add('missed');
            
            // Удаляем слово
            fallingWords.splice(i, 1);
            setTimeout(() => {
                if (word.element.parentNode) {
                    word.element.parentNode.removeChild(word.element);
                }
            }, 500);
        }
        
        // Удаляем слова, упавшие за пределы
        if (word.y > containerRect.height + 100) {
            fallingWords.splice(i, 1);
            if (word.element.parentNode) {
                word.element.parentNode.removeChild(word.element);
            }
        }
    }
}

// Проверка столкновения
function isColliding(rect1, rect2) {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

// Анимация кормления кота
function feedCat() {
    const cat = document.getElementById('cat');
    const originalSrc = cat.src;
    
    // Меняем на изображение кота с открытым ртом
    const eatingSrc = originalSrc.replace('cat-normal.png', 'cat-eating.png');
    
    // Проверяем существует ли изображение для состояния "ест"
    const img = new Image();
    img.onload = function() {
        cat.src = eatingSrc;
        cat.classList.add('eating');
        
        setTimeout(() => {
            cat.src = originalSrc;
            cat.classList.remove('eating');
        }, 300);
    };
    
    img.onerror = function() {
        // Если изображения "ест" нет, просто анимируем масштаб
        cat.classList.add('eating');
        setTimeout(() => {
            cat.classList.remove('eating');
        }, 300);
    };
    
    img.src = eatingSrc;
}

// Создание эффекта частиц
function createParticles(element, isCorrect) {
    const rect = element.getBoundingClientRect();
    const container = document.getElementById('fallingWordsContainer');
    
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.className = `particle ${isCorrect ? 'correct' : ''}`;
        particle.style.left = (rect.left + rect.width / 2 - 4) + 'px';
        particle.style.top = (rect.top + rect.height / 2 - 4) + 'px';
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        container.appendChild(particle);
        
        let opacity = 1;
        const particleInterval = setInterval(() => {
            const left = parseFloat(particle.style.left) + vx;
            const top = parseFloat(particle.style.top) + vy;
            opacity -= 0.05;
            
            particle.style.left = left + 'px';
            particle.style.top = top + 'px';
            particle.style.opacity = opacity;
            
            if (opacity <= 0) {
                clearInterval(particleInterval);
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }
        }, 50);
    }
}

// Обновление интерфейса
function updateUI() {
    document.getElementById('score').textContent = score;
}

// Конец игры (после 20 пойманных слов)
function checkGameEnd() {
    if (score >= 20) {
        setTimeout(() => {
            endGame(true);
        }, 1000);
    }
}

function endGame(isWin) {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(wordInterval);
    
    const overlay = document.getElementById('resultOverlay');
    const resultImage = document.getElementById('resultImage');
    const resultTitle = document.getElementById('resultTitle');
    const resultStats = document.getElementById('resultStats');
    
    if (isWin) {
        resultImage.src = '../../assets/icon/result-success.png';
        resultTitle.textContent = 'Молодец! Кот сыт!';
        playSound('applause');
    } else {
        resultImage.src = '../../assets/icon/result-try-again.png';
        resultTitle.textContent = 'Попробуй еще!';
    }
    
    resultStats.textContent = `Поймано: ${score} слов`;
    overlay.style.display = 'flex';
}

// Звуки
function playSound(type) {
    if (!soundEnabled) return;
    
    const sounds = {
        wrong: '../../assets/audio/sounds/wrong.mp3',
        applause: '../../assets/audio/sounds/applause.mp3'
    };
    
    const audio = new Audio(sounds[type]);
    audio.volume = 0.7;
    audio.play().catch(e => console.log('Audio play error:', e));
}

// Переключение звука
function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundToggleIcon = document.getElementById('soundToggleIcon');
    const soundToggleText = document.getElementById('soundToggleText');
    
    if (soundEnabled) {
        soundToggleIcon.src = '../../assets/icon/sound-on.png';
        soundToggleText.textContent = 'Вкл';
    } else {
        soundToggleIcon.src = '../../assets/icon/sound-off.png';
        soundToggleText.textContent = 'Выкл';
    }
}

// Навигация
function backToMenu() {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(wordInterval);
    
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('levelSelect').style.display = 'block';
    closeResult();
}

function closeResult() {
    document.getElementById('resultOverlay').style.display = 'none';
}

function retryGame() {
    closeResult();
    startGame();
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', function() {
    loadGameData();
    
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    
    document.getElementById('resultOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeResult();
        }
    });
});