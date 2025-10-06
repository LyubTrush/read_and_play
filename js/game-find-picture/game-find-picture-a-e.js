// Глобальные переменные игры для Magic E
let currentLevel = 0;
let currentWordIndex = 0;
let score = 0;
let totalWords = 0;
let currentWords = [];
let progressDots = [];
let answers = [];
let currentWordData = null;
let soundEnabled = true;
let gameData = null;

// Загрузка данных игры для Magic E
async function loadGameData() {
    try {
        console.log('Загружаем данные игры с Magic E...');
        const response = await fetch('../../data/a-e-words-data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        gameData = await response.json();
        console.log('Данные Magic E игры успешно загружены');
        
    } catch (error) {
        console.error('Ошибка загрузки данных Magic E игры:', error);
        // Fallback данные на случай ошибки загрузки
        gameData = {
            levels: [
                {
                    name: "-ake слова",
                    words: [
                        {word: "CAKE", lowercase: "cake", image: "../../assets/images/words/cake.png", variants: ["cake", "lake", "snake", "bake"]},
                        {word: "LAKE", lowercase: "lake", image: "../../assets/images/words/lake.png", variants: ["lake", "cake", "snake", "wake"]}
                    ]
                }
            ]
        };
    }
}

// Функция для получения всех слов для уровня с накоплением
function getWordsForLevel(level) {
    let allWords = [];
    
    // Для уровня 5 (экзамен) берем ВСЕ слова из всех 4 уровней
    if (level === 5) {
        for (let i = 0; i < gameData.levels.length; i++) {
            // Для слов из предыдущих уровней используем lowercase
            const levelWords = gameData.levels[i].words.map(wordData => ({
                ...wordData,
                displayWord: wordData.lowercase, // Все слова в lowercase для экзамена
                isNew: false
            }));
            allWords = allWords.concat(levelWords);
        }
    } else {
        // Для обычных уровней (1-4) берем слова из всех предыдущих уровней + текущего
        for (let i = 0; i < level; i++) {
            const levelWords = gameData.levels[i].words.map(wordData => ({
                ...wordData,
                // Слова из текущего уровня - в UPPERCASE, из предыдущих - в lowercase
                displayWord: i === (level - 1) ? wordData.word : wordData.lowercase,
                isNew: i === (level - 1) // Помечаем новые слова текущего уровня
            }));
            allWords = allWords.concat(levelWords);
        }
    }
    
    return allWords;
}

// Начало уровня
function startLevel(level) {
    if (!gameData) {
        console.error('Game data not loaded');
        return;
    }

    currentLevel = level - 1;
    currentWordIndex = 0;
    score = 0;
    progressDots = [];
    answers = [];
    
    // Получаем слова для текущего уровня с накоплением
    currentWords = getWordsForLevel(level);
    
    console.log(`Уровень ${level}: доступно ${currentWords.length} слов`);
    
    // Перемешиваем слова - ВСЕ слова будут показаны
    currentWords = shuffleArray(currentWords);
    
    // Для ВСЕХ уровней берем ВСЕ доступные слова
    totalWords = currentWords.length;
    
    // Обновляем интерфейс
    document.getElementById('levelSelect').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    if (level === 5) {
        document.getElementById('levelInfo').textContent = `Уровень 5: Тренировка-экзамен (${totalWords} слов)`;
    } else {
        document.getElementById('levelInfo').textContent = `Уровень ${level}: ${gameData.levels[currentLevel].name} (${totalWords} слов)`;
    }
    
    createProgressDots();
    showNextWord();
}

// Создание кружочков прогресса
function createProgressDots() {
    const progressDotsContainer = document.getElementById('progressDots');
    progressDotsContainer.innerHTML = '';
    progressDots = [];
    
    for (let i = 0; i < totalWords; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        if (i === 0) {
            dot.classList.add('current');
        }
        progressDotsContainer.appendChild(dot);
        progressDots.push(dot);
    }
}

// Показать следующее слово
function showNextWord() {
    if (currentWordIndex >= totalWords) {
        showResult();
        return;
    }

    currentWordData = currentWords[currentWordIndex];
    const wordElement = document.getElementById('currentWord');
    
    // Форматируем слово с выделением гласной и окончания
    const formattedWord = formatWordWithHighlight(currentWordData.displayWord || currentWordData.word);
    wordElement.innerHTML = formattedWord;
    
    // Создаем карточки с картинками
    createImageCards(currentWordData);
}

// Воспроизведение звука слова
function playWordSound() {
    if (!currentWordData) return;
    
    const wordToPlay = currentWordData.lowercase;
    const wordSound = new Audio(`../../assets/audio/words/${wordToPlay}.mp3`);
    wordSound.volume = 0.8;
    
    wordSound.play().catch(e => {
        console.log('Audio play error:', e);
        // Fallback - попробуем другой путь
        const fallbackSound = new Audio(`../../assets/audio/words/${wordToPlay}.wav`);
        fallbackSound.volume = 0.8;
        fallbackSound.play().catch(e2 => {
            console.log('Fallback audio also failed:', e2);
        });
    });
}

// Переключение звука ответов
function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundToggleIcon = document.getElementById('soundToggleIcon');
    const soundToggleText = document.getElementById('soundToggleText');
    const soundToggle = document.getElementById('soundToggle');
    
    if (soundEnabled) {
        soundToggleIcon.src = '../../assets/icon/sound-on.png';
        soundToggleText.textContent = 'Вкл';
        soundToggle.title = 'Выключить звук ответов';
    } else {
        soundToggleIcon.src = '../../assets/icon/sound-off.png';
        soundToggleText.textContent = 'Выкл';
        soundToggle.title = 'Включить звук ответов';
    }
}

// Форматирование слова с выделением гласной и окончания
function formatWordWithHighlight(word) {
    let result = '';
    const wordToFormat = word.toLowerCase();
    
    // Для слов Magic E выделяем гласную и окончание
    if (wordToFormat.endsWith('e') && wordToFormat.length > 2) {
        const base = wordToFormat.slice(0, -1); // все кроме последней e
        const vowelIndex = base.length - 2; // предполагаем, что гласная перед последней согласной
        
        if (vowelIndex >= 0) {
            const beforeVowel = word.substring(0, vowelIndex);
            const vowel = word.substring(vowelIndex, vowelIndex + 1);
            const afterVowel = word.substring(vowelIndex + 1, word.length - 1);
            const finalE = word.substring(word.length - 1);
            
            result = beforeVowel + 
                    `<span class="sound-a">${vowel}</span>` +
                    afterVowel +
                    `<span class="sound-e">${finalE}</span>`;
        } else {
            result = word;
        }
    } else {
        result = word;
    }
    
    return result;
}

// Создание карточек с картинками
function createImageCards(wordData) {
    const imagesGrid = document.getElementById('imagesGrid');
    imagesGrid.innerHTML = '';
    
    // Создаем варианты ответов (4 карточки)
    const variants = shuffleArray([...wordData.variants]);
    const correctVariant = wordData.lowercase;
    
    // Убедимся, что правильный ответ есть среди вариантов
    if (!variants.includes(correctVariant)) {
        variants[0] = correctVariant;
    }
    
    variants.forEach(variant => {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.onclick = () => checkAnswer(variant === correctVariant, card, correctVariant);
        
        const imageDiv = document.createElement('div');
        imageDiv.className = 'card-image';
        
        // Создаем изображение - ПРОСТОЙ ПУТЬ как в рабочем коде
        const img = document.createElement('img');
        img.src = `../../assets/images/words/${variant}.png`;
        img.alt = variant;
        img.onerror = function() {
            // Если картинка не загрузилась, показываем эмодзи
            this.style.display = 'none';
            const emoji = document.createElement('div');
            emoji.className = 'fallback-emoji';
            emoji.textContent = getEmojiForWord(variant);
            imageDiv.appendChild(emoji);
        };
        
        imageDiv.appendChild(img);
        card.appendChild(imageDiv);
        
        imagesGrid.appendChild(card);
    });
}

// Получение эмодзи для слова (fallback)
function getEmojiForWord(word) {
    const emojiMap = {
        'cake': '🍰', 'lake': '🌊', 'snake': '🐍', 'rake': '🍂', 
        'bake': '🍞', 'wake': '⏰', 'name': '📛', 'game': '🎮',
        'flame': '🔥', 'plane': '✈️', 'crane': '🐦', 'grape': '🍇',
        'cape': '🧥', 'tape': '📼', 'shape': '🔷', 'gate': '🚪',
        'plate': '🍽️', 'skate': '⛸️', 'date': '📅', 'wave': '👋',
        'cave': '🕳️', 'save': '💾', 'face': '😀', 'lace': '👟',
        'race': '🏁', 'space': '🚀'
    };
    return emojiMap[word] || '❓';
}

// Проверка ответа
function checkAnswer(isCorrect, card, correctWord) {
    // Блокируем клики на время анимации
    const imagesGrid = document.getElementById('imagesGrid');
    imagesGrid.style.pointerEvents = 'none';
    
    // Сохраняем результат ответа
    answers[currentWordIndex] = isCorrect;
    
    if (isCorrect) {
        card.classList.add('correct');
        
        // Воспроизводим звук только если включен
        if (soundEnabled) {
            const correctSound = new Audio("../../assets/audio/sounds/correct.mp3");
            correctSound.volume = 0.7;
            correctSound.play().catch(e => {
                // Fallback путь
                const fallbackSound = new Audio("../../assets/audio/sounds/correct.mp3");
                fallbackSound.volume = 0.7;
                fallbackSound.play();
            });
        }
        
        score++;
        // Обновляем кружочек на зеленый
        progressDots[currentWordIndex].classList.remove('current');
        progressDots[currentWordIndex].classList.add('correct');
    } else {
        card.classList.add('wrong');
        
        // Воспроизводим звук только если включен
        if (soundEnabled) {
            const wrongSound = new Audio("../../assets/audio/sounds/wrong.mp3");
            wrongSound.volume = 0.7;
            wrongSound.play().catch(e => {
                // Fallback путь
                const fallbackSound = new Audio("../../assets/audio/sounds/wrong.mp3");
                fallbackSound.volume = 0.7;
                fallbackSound.play();
            });
        }
        
        // Обновляем кружочек на красный
        progressDots[currentWordIndex].classList.remove('current');
        progressDots[currentWordIndex].classList.add('wrong');
    }
    
    setTimeout(() => {
        currentWordIndex++;
        if (currentWordIndex < totalWords) {
            // Показываем следующий кружочек как текущий
            progressDots[currentWordIndex].classList.add('current');
        }
        
        // Разблокируем клики перед показом следующего слова
        imagesGrid.style.pointerEvents = 'auto';
        showNextWord();
    }, 1500);
}

// Показать результаты
function showResult() {
    const overlay = document.getElementById('resultOverlay');
    const resultImage = document.getElementById('resultImage');
    const resultTitle = document.getElementById('resultTitle');
    const resultStats = document.getElementById('resultStats');
    const nextButton = document.getElementById('nextButton');
    
    // Настройка отображения в зависимости от результата
    const percentage = (score / totalWords) * 100;
    
    if (percentage >= 80) {
        resultImage.src = '../../assets/icon/result-success.png';
        resultTitle.textContent = 'Отлично!';
        // Воспроизводим звук только если включен
        if (soundEnabled) {
            const applauseSound = new Audio("../../assets/audio/sounds/applause.mp3");
            applauseSound.volume = 0.7;
            applauseSound.play().catch(e => {
                // Fallback путь
                const fallbackSound = new Audio("../../assets/audio/sounds/applause.mp3");
                fallbackSound.volume = 0.7;
                fallbackSound.play();
            });
        }
    } else if (percentage >= 60) {
        resultImage.src = '../../assets/icon/result-good.png';
        resultTitle.textContent = 'Хорошо!';
    } else {
        resultImage.src = '../../assets/icon/result-try-again.png';
        resultTitle.textContent = 'Попробуй еще!';
    }
    
    resultStats.textContent = `${score} из ${totalWords} правильных ответов`;
    
    // Настройка кнопки "Далее"
    if (currentLevel === 4) {
        nextButton.textContent = 'Вернуться к играм';
        nextButton.onclick = () => window.location.href = '../../modules/magic-e/games.html';
    } else {
        nextButton.textContent = 'Следующий уровень';
        nextButton.onclick = nextLevel;
    }
    
    overlay.style.display = 'flex';
}

// Закрыть окно результатов
function closeResult() {
    document.getElementById('resultOverlay').style.display = 'none';
}

// Возврат в меню уровней
function backToMenu() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('levelSelect').style.display = 'block';
    closeResult();
}

// Повторить уровень
function retryLevel() {
    closeResult();
    startLevel(currentLevel + 1);
}

// Следующий уровень
function nextLevel() {
    closeResult();
    if (currentLevel < 4) {
        startLevel(currentLevel + 2);
    } else {
        window.location.href = '../../modules/magic-e/games.html';
    }
}

// Вспомогательные функции
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка данных игры
    loadGameData();
    
    // Назначение обработчиков событий
    document.getElementById('soundButton').addEventListener('click', playWordSound);
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    
    // Закрытие окна по клику на overlay
    document.getElementById('resultOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeResult();
        }
    });
    
    // Предзагрузка аудио
    const correctSound = new Audio("../../assets/audio/sounds/correct.mp3");
    const wrongSound = new Audio("../../assets/audio/sounds/wrong.mp3");
    const applauseSound = new Audio("../../assets/audio/sounds/applause.mp3");
    
    correctSound.preload = 'auto';
    wrongSound.preload = 'auto';
    applauseSound.preload = 'auto';
});

// Делаем функции глобальными для HTML
window.startLevel = startLevel;
window.backToMenu = backToMenu;
window.retryLevel = retryLevel;
window.nextLevel = nextLevel;
window.closeResult = closeResult;